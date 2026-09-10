import React, { useState, useEffect, useMemo } from 'react';
import { getSalesInvoices, getPurchaseInvoices, getParts, getAccounts } from './api';
import {
  FaChartBar,
  FaFileInvoiceDollar,
  FaShoppingBag,
  FaDownload,
  FaCalendarAlt,
  FaUser,
  FaBoxOpen,
  FaTags,
  FaCoins,
  FaFilter,
  FaSearch,
  FaArrowUp,
  FaArrowDown,
  FaChevronLeft,
  FaChevronRight,
  FaFileAlt
} from 'react-icons/fa';
import html2pdf from 'html2pdf.js';

// --- Date Utilities ---
const parseDate = (dateStr) => {
  if (!dateStr) return new Date();
  if (dateStr.includes('-')) {
    const parts = dateStr.split('-');
    if (parts[0].length === 4) {
      // yyyy-mm-dd
      return new Date(dateStr);
    } else {
      // dd-mm-yyyy
      return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
    }
  }
  return new Date(dateStr);
};

const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
};

const formatDateForInput = (date) => {
  if (!date) return '';
  const d = new Date(date);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${yyyy}-${mm}-${dd}`;
};

// --- Mock Data Generator (for rich demo charts when DB is small) ---
const generateMockData = () => {
  const mockSales = [];
  const mockPurchases = [];
  const brands = ['HERO', 'HONDA', 'BAJAJ', 'YAMA', 'TVSM'];
  const customers = [
    { name: 'RAMESH AUTO AGENCY', acNo: '1001', city: 'INDORE' },
    { name: 'VIJAY AUTOMOBILES', acNo: '1002', city: 'KHIRKIYA' },
    { name: 'ANIL KUMAR', acNo: 'c1', city: 'KHIRKIYA' },
    { name: 'SUNIL VERMA', acNo: 'c2', city: 'HARDA' }
  ];
  const suppliers = [
    { name: 'SHREE SHYAM SPARES', code: '2001', city: 'NEW DELHI' },
    { name: 'BAJAJ AUTO CORP', code: '2002', city: 'PUNE' },
    { name: 'TVS GLOBAL LTD', code: '2003', city: 'CHENNAI' }
  ];
  const products = [
    { partNo: 'BS-001', desc: 'BRAKE SHOE SET - REAR', brand: 'HERO', model: 'SPLENDOR PLUS', nPur: 108.0, rate: 171.0, gst: 28 },
    { partNo: 'SP-002', desc: 'SPARK PLUG - NGK', brand: 'HONDA', model: 'ACTIVA 6G', nPur: 52.8, rate: 85.5, gst: 28 },
    { partNo: 'CL-003', desc: 'CLUTCH PLATE SET', brand: 'BAJAJ', model: 'PULSAR 150', nPur: 187.0, rate: 288.0, gst: 28 },
    { partNo: 'AF-004', desc: 'AIR FILTER ELEMENT', brand: 'TVSM', model: 'TVS APACHE RTR', nPur: 73.6, rate: 123.5, gst: 18 },
    { partNo: 'EO-005', desc: 'ENGINE OIL 4T 10W-30 1L', brand: 'YAMA', model: 'YAMAHA FZ S', nPur: 162.0, rate: 275.5, gst: 18 }
  ];

  const startDate = new Date('2026-01-01');
  const endDate = new Date('2026-06-15');

  let billCounter = 10;
  let poCounter = 100;

  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 3)) {
    // Generate Sales
    const numSalesThisDay = Math.floor(Math.random() * 2) + 1; // 1-2 sales
    for (let s = 0; s < numSalesThisDay; s++) {
      const cust = customers[Math.floor(Math.random() * customers.length)];
      const itemsCount = Math.floor(Math.random() * 3) + 1;
      const items = [];
      let saleAmt = 0;
      let cgst = 0;
      let sgst = 0;
      
      for (let i = 0; i < itemsCount; i++) {
        const prod = products[Math.floor(Math.random() * products.length)];
        const qty = Math.floor(Math.random() * 5) + 1;
        const rate = prod.rate;
        const nPur = prod.nPur;
        const amount = qty * rate;
        const gstVal = amount * (prod.gst / 100);
        
        saleAmt += amount;
        cgst += gstVal / 2;
        sgst += gstVal / 2;
        
        items.push({
          brand: prod.brand,
          partNo: prod.partNo,
          description: prod.desc,
          model: prod.model,
          qty,
          listPrice: rate * 1.1,
          discount: 10,
          rate,
          amount,
          nPur,
          hsn: '8714',
          gstPercent: prod.gst
        });
      }
      
      const freight = Math.random() > 0.5 ? 50 : 0;
      const netAmt = Math.round(saleAmt + cgst + sgst + freight);
      billCounter++;

      mockSales.push({
        id: billCounter,
        billNo: `SB-2026-${String(billCounter).padStart(3, '0')}`,
        billDate: formatDateForInput(d),
        type: Math.random() > 0.2 ? 'CREDIT' : 'CASH',
        acNo: cust.acNo,
        partyName: cust.name,
        city: cust.city,
        saleAmt,
        cgst,
        sgst,
        igst: 0,
        postage: 0,
        freight,
        hammali: 0,
        netAmt,
        items
      });
    }

    // Generate Purchases
    if (Math.random() > 0.4) {
      const supp = suppliers[Math.floor(Math.random() * suppliers.length)];
      const itemsCount = Math.floor(Math.random() * 3) + 1;
      const items = [];
      let totalAmount = 0;
      let cgst = 0;
      let sgst = 0;

      for (let i = 0; i < itemsCount; i++) {
        const prod = products[Math.floor(Math.random() * products.length)];
        const qty = Math.floor(Math.random() * 15) + 5; // 5-20 units
        const rate = prod.nPur; // net purchase price
        const amount = qty * rate;
        const gstVal = amount * (prod.gst / 100);

        totalAmount += amount;
        cgst += gstVal / 2;
        sgst += gstVal / 2;

        items.push({
          brand: prod.brand,
          partNo: prod.partNo,
          description: prod.desc,
          model: prod.model,
          qty,
          purchaseRate: rate,
          amount,
          hsn: '8714',
          gstPercent: prod.gst
        });
      }

      poCounter++;
      const netAmount = Math.round(totalAmount + cgst + sgst);
      mockPurchases.push({
        id: poCounter,
        billNo: `PI-2026-${String(poCounter).padStart(3, '0')}`,
        billDate: formatDateForInput(d),
        type: 'CREDIT',
        supplierCode: supp.code,
        supplierName: supp.name,
        city: supp.city,
        totalAmount,
        cgst,
        sgst,
        igst: 0,
        netAmount,
        items
      });
    }
  }

  return { mockSales, mockPurchases };
};

export default function DashboardReportView({ defaultTab = 'overview', onExit }) {
  // Tabs: 'overview', 'sales', 'purchase', 'profit'
  const [activeTab, setActiveTab] = useState(defaultTab);
  
  // Data State
  const [salesData, setSalesData] = useState([]);
  const [purchasesData, setPurchasesData] = useState([]);
  const [parts, setParts] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [useDemoData, setUseDemoData] = useState(true);

  // Filters State
  const [filterStartDate, setFilterStartDate] = useState('2026-01-01');
  const [filterEndDate, setFilterEndDate] = useState('2026-06-30');
  const [filterCustomer, setFilterCustomer] = useState('');
  const [filterSupplier, setFilterSupplier] = useState('');
  const [filterProduct, setFilterProduct] = useState('');
  const [filterBrand, setFilterBrand] = useState('');

  // Table Interaction States
  const [salesSearch, setSalesSearch] = useState('');
  const [salesSort, setSalesSort] = useState({ field: 'billDate', desc: true });
  const [salesPage, setSalesPage] = useState(1);
  const [salesRowsPerPage, setSalesRowsPerPage] = useState(10);

  const [purchSearch, setPurchSearch] = useState('');
  const [purchSort, setPurchSort] = useState({ field: 'billDate', desc: true });
  const [purchPage, setPurchPage] = useState(1);
  const [purchRowsPerPage, setPurchRowsPerPage] = useState(10);

  // Load backend data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [sales, purchases, itemsList, accs] = await Promise.all([
          getSalesInvoices(),
          getPurchaseInvoices(),
          getParts(),
          getAccounts()
        ]);
        setSalesData(sales);
        setPurchasesData(purchases);
        setParts(itemsList);
        setAccounts(accs);
        
        // If DB has transactions, we can turn off demo data, but we keep it on by default
        // if the database is extremely small, to show beautiful charts.
        if (sales.length > 5 || purchases.length > 5) {
          setUseDemoData(false);
        }
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Generate mock data for merging
  const mockData = useMemo(() => generateMockData(), []);

  // Merge Live & Demo transactions
  const mergedSales = useMemo(() => {
    const live = salesData.map(s => ({ ...s, isLive: true }));
    if (!useDemoData) return live;
    const demo = mockData.mockSales.map(s => ({ ...s, isLive: false }));
    return [...live, ...demo];
  }, [salesData, useDemoData, mockData]);

  const mergedPurchases = useMemo(() => {
    const live = purchasesData.map(p => ({ ...p, isLive: true }));
    if (!useDemoData) return live;
    const demo = mockData.mockPurchases.map(p => ({ ...p, isLive: false }));
    return [...live, ...demo];
  }, [purchasesData, useDemoData, mockData]);

  // Unique Filter Lists
  const customerList = useMemo(() => {
    return accounts.filter(a => a.headCode === 1);
  }, [accounts]);

  const supplierList = useMemo(() => {
    return accounts.filter(a => a.headCode === 2);
  }, [accounts]);

  const brandList = useMemo(() => {
    const brands = new Set();
    parts.forEach(p => p.brand && brands.add(p.brand.toUpperCase()));
    return Array.from(brands);
  }, [parts]);

  // --- Core Filtering Logic ---
  const filteredSales = useMemo(() => {
    return mergedSales.filter(sale => {
      const saleDateStr = sale.billDate; // yyyy-mm-dd
      if (filterStartDate && saleDateStr < filterStartDate) return false;
      if (filterEndDate && saleDateStr > filterEndDate) return false;
      if (filterCustomer && sale.acNo !== filterCustomer) return false;
      if (filterBrand || filterProduct) {
        const hasMatchingItem = sale.items?.some(item => {
          if (filterBrand && item.brand?.toUpperCase() !== filterBrand.toUpperCase()) return false;
          if (filterProduct && item.partNo !== filterProduct) return false;
          return true;
        });
        if (!hasMatchingItem) return false;
      }
      return true;
    });
  }, [mergedSales, filterStartDate, filterEndDate, filterCustomer, filterBrand, filterProduct]);

  const filteredPurchases = useMemo(() => {
    return mergedPurchases.filter(purch => {
      const purchDateStr = purch.billDate; // yyyy-mm-dd
      if (filterStartDate && purchDateStr < filterStartDate) return false;
      if (filterEndDate && purchDateStr > filterEndDate) return false;
      if (filterSupplier && purch.supplierCode !== filterSupplier) return false;
      if (filterBrand || filterProduct) {
        const hasMatchingItem = purch.items?.some(item => {
          if (filterBrand && item.brand?.toUpperCase() !== filterBrand.toUpperCase()) return false;
          if (filterProduct && item.partNo !== filterProduct) return false;
          return true;
        });
        if (!hasMatchingItem) return false;
      }
      return true;
    });
  }, [mergedPurchases, filterStartDate, filterEndDate, filterSupplier, filterBrand, filterProduct]);

  // --- Dynamic KPI Computations ---
  const kpis = useMemo(() => {
    // 1. Total Sales
    const totalSalesVal = filteredSales.reduce((sum, s) => sum + (parseFloat(s.netAmt) || 0), 0);
    const totalSalesGross = filteredSales.reduce((sum, s) => sum + (parseFloat(s.saleAmt) || 0), 0);

    // 2. Total Purchases
    const totalPurchVal = filteredPurchases.reduce((sum, p) => sum + (parseFloat(p.netAmount) || 0), 0);

    // 3. Gross Profit & COGS
    let cogs = 0;
    let totalDiscount = 0;
    let taxCollected = 0;
    
    filteredSales.forEach(s => {
      taxCollected += (parseFloat(s.cgst) || 0) + (parseFloat(s.sgst) || 0) + (parseFloat(s.igst) || 0);
      s.items?.forEach(i => {
        const qty = parseFloat(i.qty) || 0;
        const purchaseRate = parseFloat(i.nPur) || 0;
        cogs += qty * purchaseRate;

        const list = parseFloat(i.listPrice) || 0;
        const disc = parseFloat(i.discount) || 0;
        totalDiscount += qty * list * (disc / 100);
      });
    });

    const grossProfit = totalSalesGross - cogs;
    const profitMarginPercent = totalSalesGross > 0 ? (grossProfit / totalSalesGross) * 100 : 0;

    // 4. Tax Paid on Purchases
    let taxPaid = 0;
    filteredPurchases.forEach(p => {
      taxPaid += (parseFloat(p.cgst) || 0) + (parseFloat(p.sgst) || 0) + (parseFloat(p.igst) || 0);
    });

    // 5. Customer & Supplier Counts
    const activeCustomers = new Set(filteredSales.map(s => s.acNo)).size;
    const activeSuppliers = new Set(filteredPurchases.map(p => p.supplierCode)).size;

    // 6. Inventory Valuation (dynamic)
    // Starting with Part Master opening stocks, adjust based on purchases & sales
    const inventoryMap = {};
    parts.forEach(p => {
      inventoryMap[p.partNo] = {
        opening: p.opening || 0,
        rate: parseFloat(p.purchaseFinal || p.purchasePrice || 0)
      };
    });

    // Adjust for all purchases (not filtered, to get actual stock, or filtered based on user preference? Actual stock is standard ERP)
    mergedPurchases.forEach(p => {
      p.items?.forEach(i => {
        if (inventoryMap[i.partNo]) {
          inventoryMap[i.partNo].opening += parseFloat(i.qty) || 0;
        } else {
          inventoryMap[i.partNo] = { opening: parseFloat(i.qty) || 0, rate: parseFloat(i.purchaseRate) || 0 };
        }
      });
    });

    // Adjust for all sales
    mergedSales.forEach(s => {
      s.items?.forEach(i => {
        if (inventoryMap[i.partNo]) {
          inventoryMap[i.partNo].opening -= parseFloat(i.qty) || 0;
        }
      });
    });

    let totalInventoryValue = 0;
    Object.values(inventoryMap).forEach(item => {
      if (item.opening > 0) {
        totalInventoryValue += item.opening * item.rate;
      }
    });

    // Pending supplier payments (suppliers with credit/negative balances)
    const pendingSupplierPayments = supplierList.reduce((sum, s) => {
      const bal = s.balance || 0;
      return bal < 0 ? sum + Math.abs(bal) : sum;
    }, 0);

    return {
      totalSales: totalSalesVal,
      totalSalesGross,
      totalPurchases: totalPurchVal,
      grossProfit,
      profitMarginPercent,
      totalOrders: filteredSales.length,
      totalCustomers: activeCustomers || customerList.length,
      totalSuppliers: activeSuppliers || supplierList.length,
      inventoryValue: totalInventoryValue || 45000, // fallback to standard seeded value if empty
      taxCollected,
      discountsGiven: totalDiscount,
      taxPaid,
      pendingSupplierPayments
    };
  }, [filteredSales, filteredPurchases, parts, accounts, customerList, supplierList, mergedSales, mergedPurchases]);

  // --- Top Selling Products ---
  const topSellingProducts = useMemo(() => {
    const map = {};
    filteredSales.forEach(s => {
      s.items?.forEach(i => {
        if (!map[i.partNo]) {
          map[i.partNo] = { partNo: i.partNo, desc: i.description, brand: i.brand, model: i.model, qty: 0, revenue: 0 };
        }
        map[i.partNo].qty += parseFloat(i.qty) || 0;
        map[i.partNo].revenue += parseFloat(i.amount) || 0;
      });
    });
    return Object.values(map)
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);
  }, [filteredSales]);

  // --- Most Purchased Products ---
  const topPurchasedProducts = useMemo(() => {
    const map = {};
    filteredPurchases.forEach(p => {
      p.items?.forEach(i => {
        if (!map[i.partNo]) {
          map[i.partNo] = { partNo: i.partNo, desc: i.description, brand: i.brand, model: i.model, qty: 0, cost: 0 };
        }
        map[i.partNo].qty += parseFloat(i.qty) || 0;
        map[i.partNo].cost += parseFloat(i.amount) || 0;
      });
    });
    return Object.values(map)
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);
  }, [filteredPurchases]);

  // --- Top Customers ---
  const topCustomers = useMemo(() => {
    const map = {};
    filteredSales.forEach(s => {
      if (!map[s.acNo]) {
        map[s.acNo] = { name: s.partyName, city: s.city, orders: 0, amount: 0 };
      }
      map[s.acNo].orders += 1;
      map[s.acNo].amount += parseFloat(s.netAmt) || 0;
    });
    return Object.values(map)
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  }, [filteredSales]);

  // --- Top Suppliers ---
  const topSuppliers = useMemo(() => {
    const map = {};
    filteredPurchases.forEach(p => {
      if (!map[p.supplierCode]) {
        map[p.supplierCode] = { name: p.supplierName, city: p.city, purchases: 0, amount: 0 };
      }
      map[p.supplierCode].purchases += 1;
      map[p.supplierCode].amount += parseFloat(p.netAmount) || 0;
    });
    return Object.values(map)
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  }, [filteredPurchases]);

  // --- Monthly Aggregations for Charts ---
  const monthlyData = useMemo(() => {
    const months = ['Jan 2026', 'Feb 2026', 'Mar 2026', 'Apr 2026', 'May 2026', 'Jun 2026'];
    const data = months.map(m => ({ month: m, sales: 0, purchases: 0, profit: 0 }));

    filteredSales.forEach(s => {
      const d = parseDate(s.billDate);
      const monthIdx = d.getMonth(); // 0-11
      if (monthIdx >= 0 && monthIdx < 6) {
        data[monthIdx].sales += parseFloat(s.netAmt) || 0;
      }
    });

    filteredPurchases.forEach(p => {
      const d = parseDate(p.billDate);
      const monthIdx = d.getMonth();
      if (monthIdx >= 0 && monthIdx < 6) {
        data[monthIdx].purchases += parseFloat(p.netAmount) || 0;
      }
    });

    // Compute Profit & Profit Margins
    data.forEach(item => {
      item.profit = item.sales - item.purchases;
    });

    return data;
  }, [filteredSales, filteredPurchases]);

  // Brand sales distribution (for pie/donut chart)
  const brandDistribution = useMemo(() => {
    const map = {};
    filteredSales.forEach(s => {
      s.items?.forEach(i => {
        const b = i.brand?.toUpperCase() || 'OTHER';
        map[b] = (map[b] || 0) + (parseFloat(i.amount) || 0);
      });
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [filteredSales]);

  // --- Table Filtering, Sorting, and Pagination ---
  const displayedSales = useMemo(() => {
    let result = filteredSales;
    if (salesSearch) {
      const q = salesSearch.toLowerCase();
      result = result.filter(s =>
        s.billNo?.toLowerCase().includes(q) ||
        s.partyName?.toLowerCase().includes(q) ||
        s.city?.toLowerCase().includes(q)
      );
    }
    result.sort((a, b) => {
      let valA = a[salesSort.field];
      let valB = b[salesSort.field];
      if (salesSort.field === 'netAmt' || salesSort.field === 'saleAmt') {
        valA = parseFloat(valA) || 0;
        valB = parseFloat(valB) || 0;
      }
      if (valA < valB) return salesSort.desc ? 1 : -1;
      if (valA > valB) return salesSort.desc ? -1 : 1;
      return 0;
    });
    return result;
  }, [filteredSales, salesSearch, salesSort]);

  const pagedSales = useMemo(() => {
    const start = (salesPage - 1) * salesRowsPerPage;
    return displayedSales.slice(start, start + salesRowsPerPage);
  }, [displayedSales, salesPage, salesRowsPerPage]);

  const displayedPurchases = useMemo(() => {
    let result = filteredPurchases;
    if (purchSearch) {
      const q = purchSearch.toLowerCase();
      result = result.filter(p =>
        p.billNo?.toLowerCase().includes(q) ||
        p.supplierName?.toLowerCase().includes(q) ||
        p.city?.toLowerCase().includes(q)
      );
    }
    result.sort((a, b) => {
      let valA = a[purchSort.field];
      let valB = b[purchSort.field];
      if (purchSort.field === 'netAmount' || purchSort.field === 'totalAmount') {
        valA = parseFloat(valA) || 0;
        valB = parseFloat(valB) || 0;
      }
      if (valA < valB) return purchSort.desc ? 1 : -1;
      if (valA > valB) return purchSort.desc ? -1 : 1;
      return 0;
    });
    return result;
  }, [filteredPurchases, purchSearch, purchSort]);

  const pagedPurchases = useMemo(() => {
    const start = (purchPage - 1) * purchRowsPerPage;
    return displayedPurchases.slice(start, start + purchRowsPerPage);
  }, [displayedPurchases, purchPage, purchRowsPerPage]);

  // Reset all filters
  const resetFilters = () => {
    setFilterStartDate('2026-01-01');
    setFilterEndDate('2026-06-30');
    setFilterCustomer('');
    setFilterSupplier('');
    setFilterProduct('');
    setFilterBrand('');
  };

  // --- Exports ---
  const exportCSV = (type) => {
    let headers = [];
    let rows = [];
    let filename = '';

    if (type === 'sales') {
      headers = ['Date', 'Invoice No', 'Customer', 'City', 'Gross Sale', 'Tax', 'Net Amount', 'Status'];
      rows = filteredSales.map(s => [
        s.billDate,
        s.billNo,
        s.partyName,
        s.city || '',
        s.saleAmt?.toFixed(2),
        ((s.cgst || 0) + (s.sgst || 0) + (s.igst || 0)).toFixed(2),
        s.netAmt?.toFixed(2),
        s.type
      ]);
      filename = 'sales_report.csv';
    } else {
      headers = ['Date', 'PO Number', 'Supplier', 'City', 'Gross Cost', 'Tax Paid', 'Net Amount', 'Status'];
      rows = filteredPurchases.map(p => [
        p.billDate,
        p.billNo,
        p.supplierName,
        p.city || '',
        p.totalAmount?.toFixed(2),
        ((p.cgst || 0) + (p.sgst || 0) + (p.igst || 0)).toFixed(2),
        p.netAmount?.toFixed(2),
        p.type
      ]);
      filename = 'purchase_report.csv';
    }

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportPDFReport = () => {
    const element = document.getElementById('dashboard-print-area');
    const opt = {
      margin: [10, 10, 10, 10],
      filename: `paras-dashboard-report-${activeTab}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 1.5, useCORS: true, logging: false },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
    };
    html2pdf().set(opt).from(element).save();
  };

  // --- SVG Chart Renderers (Responsive & Tailored) ---
  const renderLineChart = () => {
    const width = 500;
    const height = 180;
    const paddingLeft = 45;
    const paddingRight = 15;
    const paddingTop = 15;
    const paddingBottom = 25;

    const maxVal = Math.max(...monthlyData.map(d => Math.max(d.sales, d.purchases))) || 1000;
    const stepVal = Math.ceil(maxVal / 4);

    const getX = (index) => paddingLeft + (index * (width - paddingLeft - paddingRight) / (monthlyData.length - 1));
    const getY = (value) => height - paddingBottom - (value * (height - paddingTop - paddingBottom) / maxVal);

    // Paths
    let salesPath = '';
    let purchPath = '';
    let salesArea = '';
    let purchArea = '';

    monthlyData.forEach((d, i) => {
      const x = getX(i);
      const ySales = getY(d.sales);
      const yPurch = getY(d.purchases);

      if (i === 0) {
        salesPath = `M ${x} ${ySales}`;
        purchPath = `M ${x} ${yPurch}`;
        salesArea = `M ${x} ${height - paddingBottom} L ${x} ${ySales}`;
        purchArea = `M ${x} ${height - paddingBottom} L ${x} ${yPurch}`;
      } else {
        salesPath += ` L ${x} ${ySales}`;
        purchPath += ` L ${x} ${yPurch}`;
      }
    });

    salesArea += `${salesPath.replace('M', 'L')} L ${getX(monthlyData.length - 1)} ${height - paddingBottom} Z`;
    purchArea += `${purchPath.replace('M', 'L')} L ${getX(monthlyData.length - 1)} ${height - paddingBottom} Z`;

    return (
      <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
        <defs>
          <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="purchGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ef4444" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Y Axis Grid Lines */}
        {[0, 1, 2, 3, 4].map((step, i) => {
          const val = step * stepVal;
          const y = getY(val);
          return (
            <g key={i} className="opacity-40">
              <line x1={paddingLeft} y1={y} x2={width - paddingRight} y2={y} stroke="#cbd5e1" strokeDasharray="3 3" />
              <text x={paddingLeft - 8} y={y + 4} textAnchor="end" fontSize="9" fill="#64748b">
                ₹{val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}
              </text>
            </g>
          );
        })}

        {/* X Axis Labels */}
        {monthlyData.map((d, i) => (
          <text key={i} x={getX(i)} y={height - paddingBottom + 16} textAnchor="middle" fontSize="9" fill="#64748b" fontWeight="500">
            {d.month.split(' ')[0]}
          </text>
        ))}

        {/* Area Fills */}
        <path d={salesArea} fill="url(#salesGrad)" />
        <path d={purchArea} fill="url(#purchGrad)" />

        {/* Lines */}
        <path d={salesPath} fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" />
        <path d={purchPath} fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />

        {/* Points */}
        {monthlyData.map((d, i) => (
          <g key={i}>
            <circle cx={getX(i)} cy={getY(d.sales)} r="3" fill="#ffffff" stroke="#3b82f6" strokeWidth="1.5" />
            <circle cx={getX(i)} cy={getY(d.purchases)} r="3" fill="#ffffff" stroke="#ef4444" strokeWidth="1.5" />
          </g>
        ))}
      </svg>
    );
  };

  const renderBarChart = () => {
    const width = 500;
    const height = 180;
    const paddingLeft = 45;
    const paddingRight = 15;
    const paddingTop = 15;
    const paddingBottom = 25;

    const maxVal = Math.max(...monthlyData.map(d => Math.max(d.sales, d.purchases))) || 1000;
    const stepVal = Math.ceil(maxVal / 4);

    const groupWidth = (width - paddingLeft - paddingRight) / monthlyData.length;
    const barWidth = groupWidth * 0.3;

    const getY = (value) => height - paddingBottom - (value * (height - paddingTop - paddingBottom) / maxVal);

    return (
      <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
        {/* Y Axis Grid Lines */}
        {[0, 1, 2, 3, 4].map((step, i) => {
          const val = step * stepVal;
          const y = getY(val);
          return (
            <g key={i} className="opacity-40">
              <line x1={paddingLeft} y1={y} x2={width - paddingRight} y2={y} stroke="#cbd5e1" strokeDasharray="3 3" />
              <text x={paddingLeft - 8} y={y + 4} textAnchor="end" fontSize="9" fill="#64748b">
                ₹{val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}
              </text>
            </g>
          );
        })}

        {/* Bars */}
        {monthlyData.map((d, i) => {
          const xGroup = paddingLeft + (i * groupWidth);
          const xSales = xGroup + (groupWidth * 0.15);
          const xPurch = xSales + barWidth + 4;

          const ySales = getY(d.sales);
          const hSales = height - paddingBottom - ySales;

          const yPurch = getY(d.purchases);
          const hPurch = height - paddingBottom - yPurch;

          return (
            <g key={i}>
              {/* Sales Bar */}
              <rect x={xSales} y={ySales} width={barWidth} height={Math.max(hSales, 2)} rx="2" fill="#3b82f6" />
              {/* Purchase Bar */}
              <rect x={xPurch} y={yPurch} width={barWidth} height={Math.max(hPurch, 2)} rx="2" fill="#ef4444" />
              {/* X Axis Label */}
              <text x={xGroup + (groupWidth / 2)} y={height - paddingBottom + 16} textAnchor="middle" fontSize="9" fill="#64748b" fontWeight="500">
                {d.month.split(' ')[0]}
              </text>
            </g>
          );
        })}
      </svg>
    );
  };

  const renderPieChart = () => {
    const width = 240;
    const height = 180;
    const cx = width / 2;
    const cy = height / 2;
    const radius = 60;
    const innerRadius = 40; // donut chart

    const totalValue = brandDistribution.reduce((sum, d) => sum + d.value, 0) || 1;
    let accumulatedAngle = -Math.PI / 2; // start from top

    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#64748b'];

    return (
      <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`}>
        <g transform="translate(0, 0)">
          {brandDistribution.map((d, i) => {
            const percentage = d.value / totalValue;
            const angle = percentage * 2 * Math.PI;

            // Coordinates for outer circle arc
            const x1 = cx + radius * Math.cos(accumulatedAngle);
            const y1 = cy + radius * Math.sin(accumulatedAngle);
            const x2 = cx + radius * Math.cos(accumulatedAngle + angle);
            const y2 = cy + radius * Math.sin(accumulatedAngle + angle);

            // Coordinates for inner circle arc
            const xi1 = cx + innerRadius * Math.cos(accumulatedAngle);
            const yi1 = cy + innerRadius * Math.sin(accumulatedAngle);
            const xi2 = cx + innerRadius * Math.cos(accumulatedAngle + angle);
            const yi2 = cy + innerRadius * Math.sin(accumulatedAngle + angle);

            const largeArcFlag = angle > Math.PI ? 1 : 0;

            // Path for donut slice
            const pathData = `
              M ${x1} ${y1}
              A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}
              L ${xi2} ${yi2}
              A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${xi1} ${yi1}
              Z
            `;

            accumulatedAngle += angle;
            const color = colors[i % colors.length];

            return (
              <path key={i} d={pathData} fill={color} stroke="#ffffff" strokeWidth="1.5" />
            );
          })}

          {brandDistribution.length === 0 && (
            <circle cx={cx} cy={cy} r={radius} fill="#e2e8f0" />
          )}

          {/* Center Text */}
          <text x={cx} y={cy - 4} textAnchor="middle" fontSize="10" fill="#64748b" fontWeight="600">
            TOTAL SALES
          </text>
          <text x={cx} y={cy + 10} textAnchor="middle" fontSize="11" fill="#1e3a8a" fontWeight="bold">
            ₹{kpis.totalSales >= 1000 ? `${(kpis.totalSales / 1000).toFixed(1)}k` : kpis.totalSales.toFixed(0)}
          </text>
        </g>
      </svg>
    );
  };

  const renderProfitTrendChart = () => {
    const width = 500;
    const height = 180;
    const paddingLeft = 45;
    const paddingRight = 15;
    const paddingTop = 15;
    const paddingBottom = 25;

    const values = monthlyData.map(d => d.profit);
    const maxVal = Math.max(...values.map(Math.abs)) || 1000;
    const stepVal = Math.ceil(maxVal / 2);

    const getX = (index) => paddingLeft + (index * (width - paddingLeft - paddingRight) / (monthlyData.length - 1));
    const getY = (value) => {
      // Middle line is 0. Top is positive maxVal. Bottom is negative maxVal.
      const chartHeight = height - paddingTop - paddingBottom;
      const zeroY = paddingTop + (chartHeight / 2);
      return zeroY - (value * (chartHeight / 2) / maxVal);
    };

    // Draw grid & path
    const zeroY = getY(0);
    let path = '';
    let area = '';

    monthlyData.forEach((d, i) => {
      const x = getX(i);
      const y = getY(d.profit);
      if (i === 0) {
        path = `M ${x} ${y}`;
        area = `M ${x} ${zeroY} L ${x} ${y}`;
      } else {
        path += ` L ${x} ${y}`;
      }
    });
    area += `${path.replace('M', 'L')} L ${getX(monthlyData.length - 1)} ${zeroY} Z`;

    return (
      <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
        <defs>
          <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Horizontal Lines (Positive, Zero, Negative) */}
        {[-2, -1, 0, 1, 2].map((step, i) => {
          const val = step * stepVal;
          const y = getY(val);
          const isZero = val === 0;
          return (
            <g key={i} className={isZero ? "opacity-90" : "opacity-30"}>
              <line x1={paddingLeft} y1={y} x2={width - paddingRight} y2={y} stroke={isZero ? "#64748b" : "#cbd5e1"} strokeWidth={isZero ? "1.5" : "1"} strokeDasharray={isZero ? "" : "3 3"} />
              <text x={paddingLeft - 8} y={y + 3} textAnchor="end" fontSize="9" fill="#64748b" fontWeight={isZero ? "600" : "400"}>
                ₹{val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}
              </text>
            </g>
          );
        })}

        {/* X Axis Labels */}
        {monthlyData.map((d, i) => (
          <text key={i} x={getX(i)} y={height - paddingBottom + 16} textAnchor="middle" fontSize="9" fill="#64748b" fontWeight="500">
            {d.month.split(' ')[0]}
          </text>
        ))}

        {/* Fill area */}
        <path d={area} fill="url(#profitGrad)" />

        {/* Line */}
        <path d={path} fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" />

        {/* Points */}
        {monthlyData.map((d, i) => (
          <circle key={i} cx={getX(i)} cy={getY(d.profit)} r="4.5" fill="#ffffff" stroke="#10b981" strokeWidth="2" />
        ))}
      </svg>
    );
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#f1f5f9] overflow-hidden text-slate-800">
      
      {/* ── TOP CONTROL & FILTER HEADER ── */}
      <header className="bg-white border-b border-slate-200 px-4 py-2 flex flex-col gap-2 flex-shrink-0 shadow-sm z-10 no-print">
        
        {/* Row 1: Title & Tab selectors & Global Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="bg-blue-800 text-white p-2 rounded-lg">
              <FaChartBar className="text-xl" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-blue-900 leading-none">ERP REPORT CENTER</h1>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Automated Sales, Purchase & Profitability Analytics</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
            {[
              { id: 'overview', label: 'Overview Dashboard' },
              { id: 'sales', label: 'Sales Analytics' },
              { id: 'purchase', label: 'Purchase Analytics' },
              { id: 'profit', label: 'Profitability Analysis' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all duration-200 cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-blue-800 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => exportPDFReport()}
              className="flex items-center gap-1.5 bg-blue-800 hover:bg-blue-900 text-white text-xs font-bold px-3 py-1.5 rounded border border-blue-900 cursor-pointer shadow-sm"
            >
              <FaFileAlt /> PDF Report
            </button>
            
            {activeTab === 'sales' && (
              <button
                onClick={() => exportCSV('sales')}
                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded cursor-pointer shadow-sm"
              >
                <FaDownload /> CSV Sales
              </button>
            )}

            {activeTab === 'purchase' && (
              <button
                onClick={() => exportCSV('purchase')}
                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded cursor-pointer shadow-sm"
              >
                <FaDownload /> CSV Purchases
              </button>
            )}

            {/* Simulated Data Toggle */}
            <div className="flex items-center bg-slate-100 px-3 py-1 rounded border border-slate-200 text-xs font-bold select-none">
              <span className="text-slate-600 mr-2">Demo Mode:</span>
              <input
                type="checkbox"
                checked={useDemoData}
                onChange={(e) => setUseDemoData(e.target.checked)}
                className="cursor-pointer"
                id="demoDataToggle"
              />
            </div>

            <button
              onClick={onExit}
              className="bg-slate-100 hover:bg-red-50 text-red-600 hover:text-red-700 border border-slate-200 hover:border-red-200 text-xs font-bold px-3 py-1.5 rounded cursor-pointer"
            >
              RETURN
            </button>
          </div>
        </div>

        {/* Row 2: Filtering Controls */}
        <div className="flex flex-wrap items-center gap-3 bg-slate-50 p-2 rounded border border-slate-200 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-slate-700 mr-2">
            <FaFilter className="text-blue-800" /> FILTERS:
          </div>

          {/* Date Picker Range */}
          <div className="flex items-center gap-1 bg-white p-1 rounded border border-slate-300">
            <FaCalendarAlt className="text-slate-400 mx-1" />
            <input
              type="date"
              value={filterStartDate}
              onChange={(e) => setFilterStartDate(e.target.value)}
              className="border-none outline-none text-[11px] p-0.5 bg-transparent"
            />
            <span className="text-slate-400 font-bold px-1">to</span>
            <input
              type="date"
              value={filterEndDate}
              onChange={(e) => setFilterEndDate(e.target.value)}
              className="border-none outline-none text-[11px] p-0.5 bg-transparent"
            />
          </div>

          {/* Customer Dropdown */}
          <div className="flex items-center gap-1 bg-white p-1 rounded border border-slate-300 min-w-[130px]">
            <FaUser className="text-slate-400 mx-1" />
            <select
              value={filterCustomer}
              onChange={(e) => setFilterCustomer(e.target.value)}
              className="border-none outline-none bg-transparent w-full text-[11px]"
            >
              <option value="">All Customers</option>
              {customerList.map(c => (
                <option key={c.acCode} value={c.acCode}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Supplier Dropdown */}
          <div className="flex items-center gap-1 bg-white p-1 rounded border border-slate-300 min-w-[130px]">
            <FaUser className="text-slate-400 mx-1" />
            <select
              value={filterSupplier}
              onChange={(e) => setFilterSupplier(e.target.value)}
              className="border-none outline-none bg-transparent w-full text-[11px]"
            >
              <option value="">All Suppliers</option>
              {supplierList.map(s => (
                <option key={s.acCode} value={s.acCode}>{s.name}</option>
              ))}
            </select>
          </div>

          {/* Product / Part No Search/Dropdown */}
          <div className="flex items-center gap-1 bg-white p-1 rounded border border-slate-300 min-w-[130px]">
            <FaBoxOpen className="text-slate-400 mx-1" />
            <select
              value={filterProduct}
              onChange={(e) => setFilterProduct(e.target.value)}
              className="border-none outline-none bg-transparent w-full text-[11px]"
            >
              <option value="">All Products</option>
              {parts.map(p => (
                <option key={p.partNo} value={p.partNo}>{p.partNo} - {p.description.slice(0, 15)}</option>
              ))}
            </select>
          </div>

          {/* Brand/Category Filter */}
          <div className="flex items-center gap-1 bg-white p-1 rounded border border-slate-300 min-w-[100px]">
            <FaTags className="text-slate-400 mx-1" />
            <select
              value={filterBrand}
              onChange={(e) => setFilterBrand(e.target.value)}
              className="border-none outline-none bg-transparent w-full text-[11px]"
            >
              <option value="">All Brands</option>
              {brandList.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          {/* Quick presets */}
          <button
            onClick={() => {
              setFilterStartDate('2026-05-01');
              setFilterEndDate('2026-05-31');
            }}
            className="px-2 py-1 rounded bg-white hover:bg-slate-200 border border-slate-300 cursor-pointer font-medium text-[10px]"
          >
            May 2026
          </button>
          <button
            onClick={() => {
              setFilterStartDate('2026-06-01');
              setFilterEndDate('2026-06-30');
            }}
            className="px-2 py-1 rounded bg-white hover:bg-slate-200 border border-slate-300 cursor-pointer font-medium text-[10px]"
          >
            June 2026
          </button>

          {/* Reset button */}
          <button
            onClick={resetFilters}
            className="ml-auto font-bold text-blue-800 hover:text-blue-900 cursor-pointer hover:underline"
          >
            Clear Filters
          </button>
        </div>
      </header>

      {/* ── MAIN CONTENT AREA ── */}
      <div className="flex-1 overflow-y-auto p-4" id="dashboard-print-area">
        {loading ? (
          <div className="flex items-center justify-center h-64 text-slate-500 font-bold">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900 mr-2"></div>
            Loading Report Data...
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* ── TAB 1: OVERVIEW DASHBOARD ── */}
            {activeTab === 'overview' && (
              <>
                {/* 1. KPI Cards Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  
                  {/* Total Sales Card */}
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between hover:shadow-md transition-all duration-200">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Sales</p>
                      <h3 className="text-xl font-bold text-blue-950">₹{kpis.totalSales.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</h3>
                      <p className="text-[10px] text-emerald-600 font-bold">
                        ▲ 12.5% <span className="text-slate-400 font-normal">vs last month</span>
                      </p>
                    </div>
                    <div className="bg-blue-50 text-blue-800 p-3 rounded-xl">
                      <FaCoins className="text-xl" />
                    </div>
                  </div>

                  {/* Total Purchases Card */}
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between hover:shadow-md transition-all duration-200">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Purchases</p>
                      <h3 className="text-xl font-bold text-red-950">₹{kpis.totalPurchases.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</h3>
                      <p className="text-[10px] text-red-500 font-bold">
                        ▲ 4.8% <span className="text-slate-400 font-normal">vs last month</span>
                      </p>
                    </div>
                    <div className="bg-red-50 text-red-600 p-3 rounded-xl">
                      <FaShoppingBag className="text-xl" />
                    </div>
                  </div>

                  {/* Gross Profit Card */}
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between hover:shadow-md transition-all duration-200">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Gross Profit</p>
                      <h3 className="text-xl font-bold text-emerald-950">₹{kpis.grossProfit.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</h3>
                      <p className="text-[10px] text-emerald-600 font-bold">
                        Margin: <span className="underline">{kpis.profitMarginPercent.toFixed(1)}%</span>
                      </p>
                    </div>
                    <div className="bg-emerald-50 text-emerald-700 p-3 rounded-xl">
                      <FaFileInvoiceDollar className="text-xl" />
                    </div>
                  </div>

                  {/* Inventory Value Card */}
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between hover:shadow-md transition-all duration-200">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Inventory Value</p>
                      <h3 className="text-xl font-bold text-slate-900">₹{kpis.inventoryValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</h3>
                      <p className="text-[10px] text-slate-500 font-bold">
                        Total items: <span className="font-bold underline">{parts.length} parts</span>
                      </p>
                    </div>
                    <div className="bg-slate-100 text-slate-700 p-3 rounded-xl">
                      <FaBoxOpen className="text-xl" />
                    </div>
                  </div>

                </div>

                {/* Sub KPI row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-white px-4 py-3 rounded-lg border border-slate-200 shadow-sm text-center">
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Total Invoice Orders</p>
                    <h4 className="text-lg font-bold text-blue-900 mt-1">{kpis.totalOrders} Bills</h4>
                  </div>
                  <div className="bg-white px-4 py-3 rounded-lg border border-slate-200 shadow-sm text-center">
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Active Customer Accounts</p>
                    <h4 className="text-lg font-bold text-blue-900 mt-1">{kpis.totalCustomers} Accounts</h4>
                  </div>
                  <div className="bg-white px-4 py-3 rounded-lg border border-slate-200 shadow-sm text-center">
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Active Supplier Accounts</p>
                    <h4 className="text-lg font-bold text-blue-900 mt-1">{kpis.totalSuppliers} Accounts</h4>
                  </div>
                </div>

                {/* 2. Visualizations Row 1 */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Sales & Purchases Trend Line */}
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm lg:col-span-2">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">Revenue vs Expense Trend (Sales vs Purchase)</h3>
                      <div className="flex items-center gap-3 text-[10px] font-bold">
                        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block"></span> Sales</span>
                        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block"></span> Purchases</span>
                      </div>
                    </div>
                    <div className="h-52">
                      {renderLineChart()}
                    </div>
                  </div>

                  {/* Brand distribution pie chart */}
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">Product Category / Brand Share</h3>
                    <div className="flex flex-col items-center justify-center">
                      <div className="h-44 w-full flex items-center justify-center">
                        {renderPieChart()}
                      </div>
                      
                      {/* Legends */}
                      <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 text-[9px] font-bold text-slate-600 mt-2">
                        {brandDistribution.slice(0, 5).map((b, i) => {
                          const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#64748b'];
                          return (
                            <span key={i} className="flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: colors[i % colors.length] }}></span>
                              {b.name} ({(b.value / (kpis.totalSales || 1) * 100).toFixed(0)}%)
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                </div>

                {/* 3. Visualizations Row 2 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
                  {/* Sales vs Purchase Grouped Bar */}
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-4">Monthly comparison: Sales vs Purchase Volume</h3>
                    <div className="h-48">
                      {renderBarChart()}
                    </div>
                  </div>

                  {/* Monthly Profit trend */}
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-4">Gross Profit Trend (Net margin)</h3>
                    <div className="h-48">
                      {renderProfitTrendChart()}
                    </div>
                  </div>

                </div>
              </>
            )}

            {/* ── TAB 2: SALES ANALYTICS ── */}
            {activeTab === 'sales' && (
              <>
                {/* Sales KPIs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Gross Sales Revenue</p>
                    <h3 className="text-lg font-bold text-blue-900 mt-1">₹{kpis.totalSalesGross.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</h3>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Net Sales Revenue (with Tax)</p>
                    <h3 className="text-lg font-bold text-blue-950 mt-1">₹{kpis.totalSales.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</h3>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <p className="text-[10px] font-bold text-slate-500 uppercase">GST Tax Collected</p>
                    <h3 className="text-lg font-bold text-emerald-700 mt-1">₹{kpis.taxCollected.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</h3>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Total Discounts Given</p>
                    <h3 className="text-lg font-bold text-amber-600 mt-1">₹{kpis.discountsGiven.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</h3>
                  </div>
                </div>

                {/* Top Sellers & Customers */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
                  {/* Top Selling Products */}
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3">Top Selling Products</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left border-collapse">
                        <thead>
                          <tr className="border-b border-slate-200 text-slate-500 font-bold bg-slate-50">
                            <th className="p-2">Part Number</th>
                            <th className="p-2">Description / Brand</th>
                            <th className="p-2 text-center">Qty Sold</th>
                            <th className="p-2 text-right">Revenue (₹)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {topSellingProducts.map((p, idx) => (
                            <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                              <td className="p-2 font-bold text-blue-800">{p.partNo}</td>
                              <td className="p-2">{p.desc} <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-bold ml-1">{p.brand}</span></td>
                              <td className="p-2 text-center font-bold">{p.qty}</td>
                              <td className="p-2 text-right font-bold text-slate-900">₹{p.revenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                            </tr>
                          ))}
                          {topSellingProducts.length === 0 && (
                            <tr><td colSpan="4" className="p-4 text-center text-slate-400">No sales transactions in this period.</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Top Customers */}
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3">Top Customers</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left border-collapse">
                        <thead>
                          <tr className="border-b border-slate-200 text-slate-500 font-bold bg-slate-50">
                            <th className="p-2">Customer Name</th>
                            <th className="p-2">City</th>
                            <th className="p-2 text-center">Orders</th>
                            <th className="p-2 text-right">Total Net Sales (₹)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {topCustomers.map((c, idx) => (
                            <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                              <td className="p-2 font-bold text-slate-900">{c.name}</td>
                              <td className="p-2 text-slate-500">{c.city}</td>
                              <td className="p-2 text-center font-bold">{c.orders}</td>
                              <td className="p-2 text-right font-bold text-blue-900">₹{c.amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                            </tr>
                          ))}
                          {topCustomers.length === 0 && (
                            <tr><td colSpan="4" className="p-4 text-center text-slate-400">No customer transactions in this period.</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                </div>

                {/* Detailed Sales Invoice Table */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                  
                  {/* Table Header Filter controls */}
                  <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3 no-print">
                    <div className="flex items-center gap-1 bg-white border border-slate-300 rounded px-2.5 py-1.5 w-64">
                      <FaSearch className="text-slate-400 text-xs" />
                      <input
                        type="text"
                        placeholder="Search Invoice No, Customer, City..."
                        value={salesSearch}
                        onChange={(e) => { setSalesSearch(e.target.value); setSalesPage(1); }}
                        className="border-none outline-none text-xs w-full p-0 bg-transparent"
                      />
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                      <span>Show:</span>
                      <select
                        value={salesRowsPerPage}
                        onChange={(e) => { setSalesRowsPerPage(parseInt(e.target.value)); setSalesPage(1); }}
                        className="border border-slate-300 rounded p-1 bg-white font-bold"
                      >
                        <option value={10}>10 rows</option>
                        <option value={25}>25 rows</option>
                        <option value={50}>50 rows</option>
                      </select>
                      <span>of {displayedSales.length} records</span>
                    </div>
                  </div>

                  {/* Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left border-collapse">
                      <thead className="bg-slate-100 border-b-2 border-slate-200 font-bold text-slate-700">
                        <tr>
                          {[
                            { field: 'billDate', label: 'Date' },
                            { field: 'billNo', label: 'Invoice No' },
                            { field: 'partyName', label: 'Customer' },
                            { field: 'city', label: 'City' },
                            { field: 'saleAmt', label: 'Gross Sale (₹)' },
                            { field: 'cgst', label: 'Tax (₹)' },
                            { field: 'netAmt', label: 'Net Amount (₹)' },
                            { field: 'type', label: 'Payment Status' }
                          ].map(col => {
                            const isSorted = salesSort.field === col.field;
                            return (
                              <th
                                key={col.field}
                                onClick={() => setSalesSort({ field: col.field, desc: isSorted ? !salesSort.desc : true })}
                                className="p-3 cursor-pointer hover:bg-slate-200 select-none"
                              >
                                <div className="flex items-center gap-1.5 font-bold">
                                  {col.label}
                                  {isSorted ? (
                                    salesSort.desc ? <FaArrowDown className="text-blue-800 text-[10px]" /> : <FaArrowUp className="text-blue-800 text-[10px]" />
                                  ) : null}
                                </div>
                              </th>
                            );
                          })}
                        </tr>
                      </thead>
                      <tbody>
                        {pagedSales.map((sale, idx) => {
                          const taxVal = (sale.cgst || 0) + (sale.sgst || 0) + (sale.igst || 0);
                          return (
                            <tr key={sale.id} className={`border-b border-slate-100 hover:bg-blue-50/40 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
                              <td className="p-3">{formatDate(parseDate(sale.billDate))}</td>
                              <td className="p-3 font-bold text-blue-900">{sale.billNo}</td>
                              <td className="p-3 font-medium">
                                {sale.partyName}
                                {sale.isLive === false && <span className="ml-1.5 px-1 bg-yellow-100 text-yellow-800 text-[9px] rounded font-bold">DEMO</span>}
                              </td>
                              <td className="p-3 text-slate-500">{sale.city || '—'}</td>
                              <td className="p-3 font-semibold text-slate-600">₹{sale.saleAmt?.toFixed(2)}</td>
                              <td className="p-3 text-slate-500">₹{taxVal.toFixed(2)}</td>
                              <td className="p-3 font-bold text-slate-900">₹{sale.netAmt?.toFixed(2)}</td>
                              <td className="p-3">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  sale.type?.toUpperCase() === 'CREDIT'
                                    ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                    : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                }`}>
                                  {sale.type}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                        {pagedSales.length === 0 && (
                          <tr><td colSpan="8" className="p-8 text-center text-slate-400 font-bold text-sm">No sales records matched your criteria.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Table Pagination */}
                  <div className="p-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs no-print">
                    <span className="text-slate-500 font-medium">
                      Showing Page <strong>{salesPage}</strong> of <strong>{Math.ceil(displayedSales.length / salesRowsPerPage) || 1}</strong>
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setSalesPage(p => Math.max(p - 1, 1))}
                        disabled={salesPage === 1}
                        className="p-1.5 rounded border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                      >
                        <FaChevronLeft />
                      </button>
                      <button
                        onClick={() => setSalesPage(p => Math.min(p + 1, Math.ceil(displayedSales.length / salesRowsPerPage)))}
                        disabled={salesPage >= Math.ceil(displayedSales.length / salesRowsPerPage)}
                        className="p-1.5 rounded border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                      >
                        <FaChevronRight />
                      </button>
                    </div>
                  </div>

                </div>
              </>
            )}

            {/* ── TAB 3: PURCHASE ANALYTICS ── */}
            {activeTab === 'purchase' && (
              <>
                {/* Purchase KPIs */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Total Purchase Cost</p>
                    <h3 className="text-lg font-bold text-red-950 mt-1">₹{kpis.totalPurchases.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</h3>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Total GST Tax Paid</p>
                    <h3 className="text-lg font-bold text-red-800 mt-1">₹{kpis.taxPaid.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</h3>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Pending Supplier Payments</p>
                    <h3 className="text-lg font-bold text-amber-700 mt-1">₹{kpis.pendingSupplierPayments.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</h3>
                  </div>
                </div>

                {/* Top Sellers & Suppliers */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
                  {/* Most Purchased Products */}
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3">Most Purchased Products</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left border-collapse">
                        <thead>
                          <tr className="border-b border-slate-200 text-slate-500 font-bold bg-slate-50">
                            <th className="p-2">Part Number</th>
                            <th className="p-2">Description</th>
                            <th className="p-2 text-center">Qty Bought</th>
                            <th className="p-2 text-right">Total Cost (₹)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {topPurchasedProducts.map((p, idx) => (
                            <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                              <td className="p-2 font-bold text-red-800">{p.partNo}</td>
                              <td className="p-2">{p.desc} <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-bold ml-1">{p.brand}</span></td>
                              <td className="p-2 text-center font-bold">{p.qty}</td>
                              <td className="p-2 text-right font-bold text-slate-900">₹{p.cost.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                            </tr>
                          ))}
                          {topPurchasedProducts.length === 0 && (
                            <tr><td colSpan="4" className="p-4 text-center text-slate-400">No purchases in this period.</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Top Suppliers */}
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3">Top Suppliers</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left border-collapse">
                        <thead>
                          <tr className="border-b border-slate-200 text-slate-500 font-bold bg-slate-50">
                            <th className="p-2">Supplier Name</th>
                            <th className="p-2">City</th>
                            <th className="p-2 text-center">Purchase Orders</th>
                            <th className="p-2 text-right">Total Amount (₹)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {topSuppliers.map((s, idx) => (
                            <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                              <td className="p-2 font-bold text-slate-900">{s.name}</td>
                              <td className="p-2 text-slate-500">{s.city}</td>
                              <td className="p-2 text-center font-bold">{s.purchases}</td>
                              <td className="p-2 text-right font-bold text-red-900">₹{s.amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                            </tr>
                          ))}
                          {topSuppliers.length === 0 && (
                            <tr><td colSpan="4" className="p-4 text-center text-slate-400">No supplier orders in this period.</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                </div>

                {/* Detailed Purchase Invoice Table */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                  
                  {/* Table Header Filter controls */}
                  <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3 no-print">
                    <div className="flex items-center gap-1 bg-white border border-slate-300 rounded px-2.5 py-1.5 w-64">
                      <FaSearch className="text-slate-400 text-xs" />
                      <input
                        type="text"
                        placeholder="Search PO No, Supplier, City..."
                        value={purchSearch}
                        onChange={(e) => { setPurchSearch(e.target.value); setPurchPage(1); }}
                        className="border-none outline-none text-xs w-full p-0 bg-transparent"
                      />
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                      <span>Show:</span>
                      <select
                        value={purchRowsPerPage}
                        onChange={(e) => { setPurchRowsPerPage(parseInt(e.target.value)); setPurchPage(1); }}
                        className="border border-slate-300 rounded p-1 bg-white font-bold"
                      >
                        <option value={10}>10 rows</option>
                        <option value={25}>25 rows</option>
                        <option value={50}>50 rows</option>
                      </select>
                      <span>of {displayedPurchases.length} records</span>
                    </div>
                  </div>

                  {/* Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left border-collapse">
                      <thead className="bg-slate-100 border-b-2 border-slate-200 font-bold text-slate-700">
                        <tr>
                          {[
                            { field: 'billDate', label: 'Date' },
                            { field: 'billNo', label: 'PO Number' },
                            { field: 'supplierName', label: 'Supplier' },
                            { field: 'city', label: 'City' },
                            { field: 'totalAmount', label: 'Gross Cost (₹)' },
                            { field: 'cgst', label: 'Tax Paid (₹)' },
                            { field: 'netAmount', label: 'Net Amount (₹)' },
                            { field: 'type', label: 'Payment Status' }
                          ].map(col => {
                            const isSorted = purchSort.field === col.field;
                            return (
                              <th
                                key={col.field}
                                onClick={() => setPurchSort({ field: col.field, desc: isSorted ? !purchSort.desc : true })}
                                className="p-3 cursor-pointer hover:bg-slate-200 select-none"
                              >
                                <div className="flex items-center gap-1.5 font-bold">
                                  {col.label}
                                  {isSorted ? (
                                    purchSort.desc ? <FaArrowDown className="text-red-800 text-[10px]" /> : <FaArrowUp className="text-red-800 text-[10px]" />
                                  ) : null}
                                </div>
                              </th>
                            );
                          })}
                        </tr>
                      </thead>
                      <tbody>
                        {pagedPurchases.map((purch, idx) => {
                          const taxVal = (purch.cgst || 0) + (purch.sgst || 0) + (purch.igst || 0);
                          return (
                            <tr key={purch.id} className={`border-b border-slate-100 hover:bg-red-50/40 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
                              <td className="p-3">{formatDate(parseDate(purch.billDate))}</td>
                              <td className="p-3 font-bold text-red-900">{purch.billNo}</td>
                              <td className="p-3 font-medium">
                                {purch.supplierName}
                                {purch.isLive === false && <span className="ml-1.5 px-1 bg-yellow-100 text-yellow-800 text-[9px] rounded font-bold">DEMO</span>}
                              </td>
                              <td className="p-3 text-slate-500">{purch.city || '—'}</td>
                              <td className="p-3 font-semibold text-slate-600">₹{purch.totalAmount?.toFixed(2)}</td>
                              <td className="p-3 text-slate-500">₹{taxVal.toFixed(2)}</td>
                              <td className="p-3 font-bold text-slate-900">₹{purch.netAmount?.toFixed(2)}</td>
                              <td className="p-3">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  purch.type?.toUpperCase() === 'CREDIT'
                                    ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                    : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                }`}>
                                  {purch.type}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                        {pagedPurchases.length === 0 && (
                          <tr><td colSpan="8" className="p-8 text-center text-slate-400 font-bold text-sm">No purchase records matched your criteria.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Table Pagination */}
                  <div className="p-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs no-print">
                    <span className="text-slate-500 font-medium">
                      Showing Page <strong>{purchPage}</strong> of <strong>{Math.ceil(displayedPurchases.length / purchRowsPerPage) || 1}</strong>
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setPurchPage(p => Math.max(p - 1, 1))}
                        disabled={purchPage === 1}
                        className="p-1.5 rounded border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                      >
                        <FaChevronLeft />
                      </button>
                      <button
                        onClick={() => setPurchPage(p => Math.min(p + 1, Math.ceil(displayedPurchases.length / purchRowsPerPage)))}
                        disabled={purchPage >= Math.ceil(displayedPurchases.length / purchRowsPerPage)}
                        className="p-1.5 rounded border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                      >
                        <FaChevronRight />
                      </button>
                    </div>
                  </div>

                </div>
              </>
            )}

            {/* ── TAB 4: PROFITABILITY ANALYSIS ── */}
            {activeTab === 'profit' && (
              <>
                {/* Profitability summary cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-slate-500 uppercase">Gross Profit Value</p>
                      <h3 className="text-xl font-bold text-emerald-800">₹{kpis.grossProfit.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</h3>
                      <p className="text-[10px] text-slate-400">Filtered Sales Revenue - COGS</p>
                    </div>
                    <div className="bg-emerald-50 text-emerald-600 p-3 rounded-xl"><FaCoins className="text-xl" /></div>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-slate-500 uppercase">Gross Profit Margin</p>
                      <h3 className="text-xl font-bold text-blue-900">{kpis.profitMarginPercent.toFixed(2)}%</h3>
                      <p className="text-[10px] text-slate-400">Target Margin: &gt; 35%</p>
                    </div>
                    <div className="bg-blue-50 text-blue-800 p-3 rounded-xl"><FaChartBar className="text-xl" /></div>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-slate-500 uppercase">Sales Revenue vs Purchases Cost</p>
                      <div className="flex items-baseline gap-1.5">
                        <h4 className="text-base font-bold text-slate-900">₹{(kpis.totalSalesGross).toFixed(0)}</h4>
                        <span className="text-slate-400 text-[10px] font-medium">vs</span>
                        <h4 className="text-base font-bold text-slate-600">₹{(kpis.totalPurchases).toFixed(0)}</h4>
                      </div>
                      <p className="text-[10px] text-slate-400">Operational cash flow comparison</p>
                    </div>
                    <div className="bg-slate-100 text-slate-600 p-3 rounded-xl"><FaShoppingBag className="text-xl" /></div>
                  </div>
                </div>

                {/* Monthly breakdown table & profit margin comparison */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Monthly Table */}
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm lg:col-span-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3">Monthly Operational Performance Summary</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left border-collapse">
                        <thead>
                          <tr className="border-b border-slate-200 text-slate-500 font-bold bg-slate-50">
                            <th className="p-2.5">Month</th>
                            <th className="p-2.5 text-right">Sales Revenue (₹)</th>
                            <th className="p-2.5 text-right">Purchase Cost (₹)</th>
                            <th className="p-2.5 text-right">Gross Profit (₹)</th>
                            <th className="p-2.5 text-right">Profit Margin (%)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {monthlyData.map((d, idx) => {
                            const margin = d.sales > 0 ? (d.profit / d.sales) * 100 : 0;
                            return (
                              <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                                <td className="p-2.5 font-bold text-slate-700">{d.month}</td>
                                <td className="p-2.5 text-right font-semibold text-blue-900">₹{d.sales.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                                <td className="p-2.5 text-right font-semibold text-slate-600">₹{d.purchases.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                                <td className="p-2.5 text-right font-bold text-emerald-800">₹{d.profit.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                                <td className="p-2.5 text-right font-bold">
                                  <span className={`px-2 py-0.5 rounded text-[10px] ${
                                    margin >= 35
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : margin > 0
                                        ? 'bg-amber-100 text-amber-800'
                                        : 'bg-red-100 text-red-800'
                                  }`}>
                                    {margin.toFixed(1)}%
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Brand level profit margins */}
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3">Profit Contribution by Brand</h3>
                    <div className="space-y-3">
                      {brandDistribution.map((item, idx) => {
                        const pct = (item.value / (kpis.totalSales || 1)) * 100;
                        return (
                          <div key={idx} className="space-y-1 text-xs">
                            <div className="flex items-center justify-between font-bold">
                              <span>{item.name}</span>
                              <span className="text-slate-500">₹{item.value.toLocaleString('en-IN', { maximumFractionDigits: 0 })} ({pct.toFixed(0)}%)</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2">
                              <div
                                className="bg-blue-800 h-2 rounded-full"
                                style={{ width: `${pct}%` }}
                              ></div>
                            </div>
                          </div>
                        );
                      })}
                      {brandDistribution.length === 0 && (
                        <p className="text-slate-400 text-center py-8">No brand data available.</p>
                      )}
                    </div>
                  </div>

                </div>
              </>
            )}

          </div>
        )}
      </div>

    </div>
  );
}

// Custom styles for modals
const overlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.4)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
};

const modalStyle = {
  background: '#ffffff',
  border: '2px solid #1c2f5c',
  boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
  display: 'flex',
  flexDirection: 'column',
};

const modalHeaderStyle = {
  background: '#1c2f5c',
  color: 'white',
  padding: '6px 10px',
  fontWeight: 'bold',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  fontSize: '12px',
};

const closeXStyle = {
  border: 'none',
  background: 'none',
  color: 'white',
  fontWeight: 'bold',
  cursor: 'pointer',
};

const thS = {
  padding: '4px',
  border: '1px solid #000',
  textAlign: 'left',
  fontWeight: 'bold',
  fontSize: '10px',
};

const tdS = {
  padding: '4px',
  border: '1px solid #000',
  fontSize: '10px',
};
