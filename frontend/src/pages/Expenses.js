import React, { useEffect, useState } from 'react';
import { getExpenses, addExpense, deleteExpense } from '../utils/api';

const CATEGORIES = ['Food', 'Transport', 'Shopping', 'Entertainment', 'Health', 'Bills', 'Education', 'Other'];
const ICONS = { Food: '🍕', Transport: '🚗', Shopping: '🛍️', Entertainment: '🎬', Health: '💊', Bills: '📱', Education: '📚', Other: '📦' };

const fmt = (n) => '₹' + Number(n).toLocaleString('en-IN');

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState('all');
  const [form, setForm] = useState({ title: '', amount: '', category: 'Food', type: 'expense', note: '', date: '' });

  useEffect(() => { loadExpenses(); }, []);

  const loadExpenses = async () => {
    const res = await getExpenses();
    setExpenses(res.data);
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      alert('Please enter a valid title');
      return;
    }
    await addExpense(form);
    setShowModal(false);
    setForm({ title: '', amount: '', category: 'Food', type: 'expense', note: '', date: '' });
    loadExpenses();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this transaction?')) {
      await deleteExpense(id);
      loadExpenses();
    }
  };

  const filtered = filter === 'all' ? expenses : expenses.filter(e => e.type === filter);

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">💸 Expenses</div>
          <div className="page-subtitle">Track every rupee you earn or spend</div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Add Transaction</button>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {['all', 'income', 'expense'].map(f => (
          <button key={f} className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setFilter(f)}>
            {f === 'all' ? 'All' : f === 'income' ? '📈 Income' : '📉 Expense'}
          </button>
        ))}
      </div>

      <div className="card">
        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">💳</div>
            <h3>No transactions found</h3>
            <p>Add your first transaction to get started</p>
          </div>
        ) : (
          filtered.map(e => (
            <div className="list-item" key={e._id}>
              <div className="item-icon" style={{ background: e.type === 'income' ? 'rgba(0,229,160,0.12)' : 'rgba(255,77,109,0.12)' }}>
                {ICONS[e.category] || '📦'}
              </div>
              <div className="item-info">
                <div className="item-title">{e.title}</div>
                <div className="item-sub">
                  <span className={`badge cat-${e.category?.toLowerCase()}`}>{e.category}</span>
                  &nbsp;·&nbsp;{new Date(e.date).toLocaleDateString('en-IN')}
                  {e.note && <>&nbsp;·&nbsp;{e.note}</>}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div className={`item-amount ${e.type === 'income' ? 'amount-income' : 'amount-expense'}`}>
                  {e.type === 'income' ? '+' : '-'}{fmt(e.amount)}
                </div>
                <button className="icon-btn icon-btn-danger" onClick={() => handleDelete(e._id)} title="Delete">🗑️</button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Add Transaction</h2>
            <form onSubmit={handleAdd}>
              <div className="form-group">
                <label>Type</label>
                <div className="type-toggle">
                  <button type="button" className={`type-btn ${form.type === 'expense' ? 'active-expense' : ''}`} onClick={() => setForm({ ...form, type: 'expense' })}>📉 Expense</button>
                  <button type="button" className={`type-btn ${form.type === 'income' ? 'active-income' : ''}`} onClick={() => setForm({ ...form, type: 'income' })}>📈 Income</button>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Title</label>
                  <input value={form.title} onChange={e => {
  const val = e.target.value;
  if (/^[a-zA-Z\s]*$/.test(val)) {
    setForm({ ...form, title: val });
  }
}} placeholder="e.g. Lunch at cafe" required />
                </div>
                <div className="form-group">
                  <label>Amount (₹)</label>
                  <input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} placeholder="0" required min="1" step="1" onKeyDown={e => (e.key === '-' || e.key === '.') && e.preventDefault()} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Category</label>
                  <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Date</label>
                  <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label>Note (optional)</label>
                <input value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} placeholder="Any note..." />
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Add Transaction</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
