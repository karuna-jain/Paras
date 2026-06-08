import { useState, useEffect } from 'react';
import { getAccounts, postOpening, getLedgerOpening } from './api';

export default function AcBalanceEntry({ onExit }) {
  const [formData, setFormData] = useState({
    acId: null,
    acCode: '',
    acName: '',
    amount: 0.0,
    dc: 'D',
    date: new Date().toISOString().split('T')[0],
  });

  const [accounts, setAccounts] = useState([]);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [accountSearch, setAccountSearch] = useState('');

  useEffect(() => {
    getAccounts().then(setAccounts).catch(console.error);
  }, []);

  const handleAccountBlur = async () => {
    if (!formData.acCode) return;
    const acc = accounts.find(a => a.acCode?.toString() === formData.acCode.trim());
    if (acc) {
      fillFromAccount(acc);
    } else {
      setAccountSearch(formData.acCode);
      setShowAccountModal(true);
    }
  };

  const fillFromAccount = async (acc) => {
    // Load existing opening balance if any
    let existingAmt = 0.0;
    let existingDc = 'D';
    try {
      const existing = await getLedgerOpening(acc.acCode);
      if (existing && existing.amount !== undefined) {
        existingAmt = existing.amount;
        existingDc = existing.dc || 'D';
      }
    } catch (e) {
      console.error("No existing opening balance", e);
    }

    setFormData(f => ({
      ...f,
      acId: acc.id,
      acCode: acc.acCode?.toString() || '',
      acName: acc.name || acc.acName || '',
      amount: existingAmt,
      dc: existingDc,
    }));
    setShowAccountModal(false);
  };

  const handleSave = async () => {
    if (!formData.acCode || !formData.acId) {
      alert('Please select a valid account');
      return;
    }
    if (parseFloat(formData.amount) < 0) {
      alert('Amount cannot be negative');
      return;
    }

    const payload = {
      acId: formData.acId,
      acCode: formData.acCode,
      amount: parseFloat(formData.amount) || 0.0,
      dc: formData.dc,
      date: formData.date,
    };

    try {
      await postOpening(payload);
      alert('Opening Balance updated successfully!');
      // Reset form
      setFormData({
        acId: null,
        acCode: '',
        acName: '',
        amount: 0.0,
        dc: 'D',
        date: new Date().toISOString().split('T')[0],
      });
    } catch (err) {
      console.error('Failed to post opening balance', err);
      alert('Error saving opening balance');
    }
  };

  const filteredAccounts = accounts.filter(a =>
    (a.acCode || '').toString().includes(accountSearch) ||
    (a.name || a.acName || '').toLowerCase().includes(accountSearch.toLowerCase())
  );

  const panelStyle = {
    background: '#e8e8e8',
    border: '1px solid #808080',
    padding: '20px',
    fontFamily: 'Tahoma, sans-serif',
    fontSize: '11px',
    color: '#000',
    width: '420px',
    margin: '40px auto 0 auto',
    boxShadow: 'inset 1px 1px #fff, inset -1px -1px #a0a0a0',
  };

  const btnStyle = {
    height: '24px',
    background: '#e8e8e8',
    color: '#000',
    border: '1px solid #808080',
    padding: '0 15px',
    fontWeight: 'bold',
    fontFamily: 'Tahoma, sans-serif',
    fontSize: '11px',
    cursor: 'pointer',
    borderRadius: '0',
    boxShadow: 'inset 1px 1px #fff, inset -1px -1px #a0a0a0',
  };

  const inputStyle = {
    height: '22px',
    border: '1px solid #808080',
    background: '#fff',
    padding: '0 4px',
    fontFamily: 'Tahoma, sans-serif',
    fontSize: '11px',
    borderRadius: '0',
    outline: 'none',
  };

  const rowStyle = {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '10px',
  };

  const labelStyle = {
    width: '110px',
    fontWeight: 'bold',
  };

  return (
    <div style={{ width: '100%', height: '100%', background: '#d6dbe2', padding: '10px', overflow: 'auto' }}>
      
      {/* Panel Box */}
      <div style={panelStyle}>
        
        {/* Title inside panel */}
        <div style={{ height: '22px', background: '#000080', color: 'white', display: 'flex', alignItems: 'center', padding: '0 8px', fontWeight: 'bold', marginBottom: '15px' }}>
          <span>A/C OPENING BALANCE ENTRY</span>
        </div>

        {/* Account Code */}
        <div style={rowStyle}>
          <span style={labelStyle}>A/C CODE:</span>
          <input
            style={{ ...inputStyle, width: '80px', fontWeight: 'bold' }}
            value={formData.acCode}
            onChange={(e) => setFormData(f => ({ ...f, acCode: e.target.value }))}
            onBlur={handleAccountBlur}
          />
          <button
            onClick={() => { setAccountSearch(''); setShowAccountModal(true); }}
            style={{ ...btnStyle, marginLeft: '6px', height: '22px' }}
          >
            🔍 FIND
          </button>
        </div>

        {/* Account Name */}
        <div style={rowStyle}>
          <span style={labelStyle}>A/C NAME:</span>
          <input
            style={{ ...inputStyle, flex: 1, background: '#f5f5f5' }}
            value={formData.acName}
            readOnly
            placeholder="Select Account..."
          />
        </div>

        {/* Opening Balance Amount */}
        <div style={rowStyle}>
          <span style={labelStyle}>OPENING BAL:</span>
          <input
            type="number"
            style={{ ...inputStyle, width: '120px', fontWeight: 'bold', textAlign: 'right' }}
            value={formData.amount || ''}
            onChange={(e) => setFormData(f => ({ ...f, amount: parseFloat(e.target.value) || 0.0 }))}
          />
          <select
            style={{ ...inputStyle, width: '60px', marginLeft: '6px' }}
            value={formData.dc}
            onChange={(e) => setFormData(f => ({ ...f, dc: e.target.value }))}
          >
            <option value="D">DEBIT</option>
            <option value="C">CREDIT</option>
          </select>
        </div>

        {/* Date */}
        <div style={rowStyle}>
          <span style={labelStyle}>AS ON DATE:</span>
          <input
            type="date"
            style={{ ...inputStyle, width: '120px' }}
            value={formData.date}
            onChange={(e) => setFormData(f => ({ ...f, date: e.target.value }))}
          />
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '20px', borderTop: '1px solid #808080', paddingTop: '15px' }}>
          <button onClick={handleSave} style={{ ...btnStyle, background: '#d4f0d4', color: '#006600' }}>
            <u>S</u>AVE
          </button>
          <button onClick={onExit} style={{ ...btnStyle, color: '#cc0000' }}>
            <u>C</u>LOSE
          </button>
        </div>

      </div>

      {/* Account Finder Modal */}
      {showAccountModal && (
        <div style={overlayStyle}>
          <div style={{ ...modalStyle, width: '550px' }}>
            <div style={modalHeaderStyle}>
              <span>SELECT ACCOUNT</span>
              <button onClick={() => setShowAccountModal(false)} style={closeXStyle}>✕</button>
            </div>
            <div style={{ padding: '8px 10px', display: 'flex', gap: '5px', background: '#e8e8e8', borderBottom: '1px solid #808080' }}>
              <input
                placeholder="Search account by code or name..."
                value={accountSearch}
                onChange={e => setAccountSearch(e.target.value)}
                style={{ ...inputStyle, flex: 1 }}
                autoFocus
              />
            </div>
            <div style={{ height: '300px', overflowY: 'auto', background: '#fff' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#e0e0e0', borderBottom: '1px solid #808080', position: 'sticky', top: 0 }}>
                    <th style={modalThStyle(90)}>CODE</th>
                    <th style={modalThStyle()}>ACCOUNT NAME</th>
                    <th style={modalThStyle(100)}>CITY</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAccounts.map((a, idx) => (
                    <tr
                      key={idx}
                      onClick={() => fillFromAccount(a)}
                      style={{ cursor: 'pointer', background: idx % 2 === 0 ? '#fff' : '#f4f4f4', borderBottom: '1px solid #e8e8e8' }}
                      className="hover:bg-blue-100"
                    >
                      <td style={modalTdStyle(90, 'center')}>{a.acCode}</td>
                      <td style={modalTdStyle()}>{a.name || a.acName}</td>
                      <td style={modalTdStyle(100)}>{a.city || ''}</td>
                    </tr>
                  ))}
                  {filteredAccounts.length === 0 && (
                    <tr>
                      <td colSpan={3} style={{ padding: '15px', textAlign: 'center', color: '#666' }}>No matching accounts found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

function modalThStyle(width) {
  return {
    width: width ? `${width}px` : 'auto',
    padding: '5px 8px',
    textAlign: 'left',
    background: '#e0e0e0',
    borderRight: '1px solid #808080',
    fontWeight: 'bold',
    fontSize: '11px',
  };
}

function modalTdStyle(width, align = 'left') {
  return {
    width: width ? `${width}px` : 'auto',
    padding: '5px 8px',
    textAlign: align,
    borderRight: '1px solid #e8e8e8',
    fontSize: '11px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  };
}

const overlayStyle = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0,0,0,0.3)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 3000,
};

const modalStyle = {
  background: 'white',
  border: '2px solid #808080',
  display: 'flex',
  flexDirection: 'column',
  maxHeight: '80vh',
  overflow: 'hidden',
  boxShadow: '2px 2px 10px rgba(0,0,0,0.3)',
};

const modalHeaderStyle = {
  background: '#000080',
  color: 'white',
  padding: '5px 8px',
  fontWeight: 'bold',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  fontSize: '11px',
};

const closeXStyle = {
  background: 'none',
  border: 'none',
  color: 'white',
  cursor: 'pointer',
  fontWeight: 'bold',
  fontSize: '12px',
};
