import { useState, useEffect } from 'react';
import { getParts, getAccounts, createSalesInvoice, getPendingWhatsappMessage, markWhatsappProcessed } from './api';
import { FaFileInvoiceDollar } from 'react-icons/fa';
import AccountView from './AccountView';

export default function SalesInvoiceEntry({ invoice, onBack, onClose }) {

  const [formData, setFormData] = useState(invoice ? {
    billType: invoice.billType || 'RETAIL',
    invoiceNo: invoice.invoiceNo || '',
    partyCd: invoice.partyCd || '',
    customerName: invoice.customerName || '',
    date: invoice.date || new Date().toISOString().split('T')[0],
    paid: invoice.paidAmount || invoice.paid || 0,
    fromOrderId: invoice.fromOrderId || null,
    isReturn: invoice.isReturn || false,
  } : {
    billType: 'RETAIL', invoiceNo: '', partyCd: '', customerName: '',
    date: new Date().toISOString().split('T')[0],
    paid: 0,
    fromOrderId: null,
    isReturn: false,
  });

  const [items, setItems] = useState(
    invoice?.items?.map(i => ({
      partId: i.partId || null,
      brand: i.brand || '', // For display
      partNo: i.partNo || '', // For display
      description: i.description || '', // For display
      qty: i.qty || 1,
      rate: i.rate || 0,
      amount: i.amount || 0,
    })) || []
  );

  const [showModal, setShowModal] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [selectedItemIndex, setSelectedItemIndex] = useState(null);

  const [parts, setParts] = useState([]);
  const [accounts, setAccounts] = useState([]);

  const [filter, setFilter] = useState({ brand: '', partItem: '', description: '' });
  const [accountSearch, setAccountSearch] = useState('');

  const [showWaModal, setShowWaModal] = useState(false);
  const [waText, setWaText] = useState('');
  const [pendingWaMsgId, setPendingWaMsgId] = useState(null);

  const calcRow = (row) => {
    const rate = parseFloat(row.rate) || 0;
    const qty = parseFloat(row.qty) || 0;
    return { ...row, amount: +(rate * qty).toFixed(2) };
  };

  useEffect(() => {
    if (invoice) {
      setFormData({
        billType: invoice.billType || 'WHOLESALE',
        invoiceNo: invoice.invoiceNo || '',
        partyCd: invoice.partyCd || '',
        customerName: invoice.customerName || '',
        date: invoice.date || new Date().toISOString().split('T')[0],
        paid: invoice.paidAmount || invoice.paid || 0,
        fromOrderId: invoice.fromOrderId || null,
        isReturn: invoice.isReturn || false,
      });
      if (invoice.items) {
        setItems(invoice.items.map(i => calcRow({
          partId: i.partId || i.id,
          brand: i.brand || '',
          partNo: i.partNo,
          description: i.description,
          qty: i.qty || 1,
          rate: i.rate || 0,
        })));
      }
    }
  }, [invoice]);

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
      customerName: acc.acName || acc.name || '',
    }));
    setShowAccountModal(false);
  };

  const addItem = (part) => {
    const rate = parseFloat(formData.billType === 'WHOLESALE' ? (part.wholesaleFinal || part.wholesalePrice || 0) : (part.retailFinal || part.retailPrice || 0));
    const newRow = calcRow({
      partId: part.id,
      brand: part.brand || '',
      partNo: part.partNo || '',
      description: part.description || '',
      qty: 1,
      rate,
      amount: rate,
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
          const rate = parseFloat(formData.billType === 'WHOLESALE' ? (part.wholesaleFinal || part.wholesalePrice || 0) : (part.retailFinal || part.retailPrice || 0));
          newItems.push(calcRow({
            partId: part.id,
            brand: part.brand || '',
            partNo: part.partNo || '',
            description: part.description || '',
            qty: qty,
            rate: rate,
            amount: rate * qty,
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

  const totalAmount = items.reduce((s, i) => s + (i.amount || 0), 0);

  const handleSave = async () => {
    if (!formData.customerName) {
      alert('Please enter a customer name'); return;
    }
    const payload = {
      ...formData,
      amount: totalAmount,
      paidAmount: parseFloat(formData.paid) || 0,
      items: items.map(i => ({
        partId: i.partId,
        partNo: i.partNo,
        description: i.description,
        qty: parseFloat(i.qty) || 0,
        rate: parseFloat(i.rate) || 0,
        amount: i.amount,
      }))
    };
    try {
      await createSalesInvoice(payload);
      if (pendingWaMsgId) {
        await markWhatsappProcessed(pendingWaMsgId);
      }
      alert('Sales Invoice saved successfully');
      onBack();
    } catch (err) { console.error('Save failed', err); }
  };

  const handleSendWa = () => {
    if (!formData.partyCd) {
      alert("Please select a customer first.");
      return;
    }
    const acc = accounts.find(a => a.acCode?.toString() === formData.partyCd);
    if (!acc || !acc.mobileNo) {
      alert("Customer does not have a mobile number saved.");
      return;
    }
    
    let text = `*Invoice:* ${formData.invoiceNo || '(Unsaved)'}\n*Date:* ${formData.date}\n*Customer:* ${formData.customerName}\n\n*Items:*\n`;
    items.forEach(i => {
      text += `- ${i.qty} x ${i.description} @ ${i.rate} = ${i.amount?.toFixed(2)}\n`;
    });
    
    const ledgerAmt = totalAmount - (parseFloat(formData.paid) || 0);
    text += `\n*Bill Total:* ${totalAmount.toFixed(2)}`;
    text += `\n*Paid:* ${(parseFloat(formData.paid) || 0).toFixed(2)}`;
    text += `\n*This Bill Ledger:* ${ledgerAmt.toFixed(2)}`;
    text += `\n\n*Overall Account Balance:* ${(acc.balance || 0).toFixed(2)}`;
    
    let phone = acc.mobileNo.replace(/\D/g, '');
    if (phone.length === 10) phone = '91' + phone;
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const filteredParts = parts.filter(p =>
    (!filter.brand || (p.brand || '').toLowerCase().includes(filter.brand.toLowerCase())) &&
    (!filter.partItem || (p.partNo || '').toLowerCase().includes(filter.partItem.toLowerCase())) &&
    (!filter.description || (p.description || '').toLowerCase().includes(filter.description.toLowerCase()))
  );

  const filteredAccounts = accounts.filter(a =>
    (a.acName || a.name || '').toLowerCase().includes(accountSearch.toLowerCase()) ||
    (a.acCode || '').toString().includes(accountSearch)
  );

  const labelStyle = { fontSize: '11px', fontWeight: 'bold', color: '#1d2d5a', width: '80px', flexShrink: 0 };
  const inputStyle = { height: '22px', border: '1px solid #7a9cbf', background: 'white', padding: '0 4px', fontSize: '11px', fontFamily: 'Tahoma,sans-serif', flex: 1 };
  const topBtnStyle = (bg = '#e8e8e8', color = '#1d2d5a') => ({ background: bg, color, border: '1px solid #7a9cbf', padding: '4px 10px', fontWeight: 'bold', fontSize: '11px', fontFamily: 'Tahoma,sans-serif', cursor: 'pointer', whiteSpace: 'nowrap' });
  const actionBtnStyle = { background: '#e8e8e8', color: '#1d2d5a', border: '1px solid #7a9cbf', padding: '3px 8px', fontWeight: 'bold', fontSize: '11px', fontFamily: 'Tahoma,sans-serif', cursor: 'pointer' };

  return (
    <div style={{ width: '100%', height: '100vh', display: 'flex', flexDirection: 'column', background: '#dfe8ef', fontFamily: 'Tahoma,Verdana,sans-serif', fontSize: '11px', color: '#1d2d5a', overflow: 'hidden' }}>
      <div style={{ height: '26px', background: '#eef3f7', borderBottom: '1px solid #9caab7', display: 'flex', alignItems: 'center', paddingLeft: '10px', gap: '40px', flexShrink: 0 }}>
        <span>Sales Invoice Entry</span>
        <span>{new Date().toLocaleDateString()}</span>
        <span>PARAS AUTO PARTS</span>
      </div>

      <div style={{ background: '#c9e0f5', borderBottom: '1px solid #7a9cbf', padding: '8px 10px', flexShrink: 0 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '0 20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={labelStyle}>BILL TYPE</span>
              <select name="billType" value={formData.billType} onChange={handleChange} style={inputStyle}>
                <option value="RETAIL">RETAIL</option>
                <option value="WHOLESALE">WHOLESALE</option>
              </select>
              <label style={{ display: 'flex', alignItems: 'center', gap: '2px', marginLeft: '10px', fontSize: '11px', fontWeight: 'bold', color: '#1d2d5a', cursor: 'pointer' }}>
                <input type="checkbox" checked={formData.isReturn} onChange={e => setFormData(p => ({ ...p, isReturn: e.target.checked }))} style={{ margin: 0 }} />
                IS RETURN
              </label>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={labelStyle}>CUSTOMER</span>
              <input name="partyCd" value={formData.partyCd} onChange={handleChange} onBlur={handleAccountBlur} style={{ ...inputStyle, width: '80px', flex: 'none' }} />
              <button onClick={() => setShowAccountModal(true)} style={topBtnStyle('#d4edf9')}>🔍 FIND</button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={labelStyle}>NAME</span>
              <input name="customerName" value={formData.customerName} onChange={handleChange} style={inputStyle} />
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={labelStyle}>INV NO</span>
              <input name="invoiceNo" value={formData.invoiceNo} onChange={handleChange} style={inputStyle} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={labelStyle}>DATE</span>
              <input type="date" name="date" value={formData.date} onChange={handleChange} style={inputStyle} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={labelStyle}>PAID AMT</span>
              <input type="number" name="paid" value={formData.paid} onChange={handleChange} style={{ ...inputStyle, background: '#e1f5fe', fontWeight: 'bold' }} />
            </div>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
        <div style={{ background: '#d4edf9', borderBottom: '1px solid #7a9cbf', padding: '4px 8px', display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginRight: '10px' }}>
            <div style={{ background: '#003399', padding: '3px 5px', borderRadius: '2px' }}>
              <FaFileInvoiceDollar size={14} color="white" />
            </div>
            <strong style={{ color: '#003399', fontSize: '12px' }}>INVOICE</strong>
          </div>
          <button onClick={() => setShowModal(true)} style={actionBtnStyle}>ADD ITEM</button>
          <button onClick={() => { setShowWaModal(true); fetchWaMessage(); }} style={{ ...actionBtnStyle, background: '#25D366', color: 'white', borderColor: '#128C7E' }}>WA QUICK ORDER</button>
          <button onClick={() => { if (selectedItemIndex !== null) removeItem(selectedItemIndex); }} style={actionBtnStyle}>DELETE ITEM</button>
          <button onClick={handleSave} style={{ ...actionBtnStyle, background: '#28a745', color: 'white', marginLeft: 'auto' }}>SAVE</button>
          <button onClick={onBack} style={{ ...actionBtnStyle, marginLeft: '10px' }}>RETURN</button>
        </div>

        <div style={{ flex: 1, overflow: 'auto', background: '#cce6ff', border: '1px solid #7a9cbf', margin: '4px', paddingBottom: '80px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', fontFamily: 'Tahoma,sans-serif' }}>
            <thead style={{ position: 'sticky', top: 0, zIndex: 1 }}>
              <tr style={{ background: '#7fc6ea' }}>
                {[['PART NO.', '20%'], ['DESCRIPTION', '40%'], ['QTY', '10%'], ['RATE', '15%'], ['AMOUNT', '15%']].map(([h, w]) => (
                  <th key={h} style={{ width: w, textAlign: 'left', padding: '4px 8px', borderRight: '1px solid #5a8aaa', borderBottom: '2px solid #4a7a9a', fontWeight: 'bold' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={idx} onClick={() => setSelectedItemIndex(idx)} style={{ background: selectedItemIndex === idx ? '#b8d4f0' : idx % 2 === 0 ? '#ffffff' : '#e8f4ff', cursor: 'pointer' }}>
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
              <span style={{ fontWeight: 'bold', fontSize: '12px', color: '#555' }}>TOTAL: {totalAmount.toFixed(2)}</span>
              <span style={{ fontWeight: 'bold', fontSize: '12px', color: '#d32f2f' }}>PAID: {(parseFloat(formData.paid) || 0).toFixed(2)}</span>
              <span style={{ fontWeight: 'bold', fontSize: '16px', color: '#003399' }}>LEDGER AMT: {(totalAmount - (parseFloat(formData.paid) || 0)).toFixed(2)}</span>
           </div>
           <button onClick={handleSendWa} style={{ ...topBtnStyle('#25D366', 'white'), padding: '6px 18px', borderColor: '#128C7E' }}>SEND WA</button>
           <button onClick={handleSave} style={{ ...topBtnStyle('#28a745', 'white'), padding: '6px 18px' }}>SAVE</button>
           <button onClick={onBack} style={{ ...topBtnStyle('#e8e8e8'), padding: '6px 18px' }}>RETURN</button>
        </div>
      </div>

      {showModal && (
        <div style={overlayStyle}>
          <div style={{ ...modalStyle, width: '800px' }}>
            <div style={modalHeaderStyle}><span>ADD PARTS</span><button onClick={() => setShowModal(false)} style={closeXStyle}>✕</button></div>
            <div style={{ padding: '8px 10px' }}><input placeholder="Search part..." value={filter.partItem} onChange={e => setFilter(p => ({ ...p, partItem: e.target.value }))} style={inputStyle} /></div>
            <div style={{ height: '300px', overflow: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  {filteredParts.map((p, idx) => (
                    <tr key={idx} onClick={() => addItem(p)} style={{ cursor: 'pointer', background: idx % 2 === 0 ? '#fff' : '#f0f8ff' }}>
                      <td style={tdS()}>{p.partNo}</td>
                      <td style={tdS()}>{p.description}</td>
                      <td style={tdS()}>{formData.billType === 'WHOLESALE' ? p.wholesalePrice : p.retailPrice}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

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
                      <td style={tdS()}>{a.acCode}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
