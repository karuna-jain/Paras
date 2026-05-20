import { useState, useEffect } from 'react';
import { getParts, getAccounts, createSalesOrder, getPendingWhatsappMessage, markWhatsappProcessed } from './api';
import { FaShoppingCart } from 'react-icons/fa';
import PickSlipPrintView from './PickSlipPrintView';
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
    phoneStd: '',
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
      list: i.rate || 0, dis: i.discount || 0,
      netSale: i.netSale || i.rate || 0,
      amount: i.amount || 0, netPur: i.netPur || 0,
      locnI: i.locnI || '', locnII: i.locnII || '',
    })) || []
  );

  const [showModal, setShowModal] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showPrintDialog, setShowPrintDialog] = useState(false);
  const [showPickSlip, setShowPickSlip] = useState(false);
  const [showNewAccountModal, setShowNewAccountModal] = useState(false);
  const [showWaModal, setShowWaModal] = useState(false);
  const [waText, setWaText] = useState('');
  const [pendingWaMsgId, setPendingWaMsgId] = useState(null);
  const [selectedItemIndex, setSelectedItemIndex] = useState(null);
  const [savedOrderId, setSavedOrderId] = useState(order?.id || null);

  const [parts, setParts] = useState([]);
  const [accounts, setAccounts] = useState([]);

  // Smart ADD filter state
  const [filter, setFilter] = useState({
    brand: '', company: '', partItem: '', model: '', description: ''
  });
  const [accountSearch, setAccountSearch] = useState('');

  useEffect(() => {
    getParts().then(setParts).catch(console.error);
    getAccounts().then(setAccounts).catch(console.error);
  }, []);

  useEffect(() => {
    if (prefilledAccount && !order) {
      fillFromAccount(prefilledAccount);
    }
  }, [prefilledAccount, order]);

  // ── form helpers ──────────────────────────────────────────────
  const handleChange = (e) =>
    setFormData(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleAccountBlur = () => {
    if (!formData.partyCd) return;
    const acc = accounts.find(a => a.acCode?.toString() === formData.partyCd);
    if (acc) fillFromAccount(acc);
  };

  const fillFromAccount = (acc) => {
    setFormData(p => ({
      ...p,
      partyCd: acc.acCode?.toString() || '',
      customerName: acc.acName || acc.name || '',
      address: acc.addOff1 || acc.address || '',
      city: acc.city || '',
      phoneO: acc.phoneO || acc.phO || '',
    }));
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

  const addItem = (part) => {
    const list = formData.rateType === 'W'
      ? parseFloat(part.wholesaleFinal || part.wholesalePrice || 0)
      : parseFloat(part.retailFinal || part.retailPrice || 0);
    const newRow = calcRow({
      brand: part.brand || '', partNo: part.partNo || '',
      description: part.description || '', model: part.model || '',
      stock: 0, ordQty: 1, list, dis: 0,
      netSale: list, amount: list,
      netPur: parseFloat(part.purchaseFinal || part.purchasePrice || 0),
      locnI: part.locationI || '', locnII: '',
    });
    setItems(prev => [...prev, newRow]);
    setShowModal(false);
  };

  const updateItem = (idx, field, value) => {
    setItems(prev => {
      const updated = [...prev];
      updated[idx] = calcRow({ ...updated[idx], [field]: value });
      return updated;
    });
  };

  const removeItem = (idx) => {
    setItems(prev => prev.filter((_, i) => i !== idx));
    setSelectedItemIndex(null);
  };

  const fetchWaMessage = async () => {
    try {
      const msg = await getPendingWhatsappMessage();
      if (msg && msg.body) {
        setWaText(msg.body);
        setPendingWaMsgId(msg.id);
        
        // Try to match account by requested name if provided, else fall back to phone number
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
          // If a name was requested but not found, set it in the search box and open modal
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
            stock: 0, ordQty: qty, list, dis: 0,
            netSale: list, amount: list * qty,
            netPur: parseFloat(part.purchaseFinal || part.purchasePrice || 0),
            locnI: part.locationI || '', locnII: '',
          }));
        }
      }
    });
    if (newItems.length > 0) {
      setItems(prev => [...prev, ...newItems]);
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

  // ── save ──────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!formData.partyCd && !formData.customerName) {
      alert('Please select a customer'); return;
    }
    const payload = {
      ...formData,
      amount: totalAmount,
      items: items.map(i => ({
        brand: i.brand, partNo: i.partNo, description: i.description,
        model: i.model, stock: i.stock,
        qty: parseFloat(i.ordQty) || 0,
        rate: parseFloat(i.list) || 0,
        discount: parseFloat(i.dis) || 0,
        netSale: i.netSale, amount: i.amount, netPur: i.netPur,
        locnI: i.locnI, locnII: i.locnII,
      }))
    };
    try {
      if (order?.id) {
        await fetch(`/api/sales-orders/${order.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        const saved = await createSalesOrder(payload);
        if (saved && saved.id) setSavedOrderId(saved.id);
        if (pendingWaMsgId) {
          await markWhatsappProcessed(pendingWaMsgId);
        }
      }
      setShowPrintDialog(true);
    } catch (err) { console.error('Save failed', err); }
  };

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

  if (showPickSlip)
    return <PickSlipPrintView formData={formData} items={items}
      totalAmount={totalAmount} onBack={() => setShowPickSlip(false)}
      onCreateBill={onCreateBill} fromOrderId={savedOrderId || order?.id} />;

  // ── shared styles ─────────────────────────────────────────────
  const labelStyle = {
    fontSize: '11px', fontWeight: 'bold', color: '#1d2d5a',
    width: '80px', flexShrink: 0,
  };
  const inputStyle = {
    height: '22px', border: '1px solid #7a9cbf', background: 'white',
    padding: '0 4px', fontSize: '11px', fontFamily: 'Tahoma,sans-serif',
    flex: 1,
  };
  const topBtnStyle = (bg = '#e8e8e8', color = '#1d2d5a') => ({
    background: bg, color, border: '1px solid #7a9cbf',
    padding: '4px 10px', fontWeight: 'bold', fontSize: '11px',
    fontFamily: 'Tahoma,sans-serif', cursor: 'pointer',
    whiteSpace: 'nowrap',
  });
  const actionBtnStyle = {
    background: '#e8e8e8', color: '#1d2d5a', border: '1px solid #7a9cbf',
    padding: '3px 8px', fontWeight: 'bold', fontSize: '11px',
    fontFamily: 'Tahoma,sans-serif', cursor: 'pointer',
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
        <span>S.Order Entry</span>
        <span>05-05-2026 (TUESDAY)</span>
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
              <span style={{ fontSize: '11px', marginLeft: '6px' }}>CHANGE A/C</span>
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
                style={{ ...inputStyle, width: '50px', flex: 'none' }} />
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
                <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                  <input type="radio" name="rateType" value="W"
                    checked={formData.rateType === 'W'}
                    onChange={handleChange} />
                  <span>WholeSale</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                  <input type="radio" name="rateType" value="R"
                    checked={formData.rateType === 'R'}
                    onChange={handleChange} />
                  <span>Retail</span>
                </label>
              </div>
            </div>
            {/* Account lookup button */}
            <button onClick={() => setShowAccountModal(true)}
              style={{ ...topBtnStyle('#d4edf9'), marginTop: '4px' }}>
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

          {[
            ['ADD', () => setShowModal(true)],
            ['WA QUICK ORDER', () => { setShowWaModal(true); fetchWaMessage(); }],
            ['DELETE', () => { if (selectedItemIndex !== null) removeItem(selectedItemIndex); }],
            ['CALCI', null],
            ['TOTAL', null],
            ['Y-Dis%', null],
            ['Z-0 Dis%', null],
            ['OTHERS', null],
            ['LEDGER', null],
            ['SMART ADD', () => setShowModal(true)],
            ['EAST ADD', () => setShowModal(true)],
            ['ITEM FIND', null],
          ].map(([label, handler]) => {
            let bg = label === 'SMART ADD' ? '#ffffa0'
              : label === 'EAST ADD' ? '#e0ffe0'
              : label === 'WA QUICK ORDER' ? '#25D366'
              : '#e8e8e8';
            let color = label === 'WA QUICK ORDER' ? 'white' : '#1d2d5a';
            let borderColor = label === 'WA QUICK ORDER' ? '#128C7E' : '#7a9cbf';
            return (
              <button key={label} onClick={handler || undefined}
                style={{ ...actionBtnStyle, background: bg, color, borderColor }}>
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
                  ['LIST', '7%', 'right'],
                  ['DIS%', '5%', 'right'],
                  ['NET SALE', '8%', 'right'],
                  ['AMOUNT', '8%', 'right'],
                  ['NET PUR', '7%', 'right'],
                  ['LOCN-I', '5%', 'left'],
                  ['LOCN-II', '4%', 'left'],
                ].map(([h, w, a]) => (
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
                      style={{
                        width: '100%', border: 'none', padding: '3px',
                        textAlign: 'center', background: '#ffffcc',
                        fontWeight: 'bold', fontFamily: 'Tahoma', fontSize: '11px'
                      }} />
                  </td>
                  <td style={{ padding: 0 }}>
                    <input type="number" value={item.list}
                      onChange={e => updateItem(idx, 'list', e.target.value)}
                      style={{
                        width: '100%', border: 'none', padding: '3px',
                        textAlign: 'right', background: '#ffffcc',
                        fontFamily: 'Tahoma', fontSize: '11px'
                      }} />
                  </td>
                  <td style={{ padding: 0 }}>
                    <input type="number" value={item.dis}
                      onChange={e => updateItem(idx, 'dis', e.target.value)}
                      style={{
                        width: '100%', border: 'none', padding: '3px',
                        textAlign: 'right', background: '#ffe8cc',
                        fontFamily: 'Tahoma', fontSize: '11px'
                      }} />
                  </td>
                  <td style={{ ...tdS('right'), color: '#006600' }}>
                    {item.netSale?.toFixed(2)}
                  </td>
                  <td style={{ ...tdS('right'), fontWeight: 'bold', color: '#003399' }}>
                    {item.amount?.toFixed(2)}
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
                  <td colSpan={13} style={{ padding: '20px', textAlign: 'center', color: '#888' }}>
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
          <div style={{ display: 'flex', gap: '6px' }}>
            <button onClick={handleSendWa}
              style={{ ...topBtnStyle('#25D366', 'white'), padding: '6px 18px', borderColor: '#128C7E' }}>
              SEND WA
            </button>
            <button onClick={handleSave}
              style={{ ...topBtnStyle('#28a745', 'white'), padding: '6px 18px' }}>
              SAVE
            </button>
            <button onClick={onBack}
              style={{ ...topBtnStyle('#e8e8e8'), padding: '6px 18px' }}>
              CLOSE
            </button>
            <button onClick={() => setShowPickSlip(true)}
              style={{ ...topBtnStyle('#003399', 'white'), padding: '6px 18px' }}>
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
        </div>

      </div>

      {/* ── SMART ADD MODAL ── */}
      {showModal && (
        <div style={overlayStyle}>
          <div style={{ ...modalStyle, width: '860px' }}>

            {/* Modal header */}
            <div style={modalHeaderStyle}>
              <span>ADD PARTS / JOBS</span>
              <button onClick={() => setShowModal(false)} style={closeXStyle}>✕</button>
            </div>

            {/* Filter row */}
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

            {/* Parts table */}
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
                      onClick={() => addItem(p)}
                      style={{
                        background: idx % 2 === 0 ? '#fff' : '#f0f8ff',
                        cursor: 'pointer',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = '#c5e6ff'}
                      onMouseLeave={e => e.currentTarget.style.background =
                        idx % 2 === 0 ? '#fff' : '#f0f8ff'}
                    >
                      <td style={tdS('left')}>{p.brand}</td>
                      <td style={tdS('left')}>{p.brand}</td>
                      <td style={{ ...tdS('left'), fontWeight: 'bold', color: '#003399' }}>
                        {p.partNo}
                      </td>
                      <td style={tdS('left')}>{p.model}</td>
                      <td style={tdS('left')}>{p.description}</td>
                      <td style={{ ...tdS('right'), fontWeight: 'bold' }}>
                        {(p.mrp || p.retailPrice || 0).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                  {filteredParts.length === 0 && (
                    <tr><td colSpan={6} style={{ padding: '20px', textAlign: 'center', color: '#888' }}>
                      No parts found
                    </td></tr>
                  )}
                </tbody>
              </table>
            </div>

            <div style={{
              padding: '5px 10px', background: '#eef3f7',
              borderTop: '1px solid #9caab7', fontSize: '11px', color: '#555',
            }}>
              {filteredParts.length} item(s) — click row to add to order
            </div>
          </div>
        </div>
      )}

      {/* ── WA QUICK ORDER MODAL ── */}
      {showWaModal && (
        <div style={overlayStyle}>
          <div style={{ ...modalStyle, width: '500px' }}>
            <div style={modalHeaderStyle}>
              <span>QUICK WA ORDER</span>
              <button onClick={() => setShowWaModal(false)} style={closeXStyle}>✕</button>
            </div>
            <div style={{ padding: '15px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <p style={{ margin: 0, fontSize: '12px', color: '#555' }}>
                Paste WhatsApp order text below. Format expected: <strong>[Qty] [Part description/No]</strong> per line.<br/>
                Example:<br/>
                <em>5 oil filter<br/>2 brake pad</em>
              </p>
              <textarea 
                value={waText} 
                onChange={(e) => setWaText(e.target.value)} 
                style={{ width: '100%', height: '150px', padding: '8px', border: '1px solid #7a9cbf', fontFamily: 'monospace', resize: 'vertical' }}
                placeholder="5 PartName..."
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '5px' }}>
                <button onClick={() => setShowWaModal(false)} style={topBtnStyle('#e8e8e8')}>CANCEL</button>
                <button 
                  onClick={async () => { 
                    if (pendingWaMsgId) {
                      await markWhatsappProcessed(pendingWaMsgId);
                      setWaText('');
                      setShowWaModal(false);
                      alert('Message discarded.');
                    }
                  }} 
                  style={topBtnStyle('#dc3545', 'white')}
                >DISCARD MSG</button>
                <button onClick={handleWaParse} style={topBtnStyle('#25D366', 'white')}>PROCESS ORDER</button>
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
                      onMouseLeave={e => e.currentTarget.style.background =
                        idx % 2 === 0 ? '#fff' : '#f0f8ff'}
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

      {/* ── SAVE CONFIRMATION ── */}
      {showPrintDialog && (
        <div style={overlayStyle}>
          <div style={{ ...modalStyle, width: '380px' }}>
            <div style={modalHeaderStyle}>
              <span>ORDER SAVED</span>
              <button onClick={onBack} style={closeXStyle}>✕</button>
            </div>
            <div style={{ padding: '24px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#1d2d5a', marginBottom: '10px' }}>
                Sales Order saved successfully.
              </div>
              <div style={{ fontSize: '12px', color: '#555', marginBottom: '24px' }}>
                Would you like to print the Pick-Slip?
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
                <button
                  onClick={() => { setShowPrintDialog(false); setShowPickSlip(true); }}
                  style={topBtnStyle('#003399', 'white')}>
                  YES, PRINT
                </button>
                <button
                  onClick={() => {
                    setShowPrintDialog(false);
                    if (onCreateBill) {
                      onCreateBill({
                        ...formData,
                        fromOrderId: savedOrderId,
                        amount: totalAmount,
                        items: items.map(i => ({
                          ...i,
                          qty: i.ordQty,
                          rate: i.list,
                          discount: i.dis
                        }))
                      });
                    }
                  }}
                  style={topBtnStyle('#ff8c00', 'white')}>
                  CREATE BILL
                </button>
                <button onClick={onBack} style={topBtnStyle()}>
                  NO, EXIT
                </button>
              </div>
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