import axios from 'axios';
const API = axios.create({ baseURL: 'http://localhost:5000/api' });

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('fintrack_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const getExpenses = () => API.get('/expenses');
export const addExpense = (data) => API.post('/expenses', data);
export const updateExpense = (id, data) => API.put(`/expenses/${id}`, data);
export const deleteExpense = (id) => API.delete(`/expenses/${id}`);

export const getSplits = () => API.get('/splits');
export const addSplit = (data) => API.post('/splits', data);
export const toggleMemberPaid = (splitId, memberId) => API.put(`/splits/${splitId}/member/${memberId}`);
export const deleteSplit = (id) => API.delete(`/splits/${id}`);

export const getLendBorrow = () => API.get('/lendborrow');
export const addLendBorrow = (data) => API.post('/lendborrow', data);
export const settleRecord = (id) => API.put(`/lendborrow/${id}/settle`);
export const deleteLendBorrow = (id) => API.delete(`/lendborrow/${id}`);

export const getGoals = () => API.get('/goals');
export const addGoal = (data) => API.post('/goals', data);
export const updateGoal = (id, data) => API.put(`/goals/${id}`, data);
export const deleteGoal = (id) => API.delete(`/goals/${id}`);

export default API;
