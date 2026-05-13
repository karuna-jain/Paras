import { useState, useEffect } from 'react';
import { getAccounts, createVoucher } from './api';
import { FaFileInvoiceDollar } from 'react-icons/fa';

export default function VoucherEntry({ voucher, onBack }) {

  const [formData, setFormData] = useState(voucher ? {
    vcode: voucher.vcode || '',
    vdate: voucher.vdate || new Date().toISOString().split('T')[0],
    acCode: voucher.acCode || '',
    partyName: voucher.partyName || '',
    vtype: voucher.vtype || 'RECEIPT',
    vamount: voucher.vamount || 0,
    remark: voucher.remark || '',
  } : {
    vcode: '',
    vdate: new Date().toISOString().split('T')[0],
    acCode: '',
    partyName: '',
    vtype: 'RECEIPT',
    vamount: 0,
    remark: '',
  });

  const [accounts, setAccounts] = useState([]);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [accountSearch, setAccountSearch] = useState('');

  useEffect(() => {
    getAccounts().then(setAccounts).catch(console.error);
  }, []);

  const handleChange = (e) =>
    setFormData(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleAccountBlur = () => {
    if (!formData.acCode) return;
    const acc = accounts.find(a => a.acCode?.toString() === formData.acCode);
    if (acc) fillFromAccount(acc);
  };

  const fillFromAccount = (acc) => {
    setFormData(p => ({
      ...p,
      acCode: acc.acCode?.toString() || '',
      partyName: acc.acName || acc.name || '',
    }));
    setShowAccountModal(false);
  };

  const handleSave = async () => {
    if (!formData.partyName || !formData.vamount) {
      alert('Please enter party name and amount'); return;
    }
    try {
      await createVoucher(formData);
      alert('Voucher saved successfully');
      onBack();
    } catch (err) { console.error('Save failed', err); }
  };

  const filteredAccounts = accounts.filter(a =>
    (a.acName || a.name || '').toLowerCase().includes(accountSearch.toLowerCase()) ||
    (a.acCode || '').toString().includes(accountSearch)
  );

  const labelStyle = { fontSize: '11px', fontWeight: 'bold', color: '#1d2d5a', width: '100px', flexShrink: 0 };
  const inputStyle = { height: '24px', border: '1px solid #7a9cbf', background: 'white', padding: '0 4px', fontSize: '11px', fontFamily: 'Tahoma,sans-serif', flex: 1 };
  const topBtnStyle = (bg = '#e8e8e8', color = '#1d2d5a') => ({ background: bg, color, border: '1px solid #7a9cbf', padding: '5px 12px', fontWeight: 'bold', fontSize: '11px', fontFamily: 'Tahoma,sans-serif', cursor: 'pointer' });

  return (
    <div style={{ width: '100%', height: '100vh', display: 'flex', flexDirection: 'column', background: '#dfe8ef', fontFamily: 'Tahoma,Verdana,sans-serif', fontSize: '11px', color: '#1d2d5a', overflow: 'hidden' }}>
      <div style={{ height: '26px', background: '#eef3f7', borderBottom: '1px solid #9caab7', display: 'flex', alignItems: 'center', paddingLeft: '10px', gap: '40px', flexShrink: 0 }}>
        <span>Voucher Entry</span>
        <span>{new Date().toLocaleDateString()}</span>
        <span>PARAS AUTO PARTS</span>
      </div>

      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', padding: '20px' }}>
        <div style={{ width: '500px', background: '#cce6ff', border: '1px solid #7a9cbf', padding: '20px', borderRadius: '4px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', height: 'fit-content' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', borderBottom: '2px solid #7a9cbf', paddingBottom: '10px' }}>
            <FaFileInvoiceDollar size={24} color="#003399" />
            <h2 style={{ margin: 0, fontSize: '16px', color: '#003399' }}>{formData.vtype} VOUCHER</h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={labelStyle}>VOUCHER TYPE</span>
              <select name="vtype" value={formData.vtype} onChange={handleChange} style={inputStyle}>
                <option value="RECEIPT">RECEIPT</option>
                <option value="PAYMENT">PAYMENT</option>
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={labelStyle}>DATE</span>
              <input type="date" name="vdate" value={formData.vdate} onChange={handleChange} style={inputStyle} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={labelStyle}>PARTY A/C</span>
              <input name="acCode" value={formData.acCode} onChange={handleChange} onBlur={handleAccountBlur} style={{ ...inputStyle, width: '80px', flex: 'none' }} />
              <button onClick={() => setShowAccountModal(true)} style={topBtnStyle('#d4edf9')}>🔍 FIND</button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={labelStyle}>PARTY NAME</span>
              <input name="partyName" value={formData.partyName} onChange={handleChange} style={inputStyle} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={labelStyle}>AMOUNT</span>
              <input type="number" name="vamount" value={formData.vamount} onChange={handleChange} style={{ ...inputStyle, fontWeight: 'bold', fontSize: '14px', color: '#003399' }} />
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <span style={labelStyle}>REMARK</span>
              <textarea name="remark" value={formData.remark} onChange={handleChange} style={{ ...inputStyle, height: '60px', padding: '4px' }} />
            </div>

          </div>

          <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button onClick={handleSave} style={{ ...topBtnStyle('#28a745', 'white'), padding: '8px 25px' }}>SAVE</button>
            <button onClick={onBack} style={{ ...topBtnStyle('#e8e8e8'), padding: '8px 25px' }}>CANCEL</button>
          </div>
        </div>
      </div>

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
