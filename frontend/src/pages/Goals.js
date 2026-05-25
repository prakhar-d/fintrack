import React, { useEffect, useState } from 'react';
import { getGoals, addGoal, updateGoal, deleteGoal } from '../utils/api';

const fmt = (n) => '₹' + Number(n).toLocaleString('en-IN');
const GOAL_ICONS = ['🚀', '✈️', '🚗', '🏠', '💻', '📱', '🎓', '💍', '🏖️', '💰', '🎸', '🏋️'];

export default function Goals() {
  const [goals, setGoals] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(null);
  const [addAmount, setAddAmount] = useState('');
  const [form, setForm] = useState({ title: '', targetAmount: '', savedAmount: '', deadline: '', icon: '🎯' });

  useEffect(() => { load(); }, []);
  const load = async () => { const res = await getGoals(); setGoals(res.data); };

const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      alert('Please enter a valid goal name');
      return;
    }
    await addGoal(form);
    setShowModal(false);
    setForm({ title: '', targetAmount: '', savedAmount: '', deadline: '', icon: '🎯' });
    load();
  };

const handleAddMoney = async (e) => {
    e.preventDefault();
    const g = showAddModal;
    if (Number(addAmount) <= 0) {
      alert('Please enter a valid amount greater than 0');
      return;
    }
    const newSaved = Math.min(g.targetAmount, g.savedAmount + Number(addAmount));
    await updateGoal(g._id, { savedAmount: newSaved, completed: newSaved >= g.targetAmount });
    setShowAddModal(null);
    setAddAmount('');
    load();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this goal?')) { await deleteGoal(id); load(); }
  };

  const active = goals.filter(g => !g.completed);
  const completed = goals.filter(g => g.completed);

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">🏆 Goals</div>
          <div className="page-subtitle">Save towards what matters</div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ New Goal</button>
      </div>

      {goals.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon">🏆</div>
            <h3>No goals yet</h3>
            <p>Create a goal and start saving towards it</p>
          </div>
        </div>
      ) : (
        <>
          {active.length > 0 && (
            <>
              <h3 style={{ fontSize: 14, color: 'var(--text3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 14 }}>Active Goals</h3>
              <div className="grid-2" style={{ marginBottom: 28 }}>
                {active.map(g => {
                  const pct = Math.min(100, (g.savedAmount / g.targetAmount) * 100);
                  const remaining = g.targetAmount - g.savedAmount;
                  return (
                    <div className="card" key={g._id}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{ fontSize: 32 }}>{g.icon}</div>
                          <div>
                            <div style={{ fontSize: 16, fontWeight: 700 }}>{g.title}</div>
                            {g.deadline && <div style={{ fontSize: 12, color: 'var(--text3)' }}>Due: {new Date(g.deadline).toLocaleDateString('en-IN')}</div>}
                          </div>
                        </div>
                        <button className="icon-btn icon-btn-danger" onClick={() => handleDelete(g._id)}>🗑️</button>
                      </div>
                      <div style={{ margin: '16px 0 8px', display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                        <span style={{ color: 'var(--text3)' }}>Saved</span>
                        <span style={{ fontFamily: 'JetBrains Mono', color: 'var(--green)' }}>{fmt(g.savedAmount)}</span>
                      </div>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${pct}%`, background: pct >= 100 ? 'var(--green)' : 'linear-gradient(90deg, var(--blue), var(--green))' }} />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text3)', margin: '8px 0 16px' }}>
                        <span>{pct.toFixed(0)}% done</span>
                        <span>{fmt(remaining)} to go · Target: {fmt(g.targetAmount)}</span>
                      </div>
                      <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setShowAddModal(g)}>
                        + Add Money
                      </button>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {completed.length > 0 && (
            <>
              <h3 style={{ fontSize: 14, color: 'var(--text3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 14 }}>✅ Completed</h3>
              <div className="grid-2">
                {completed.map(g => (
                  <div className="card" key={g._id} style={{ borderColor: 'rgba(0,229,160,0.3)', opacity: 0.7 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                        <div style={{ fontSize: 28 }}>{g.icon}</div>
                        <div>
                          <div style={{ fontWeight: 700 }}>{g.title}</div>
                          <div style={{ fontSize: 12, color: 'var(--green)' }}>✓ Goal achieved! {fmt(g.targetAmount)}</div>
                        </div>
                      </div>
                      <button className="icon-btn icon-btn-danger" onClick={() => handleDelete(g._id)}>🗑️</button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}

      {/* Add Goal Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>New Goal</h2>
            <form onSubmit={handleAdd}>
              <div className="form-group">
                <label>Pick an Icon</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
               {GOAL_ICONS.map((ic, idx) => (
  <button key={ic} type="button" onClick={() => setForm({ ...form, icon: ic })}
    title={['Target', 'Travel', 'Car', 'Home', 'Laptop', 'Mobile', 'Education', 'Wedding', 'Vacation', 'Savings', 'Music', 'Fitness'][idx]}
    style={{ fontSize: 22, background: form.icon === ic ? 'rgba(0,229,160,0.15)' : 'var(--bg3)', border: `2px solid ${form.icon === ic ? 'var(--green)' : 'var(--border)'}`, borderRadius: 10, width: 44, height: 44, cursor: 'pointer' }}>
    {ic}
  </button>
))}
                </div>
              </div>
              <div className="form-group">
                <label>Goal Title</label>
                <input 
  value={form.title} 
  onChange={e => {
    const val = e.target.value;
    if (/^[a-zA-Z\s]*$/.test(val)) {
      setForm({ ...form, title: val });
    }
  }} 
  placeholder="e.g. Trip to Goa" 
  required 
/>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Target Amount (₹)</label>
                  <input type="number" value={form.targetAmount} onChange={e => setForm({ ...form, targetAmount: e.target.value })} placeholder="0" required min="1" onKeyDown={e => e.key === '-' && e.preventDefault()} />
                </div>
                <div className="form-group">
                  <label>Already Saved (₹)</label>
                  <input type="number" value={form.savedAmount} onChange={e => {
  if (Number(e.target.value) <= Number(form.targetAmount)) {
    setForm({ ...form, savedAmount: e.target.value });
  }
}} placeholder="0" min="0" onKeyDown={e => e.key === '-' && e.preventDefault()} />
                </div>
              </div>
              <div className="form-group">
                <label>Deadline (optional)</label>
                <input type="date" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} min={new Date().toISOString().split('T')[0]} />
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Goal</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Money Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 340 }}>
            <h2>{showAddModal.icon} Add Money</h2>
            <p style={{ color: 'var(--text3)', fontSize: 13, marginBottom: 20 }}>
              Currently saved: {fmt(showAddModal.savedAmount)} / {fmt(showAddModal.targetAmount)}
            </p>
            <form onSubmit={handleAddMoney}>
              <div className="form-group">
                <label>Amount to Add (₹)</label>
                <input type="number" value={addAmount} onChange={e => setAddAmount(e.target.value)} placeholder="0" required min="1" step="1" onKeyDown={e => e.key === '-' && e.preventDefault()} />
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setShowAddModal(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Add Money</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
