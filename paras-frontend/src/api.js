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
export const getSalesOrder = (id) => api.get(`/sales-orders/${id}`).then(res => res.data);
export const createSalesOrder = (order) => api.post('/sales-orders', order).then(res => res.data);
export const updateSalesOrder = (id, order) => api.put(`/sales-orders/${id}`, order).then(res => res.data);
export const deleteSalesOrder = (id) => api.delete(`/sales-orders/${id}`);
export const markSalesOrderAsBilled = (id, billNo) => api.patch(`/sales-orders/${id}/mark-billed?billNo=${billNo}`);
export const savePickSlip = (id, order) => api.put(`/sales-orders/${id}/pick-slip`, order).then(res => res.data);

export const getSalesInvoices = () => api.get('/sale-bills').then(res => res.data);
export const getSalesInvoice = (id) => api.get(`/sale-bills/${id}`).then(res => res.data);
export const createSalesInvoice = (invoice) => api.post('/sale-bills', invoice).then(res => res.data);
export const updateSalesInvoice = (id, invoice) => api.put(`/sale-bills/${id}`, invoice).then(res => res.data);
export const deleteSalesInvoice = (id) => api.delete(`/sale-bills/${id}`);
export const getNextBillNo = () => api.get('/sale-bills/next-no').then(res => res.data);

export const getPurchaseInvoices = () => api.get('/purchases').then(res => res.data);
export const getPurchaseInvoice = (id) => api.get(`/purchases/${id}`).then(res => res.data);
export const createPurchaseInvoice = (invoice) => api.post('/purchases', invoice).then(res => res.data);
export const updatePurchaseInvoice = (id, invoice) => api.put(`/purchases/${id}`, invoice).then(res => res.data);
export const deletePurchaseInvoice = (id) => api.delete(`/purchases/${id}`);
export const getNextPurchaseNo = () => api.get('/purchases/next-no').then(res => res.data);

export const getVouchers = () => api.get('/cb-vouchers').then(res => res.data);
export const getVoucher = (id) => api.get(`/cb-vouchers/${id}`).then(res => res.data);
export const createVoucher = (voucher) => api.post('/cb-vouchers', voucher).then(res => res.data);
export const deleteVoucher = (id) => api.delete(`/cb-vouchers/${id}`);
export const getNextVoucherNo = () => api.get('/cb-vouchers/next-no').then(res => res.data);

export const postDebit = (ledger) => api.post('/ledger/debit', ledger).then(res => res.data);
export const postCredit = (ledger) => api.post('/ledger/credit', ledger).then(res => res.data);
export const postOpening = (opening) => api.post('/ledger/opening', opening).then(res => res.data);
export const getLedgerQuery = (acCode) => api.get(`/ledger/query/${acCode}`).then(res => res.data);
export const getLedgerOpening = (acCode) => api.get(`/ledger/opening/${acCode}`).then(res => res.data);

export const getPickSlips = (filter, partyCode) => api.get(`/sales-orders/pick-slips?filter=${filter}&partyCode=${partyCode}`).then(res => res.data);
export const updatePickSlipInvNo = (orderId, invNo) => api.put(`/sales-orders/pick-slips/${orderId}/inv-no?invNo=${invNo}`).then(res => res.data);

export const getBrands = () => api.get('/brands').then(res => res.data);
export const getBrand = (code) => api.get(`/brands/${code}`).then(res => res.data);
export const createBrand = (brand) => api.post('/brands', brand).then(res => res.data);

export const getModels = () => api.get('/models').then(res => res.data);
export const createModel = (model) => api.post('/models', model).then(res => res.data);

export const getPriceList = (brand, model) => api.get(`/parts/price-list?brand=${brand}&model=${model}`).then(res => res.data);

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
