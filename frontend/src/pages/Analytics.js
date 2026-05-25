import React, { useEffect, useState } from 'react';
import { getExpenses } from '../utils/api';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend
} from 'recharts';

const CATEGORY_COLORS = {
  Food: '#fbbf24', Transport: '#4d9fff', Shopping: '#a78bfa',
  Entertainment: '#fb923c', Health: '#00e5a0', Bills: '#ff4d6d',
  Education: '#60a5fa', Other: '#5a5a72'
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const fmt = (n) => '₹' + Number(n).toLocaleString('en-IN');

const tooltipStyle = {
  contentStyle: { background: '#15151f', border: '1px solid #2a2a3d', borderRadius: 10, color: '#e8e8f0' },
  labelStyle: { color: '#9090a8' }
};

export default function Analytics() {
  const [expenses, setExpenses] = useState([]);

  useEffect(() => { getExpenses().then(r => setExpenses(r.data)).catch(() => {}); }, []);

  // Monthly data
  const monthlyData = MONTHS.map((m, i) => {
    const monthExpenses = expenses.filter(e => new Date(e.date).getMonth() === i);
    return {
      month: m,
      income: monthExpenses.filter(e => e.type === 'income').reduce((s, e) => s + e.amount, 0),
      expense: monthExpenses.filter(e => e.type === 'expense').reduce((s, e) => s + e.amount, 0),
    };
  });

  // Category data
  const catData = Object.entries(
    expenses.filter(e => e.type === 'expense').reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

  // Savings line
  const savingsData = monthlyData.map(m => ({ month: m.month, savings: m.income - m.expense }));

  const totalIncome = expenses.filter(e => e.type === 'income').reduce((s, e) => s + e.amount, 0);
  const totalExpense = expenses.filter(e => e.type === 'expense').reduce((s, e) => s + e.amount, 0);
  const savingsRate = totalIncome > 0 ? (((totalIncome - totalExpense) / totalIncome) * 100).toFixed(1) : 0;
  const topCategory = catData[0];

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">📈 Analytics</div>
          <div className="page-subtitle">Visualize your financial patterns</div>
        </div>
      </div>

      {/* Summary stats */}
      <div className="stat-grid" style={{ marginBottom: 28 }}>
        <div className="stat-card">
          <div className="stat-label">💰 Savings Rate</div>
          <div className="stat-value" style={{ color: savingsRate >= 0 ? 'var(--green)' : 'var(--red)' }}>{savingsRate}%</div>
          <div className="stat-change">Of total income</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">📊 Avg Monthly Expense</div>
          <div className="stat-value">{fmt(monthlyData.filter(m => m.expense > 0).reduce((s, m) => s + m.expense, 0) / Math.max(1, monthlyData.filter(m => m.expense > 0).length))}</div>
          <div className="stat-change">Per active month</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">🔥 Top Category</div>
          <div className="stat-value" style={{ fontSize: 18 }}>{topCategory?.name || '—'}</div>
          <div className="stat-change">{topCategory ? fmt(topCategory.value) + ' spent' : 'No data yet'}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">📝 Total Transactions</div>
          <div className="stat-value">{expenses.length}</div>
          <div className="stat-change">All time</div>
        </div>
      </div>

      <div className="grid-2" style={{ marginBottom: 24 }}>
        {/* Income vs Expense Bar Chart */}
        <div className="card">
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 20 }}>Income vs Expense (Monthly)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyData} barSize={10} barGap={2}>
              <XAxis dataKey="month" tick={{ fill: '#5a5a72', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#5a5a72', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => v > 0 ? '₹' + (v / 1000).toFixed(0) + 'k' : ''} />
              <Tooltip formatter={(v) => fmt(v)} {...tooltipStyle} />
              <Bar dataKey="income" fill="var(--green)" radius={[4, 4, 0, 0]} name="Income" />
              <Bar dataKey="expense" fill="var(--red)" radius={[4, 4, 0, 0]} name="Expense" />
            </BarChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', gap: 16, marginTop: 8, fontSize: 12, color: 'var(--text3)' }}>
            <span><span style={{ color: 'var(--green)' }}>■</span> Income</span>
            <span><span style={{ color: 'var(--red)' }}>■</span> Expense</span>
          </div>
        </div>

        {/* Category Pie */}
        <div className="card">
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 20 }}>Expense by Category</h3>
          {catData.length === 0 ? (
            <div className="empty-state" style={{ padding: '30px 0' }}>
              <p>No expense data yet</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={catData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={4}>
                  {catData.map((entry, i) => (
                    <Cell key={i} fill={CATEGORY_COLORS[entry.name] || '#5a5a72'} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => fmt(v)} {...tooltipStyle} />
                <Legend formatter={(v) => <span style={{ color: 'var(--text2)', fontSize: 11 }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Savings Line Chart */}
      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 20 }}>Monthly Savings Trend</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={savingsData}>
            <XAxis dataKey="month" tick={{ fill: '#5a5a72', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#5a5a72', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => '₹' + (v / 1000).toFixed(0) + 'k'} />
            <Tooltip formatter={(v) => fmt(v)} {...tooltipStyle} />
            <Line type="monotone" dataKey="savings" stroke="var(--green)" strokeWidth={2.5} dot={{ fill: 'var(--green)', r: 4 }} name="Savings" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Category Breakdown Table */}
      {catData.length > 0 && (
        <div className="card">
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Category Breakdown</h3>
          {catData.map((c, i) => {
            const pct = ((c.value / totalExpense) * 100).toFixed(1);
            return (
              <div key={i} style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 5 }}>
                  <span style={{ fontWeight: 600 }}>{c.name}</span>
                  <span style={{ fontFamily: 'JetBrains Mono', color: CATEGORY_COLORS[c.name] }}>{fmt(c.value)} <span style={{ color: 'var(--text3)' }}>({pct}%)</span></span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${pct}%`, background: CATEGORY_COLORS[c.name] || '#5a5a72' }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
