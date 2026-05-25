import React, { useEffect, useState } from 'react';
import { getSplits, addSplit, deleteSplit, toggleMemberPaid } from '../utils/api';

const fmt = (n) => '₹' + Number(n).toLocaleString('en-IN');

// ─── Smart Settlement Algorithm ───────────────────────────────────────────────
// balance = amountPaid - share
// positive → others owe this person
// negative → this person owes others
// Minimizes number of transactions to settle everyone

function calculateSettlements(members) {
  const totalPaid = members.reduce((sum, m) => sum + (m.amountPaid || 0), 0);
  const totalShare = members.reduce((sum, m) => sum + m.share, 0);

  // If nobody paid upfront, nothing to settle yet
  if (totalPaid === 0) {
    return members.map(m => ({
      from: m.name,
      to: 'Common Pool',
      amount: m.share
    })).filter(t => t.amount > 0);
  }

  const balances = members.map(m => ({
    name: m.name,
    balance: parseFloat(((m.amountPaid || 0) - m.share).toFixed(2))
  }));

  const cr = balances.filter(b => b.balance > 0).map(b => ({ ...b })).sort((a, b) => b.balance - a.balance);
  const dr = balances.filter(b => b.balance < 0).map(b => ({ ...b })).sort((a, b) => a.balance - b.balance);

  const settlements = [];
  let i = 0, j = 0;

  while (i < cr.length && j < dr.length) {
    const amount = Math.min(cr[i].balance, -dr[j].balance);
    if (amount > 0.5) {
      settlements.push({ from: dr[j].name, to: cr[i].name, amount: parseFloat(amount.toFixed(2)) });
    }
    cr[i].balance -= amount;
    dr[j].balance += amount;
    if (Math.abs(cr[i].balance) < 0.5) i++;
    if (Math.abs(dr[j].balance) < 0.5) j++;
  }

  return settlements;
}

export default function Split() {
  const [splits, setSplits] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [equalSplit, setEqualSplit] = useState(false);
  const [form, setForm] = useState({
    title: '', totalAmount: '',
    members: [{ name: '', share: '', amountPaid: '' }]
  });

  useEffect(() => { load(); }, []);
  const load = async () => { const res = await getSplits(); setSplits(res.data); };

  const addMember = () =>
    setForm(f => ({ ...f, members: [...f.members, { name: '', share: equalSplit ? parseFloat((Number(f.totalAmount) / (f.members.length + 1)).toFixed(2)) : '', amountPaid: '' }] }));

  const removeMember = (i) =>
    setForm(f => ({ ...f, members: f.members.filter((_, idx) => idx !== i) }));

  const updateMember = (i, field, val) => {
    setForm(f => {
      const m = [...f.members];
      m[i] = { ...m[i], [field]: val };
      return { ...f, members: m };
    });
  };

  const applyEqualSplit = (total, members) => {
    if (!total || members.length === 0) return members;
    const each = parseFloat((Number(total) / members.length).toFixed(2));
    return members.map(m => ({ ...m, share: each }));
  };

  const handleTotalChange = (val) => {
    setForm(f => ({
      ...f,
      totalAmount: val,
      members: equalSplit ? applyEqualSplit(val, f.members) : f.members
    }));
  };

  const toggleEqualSplit = () => {
    setEqualSplit(prev => {
      const next = !prev;
      if (next) setForm(f => ({ ...f, members: applyEqualSplit(f.totalAmount, f.members) }));
      return next;
    });
  };

 const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      alert('Please enter a valid title');
      return;
    }
    if (Number(form.totalAmount) <= 0) {
      alert('Total bill amount must be greater than 0');
      return;
    }
    if (form.members.length < 2) {
      alert('Please add at least 2 members to split');
      return;
    }
    const emptyMember = form.members.find(m => !m.name.trim());
    if (emptyMember) {
      alert('Please enter name for all members');
      return;
    }
    const zeroShare = form.members.find(m => Number(m.share) <= 0);
    if (zeroShare) {
      alert('Share amount must be greater than 0 for all members');
      return;
    }
    const names = form.members.map(m => m.name.trim().toLowerCase());
    const hasDuplicate = names.some((name, idx) => names.indexOf(name) !== idx);
    if (hasDuplicate) {
      alert('Duplicate member names are not allowed');
      return;
    }
    const totalShares = form.members.reduce((sum, m) => sum + Number(m.share), 0);
    if (totalShares > Number(form.totalAmount)) {
      alert(`Total shares (₹${totalShares}) cannot exceed total bill amount (₹${form.totalAmount})`);
      return;
    }
    await addSplit(form);
    setShowModal(false);
    setEqualSplit(false);
    setForm({ title: '', totalAmount: '', members: [{ name: '', share: '', amountPaid: '' }] });
    load();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this split?')) { await deleteSplit(id); load(); }
  };

  const handleToggle = async (splitId, memberId) => {
    await toggleMemberPaid(splitId, memberId);
    load();
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">🔀 Split</div>
          <div className="page-subtitle">Smart bill splitting — see exactly who pays whom</div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ New Split</button>
      </div>

      {splits.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon">🔀</div>
            <h3>No splits yet</h3>
            <p>Create a split to see smart settlement suggestions</p>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {splits.map(s => {
            const totalPaid = s.members.filter(m => m.paid).reduce((sum, m) => sum + m.share, 0);
            const pct = Math.min(100, (totalPaid / s.totalAmount) * 100);
            const settlements = calculateSettlements(s.members);
            const allSettled = settlements.length === 0;

            return (
              <div className="card" key={s._id}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                  <div>
                    <div style={{ fontSize: 17, fontWeight: 700 }}>{s.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 3 }}>
                      Total: {fmt(s.totalAmount)} · {new Date(s.date).toLocaleDateString('en-IN')}
                    </div>
                  </div>
                  <button className="icon-btn icon-btn-danger" onClick={() => handleDelete(s._id)}>🗑️</button>
                </div>

                {/* Progress bar */}
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${pct}%`, background: 'var(--green)' }} />
                </div>
                <div style={{ fontSize: 12, color: 'var(--text3)', margin: '6px 0 20px', textAlign: 'right' }}>
                  {fmt(totalPaid)} settled of {fmt(s.totalAmount)}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

                  {/* Left — Members */}
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 }}>
                      Members
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {s.members.map(m => {
                        const paid = m.amountPaid || 0;
                        const owes = m.share;
                        const balance = parseFloat((paid - owes).toFixed(2));
                        return (
                          <div key={m._id} style={{ padding: '10px 12px', background: 'var(--bg3)', borderRadius: 10 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <div style={{
                                width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                                background: m.paid ? 'rgba(0,229,160,0.2)' : 'rgba(255,77,109,0.1)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 13, fontWeight: 700,
                                color: m.paid ? 'var(--green)' : 'var(--red)'
                              }}>
                                {m.name[0]?.toUpperCase()}
                              </div>
                              <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 13, fontWeight: 600 }}>{m.name}</div>
                                <div style={{ fontSize: 11, color: 'var(--text3)' }}>
                                  Paid {fmt(paid)} · Share {fmt(owes)}
                                </div>
                              </div>
                              <button
                                className={`btn btn-sm ${m.paid ? 'btn-ghost' : 'btn-primary'}`}
                                onClick={() => handleToggle(s._id, m._id)}
                              >
                                {m.paid ? '✓' : 'Done'}
                              </button>
                            </div>
                            {/* Balance label */}
                            {balance !== 0 && (
                              <div style={{
                                marginTop: 7, fontSize: 11, fontWeight: 600, padding: '4px 8px', borderRadius: 6, display: 'inline-block',
                                background: balance > 0 ? 'rgba(0,229,160,0.1)' : 'rgba(255,77,109,0.1)',
                                color: balance > 0 ? 'var(--green)' : 'var(--red)'
                              }}>
                                {balance > 0 ? `← Gets back ${fmt(balance)}` : `→ Needs to pay ${fmt(Math.abs(balance))}`}
                              </div>
                            )}
                            {balance === 0 && (
                              <div style={{ marginTop: 7, fontSize: 11, color: 'var(--text3)' }}>✓ Even</div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Right — Settlement Instructions */}
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 }}>
                      💡 Who Pays Whom
                    </div>
                    {allSettled ? (
                      <div style={{ padding: '28px 16px', background: 'rgba(0,229,160,0.08)', border: '1px solid rgba(0,229,160,0.2)', borderRadius: 14, textAlign: 'center' }}>
                        <div style={{ fontSize: 28, marginBottom: 8 }}>🎉</div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--green)' }}>All Settled!</div>
                        <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 4 }}>Everyone is even</div>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {settlements.map((t, i) => (
                          <div key={i} style={{
                            padding: '14px 16px',
                            background: 'rgba(77,159,255,0.07)',
                            border: '1px solid rgba(77,159,255,0.18)',
                            borderRadius: 12,
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                              <div style={{ fontSize: 12, fontWeight: 700, padding: '3px 10px', background: 'rgba(255,77,109,0.12)', color: 'var(--red)', borderRadius: 20 }}>{t.from}</div>
                              <span style={{ fontSize: 16, color: 'var(--text3)' }}>→</span>
                              <div style={{ fontSize: 12, fontWeight: 700, padding: '3px 10px', background: 'rgba(0,229,160,0.12)', color: 'var(--green)', borderRadius: 20 }}>{t.to}</div>
                            </div>
                            <div style={{ fontSize: 18, fontWeight: 700, fontFamily: 'JetBrains Mono', color: 'var(--blue)' }}>
                              {fmt(t.amount)}
                            </div>
                          </div>
                        ))}
                        <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4, padding: '8px 12px', background: 'var(--bg3)', borderRadius: 8 }}>
                          ⚡ {settlements.length} payment{settlements.length > 1 ? 's' : ''} needed to settle everything
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Add Split Modal ── */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 540 }}>
            <h2>New Split</h2>
            <form onSubmit={handleAdd}>
              <div className="form-row">
                <div className="form-group">
                  <label>Title</label>
                  <input value={form.title} onChange={e => {
  const val = e.target.value;
  if (/^[a-zA-Z\s]*$/.test(val)) {
    setForm(f => ({ ...f, title: val }));
  }
}} placeholder="e.g. Goa Trip" required />
                </div>
                <div className="form-group">
                  <label>Total Bill (₹)</label>
                  <input type="number" value={form.totalAmount} onChange={e => handleTotalChange(e.target.value)} placeholder="0" required min="1" step="1" onKeyDown={e => (e.key === '-' || e.key === '.') && e.preventDefault()} />
                </div>
              </div>

              {/* Equal split toggle */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, padding: '10px 14px', background: 'var(--bg3)', borderRadius: 10, cursor: 'pointer' }} onClick={toggleEqualSplit}>
                <div style={{ width: 36, height: 20, borderRadius: 10, background: equalSplit ? 'var(--green)' : 'var(--border)', position: 'relative', flexShrink: 0, transition: 'all 0.2s' }}>
                  <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, left: equalSplit ? 18 : 3, transition: 'all 0.2s' }} />
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, userSelect: 'none' }}>Split Equally</span>
                <span style={{ fontSize: 12, color: 'var(--text3)', userSelect: 'none' }}>— auto divide total equally</span>
              </div>

              {/* Column headers */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 28px', gap: 8, marginBottom: 6, fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.5px', padding: '0 2px' }}>
                <span>Name</span>
                <span>Share (₹)</span>
                <span>Paid Upfront (₹)</span>
                <span></span>
              </div>

              {form.members.map((m, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 28px', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                  <input placeholder="Name" value={m.name} onChange={e => {
  const val = e.target.value;
  if (/^[a-zA-Z\s]*$/.test(val)) {
    updateMember(i, 'name', val);
  }
}}
                    style={{ padding: '10px 12px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 10, color: 'var(--text)', fontFamily: 'Sora, sans-serif', outline: 'none', fontSize: 13 }} required />
                  <input type="number" placeholder="0" value={m.share} onChange={e => updateMember(i, 'share', e.target.value)} disabled={equalSplit} min="0" step="1" onKeyDown={e => (e.key === '-' || e.key === '.') && e.preventDefault()}
                    style={{ padding: '10px 12px', background: equalSplit ? 'rgba(0,229,160,0.07)' : 'var(--bg3)', border: `1px solid ${equalSplit ? 'rgba(0,229,160,0.3)' : 'var(--border)'}`, borderRadius: 10, color: equalSplit ? 'var(--green)' : 'var(--text)', fontFamily: 'JetBrains Mono', outline: 'none', fontSize: 13 }} required />
                  <input type="number" placeholder="0" value={m.amountPaid} onChange={e => {
  if (Number(e.target.value) <= Number(form.totalAmount)) {
    updateMember(i, 'amountPaid', e.target.value);
  }
}} max={form.totalAmount} min="0" onKeyDown={e => e.key === '-' && e.preventDefault()}
                    style={{ padding: '10px 12px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 10, color: 'var(--text)', fontFamily: 'JetBrains Mono', outline: 'none', fontSize: 13 }} />
                  {form.members.length > 1 && (
                    <button type="button" className="icon-btn icon-btn-danger" onClick={() => removeMember(i)} style={{ width: 28, height: 28 }}>✕</button>
                  )}
                </div>
              ))}

              <div style={{ fontSize: 12, color: 'var(--text3)', background: 'var(--bg3)', padding: '10px 14px', borderRadius: 10, marginBottom: 12, lineHeight: 1.6 }}>
                💡 <strong style={{ color: 'var(--text2)' }}>Share</strong> = how much this person should pay.<br />
                &nbsp;&nbsp;&nbsp;<strong style={{ color: 'var(--text2)' }}>Paid Upfront</strong> = how much they already paid (e.g. paid the full bill at restaurant). Leave 0 if they haven't paid yet.
              </div>

              <button type="button" className="btn btn-ghost btn-sm" onClick={addMember} style={{ marginBottom: 16 }}>+ Add Member</button>

              <div className="form-actions">
                <button type="button" className="btn btn-ghost" onClick={() => { setShowModal(false); setEqualSplit(false); }}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Split</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}