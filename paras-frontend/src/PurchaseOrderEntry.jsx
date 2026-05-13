import { useState, useEffect } from 'react';
import { getParts, getAccounts, createPurchaseOrder } from './api';
import { FaTruckLoading } from 'react-icons/fa';
import AccountView from './AccountView';

export default function PurchaseOrderEntry({ order, onBack, onClose }) {

  const [formData, setFormData] = useState(order ? {
    partyCd: order.partyCd || '',
    supplierName: order.supplierName || '',
    address: order.address || '',
    city: order.city || '',
    remarks: order.remarks || '',
    orderDate: order.orderDate || new Date().toISOString().split('T')[0],
    contact: order.contact || '',
    phone: order.phone || '',
    cellNo: order.cellNo || '',
  } : {
    partyCd: '', supplierName: '', address: '', city: '',
    remarks: '', orderDate: new Date().toISOString().split('T')[0],
    contact: '', phone: '', cellNo: '',
  });

  const [items, setItems] = useState(
    order?.items?.map(i => ({
      brand: i.brand || '', partNo: i.partNo || '',
      description: i.description || '', qty: i.qty || 1,
      rate: i.rate || 0, amount: i.amount || 0,
    })) || []
  );

  const [showModal, setShowModal] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showNewAccountModal, setShowNewAccountModal] = useState(false);
  const [selectedItemIndex, setSelectedItemIndex] = useState(null);

  const [parts, setParts] = useState([]);
  const [accounts, setAccounts] = useState([]);

  const [filter, setFilter] = useState({ brand: '', partItem: '', description: '' });
  const [accountSearch, setAccountSearch] = useState('');

  useEffect(() => {
    getParts().then(setParts).catch(console.error);
    getAccounts().then(setAccounts).catch(console.error);
  }, []);

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
      supplierName: acc.acName || acc.name || '',
      address: acc.addOff1 || acc.address || '',
      city: acc.city || '',
      phone: acc.phoneO || acc.phO || '',
    }));
    setShowAccountModal(false);
  };

  const calcRow = (row) => {
    const rate = parseFloat(row.rate) || 0;
    const qty = parseFloat(row.qty) || 0;
    return { ...row, amount: +(rate * qty).toFixed(2) };
  };

  const addItem = (part) => {
    const rate = parseFloat(part.purchaseFinal || part.purchasePrice || 0);
    const newRow = calcRow({
      brand: part.brand || '', partNo: part.partNo || '',
      description: part.description || '', qty: 1, rate, amount: rate,
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

  const totalAmount = items.reduce((s, i) => s + (i.amount || 0), 0);

  const handleSave = async () => {
    if (!formData.supplierName) {
      alert('Please enter a supplier name'); return;
    }
    const payload = {
      ...formData,
      amount: totalAmount,
      items: items.map(i => ({
        brand: i.brand, partNo: i.partNo, description: i.description,
        qty: parseFloat(i.qty) || 0,
        rate: parseFloat(i.rate) || 0,
        amount: i.amount,
      }))
    };
    try {
      if (order?.id) {
        await fetch(`/api/purchase-orders/${order.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        await createPurchaseOrder(payload);
      }
      alert('Purchase Order saved successfully');
      onBack();
    } catch (err) { console.error('Save failed', err); }
  };

  const filteredParts = parts.filter(p =>
    (!filter.brand || (p.brand || '').toLowerCase().includes(filter.brand.toLowerCase())) &&
    (!filter.partItem || (p.partNo || '').toLowerCase().includes(filter.partItem.toLowerCase())) &&
    (!filter.description || (p.description || '').toLowerCase().includes(filter.description.toLowerCase()))
  );

  const filteredAccounts = accounts.filter(a =>
    (a.acName || a.name || '').toLowerCase().includes(accountSearch.toLowerCase()) ||
    (a.acCode || '').toString().includes(accountSearch) ||
    (a.city || '').toLowerCase().includes(accountSearch.toLowerCase())
  );

  const labelStyle = { fontSize: '11px', fontWeight: 'bold', color: '#1d2d5a', width: '80px', flexShrink: 0 };
  const inputStyle = { height: '22px', border: '1px solid #7a9cbf', background: 'white', padding: '0 4px', fontSize: '11px', fontFamily: 'Tahoma,sans-serif', flex: 1 };
  const topBtnStyle = (bg = '#e8e8e8', color = '#1d2d5a') => ({ background: bg, color, border: '1px solid #7a9cbf', padding: '4px 10px', fontWeight: 'bold', fontSize: '11px', fontFamily: 'Tahoma,sans-serif', cursor: 'pointer', whiteSpace: 'nowrap' });
  const actionBtnStyle = { background: '#e8e8e8', color: '#1d2d5a', border: '1px solid #7a9cbf', padding: '3px 8px', fontWeight: 'bold', fontSize: '11px', fontFamily: 'Tahoma,sans-serif', cursor: 'pointer' };

  return (
    <div style={{ width: '100%', height: '100vh', display: 'flex', flexDirection: 'column', background: '#dfe8ef', fontFamily: 'Tahoma,Verdana,sans-serif', fontSize: '11px', color: '#1d2d5a', overflow: 'hidden' }}>
      <div style={{ height: '26px', background: '#eef3f7', borderBottom: '1px solid #9caab7', display: 'flex', alignItems: 'center', paddingLeft: '10px', gap: '40px', flexShrink: 0 }}>
        <span>P.Order Entry</span>
        <span>{new Date().toLocaleDateString()}</span>
        <span>PARAS AUTO PARTS</span>
      </div>

      <div style={{ background: '#c9e0f5', borderBottom: '1px solid #7a9cbf', padding: '8px 10px', flexShrink: 0 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '0 20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={labelStyle}>SUPPLIER</span>
              <input name="partyCd" value={formData.partyCd} onChange={handleChange} onBlur={handleAccountBlur} style={{ ...inputStyle, width: '80px', flex: 'none' }} />
              <button onClick={() => setShowAccountModal(true)} style={topBtnStyle('#d4edf9')}>🔍 FIND</button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={labelStyle}>NAME</span>
              <input name="supplierName" value={formData.supplierName} onChange={handleChange} style={inputStyle} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={labelStyle}>ADDRESS</span>
              <input name="address" value={formData.address} onChange={handleChange} style={inputStyle} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={labelStyle}>CITY</span>
              <input name="city" value={formData.city} onChange={handleChange} style={{ ...inputStyle, width: '140px', flex: 'none' }} />
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={labelStyle}>CONTACT</span>
              <input name="contact" value={formData.contact} onChange={handleChange} style={inputStyle} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={labelStyle}>PHONE</span>
              <input name="phone" value={formData.phone} onChange={handleChange} style={inputStyle} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={labelStyle}>CELL NO.</span>
              <input name="cellNo" value={formData.cellNo} onChange={handleChange} style={inputStyle} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={labelStyle}>REMARKS</span>
              <input name="remarks" value={formData.remarks} onChange={handleChange} style={inputStyle} />
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: '200px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'flex-end' }}>
              <span style={{ ...labelStyle, width: 'auto' }}>DATE</span>
              <input type="date" name="orderDate" value={formData.orderDate} onChange={handleChange} style={{ ...inputStyle, flex: 'none', width: '130px' }} />
            </div>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
        <div style={{ background: '#d4edf9', borderBottom: '1px solid #7a9cbf', padding: '4px 8px', display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginRight: '10px' }}>
            <div style={{ background: '#003399', padding: '3px 5px', borderRadius: '2px' }}>
              <FaTruckLoading size={14} color="white" />
            </div>
            <strong style={{ color: '#003399', fontSize: '12px' }}>P.ORDER</strong>
          </div>
          <button onClick={() => setShowModal(true)} style={actionBtnStyle}>ADD ITEM</button>
          <button onClick={() => { if (selectedItemIndex !== null) removeItem(selectedItemIndex); }} style={actionBtnStyle}>DELETE ITEM</button>
        </div>

        <div style={{ flex: 1, overflow: 'auto', background: '#cce6ff', border: '1px solid #7a9cbf', margin: '4px', paddingBottom: '80px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', fontFamily: 'Tahoma,sans-serif' }}>
            <thead style={{ position: 'sticky', top: 0, zIndex: 1 }}>
              <tr style={{ background: '#7fc6ea' }}>
                {[['BRND', '10%'], ['PART NO.', '20%'], ['DESCRIPTION', '30%'], ['QTY', '10%'], ['RATE', '15%'], ['AMOUNT', '15%']].map(([h, w]) => (
                  <th key={h} style={{ width: w, textAlign: 'left', padding: '4px 8px', borderRight: '1px solid #5a8aaa', borderBottom: '2px solid #4a7a9a', fontWeight: 'bold' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={idx} onClick={() => setSelectedItemIndex(idx)} style={{ background: selectedItemIndex === idx ? '#b8d4f0' : idx % 2 === 0 ? '#ffffff' : '#e8f4ff', cursor: 'pointer' }}>
                  <td style={tdS()}>{item.brand}</td>
                  <td style={{ ...tdS(), fontWeight: 'bold', color: '#003399' }}>{item.partNo}</td>
                  <td style={tdS()}>{item.description}</td>
                  <td style={{ padding: 0 }}>
                    <input type="number" value={item.qty} onChange={e => updateItem(idx, 'qty', e.target.value)} style={{ width: '100%', border: 'none', padding: '3px', textAlign: 'center', background: '#ffffcc', fontWeight: 'bold' }} />
                  </td>
                  <td style={{ padding: 0 }}>
                    <input type="number" value={item.rate} onChange={e => updateItem(idx, 'rate', e.target.value)} style={{ width: '100%', border: 'none', padding: '3px', textAlign: 'right', background: '#ffffcc' }} />
                  </td>
                  <td style={{ ...tdS(), textAlign: 'right', fontWeight: 'bold', color: '#003399' }}>{item.amount?.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ position: 'absolute', bottom: '12px', right: '12px', background: '#ebf3ff', border: '2px solid #4a6fa5', padding: '10px 12px', display: 'flex', gap: '8px', boxShadow: '0 4px 10px rgba(0,0,0,0.2)', zIndex: 10 }}>
           <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', marginRight: '20px' }}>
              <span style={{ fontWeight: 'bold', fontSize: '14px', color: '#003399' }}>TOTAL: {totalAmount.toFixed(2)}</span>
           </div>
           <button onClick={handleSave} style={{ ...topBtnStyle('#28a745', 'white'), padding: '6px 18px' }}>SAVE</button>
           <button onClick={onBack} style={{ ...topBtnStyle('#e8e8e8'), padding: '6px 18px' }}>CLOSE</button>
        </div>
      </div>

      {showModal && (
        <div style={overlayStyle}>
          <div style={{ ...modalStyle, width: '800px' }}>
            <div style={modalHeaderStyle}><span>ADD PARTS</span><button onClick={() => setShowModal(false)} style={closeXStyle}>✕</button></div>
            <div style={{ padding: '8px 10px', display: 'flex', gap: '8px', background: '#eef3f7' }}>
              <input placeholder="Search part..." value={filter.partItem} onChange={e => setFilter(p => ({ ...p, partItem: e.target.value }))} style={inputStyle} />
            </div>
            <div style={{ height: '300px', overflow: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ background: '#7fc6ea' }}>
                  <tr><th>Brand</th><th>Part No</th><th>Description</th><th>Pur.Price</th></tr>
                </thead>
                <tbody>
                  {filteredParts.map((p, idx) => (
                    <tr key={idx} onClick={() => addItem(p)} style={{ cursor: 'pointer', background: idx % 2 === 0 ? '#fff' : '#f0f8ff' }}>
                      <td style={tdS()}>{p.brand}</td>
                      <td style={tdS()}>{p.partNo}</td>
                      <td style={tdS()}>{p.description}</td>
                      <td style={tdS()}>{p.purchasePrice}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {showAccountModal && (
        <div style={overlayStyle}>
          <div style={{ ...modalStyle, width: '600px' }}>
            <div style={modalHeaderStyle}><span>SELECT ACCOUNT</span><button onClick={() => setShowAccountModal(false)} style={closeXStyle}>✕</button></div>
            <div style={{ padding: '8px 10px' }}><input placeholder="Search account..." value={accountSearch} onChange={e => setAccountSearch(e.target.value)} style={inputStyle} /></div>
            <div style={{ height: '300px', overflow: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  {filteredAccounts.map((a, idx) => (
                    <tr key={idx} onClick={() => fillFromAccount(a)} style={{ cursor: 'pointer', background: idx % 2 === 0 ? '#fff' : '#f0f8ff' }}>
                      <td style={tdS()}>{a.acName || a.name}</td>
                      <td style={tdS()}>{a.city}</td>
                      <td style={tdS()}>{a.acCode}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {showNewAccountModal && (
        <div style={{ ...overlayStyle, zIndex: 3000 }}>
          <div style={{ width: '95vw', height: '95vh', background: 'white', overflow: 'hidden' }}>
            <AccountView onExit={() => setShowNewAccountModal(false)} onSelect={(acc) => { fillFromAccount(acc); setShowNewAccountModal(false); }} />
          </div>
        </div>
      )}

    </div>
  );
}

function tdS(align = 'left') {
  return { padding: '3px 8px', textAlign: align, borderRight: '1px solid #c0d8e8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' };
}
const overlayStyle = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 };
const modalStyle = { background: 'white', border: '2px solid #1d2d5a', display: 'flex', flexDirection: 'column', maxHeight: '90vh', overflow: 'hidden' };
const modalHeaderStyle = { background: '#1d2d5a', color: 'white', padding: '6px 10px', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const closeXStyle = { background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' };
