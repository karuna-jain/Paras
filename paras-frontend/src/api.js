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
export const updateAccount = (id, account) => api.put(`/accounts/${id}`, account).then(res => res.data);
export const deleteAccount = (id) => api.delete(`/accounts/${id}`);

export const getSalesOrders = (billed) => {
  const query = billed !== undefined ? `?billed=${billed}` : '';
  return api.get(`/sales-orders${query}`).then(res => res.data);
};
export const createSalesOrder = (order) => api.post('/sales-orders', order).then(res => res.data);
export const deleteSalesOrder = (id) => api.delete(`/sales-orders/${id}`);
export const markSalesOrderAsBilled = (id, billNo) => api.patch(`/sales-orders/${id}/mark-billed?billNo=${billNo}`);

export const getSalesInvoices = () => api.get('/sales-invoices').then(res => res.data);
export const createSalesInvoice = (invoice) => api.post('/sales-invoices', invoice).then(res => res.data);
export const deleteSalesInvoice = (id) => api.delete(`/sales-invoices/${id}`);

export const getPurchaseInvoices = () => api.get('/purchase-invoices').then(res => res.data);
export const createPurchaseInvoice = (invoice) => api.post('/purchase-invoices', invoice).then(res => res.data);
export const deletePurchaseInvoice = (id) => api.delete(`/purchase-invoices/${id}`);

export const getVouchers = () => api.get('/vouchers').then(res => res.data);
export const createVoucher = (voucher) => api.post('/vouchers', voucher).then(res => res.data);
export const deleteVoucher = (id) => api.delete(`/vouchers/${id}`);

export const getBrands = () => api.get('/brands').then(res => res.data);
export const createBrand = (brand) => api.post('/brands', brand).then(res => res.data);

export const getModels = () => api.get('/models').then(res => res.data);
export const createModel = (model) => api.post('/models', model).then(res => res.data);

export const getQuotations = () => api.get('/quotations').then(res => res.data);
export const createQuotation = (quotation) => api.post('/quotations', quotation).then(res => res.data);
export const deleteQuotation = (id) => api.delete(`/quotations/${id}`);

export const getPurchaseOrders = () => api.get('/purchase-orders').then(res => res.data);
export const createPurchaseOrder = (order) => api.post('/purchase-orders', order).then(res => res.data);
export const deletePurchaseOrder = (id) => api.delete(`/purchase-orders/${id}`);

export const getHSNMaster = () => api.get('/hsn-master').then(res => res.data);
export const createHSNEntry = (hsn) => api.post('/hsn-master', hsn).then(res => res.data);
export const deleteHSNEntry = (id) => api.delete(`/hsn-master/${id}`);

export const getPendingWhatsappMessage = () => api.get('/whatsapp/pending').then(res => res.data);
export const markWhatsappProcessed = (id) => api.post(`/whatsapp/mark-processed/${id}`).then(res => res.data);

export default api;
