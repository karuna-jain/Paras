import { useState, useEffect } from 'react';
import { getParts, getAccounts, createSalesOrder, updateSalesOrder, savePickSlip, getLedgerQuery, getLedgerOpening, getPendingWhatsappMessage, markWhatsappProcessed } from './api';
import { FaShoppingCart, FaQuestionCircle, FaInfoCircle } from 'react-icons/fa';
import AccountView from './AccountView';

export default function SalesOrderEntry({ order, onBack, onClose, prefilledAccount, onCreateBill, reportMode }) {

  const [formData, setFormData] = useState(order ? {
    partyCd: order.partyCd || '',
    customerName: order.customerName || '',
    address: order.address || '',
    city: order.city || '',
    remarks: order.remarks || '',
    orderDate: order.orderDate || new Date().toISOString().split('T')[0],
    contact: order.contact || '',
    phoneStd: order.phoneStd || '',
    phoneO: order.phoneO || '',
    phoneR: order.phoneR || '',
    cellNo: order.cellNo || '',
    transport: order.transport || '',
    rateType: order.rateType || 'W',
  } : {
    partyCd: '', customerName: '', address: '', city: '',
    remarks: '', orderDate: new Date().toISOString().split('T')[0],
    contact: '', phoneStd: '', phoneO: '', phoneR: '',
    cellNo: '', transport: '', rateType: 'W',
  });

  const [items, setItems] = useState(
    order?.items?.map(i => ({
      brand: i.brand || '', partNo: i.partNo || '',
      description: i.description || '', model: i.model || '',
      stock: i.stock || 0, ordQty: i.qty || 1,
      pickQty: i.pickQty !== undefined ? i.pickQty : (i.qty || 1),
      list: i.rate || 0, dis: i.discountPercent || i.discount || 0,
      netSale: i.netSale || i.rate || 0,
      amount: i.amount || 0, netPur: i.netPur || 0,
      locnI: i.locnI || '', locnII: i.locnII || '',
    })) || []
  );

  const [isDirty, setIsDirty] = useState(false);
  const [saveStatus, setSaveStatus] = useState(order ? 'ALL PARTS SAVED' : '');

  // Modal display states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showFastAddModal, setShowFastAddModal] = useState(false);
  const [showSmartAddModal, setShowSmartAddModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showTotalModal, setShowTotalModal] = useState(false);
  const [showYDiscountModal, setShowYDiscountModal] = useState(false);
  const [showItemFindModal, setShowItemFindModal] = useState(false);
  const [showLedgerModal, setShowLedgerModal] = useState(false);
  
  const [pickSlipMode, setPickSlipMode] = useState(false);
  const [showPrintOptions, setShowPrintOptions] = useState(false);
  const [showPendingReport, setShowPendingReport] = useState(false);
  
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showPrintDialog, setShowPrintDialog] = useState(false);
  const [showNewAccountModal, setShowNewAccountModal] = useState(false);
  const [showWaModal, setShowWaModal] = useState(false);
  
  const [waText, setWaText] = useState('');
  const [pendingWaMsgId, setPendingWaMsgId] = useState(null);
  const [selectedItemIndex, setSelectedItemIndex] = useState(null);
  const [savedOrderId, setSavedOrderId] = useState(order?.id || null);

  const [parts, setParts] = useState([]);
  const [accounts, setAccounts] = useState([]);

  // Popups business states
  const [ledgerTxs, setLedgerTxs] = useState([]);
  const [ledgerBal, setLedgerBal] = useState(0);
  const [findPartNo, setFindPartNo] = useState('');
  const [yDiscountVal, setYDiscountVal] = useState('');
  const [serviceSum, setServiceSum] = useState(0);

  // Brand picker help lists (Module 8 help lookup layout)
  const [brandHelpList, setBrandHelpList] = useState([]);

  // ADD Item form state
  const [addItemForm, setAddItemForm] = useState({
    brand: '', company: '', part: '', details: '', model: '',
    sList: '', disc: '', net: '', quantity: '1', amount: '',
    itemUnit: '', packOf: '', stock: '', locationI: '', locationII: ''
  });

  // FAST ADD state
  const [fastAddSearch, setFastAddSearch] = useState('');
  const [fastAddQty, setFastAddQty] = useState('1');
  const [fastAddKeyItemsOnly, setFastAddKeyItemsOnly] = useState(false);

  // Smart ADD filter state
  const [filter, setFilter] = useState({
    brand: '', company: '', partItem: '', model: '', description: ''
  });
  const [accountSearch, setAccountSearch] = useState('');

  useEffect(() => {
    getParts().then(setParts).catch(console.error);
    getAccounts().then(setAccounts).catch(console.error);
    fetch('/api/brands').then(res => res.json()).then(setBrandHelpList).catch(console.error);
  }, []);

  useEffect(() => {
    if (prefilledAccount && !order) {
      fillFromAccount(prefilledAccount);
    }
  }, [prefilledAccount, order]);

  // Keyboard shortcut listener (F5 -> City, F6 -> Parts, F7 -> Accounts, ESC -> close modals)
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowAddModal(false);
        setShowFastAddModal(false);
        setShowSmartAddModal(false);
        setShowDeleteConfirm(false);
        setShowTotalModal(false);
        setShowYDiscountModal(false);
        setShowItemFindModal(false);
        setShowLedgerModal(false);
        setShowPrintOptions(false);
        setShowPendingReport(false);
        setShowAccountModal(false);
        setShowPrintDialog(false);
        setShowNewAccountModal(false);
        setShowWaModal(false);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  // Fetch ledger data when ledger modal opens
  useEffect(() => {
    if (showLedgerModal && formData.partyCd) {
      getLedgerQuery(formData.partyCd).then(setLedgerTxs).catch(console.error);
      getLedgerOpening(formData.partyCd).then(data => {
        setLedgerBal(data.amount || 0);
      }).catch(console.error);
    }
  }, [showLedgerModal, formData.partyCd]);

  // ── form helpers ──────────────────────────────────────────────
  const handleChange = (e) => {
    setFormData(p => ({ ...p, [e.target.name]: e.target.value }));
    setIsDirty(true);
  };

  const handleAccountBlur = () => {
    if (!formData.partyCd) return;
    const acc = accounts.find(a => a.acCode?.toString() === formData.partyCd);
    if (acc) {
      fillFromAccount(acc);
    } else {
      setAccountSearch(formData.partyCd);
      setShowAccountModal(true);
    }
  };

  const fillFromAccount = (acc) => {
    setFormData(p => ({
      ...p,
      partyCd: acc.acCode?.toString() || '',
      customerName: acc.acName || acc.name || '',
      address: acc.addOff1 || acc.addressOff || acc.address || '',
      city: acc.city || '',
      phoneO: acc.phO || acc.phoneO || '',
      phoneR: acc.phR || acc.phoneR || '',
      cellNo: acc.mobileNo || '',
      transport: acc.transport || '',
    }));
    setIsDirty(true);
    setShowAccountModal(false);
  };

  // ── item helpers ──────────────────────────────────────────────
  const calcRow = (row) => {
    const list = parseFloat(row.list) || 0;
    const dis = parseFloat(row.dis) || 0;
    const qty = parseFloat(row.ordQty) || 0;
    const netSale = list - (list * dis / 100);
    return { ...row, netSale: +netSale.toFixed(2), amount: +(netSale * qty).toFixed(2) };
  };

  const addItem = (part, quantityToAdd = 1) => {
    const list = formData.rateType === 'W'
      ? parseFloat(part.wholesaleFinal || part.wholesalePrice || 0)
      : parseFloat(part.retailFinal || part.retailPrice || 0);
    const newRow = calcRow({
      brand: part.brand || '', partNo: part.partNo || '',
      description: part.description || '', model: part.model || '',
      stock: part.opening || 0, ordQty: quantityToAdd,
      pickQty: quantityToAdd, list, dis: 0,
      netSale: list, amount: list * quantityToAdd,
      netPur: parseFloat(part.purchaseFinal || part.purchasePrice || 0),
      locnI: part.locationI || '', locnII: '',
    });
    setItems(prev => [...prev, newRow]);
    setIsDirty(true);
    setSaveStatus('PARTS NOT SAVED');
  };

  const updateItem = (idx, field, value) => {
    setItems(prev => {
      const updated = [...prev];
      updated[idx] = calcRow({ ...updated[idx], [field]: value });
      return updated;
    });
    setIsDirty(true);
    setSaveStatus('PARTS NOT SAVED');
  };

  const removeItem = (idx) => {
    setItems(prev => prev.filter((_, i) => i !== idx));
    setSelectedItemIndex(null);
    setIsDirty(true);
    setSaveStatus('PARTS NOT SAVED');
  };

  // ADD POPUP HANDLERS
  const handleAddFormChange = (e) => {
    const { name, value } = e.target;
    setAddItemForm(prev => {
      const updated = { ...prev, [name]: value };
      
      // Auto-fill from parts on brand + part entry
      if ((name === 'part' || name === 'brand') && updated.part.trim()) {
        const found = parts.find(p => p.partNo?.toLowerCase() === updated.part.trim().toLowerCase());
        if (found) {
          const list = formData.rateType === 'W'
            ? (found.wholesaleFinal || found.wholesalePrice || 0)
            : (found.retailFinal || found.retailPrice || 0);
          
          updated.brand = found.brand || '';
          updated.company = brandHelpList.find(b => b.code === found.brand)?.name || found.brand || '';
          updated.details = found.description || '';
          updated.model = found.model || '';
          updated.sList = list.toString();
          updated.disc = '0';
          updated.itemUnit = found.itemUnit || '';
          updated.packOf = found.packOf ? found.packOf.toString() : '1';
          updated.stock = found.opening ? found.opening.toString() : '0';
          updated.locationI = found.locationI || '';
        }
      }

      // Calculations
      const listVal = parseFloat(updated.sList) || 0;
      const discVal = parseFloat(updated.disc) || 0;
      const qtyVal = parseFloat(updated.quantity) || 0;
      const netVal = listVal - (listVal * discVal / 100);
      
      updated.net = netVal.toFixed(2);
      updated.amount = (netVal * qtyVal).toFixed(2);

      return updated;
    });
  };

  const handleAddConfirm = () => {
    if (!addItemForm.part.trim()) {
      alert("Please enter a Part No.");
      return;
    }
    const listVal = parseFloat(addItemForm.sList) || 0;
    const qtyVal = parseFloat(addItemForm.quantity) || 1;
    const discVal = parseFloat(addItemForm.disc) || 0;
    const netVal = listVal - (listVal * discVal / 100);

    const newRow = {
      brand: addItemForm.brand,
      partNo: addItemForm.part,
      description: addItemForm.details,
      model: addItemForm.model,
      stock: parseInt(addItemForm.stock) || 0,
      ordQty: qtyVal,
      pickQty: qtyVal,
      list: listVal,
      dis: discVal,
      netSale: netVal,
      amount: netVal * qtyVal,
      netPur: parseFloat(addItemForm.sList) * 0.7, // approximation fallback
      locnI: addItemForm.locationI,
      locnII: addItemForm.locationII
    };
    
    setItems(prev => [...prev, newRow]);
    setIsDirty(true);
    setSaveStatus('PARTS NOT SAVED');
    setShowAddModal(false);
    // Reset form
    setAddItemForm({
      brand: '', company: '', part: '', details: '', model: '',
      sList: '', disc: '', net: '', quantity: '1', amount: '',
      itemUnit: '', packOf: '', stock: '', locationI: '', locationII: ''
    });
  };

  // FAST ADD ACTION
  const handleFastAddConfirm = (part) => {
    const qty = parseInt(fastAddQty) || 1;
    addItem(part, qty);
    setFastAddSearch('');
  };

  // WA ORDER PARSE
  const fetchWaMessage = async () => {
    try {
      const msg = await getPendingWhatsappMessage();
      if (msg && msg.body) {
        setWaText(msg.body);
        setPendingWaMsgId(msg.id);
        
        let matchedAcc = null;
        if (msg.requestedAccountName) {
          const reqName = msg.requestedAccountName.toLowerCase();
          matchedAcc = accounts.find(a => (a.acName || a.name || '').toLowerCase().includes(reqName) || (a.acCode || '').toString() === reqName);
        }
        
        if (!matchedAcc && msg.fromNumber) {
          matchedAcc = accounts.find(a => a.mobileNo && a.mobileNo.includes(msg.fromNumber.substring(msg.fromNumber.length - 10)));
        }
        
        if (matchedAcc) {
          fillFromAccount(matchedAcc);
        } else if (msg.requestedAccountName) {
          setAccountSearch(msg.requestedAccountName);
          setShowAccountModal(true);
        }
      } else {
        alert("No pending WhatsApp orders found.");
        setShowWaModal(false);
      }
    } catch (err) {
      console.error(err);
      alert("No pending WhatsApp orders found or server error.");
      setShowWaModal(false);
    }
  };

  const handleWaParse = () => {
    if (!waText.trim()) return;
    const lines = waText.split('\n');
    const newItems = [];
    lines.forEach(line => {
      const match = line.trim().match(/^(\d+)\s*(.*)$/);
      if (match) {
        const qty = parseInt(match[1]);
        const query = match[2].trim().toLowerCase();
        if (!query) return;
        const part = parts.find(p =>
          (p.partNo && p.partNo.toLowerCase().includes(query)) ||
          (p.description && p.description.toLowerCase().includes(query))
        );
        if (part) {
          const list = formData.rateType === 'W'
            ? parseFloat(part.wholesaleFinal || part.wholesalePrice || 0)
            : parseFloat(part.retailFinal || part.retailPrice || 0);
          newItems.push(calcRow({
            brand: part.brand || '', partNo: part.partNo || '',
            description: part.description || '', model: part.model || '',
            stock: part.opening || 0, ordQty: qty, pickQty: qty, list, dis: 0,
            netSale: list, amount: list * qty,
            netPur: parseFloat(part.purchaseFinal || part.purchasePrice || 0),
            locnI: part.locationI || '', locnII: '',
          }));
        }
      }
    });
    if (newItems.length > 0) {
      setItems(prev => [...prev, ...newItems]);
      setIsDirty(true);
      setSaveStatus('PARTS NOT SAVED');
      setShowWaModal(false);
      setWaText('');
    } else {
      alert('Could not match any parts from the provided text.');
    }
  };

  const handleSendWa = () => {
    if (!formData.partyCd && !formData.customerName) {
      alert("Please select a customer first.");
      return;
    }
    const acc = accounts.find(a => a.acCode?.toString() === formData.partyCd);
    if (!acc || !acc.mobileNo) {
      alert("Customer does not have a mobile number saved.");
      return;
    }
    let text = `*Sales Order Acknowledgement:*\n*Date:* ${formData.orderDate}\n*Customer:* ${formData.customerName}\n\n*Items:*\n`;
    items.forEach(i => {
      text += `- ${i.ordQty} x ${i.description}\n`;
    });
    let phone = acc.mobileNo.replace(/\D/g, '');
    if (phone.length === 10) phone = '91' + phone;
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const totalAmount = items.reduce((s, i) => s + (i.amount || 0), 0);

  // ── SAVE ──────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!formData.partyCd && !formData.customerName) {
      alert('Please select a customer'); return;
    }
    const payload = {
      ...formData,
      amount: totalAmount,
      billed: false,
      items: items.map(i => ({
        brand: i.brand, partNo: i.partNo, description: i.description,
        model: i.model, stock: i.stock,
        qty: parseFloat(i.ordQty) || 0,
        pickQty: parseFloat(i.pickQty) || parseFloat(i.ordQty) || 0,
        rate: parseFloat(i.list) || 0,
        discountPercent: parseFloat(i.dis) || 0,
        netSale: i.netSale, amount: i.amount, netPur: i.netPur,
        locnI: i.locnI, locnII: i.locnII,
      }))
    };
    try {
      if (order?.id || savedOrderId) {
        const id = order?.id || savedOrderId;
        await updateSalesOrder(id, payload);
      } else {
        const saved = await createSalesOrder(payload);
        if (saved && saved.id) setSavedOrderId(saved.id);
        if (pendingWaMsgId) {
          await markWhatsappProcessed(pendingWaMsgId);
        }
      }
      setIsDirty(false);
      setSaveStatus('ALL PARTS SAVED');
      setShowPrintDialog(true);
    } catch (err) { console.error('Save failed', err); }
  };

  // SAVE PICK-SLIP (Module 1 View Mode)
  const handleSavePickSlip = async () => {
    const id = order?.id || savedOrderId;
    if (!id) return;
    
    try {
      const payload = {
        ...formData,
        items: items.map(i => ({
          ...i,
          qty: i.ordQty,
          rate: i.list,
          discountPercent: i.dis
        }))
      };
      await savePickSlip(id, payload);
      setIsDirty(false);
      setSaveStatus('ALL PARTS SAVED');
      setShowPendingReport(true);
    } catch (err) {
      console.error(err);
      alert('Failed to save pick slip quantities');
    }
  };

  const handleCreateBill = () => {
    if (onCreateBill) {
      onCreateBill({
        ...formData,
        fromOrderId: order?.id || savedOrderId,
        amount: items.reduce((s, i) => s + (i.pickQty * i.netSale), 0),
        items: items.map(i => ({
          ...i,
          qty: i.pickQty, // PICK.QTY is used as billing quantity!
          rate: i.list,
          discount: i.dis,
          amount: i.pickQty * i.netSale
        }))
      });
    }
  };

  // ACTION BUTTON HANDLERS
  const handleYDiscountApply = () => {
    const val = parseFloat(yDiscountVal);
    if (isNaN(val)) return;
    setItems(prev => prev.map(i => calcRow({ ...i, dis: val })));
    setIsDirty(true);
    setSaveStatus('PARTS NOT SAVED');
    setShowYDiscountModal(false);
  };

  const handleZDiscountApply = () => {
    setItems(prev => prev.map(i => calcRow({ ...i, dis: 0 })));
    setIsDirty(true);
    setSaveStatus('PARTS NOT SAVED');
  };

  const handleItemFind = () => {
    const idx = items.findIndex(i => i.partNo.toLowerCase().includes(findPartNo.toLowerCase()));
    if (idx !== -1) {
      setSelectedItemIndex(idx);
    } else {
      alert("Part number not found in order.");
    }
    setShowItemFindModal(false);
  };

  // CALCULATIONS FOR TOTAL POPUP
  const partsCount = items.length;
  const availCount = items.filter(i => i.stock > 0).length;
  const notAvlCount = items.filter(i => i.stock === 0).length;
  const partialCount = items.filter(i => i.stock > 0 && i.stock < i.ordQty).length;
  const availAmt = items.filter(i => i.stock > 0).reduce((s, i) => s + i.amount, 0);
  const notAvlAmt = items.filter(i => i.stock === 0).reduce((s, i) => s + i.amount, 0);

  // ── filtered lists ────────────────────────────────────────────
  const filteredParts = parts.filter(p =>
    (!filter.brand || (p.brand || '').toLowerCase().includes(filter.brand.toLowerCase())) &&
    (!filter.partItem || (p.partNo || '').toLowerCase().includes(filter.partItem.toLowerCase())) &&
    (!filter.model || (p.model || '').toLowerCase().includes(filter.model.toLowerCase())) &&
    (!filter.description || (p.description || '').toLowerCase().includes(filter.description.toLowerCase()))
  );

  const filteredAccounts = accounts.filter(a =>
    (a.acName || a.name || '').toLowerCase().includes(accountSearch.toLowerCase()) ||
    (a.acCode || '').toString().includes(accountSearch) ||
    (a.city || '').toLowerCase().includes(accountSearch.toLowerCase())
  );

  const fastAddFiltered = parts.filter(p => {
    if (fastAddKeyItemsOnly && !(p.reorder > 0)) return false;
    if (!fastAddSearch) return true;
    return (p.partNo && p.partNo.toLowerCase().includes(fastAddSearch.toLowerCase())) ||
           (p.description && p.description.toLowerCase().includes(fastAddSearch.toLowerCase()));
  });

  // ── shared styles ─────────────────────────────────────────────
  const labelStyle = {
    fontSize: '11px', fontWeight: 'bold', color: '#1d2d5a',
    width: '80px', flexShrink: 0,
  };
  const inputStyle = {
    height: '22px', border: '1px solid #999', background: 'white',
    padding: '0 4px', fontSize: '11px', fontFamily: 'Tahoma,sans-serif',
    flex: 1, borderRadius: 0,
  };
  const topBtnStyle = (bg = '#e8e8e8', color = '#1d2d5a') => ({
    background: bg, color, border: '1px solid #999',
    padding: '4px 12px', fontWeight: 'bold', fontSize: '11px',
    fontFamily: 'Tahoma,sans-serif', cursor: 'pointer',
    whiteSpace: 'nowrap', borderRadius: 0, height: '28px',
  });
  const actionBtnStyle = {
    background: '#e8e8e8', color: '#1d2d5a', border: '1px solid #999',
    padding: '4px 12px', fontWeight: 'bold', fontSize: '11px',
    fontFamily: 'Tahoma,sans-serif', cursor: 'pointer', borderRadius: 0,
    height: '28px',
  };

  return (
    <div style={{
      width: '100%', height: '100vh', display: 'flex', flexDirection: 'column',
      background: '#dfe8ef', fontFamily: 'Tahoma,Verdana,sans-serif',
      fontSize: '11px', color: '#1d2d5a', overflow: 'hidden',
    }}>

      {/* ── HEADER BAR ── */}
      <div style={{
        height: '26px', background: '#eef3f7',
        borderBottom: '1px solid #9caab7',
        display: 'flex', alignItems: 'center',
        paddingLeft: '10px', gap: '40px', flexShrink: 0,
      }}>
        <span style={{ fontWeight: 'bold' }}>{pickSlipMode ? 'PICK-SLIP' : 'S.Order Entry'}</span>
        <span>{formData.orderDate ? formData.orderDate : '21-05-2026'} (THURSDAY)</span>
        <span>PARAS AUTO PARTS</span>
        <span>(OPER)</span>
      </div>

      {/* ── TOP FORM SECTION ── */}
      <div style={{
        background: '#c9e0f5', borderBottom: '1px solid #7a9cbf',
        padding: '8px 10px', flexShrink: 0,
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '0 20px' }}>

          {/* LEFT column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {/* A/C row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={labelStyle}>A / C</span>
              <input name="partyCd" value={formData.partyCd}
                onChange={handleChange} onBlur={handleAccountBlur}
                style={{ ...inputStyle, width: '80px', flex: 'none' }} />
              <span style={{ fontSize: '11px', marginLeft: '6px', fontWeight: 'bold' }}>CHANGE A/C</span>
              <input type="checkbox" style={{ marginLeft: '4px' }} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={labelStyle}>NAME</span>
              <input name="customerName" value={formData.customerName}
                onChange={handleChange} style={inputStyle} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={labelStyle}>ADDRESS</span>
              <input name="address" value={formData.address}
                onChange={handleChange} style={inputStyle} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={labelStyle}>CITY</span>
              <input name="city" value={formData.city}
                onChange={handleChange} style={{ ...inputStyle, width: '140px', flex: 'none' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={labelStyle}>REMARKS</span>
              <input name="remarks" value={formData.remarks}
                onChange={handleChange} style={inputStyle} />
            </div>
          </div>

          {/* RIGHT column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={labelStyle}>CONTACT</span>
              <input name="contact" value={formData.contact}
                onChange={handleChange} style={inputStyle} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={labelStyle}>PHONE</span>
              <span style={{ fontSize: '11px', marginRight: '2px' }}>STD</span>
              <input name="phoneStd" value={formData.phoneStd}
                onChange={handleChange}
                style={{ ...inputStyle, width: '40px', flex: 'none' }} />
              <span style={{ fontSize: '11px', marginRight: '2px' }}>(O)</span>
              <input name="phoneO" value={formData.phoneO}
                onChange={handleChange} style={inputStyle} />
              <span style={{ fontSize: '11px', marginRight: '2px' }}>(R)</span>
              <input name="phoneR" value={formData.phoneR}
                onChange={handleChange}
                style={{ ...inputStyle, width: '80px', flex: 'none' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={labelStyle}>CELL NO.</span>
              <input name="cellNo" value={formData.cellNo}
                onChange={handleChange} style={inputStyle} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={labelStyle}>TRANSPORT</span>
              <input name="transport" value={formData.transport}
                onChange={handleChange} style={inputStyle} />
            </div>
          </div>

          {/* DATE + RATE box */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: '200px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'flex-end' }}>
              <span style={{ ...labelStyle, width: 'auto' }}>DATE</span>
              <input type="date" name="orderDate" value={formData.orderDate}
                onChange={handleChange}
                style={{ ...inputStyle, flex: 'none', width: '130px' }} />
            </div>
            {/* APPLY-RATE box */}
            <div style={{
              border: '1px solid #7a9cbf', background: '#e8f4ff',
              padding: '6px 10px', marginTop: '4px', textAlign: 'center',
            }}>
              <div style={{ fontWeight: 'bold', color: '#cc0000', fontSize: '11px', marginBottom: '5px' }}>
                APPLY - RATE
              </div>
              <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                  <input type="radio" name="rateType" value="W"
                    checked={formData.rateType === 'W'}
                    onChange={handleChange} />
                  <span>WholeSale</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                  <input type="radio" name="rateType" value="R"
                    checked={formData.rateType === 'R'}
                    onChange={handleChange} />
                  <span>Retail</span>
                </label>
              </div>
            </div>
            {/* Account lookup button */}
            <button onClick={() => setShowAccountModal(true)}
              style={{ ...topBtnStyle('#e8e8e8'), marginTop: '4px', border: '1px solid #999' }}>
              🔍 FIND ACCOUNT
            </button>
          </div>

        </div>
      </div>

      {/* ── ORDER ITEMS SECTION ── */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        overflow: 'hidden', position: 'relative',
      }}>

        {/* Action buttons bar */}
        <div style={{
          background: '#d4edf9', borderBottom: '1px solid #7a9cbf',
          padding: '4px 8px', display: 'flex', alignItems: 'center',
          gap: '6px', flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginRight: '10px' }}>
            <div style={{ background: '#003399', padding: '3px 5px', borderRadius: '2px' }}>
              <FaShoppingCart size={14} color="white" />
            </div>
            <strong style={{ color: '#003399', fontSize: '12px' }}>S.ORDER</strong>
          </div>

          <div style={{ marginRight: '15px' }}>
            {items.length === 0 ? null : (
              isDirty ? (
                <span style={{ color: 'red', fontWeight: 'bold', fontSize: '12px' }}>
                  {items.length} PARTS NOT SAVED
                </span>
              ) : (
                <span style={{ color: 'red', fontWeight: 'bold', fontSize: '12px' }}>
                  ALL PARTS SAVED
                </span>
              )
            )}
          </div>

          {!pickSlipMode && [
            ['ADD', () => setShowAddModal(true)],
            ['FAST ADD', () => setShowFastAddModal(true)],
            ['DELETE', () => { if (selectedItemIndex !== null) setShowDeleteConfirm(true); else alert('Please select a row first.'); }],
            ['CALCI', null],
            ['TOTAL', () => setShowTotalModal(true)],
            ['Y-Dis%', () => setShowYDiscountModal(true)],
            ['Z-0 Dis%', handleZDiscountApply],
            ['OTHERS', null],
            ['LEDGER', () => { if (formData.partyCd) setShowLedgerModal(true); else alert('Select A/C first'); }],
            ['SMART ADD', () => setShowSmartAddModal(true)],
            ['EAST ADD', () => setShowSmartAddModal(true)],
            ['ITEM FIND', () => setShowItemFindModal(true)],
          ].map(([label, handler]) => {
            let bg = label === 'SMART ADD' ? '#ffffa0'
              : label === 'EAST ADD' ? '#e0ffe0'
              : '#e8e8e8';
            return (
              <button key={label} onClick={handler || undefined}
                style={{ ...actionBtnStyle, background: bg }}>
                {label}
              </button>
            )
          })}
        </div>

        {/* Items table */}
        <div style={{
          flex: 1, overflow: 'auto', background: '#cce6ff',
          border: '1px solid #7a9cbf', margin: '4px',
          paddingBottom: '80px',
        }}>
          <table style={{
            width: '100%', borderCollapse: 'collapse',
            fontSize: '11px', fontFamily: 'Tahoma,sans-serif',
          }}>
            <thead style={{ position: 'sticky', top: 0, zIndex: 1 }}>
              <tr style={{ background: '#7fc6ea' }}>
                {[
                  ['BRND', '5%', 'left'],
                  ['PART NO.', '10%', 'left'],
                  ['DESCRIPTION', '22%', 'left'],
                  ['STOCK', '5%', 'center'],
                  ['MODEL', '8%', 'left'],
                  ['ORD.QTY', '6%', 'center'],
                  pickSlipMode ? ['PICK.QTY', '6%', 'center'] : null,
                  ['LIST', '7%', 'right'],
                  ['DIS%', '5%', 'right'],
                  ['NET SALE', '8%', 'right'],
                  ['AMOUNT', '8%', 'right'],
                  ['NET PUR', '7%', 'right'],
                  ['LOCN-I', '5%', 'left'],
                  ['LOCN-II', '4%', 'left'],
                ].filter(Boolean).map(([h, w, a]) => (
                  <th key={h} style={{
                    width: w, textAlign: a, padding: '4px 4px',
                    borderRight: '1px solid #5a8aaa',
                    borderBottom: '2px solid #4a7a9a',
                    fontWeight: 'bold', fontSize: '11px',
                    whiteSpace: 'nowrap',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={idx}
                  onClick={() => setSelectedItemIndex(idx)}
                  style={{
                    background: selectedItemIndex === idx
                      ? '#b8d4f0'
                      : idx % 2 === 0 ? '#ffffff' : '#e8f4ff',
                    cursor: 'pointer',
                  }}>
                  <td style={tdS('left')}>{item.brand}</td>
                  <td style={{ ...tdS('left'), fontWeight: 'bold', color: '#003399' }}>
                    {item.partNo}
                  </td>
                  <td style={tdS('left')}>{item.description}</td>
                  <td style={tdS('center')}>{item.stock}</td>
                  <td style={tdS('left')}>{item.model}</td>
                  <td style={{ padding: 0 }}>
                    <input type="number" value={item.ordQty}
                      onChange={e => updateItem(idx, 'ordQty', e.target.value)}
                      disabled={pickSlipMode}
                      style={{
                        width: '100%', border: 'none', padding: '3px',
                        textAlign: 'center', background: pickSlipMode ? 'transparent' : '#ffffcc',
                        fontWeight: 'bold', fontFamily: 'Tahoma', fontSize: '11px'
                      }} />
                  </td>
                  {pickSlipMode && (
                    <td style={{ padding: 0 }}>
                      <input type="number" value={item.pickQty}
                        onChange={e => {
                          const val = parseFloat(e.target.value) || 0;
                          setItems(prev => {
                            const updated = [...prev];
                            updated[idx].pickQty = val;
                            return updated;
                          });
                          setIsDirty(true);
                        }}
                        style={{
                          width: '100%', border: 'none', padding: '3px',
                          textAlign: 'center', background: '#ffffcc',
                          fontWeight: 'bold', fontFamily: 'Tahoma', fontSize: '11px'
                        }} />
                    </td>
                  )}
                  <td style={{ padding: 0 }}>
                    <input type="number" value={item.list}
                      onChange={e => updateItem(idx, 'list', e.target.value)}
                      disabled={pickSlipMode}
                      style={{
                        width: '100%', border: 'none', padding: '3px',
                        textAlign: 'right', background: pickSlipMode ? 'transparent' : '#ffffcc',
                        fontFamily: 'Tahoma', fontSize: '11px'
                      }} />
                  </td>
                  <td style={{ padding: 0 }}>
                    <input type="number" value={item.dis}
                      onChange={e => updateItem(idx, 'dis', e.target.value)}
                      disabled={pickSlipMode}
                      style={{
                        width: '100%', border: 'none', padding: '3px',
                        textAlign: 'right', background: pickSlipMode ? 'transparent' : '#ffe8cc',
                        fontFamily: 'Tahoma', fontSize: '11px'
                      }} />
                  </td>
                  <td style={{ ...tdS('right'), color: '#006600', fontWeight: 'bold' }}>
                    {item.netSale?.toFixed(2)}
                  </td>
                  <td style={{ ...tdS('right'), fontWeight: 'bold', color: '#003399' }}>
                    {(pickSlipMode ? (item.pickQty * item.netSale) : item.amount)?.toFixed(2)}
                  </td>
                  <td style={{ ...tdS('right'), color: '#666' }}>
                    {item.netPur?.toFixed(2)}
                  </td>
                  <td style={tdS('left')}>{item.locnI}</td>
                  <td style={tdS('left')}>{item.locnII}</td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={pickSlipMode ? 14 : 13} style={{ padding: '20px', textAlign: 'center', color: '#888' }}>
                    No items added. Click SMART ADD or ADD to add parts.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ── SAVE / CLOSE / PICK-SLIP — fixed bottom-right ── */}
        <div style={{
          position: 'absolute', bottom: '12px', right: '12px',
          background: '#ebf3ff', border: '2px solid #4a6fa5',
          padding: '10px 12px', display: 'flex',
          flexDirection: 'column', gap: '8px',
          boxShadow: '0 4px 10px rgba(0,0,0,0.2)', zIndex: 10,
        }}>
          {!pickSlipMode ? (
            <>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button onClick={() => { setShowWaModal(true); fetchWaMessage(); }}
                  style={{ ...topBtnStyle('#25D366', 'white'), padding: '6px 18px', borderColor: '#128C7E' }}>
                  WA ORDER
                </button>
                <button onClick={handleSave}
                  style={{ ...topBtnStyle('#e8e8e8'), padding: '6px 18px' }}>
                  SAVE
                </button>
                <button onClick={onBack}
                  style={{ ...topBtnStyle('#e8e8e8'), padding: '6px 18px' }}>
                  CLOSE
                </button>
                <button 
                  onClick={() => setShowPrintOptions(true)}
                  disabled={!savedOrderId && !order?.id}
                  style={{ 
                    ...topBtnStyle('#e8e8e8'), 
                    padding: '6px 18px',
                    opacity: (!savedOrderId && !order?.id) ? 0.5 : 1,
                    cursor: (!savedOrderId && !order?.id) ? 'not-allowed' : 'pointer'
                  }}>
                  PICK-SLIP
                </button>
              </div>
              <label style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                fontSize: '11px', fontWeight: 'bold', color: '#1d2d5a', cursor: 'pointer'
              }}>
                <input type="checkbox" />
                PICK-SLIP FOR AVAILABLE ITEMS
              </label>
            </>
          ) : (
            <div style={{ display: 'flex', gap: '6px' }}>
              <button onClick={handleSavePickSlip}
                style={{ ...topBtnStyle('#e8e8e8'), padding: '6px 18px' }}>
                SAVE PICK-SLIP
              </button>
              <button onClick={() => setPickSlipMode(false)}
                style={{ ...topBtnStyle('#e8e8e8'), padding: '6px 18px' }}>
                CLOSE
              </button>
              <button onClick={handleCreateBill}
                style={{ ...topBtnStyle('#003399', 'white'), padding: '6px 18px' }}>
                CREATE BILL
              </button>
            </div>
          )}
        </div>

      </div>

      {/* ── ADD ITEM MODAL ── */}
      {showAddModal && (
        <div style={overlayStyle}>
          <div style={{ ...modalStyle, width: '700px' }}>
            <div style={modalHeaderStyle}>
              <span>Add Item</span>
              <div style={{ display: 'flex', gap: '4px' }}>
                <button style={{ background: 'none', border: 'none', color: 'white', fontWeight: 'bold' }}>—</button>
                <button style={{ background: 'none', border: 'none', color: 'white', fontWeight: 'bold' }}>□</button>
                <button onClick={() => setShowAddModal(false)} style={closeXStyle}>✕</button>
              </div>
            </div>
            <div style={{ padding: '15px', background: '#c9e0f5', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                
                {/* BRAND */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ ...labelStyle, width: '70px' }}>BRAND</span>
                  <input name="brand" value={addItemForm.brand} onChange={handleAddFormChange} style={{ ...inputStyle, width: '50px', flex: 'none' }} maxLength={4} />
                  <input name="company" value={addItemForm.company} onChange={handleAddFormChange} style={inputStyle} placeholder="Company name" />
                </div>
                
                {/* PART */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ ...labelStyle, width: '70px' }}>PART</span>
                  <input name="part" value={addItemForm.part} onChange={handleAddFormChange} style={inputStyle} />
                </div>

                {/* DETAILS */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', gridColumn: '1 / 3' }}>
                  <span style={{ ...labelStyle, width: '70px' }}>DETAILS</span>
                  <input name="details" value={addItemForm.details} onChange={handleAddFormChange} style={inputStyle} />
                </div>

                {/* MODEL */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ ...labelStyle, width: '70px' }}>MODEL</span>
                  <input name="model" value={addItemForm.model} onChange={handleAddFormChange} style={inputStyle} />
                </div>

                {/* S.LIST */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ ...labelStyle, width: '70px' }}>S.LIST</span>
                  <input name="sList" type="number" value={addItemForm.sList} onChange={handleAddFormChange} style={inputStyle} />
                </div>

                {/* DISC % */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ ...labelStyle, width: '70px' }}>DISC %</span>
                  <input name="disc" type="number" value={addItemForm.disc} onChange={handleAddFormChange} style={inputStyle} />
                </div>

                {/* NET */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ ...labelStyle, width: '70px' }}>NET</span>
                  <input name="net" value={addItemForm.net} readOnly style={{ ...inputStyle, background: '#e8f4ff' }} />
                </div>

                {/* QUANTITY */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ ...labelStyle, width: '70px' }}>QUANTITY</span>
                  <input name="quantity" type="number" value={addItemForm.quantity} onChange={handleAddFormChange} style={inputStyle} />
                </div>

                {/* AMOUNT */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ ...labelStyle, width: '70px' }}>AMOUNT</span>
                  <input name="amount" value={addItemForm.amount} readOnly style={{ ...inputStyle, background: '#e8f4ff', fontWeight: 'bold' }} />
                </div>

                {/* ITEM UNIT */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ ...labelStyle, width: '70px' }}>ITEM UNIT</span>
                  <input name="itemUnit" value={addItemForm.itemUnit} onChange={handleAddFormChange} style={inputStyle} />
                </div>

                {/* PACK OF */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ ...labelStyle, width: '70px' }}>PACK OF</span>
                  <input name="packOf" type="number" value={addItemForm.packOf} onChange={handleAddFormChange} style={inputStyle} />
                </div>

                {/* STOCK */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ ...labelStyle, width: '70px' }}>STOCK</span>
                  <input name="stock" type="number" value={addItemForm.stock} onChange={handleAddFormChange} style={inputStyle} />
                </div>

                {/* LOCATION */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ ...labelStyle, width: '70px' }}>LOCATION</span>
                  <input name="locationI" value={addItemForm.locationI} onChange={handleAddFormChange} style={inputStyle} placeholder="Loc I" />
                  <input name="locationII" value={addItemForm.locationII} onChange={handleAddFormChange} style={inputStyle} placeholder="Loc II" />
                </div>

              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
                <button onClick={handleAddConfirm} style={topBtnStyle('#e8e8e8')}>CONFIRM</button>
                <button onClick={() => setShowAddModal(false)} style={topBtnStyle('#e8e8e8')}>CANCEL</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── FAST ADD MODAL ── */}
      {showFastAddModal && (
        <div style={overlayStyle}>
          <div style={{ ...modalStyle, width: '680px' }}>
            <div style={modalHeaderStyle}>
              <span>Add Items — 21-05-2026</span>
              <div style={{ display: 'flex', gap: '4px' }}>
                <button style={{ background: 'none', border: 'none', color: 'white', fontWeight: 'bold' }}>—</button>
                <button style={{ background: 'none', border: 'none', color: 'white', fontWeight: 'bold' }}>□</button>
                <button onClick={() => setShowFastAddModal(false)} style={closeXStyle}>✕</button>
              </div>
            </div>
            <div style={{ background: '#b8cfe0', padding: '6px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 'bold' }}>
              <span>PRESS &lt;Esc&gt; TO EXIT</span>
              <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                <input type="checkbox" checked={fastAddKeyItemsOnly} onChange={e => setFastAddKeyItemsOnly(e.target.checked)} />
                <span>KEY ITEMS ONLY</span>
              </label>
            </div>
            {/* Table */}
            <div style={{ height: '240px', overflow: 'auto', background: 'white' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                <thead style={{ background: '#e0e8f0', sticky: true, top: 0 }}>
                  <tr style={{ borderBottom: '1px solid #999' }}>
                    <th style={{ padding: '4px 8px', textAlign: 'left', fontWeight: 'bold' }}>HEAD</th>
                    <th style={{ padding: '4px 8px', textAlign: 'left', fontWeight: 'bold' }}>PART NO</th>
                    <th style={{ padding: '4px 8px', textAlign: 'left', fontWeight: 'bold' }}>DESCRIPTION</th>
                    <th style={{ padding: '4px 8px', textAlign: 'left', fontWeight: 'bold' }}>MODEL</th>
                  </tr>
                </thead>
                <tbody>
                  {fastAddFiltered.map((p, idx) => (
                    <tr key={idx} 
                      onClick={() => handleFastAddConfirm(p)}
                      style={{ cursor: 'pointer', background: idx % 2 === 0 ? '#fff' : '#f5f9fc' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#d9e8f5'}
                      onMouseLeave={e => e.currentTarget.style.background = idx % 2 === 0 ? '#fff' : '#f5f9fc'}>
                      <td style={{ padding: '4px 8px' }}>{p.brand}</td>
                      <td style={{ padding: '4px 8px', fontWeight: 'bold', color: '#003399' }}>{p.partNo}</td>
                      <td style={{ padding: '4px 8px' }}>{p.description}</td>
                      <td style={{ padding: '4px 8px' }}>{p.model}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Bottom Controls */}
            <div style={{ background: '#cfe8ff', padding: '10px', display: 'grid', gridTemplateColumns: '80px 1fr 150px', gap: '10px', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '10px', fontWeight: 'bold', marginBottom: '2px' }}>QUANTITY</div>
                <input value={fastAddQty} onChange={e => setFastAddQty(e.target.value)} style={{ ...inputStyle, width: '60px' }} type="number" />
              </div>
              <div>
                <div style={{ fontSize: '10px', fontWeight: 'bold', marginBottom: '2px' }}>PART / ITEM</div>
                <input value={fastAddSearch} onChange={e => setFastAddSearch(e.target.value)} style={{ ...inputStyle, width: '100%' }} placeholder="Search Part or Description..." />
              </div>
              <div style={{ display: 'flex', gap: '4px', alignSelf: 'end' }}>
                <button onClick={() => setShowFastAddModal(false)} style={topBtnStyle()}>CLOSE</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── SMART ADD MODAL ── */}
      {showSmartAddModal && (
        <div style={overlayStyle}>
          <div style={{ ...modalStyle, width: '860px' }}>
            <div style={modalHeaderStyle}>
              <span>ADD PARTS / JOBS</span>
              <button onClick={() => setShowSmartAddModal(false)} style={closeXStyle}>✕</button>
            </div>
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(5,1fr)',
              gap: '8px', padding: '8px 10px',
              background: '#eef3f7', borderBottom: '1px solid #9caab7',
            }}>
              {[
                ['BRAND', 'brand'],
                ['BRAND/COMPANY', 'company'],
                ['PART / ITEM', 'partItem'],
                ['MODEL / CATG', 'model'],
                ['DESCRIPTION', 'description'],
              ].map(([lbl, key]) => (
                <div key={key}>
                  <div style={{
                    fontSize: '10px', fontWeight: 'bold',
                    color: '#1d2d5a', marginBottom: '2px'
                  }}>{lbl}</div>
                  <input value={filter[key]}
                    onChange={e => setFilter(p => ({ ...p, [key]: e.target.value }))}
                    style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }}
                    autoFocus={key === 'partItem'} />
                </div>
              ))}
            </div>
            <div style={{ height: '380px', overflow: 'auto' }}>
              <table style={{
                width: '100%', borderCollapse: 'collapse',
                fontSize: '11px', fontFamily: 'Tahoma,sans-serif',
              }}>
                <thead style={{ position: 'sticky', top: 0 }}>
                  <tr style={{ background: '#7fc6ea' }}>
                    {['Brand', 'Brand/Company', 'Part Number', 'Model', 'Part Description', 'MRP']
                      .map(h => (
                        <th key={h} style={{
                          padding: '4px 6px', textAlign: 'left',
                          borderRight: '1px solid #5a8aaa',
                          borderBottom: '2px solid #4a7a9a',
                        }}>{h}</th>
                      ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredParts.map((p, idx) => (
                    <tr key={p.id || idx}
                      onClick={() => { addItem(p); }} // Clicking row adds but keeps modal open
                      style={{
                        background: idx % 2 === 0 ? '#fff' : '#f0f8ff',
                        cursor: 'pointer',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = '#c5e6ff'}
                      onMouseLeave={e => e.currentTarget.style.background = idx % 2 === 0 ? '#fff' : '#f0f8ff'}
                    >
                      <td style={tdS('left')}>{p.brand}</td>
                      <td style={tdS('left')}>{p.brand}</td>
                      <td style={{ ...tdS('left'), fontWeight: 'bold', color: '#003399' }}>{p.partNo}</td>
                      <td style={tdS('left')}>{p.model}</td>
                      <td style={tdS('left')}>{p.description}</td>
                      <td style={{ ...tdS('right'), fontWeight: 'bold' }}>
                        {(p.mrp || p.retailPrice || 0).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{
              padding: '5px 10px', background: '#eef3f7',
              borderTop: '1px solid #9caab7', fontSize: '11px', color: '#555',
            }}>
              {filteredParts.length} item(s) — click rows to add (modal remains open)
            </div>
          </div>
        </div>
      )}

      {/* ── DELETE CONFIRM MODAL ── */}
      {showDeleteConfirm && selectedItemIndex !== null && (
        <div style={overlayStyle}>
          <div style={{ ...modalStyle, width: '320px' }}>
            <div style={modalHeaderStyle}>
              <span>Confirm Delete</span>
              <button onClick={() => setShowDeleteConfirm(false)} style={closeXStyle}>✕</button>
            </div>
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <FaQuestionCircle size={32} color="#0055ff" />
                <span style={{ fontSize: '12px', fontWeight: 'bold' }}>
                  PART NO : {items[selectedItemIndex].brand}-{items[selectedItemIndex].partNo}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button onClick={() => { removeItem(selectedItemIndex); setShowDeleteConfirm(false); }} style={topBtnStyle('#e8e8e8', '#1d2d5a')}>Yes</button>
                <button onClick={() => setShowDeleteConfirm(false)} style={topBtnStyle('#e8e8e8', '#1d2d5a')}>No</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TOTAL POPUP MODAL ── */}
      {showTotalModal && (
        <div style={overlayStyle}>
          <div style={{ ...modalStyle, width: '450px' }}>
            <div style={modalHeaderStyle}>
              <span>TOTAL</span>
              <button onClick={() => setShowTotalModal(false)} style={closeXStyle}>✕</button>
            </div>
            <div style={{ padding: '15px', display: 'flex', flexDirection: 'column', gap: '8px', background: '#f0f4f8' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #ccc', padding: '4px 0' }}>
                <span style={{ fontWeight: 'bold' }}>PARTS AMOUNT FOR Rs.</span>
                <span style={{ fontWeight: 'bold', color: '#003399' }}>{totalAmount.toFixed(2)}</span>
                <span style={{ fontWeight: 'bold' }}>No OF PARTS : {partsCount}</span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #ccc', padding: '4px 0', alignItems: 'center' }}>
                <span style={{ fontWeight: 'bold' }}>ADD ITEMS FOR Rs.</span>
                <input type="number" value={serviceSum} onChange={e => setServiceSum(parseFloat(e.target.value) || 0)} style={{ ...inputStyle, width: '80px', textAlign: 'right' }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px double #888', padding: '6px 0', fontSize: '12px' }}>
                <span style={{ fontWeight: 'bold', color: '#cc0000' }}>S.ORDER AMOUNT Rs.</span>
                <span style={{ fontWeight: 'bold', color: '#cc0000' }}>{(totalAmount + serviceSum).toFixed(2)}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #ccc', padding: '4px 0' }}>
                <span>AMOUNT OF AVAILAB. Rs.</span>
                <span style={{ fontWeight: 'bold', color: '#006600' }}>{availAmt.toFixed(2)}</span>
                <span>No Of Parts : {availCount}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #ccc', padding: '4px 0' }}>
                <span>AMOUNT OF NOT.AVL. Rs.</span>
                <span style={{ fontWeight: 'bold', color: '#cc2200' }}>{notAvlAmt.toFixed(2)}</span>
                <span>No Of Parts : {notAvlCount}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                <span>PARTIAL AVL. No OF PARTS</span>
                <span style={{ fontWeight: 'bold' }}>{partialCount}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button onClick={() => setShowTotalModal(false)} style={topBtnStyle('#e8e8e8')}>OK</button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ── Y DISCOUNT MODAL ── */}
      {showYDiscountModal && (
        <div style={overlayStyle}>
          <div style={{ ...modalStyle, width: '300px' }}>
            <div style={modalHeaderStyle}>
              <span>Enter Y Discount %</span>
              <button onClick={() => setShowYDiscountModal(false)} style={closeXStyle}>✕</button>
            </div>
            <div style={{ padding: '15px', display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
              <input type="number" value={yDiscountVal} onChange={e => setYDiscountVal(e.target.value)} style={{ ...inputStyle, width: '100%', textAlign: 'right' }} placeholder="Discount %" />
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={handleYDiscountApply} style={topBtnStyle('#e8e8e8')}>OK</button>
                <button onClick={() => setShowYDiscountModal(false)} style={topBtnStyle('#e8e8e8')}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── ITEM FIND MODAL ── */}
      {showItemFindModal && (
        <div style={overlayStyle}>
          <div style={{ ...modalStyle, width: '300px' }}>
            <div style={modalHeaderStyle}>
              <span>FIND PART NO</span>
              <button onClick={() => setShowItemFindModal(false)} style={closeXStyle}>✕</button>
            </div>
            <div style={{ padding: '15px', display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
              <input value={findPartNo} onChange={e => setFindPartNo(e.target.value)} style={{ ...inputStyle, width: '100%' }} placeholder="Part number..." />
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={handleItemFind} style={topBtnStyle('#e8e8e8')}>FIND</button>
                <button onClick={() => setShowItemFindModal(false)} style={topBtnStyle('#e8e8e8')}>CANCEL</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── LEDGER MODAL ── */}
      {showLedgerModal && (
        <div style={overlayStyle}>
          <div style={{ ...modalStyle, width: '800px', height: '520px' }}>
            <div style={modalHeaderStyle}>
              <span>Account Ledger Summary</span>
              <button onClick={() => setShowLedgerModal(false)} style={closeXStyle}>✕</button>
            </div>
            <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, overflow: 'hidden' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', background: '#c9e0f5', padding: '8px', border: '1px solid #9caab7', fontWeight: 'bold' }}>
                <span>PARTY: {formData.customerName}</span>
                <span>CITY: {formData.city}</span>
                <span>CODE: {formData.partyCd}</span>
                <span style={{ color: '#003399' }}>CURRENT BALANCE: Rs. {ledgerBal.toFixed(2)}</span>
              </div>
              <div style={{ flex: 1, overflow: 'auto', border: '1px solid #ccc', background: 'white' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                  <thead style={{ background: '#7fc6ea', position: 'sticky', top: 0 }}>
                    <tr>
                      <th style={{ padding: '4px', borderRight: '1px solid #ccc' }}>DATE</th>
                      <th style={{ padding: '4px', borderRight: '1px solid #ccc' }}>NARRATION</th>
                      <th style={{ padding: '4px', borderRight: '1px solid #ccc', textAlign: 'right' }}>DEBIT</th>
                      <th style={{ padding: '4px', borderRight: '1px solid #ccc', textAlign: 'right' }}>CREDIT</th>
                      <th style={{ padding: '4px', borderRight: '1px solid #ccc' }}>D/C</th>
                      <th style={{ padding: '4px', borderRight: '1px solid #ccc', textAlign: 'right' }}>BALANCE</th>
                      <th style={{ padding: '4px', borderRight: '1px solid #ccc' }}>SOURCE</th>
                      <th style={{ padding: '4px' }}>DOC NO</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ background: '#ffe0e0', fontWeight: 'bold', color: '#cc0000' }}>
                      <td style={{ padding: '4px', borderRight: '1px solid #ccc' }}>01-04-2026</td>
                      <td style={{ padding: '4px', borderRight: '1px solid #ccc' }}>* OPENING BALANCE *</td>
                      <td style={{ padding: '4px', borderRight: '1px solid #ccc', textAlign: 'right' }}>{ledgerBal.toFixed(2)}</td>
                      <td style={{ padding: '4px', borderRight: '1px solid #ccc' }}></td>
                      <td style={{ padding: '4px', borderRight: '1px solid #ccc' }}>D</td>
                      <td style={{ padding: '4px', borderRight: '1px solid #ccc', textAlign: 'right' }}>{ledgerBal.toFixed(2)}</td>
                      <td style={{ padding: '4px', borderRight: '1px solid #ccc' }}>OPENING</td>
                      <td style={{ padding: '4px' }}>—</td>
                    </tr>
                    {(() => {
                      let bal = ledgerBal;
                      return ledgerTxs.slice(0, 20).map((tx, idx) => {
                        const amt = tx.amount || 0;
                        if ("D".equalsIgnoreCase(tx.dc)) {
                          bal += amt;
                        } else {
                          bal -= amt;
                        }
                        const isCredit = "C".equalsIgnoreCase(tx.dc);
                        return (
                          <tr key={idx} style={{ background: isCredit ? '#e8f4ff' : '#ffffff', borderBottom: '1px solid #eee' }}>
                            <td style={{ padding: '4px', borderRight: '1px solid #ccc' }}>{tx.date}</td>
                            <td style={{ padding: '4px', borderRight: '1px solid #ccc' }}>{tx.narration}</td>
                            <td style={{ padding: '4px', borderRight: '1px solid #ccc', textAlign: 'right' }}>{!isCredit ? amt.toFixed(2) : ''}</td>
                            <td style={{ padding: '4px', borderRight: '1px solid #ccc', textAlign: 'right' }}>{isCredit ? amt.toFixed(2) : ''}</td>
                            <td style={{ padding: '4px', borderRight: '1px solid #ccc', textAlign: 'center' }}>{tx.dc}</td>
                            <td style={{ padding: '4px', borderRight: '1px solid #ccc', textAlign: 'right', fontWeight: 'bold' }}>{bal.toFixed(2)}</td>
                            <td style={{ padding: '4px', borderRight: '1px solid #ccc' }}>{tx.source}</td>
                            <td style={{ padding: '4px' }}>{tx.docNo}</td>
                          </tr>
                        );
                      });
                    })()}
                  </tbody>
                </table>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                <button onClick={() => setShowLedgerModal(false)} style={topBtnStyle('#e8e8e8')}>CLOSE</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── PRINT OPTIONS MODAL ── */}
      {showPrintOptions && (
        <div style={overlayStyle}>
          <div style={{ ...modalStyle, width: '340px' }}>
            <div style={modalHeaderStyle}>
              <span>PRINT OPTIONS</span>
              <button onClick={() => setShowPrintOptions(false)} style={closeXStyle}>✕</button>
            </div>
            <div style={{ padding: '18px 15px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                <input type="radio" name="printOption" defaultChecked />
                <span>PRINT STOCK AVAILABLE</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                <input type="radio" name="printOption" />
                <span>ALL PENDING ITEMS</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginTop: '5px' }}>
                <input type="checkbox" defaultChecked />
                <span>PRINT WITH S.RATE</span>
              </label>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button onClick={() => { setShowPrintOptions(false); setPickSlipMode(true); }} style={topBtnStyle('#003399', 'white')}>PRINT</button>
                <button onClick={() => setShowPrintOptions(false)} style={topBtnStyle()}>CLOSE</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── PENDING REPORT PRINT DIALOG ── */}
      {showPendingReport && (
        <div style={overlayStyle}>
          <div style={{ ...modalStyle, width: '300px' }}>
            <div style={modalHeaderStyle}>
              <span>PRINT PICK - SLIP</span>
              <button onClick={() => setShowPendingReport(false)} style={closeXStyle}>✕</button>
            </div>
            <div style={{ padding: '15px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                <input type="checkbox" checked={printWithSRate} onChange={e => setPrintWithSRate(e.target.checked)} />
                <span>PRINT WITH S.RATE</span>
              </label>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button 
                  onClick={() => {
                    setShowPendingReport(false);
                    setShowPickSlip(true);
                  }}
                  style={topBtnStyle('#003399', 'white')}>
                  PRINT
                </button>
                <button onClick={() => setShowPendingReport(false)} style={topBtnStyle()}>CLOSE</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── SAVE CONFIRMATION ── */}
      {showPrintDialog && (
        <div style={overlayStyle}>
          <div style={{ ...modalStyle, width: '320px' }}>
            <div style={modalHeaderStyle}>
              <span>CONFIRM PRINT</span>
              <button onClick={() => setShowPrintDialog(false)} style={closeXStyle}>✕</button>
            </div>
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <FaQuestionCircle size={32} color="#0055ff" />
                <span style={{ fontSize: '12px', fontWeight: 'bold' }}>PRINT S.ORDER ?</span>
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button 
                  onClick={() => { setShowPrintDialog(false); setShowPickSlip(true); }}
                  style={topBtnStyle('#e8e8e8', '#1d2d5a')}>Yes</button>
                <button onClick={() => setShowPrintDialog(false)} style={topBtnStyle('#e8e8e8', '#1d2d5a')}>No</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── ACCOUNT SELECTION MODAL ── */}
      {showAccountModal && (
        <div style={overlayStyle}>
          <div style={{ ...modalStyle, width: '620px' }}>
            <div style={modalHeaderStyle}>
              <span>SELECT ACCOUNT</span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => setShowNewAccountModal(true)}
                  style={{ ...topBtnStyle('#e8f4ff'), fontSize: '10px', padding: '2px 8px' }}>
                  NEW A/C
                </button>
                <button onClick={() => setShowAccountModal(false)} style={closeXStyle}>✕</button>
              </div>
            </div>
            <div style={{ padding: '8px 10px', borderBottom: '1px solid #9caab7' }}>
              <input value={accountSearch}
                onChange={e => setAccountSearch(e.target.value)}
                placeholder="Search by Name, City or Code..."
                style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }}
                autoFocus />
            </div>
            <div style={{ height: '360px', overflow: 'auto' }}>
              <table style={{
                width: '100%', borderCollapse: 'collapse',
                fontSize: '11px', fontFamily: 'Tahoma,sans-serif',
              }}>
                <thead style={{ position: 'sticky', top: 0 }}>
                  <tr style={{ background: '#7fc6ea' }}>
                    {['Account Name', 'City', 'A/c Code'].map(h => (
                      <th key={h} style={{
                        padding: '4px 8px', textAlign: 'left',
                        borderRight: '1px solid #5a8aaa',
                        borderBottom: '2px solid #4a7a9a',
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredAccounts.map((a, idx) => (
                    <tr key={a.id || idx}
                      onClick={() => fillFromAccount(a)}
                      style={{ background: idx % 2 === 0 ? '#fff' : '#f0f8ff', cursor: 'pointer' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#c5e6ff'}
                      onMouseLeave={e => e.currentTarget.style.background = idx % 2 === 0 ? '#fff' : '#f0f8ff'}
                    >
                      <td style={{ ...tdS('left'), fontWeight: 'bold' }}>{a.acName || a.name}</td>
                      <td style={tdS('left')}>{a.city}</td>
                      <td style={{ ...tdS('left'), color: '#003399', fontWeight: 'bold' }}>{a.acCode}</td>
                    </tr>
                  ))}
                  {filteredAccounts.length === 0 && (
                    <tr><td colSpan={3} style={{ padding: '20px', textAlign: 'center', color: '#888' }}>
                      No accounts found
                    </td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── NEW ACCOUNT MODAL ── */}
      {showNewAccountModal && (
        <div style={{ ...overlayStyle, zIndex: 3000 }}>
          <div style={{
            width: '95vw', height: '95vh', background: 'white',
            overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
          }}>
            <AccountView
              onExit={() => setShowNewAccountModal(false)}
              onSelect={(acc) => { fillFromAccount(acc); setShowNewAccountModal(false); }}
            />
          </div>
        </div>
      )}

    </div>
  );
}

// ── Style helpers ────────────────────────────────────────────────
function tdS(align = 'left') {
  return {
    padding: '3px 4px', textAlign: align,
    borderRight: '1px solid #c0d8e8',
    whiteSpace: 'nowrap', overflow: 'hidden',
    textOverflow: 'ellipsis',
  };
}

const overlayStyle = {
  position: 'fixed', inset: 0,
  background: 'rgba(0,0,0,0.45)',
  display: 'flex', alignItems: 'center',
  justifyContent: 'center', zIndex: 2000,
};

const modalStyle = {
  background: 'white',
  border: '2px solid #1d2d5a',
  display: 'flex', flexDirection: 'column',
  maxHeight: '90vh', overflow: 'hidden',
  fontFamily: 'Tahoma,Verdana,sans-serif',
  fontSize: '11px',
};

const modalHeaderStyle = {
  background: '#1d2d5a', color: 'white',
  padding: '6px 10px', fontWeight: 'bold',
  display: 'flex', justifyContent: 'space-between',
  alignItems: 'center', flexShrink: 0,
};

const closeXStyle = {
  background: 'none', border: 'none',
  color: 'white', cursor: 'pointer',
  fontWeight: 'bold', fontSize: '14px',
};