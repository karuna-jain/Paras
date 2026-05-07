import axios from 'axios';

// The proxy in vite.config.js will handle redirecting this to http://localhost:8081
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getCustomers = () => api.get('/customers').then(res => res.data);
export const createCustomer = (customer) => api.post('/customers', customer).then(res => res.data);
export const deleteCustomer = (id) => api.delete(`/customers/${id}`);

export const getParts = () => api.get('/parts').then(res => res.data);
export const createPart = (part) => api.post('/parts', part).then(res => res.data);
export const deletePart = (id) => api.delete(`/parts/${id}`);

export const getAccounts = () => api.get('/accounts').then(res => res.data);
export const createAccount = (account) => api.post('/accounts', account).then(res => res.data);
export const deleteAccount = (id) => api.delete(`/accounts/${id}`);

export const getSalesOrders = () => api.get('/sales-orders').then(res => res.data);
export const createSalesOrder = (order) => api.post('/sales-orders', order).then(res => res.data);
export const deleteSalesOrder = (id) => api.delete(`/sales-orders/${id}`);

export default api;
