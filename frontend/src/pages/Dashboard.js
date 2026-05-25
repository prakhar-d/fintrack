import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getExpenses } from '../utils/api';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const CATEGORY_COLORS = {
  Food: '#fbbf24', Transport: '#4d9fff', Shopping: '#a78bfa',
  Entertainment: '#fb923c', Health: '#00e5a0', Bills: '#ff4d6d',
  Education: '#4d9fff', Other: '#5a5a72'
};

const CATEGORY_ICONS = {
  Food: '🍕', Transport: '🚗', Shopping: '🛍️',
  Entertainment: '🎬', Health: '💊', Bills: '📱',
  Education: '📚', Other: '📦'
};

export default function Dashboard() {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState([]);

  useEffect(() => {
    getExpenses().then(res => setExpenses(res.data)).catch(() => {});
  }, []);

  const totalIncome = expenses.filter(e => e.type === 'income').reduce((s, e) => s + e.amount, 0);
  const totalExpense = expenses.filter(e => e.type === 'expense').reduce((s, e) => s + e.amount, 0);
  const balance = totalIncome - totalExpense;

  const categoryData = expenses
    .filter(e => e.type === 'expense')
    .reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount;
      return acc;
    }, {});

  const pieData = Object.entries(categoryData).map(([name, value]) => ({ name, value }));
  const recent = [...expenses].slice(0, 6);

  const fmt = (n) => '₹' + n.toLocaleString('en-IN');

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Hey, {user?.name?.split(' ')[0]}!</div>
          <div className="page-subtitle">Here's your financial overview</div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="stat-grid">
        <div className="stat-card" style={{ borderColor: balance >= 0 ? 'rgba(0,229,160,0.3)' : 'rgba(255,77,109,0.3)' }}>
          <div className="stat-label">💰 Net Balance</div>
          <div className="stat-value" style={{ color: balance >= 0 ? 'var(--green)' : 'var(--red)' }}>
            {fmt(Math.abs(balance))}
          </div>
          <div className="stat-change">{balance >= 0 ? '▲ Positive balance' : '▼ Negative balance'}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">📈 Total Income</div>
          <div className="stat-value" style={{ color: 'var(--green)' }}>{fmt(totalIncome)}</div>
          <div className="stat-change">{expenses.filter(e => e.type === 'income').length} transactions</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">📉 Total Expenses</div>
          <div className="stat-value" style={{ color: 'var(--red)' }}>{fmt(totalExpense)}</div>
          <div className="stat-change">{expenses.filter(e => e.type === 'expense').length} transactions</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">💳 Transactions</div>
          <div className="stat-value">{expenses.length}</div>
          <div className="stat-change">All time</div>
        </div>
      </div>

      <div className="grid-2">
        {/* Recent Transactions */}
        <div className="card">
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Recent Transactions</h3>
          {recent.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">💸</div>
              <p>No transactions yet</p>
            </div>
          ) : (
            recent.map(e => (
              <div className="list-item" key={e._id}>
                <div className="item-icon" style={{ background: e.type === 'income' ? 'rgba(0,229,160,0.12)' : 'rgba(255,77,109,0.12)' }}>
                  {CATEGORY_ICONS[e.category] || '📦'}
                </div>
                <div className="item-info">
                  <div className="item-title">{e.title}</div>
                  <div className="item-sub">{e.category} · {new Date(e.date).toLocaleDateString('en-IN')}</div>
                </div>
                <div className={`item-amount ${e.type === 'income' ? 'amount-income' : 'amount-expense'}`}>
                  {e.type === 'income' ? '+' : '-'}{fmt(e.amount)}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pie Chart */}
        <div className="card">
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Spending by Category</h3>
          {pieData.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📊</div>
              <p>Add expenses to see breakdown</p>
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" paddingAngle={3}>
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={CATEGORY_COLORS[entry.name] || '#5a5a72'} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => fmt(v)} contentStyle={{ background: '#15151f', border: '1px solid #2a2a3d', borderRadius: 10, color: '#e8e8f0' }} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 16px', marginTop: 12 }}>
                {pieData.map((d, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: CATEGORY_COLORS[d.name] || '#5a5a72' }} />
                    <span style={{ color: 'var(--text2)' }}>{d.name}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
