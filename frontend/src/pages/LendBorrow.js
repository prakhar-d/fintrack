import React, { useEffect, useState } from 'react';
import { getLendBorrow, addLendBorrow, settleRecord, deleteLendBorrow } from '../utils/api';

const fmt = (n) => '₹' + Number(n).toLocaleString('en-IN');

export default function LendBorrow() {
  const [records, setRecords] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState('all');
  const [form, setForm] = useState({ personName: '', amount: '', type: 'lent', note: '', dueDate: '' });

  useEffect(() => { load(); }, []);
  const load = async () => { const res = await getLendBorrow(); setRecords(res.data); };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.personName.trim()) {
  alert('Please enter a valid name');
  return;
}
await addLendBorrow(form);
    setShowModal(false);
    setForm({ personName: '', amount: '', type: 'lent', note: '', dueDate: '' });
    load();
  };

  const handleSettle = async (id) => { await settleRecord(id); load(); };
  const handleDelete = async (id) => { if (window.confirm('Delete this record?')) { await deleteLendBorrow(id); load(); } };

  const filtered = filter === 'all' ? records : filter === 'active' ? records.filter(r => !r.settled) : records.filter(r => r.settled);

  const totalLent = records.filter(r => r.type === 'lent' && !r.settled).reduce((s, r) => s + r.amount, 0);
  const totalBorrowed = records.filter(r => r.type === 'borrowed' && !r.settled).reduce((s, r) => s + r.amount, 0);

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">🤝 Lend / Borrow</div>
          <div className="page-subtitle">Track money you've lent or borrowed</div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Add Record</button>
      </div>

      <div className="stat-grid" style={{ gridTemplateColumns: '1fr 1fr', marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-label">💸 You've Lent</div>
          <div className="stat-value" style={{ color: 'var(--blue)' }}>{fmt(totalLent)}</div>
          <div className="stat-change">Outstanding</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">🤲 You've Borrowed</div>
          <div className="stat-value" style={{ color: 'var(--yellow)' }}>{fmt(totalBorrowed)}</div>
          <div className="stat-change">Outstanding</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {['all', 'active', 'settled'].map(f => (
          <button key={f} className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setFilter(f)}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div className="card">
        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🤝</div>
            <h3>No records found</h3>
            <p>Add a record to track lending and borrowing</p>
          </div>
        ) : (
          filtered.map(r => (
            <div className="list-item" key={r._id}>
              <div className="item-icon" style={{ background: r.type === 'lent' ? 'rgba(77,159,255,0.12)' : 'rgba(251,191,36,0.12)', fontSize: 22 }}>
                {r.type === 'lent' ? '↗️' : '↙️'}
              </div>
              <div className="item-info">
                <div className="item-title">{r.personName}</div>
                <div className="item-sub">
                  <span className={`badge badge-${r.type}`}>{r.type === 'lent' ? 'You lent' : 'You borrowed'}</span>
                  {r.settled && <>&nbsp;<span className="badge badge-settled">Settled</span></>}
                  &nbsp;·&nbsp;{new Date(r.date).toLocaleDateString('en-IN')}
                  {r.dueDate && <>&nbsp;· Due: {new Date(r.dueDate).toLocaleDateString('en-IN')}</>}
                  {r.note && <>&nbsp;· {r.note}</>}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div className={`item-amount`} style={{ color: r.type === 'lent' ? 'var(--blue)' : 'var(--yellow)' }}>
                  {fmt(r.amount)}
                </div>
                {!r.settled && (
                  <button className="icon-btn icon-btn-success" onClick={() => handleSettle(r._id)} title="Mark settled">✓</button>
                )}
                <button className="icon-btn icon-btn-danger" onClick={() => handleDelete(r._id)} title="Delete">🗑️</button>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Add Record</h2>
            <form onSubmit={handleAdd}>
              <div className="form-group">
                <label>Type</label>
                <div className="type-toggle">
                  <button type="button" className={`type-btn ${form.type === 'lent' ? 'active-income' : ''}`} onClick={() => setForm({ ...form, type: 'lent' })}>↗️ I Lent</button>
                  <button type="button" className={`type-btn ${form.type === 'borrowed' ? 'active-expense' : ''}`} onClick={() => setForm({ ...form, type: 'borrowed' })}>↙️ I Borrowed</button>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Person's Name</label>
                  <input value={form.personName} onChange={e => {
  const val = e.target.value;
  if (/^[a-zA-Z\s]*$/.test(val)) {
    setForm({ ...form, personName: val });
  }
}} placeholder="e.g. Priya" required />
                </div>
                <div className="form-group">
                  <label>Amount (₹)</label>
                  <input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} placeholder="0" required min="1" onKeyDown={e => e.key === '-' && e.preventDefault()} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Due Date (optional)</label>
                  <input type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Note (optional)</label>
                  <input value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} placeholder="Reason..." />
                </div>
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Add Record</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
