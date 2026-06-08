import { useState, useEffect } from 'react';
import { getAccounts, createVoucher, getNextVoucherNo } from './api';
import { FaPlus, FaTrash, FaSearch } from 'react-icons/fa';

export default function VoucherEntry({ voucher, onBack }) {
  const [voucherNo, setVoucherNo] = useState(voucher ? voucher.voucherNo : '');
  const [voucherDate, setVoucherDate] = useState(
    voucher ? voucher.voucherDate : new Date().toISOString().split('T')[0]
  );
  
  const [lines, setLines] = useState(
    voucher && voucher.lines && voucher.lines.length > 0
      ? voucher.lines.map(line => ({
          acId: line.acId || null,
          acCode: line.acCode || '',
          acName: line.acName || '',
          drCr: line.drCr || 'D',
          amount: line.amount || 0.0,
          narration: line.narration || '',
        }))
      : [
          { acId: null, acCode: '', acName: '', drCr: 'D', amount: 0.0, narration: '' },
          { acId: null, acCode: '', acName: '', drCr: 'C', amount: 0.0, narration: '' },
        ]
  );

  const [accounts, setAccounts] = useState([]);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [accountSearch, setAccountSearch] = useState('');
  const [activeLineIndex, setActiveLineIndex] = useState(null);

  useEffect(() => {
    getAccounts().then(setAccounts).catch(console.error);
    if (!voucher) {
      getNextVoucherNo().then(setVoucherNo).catch(console.error);
    }
  }, [voucher]);

  const handleLineChange = (index, field, value) => {
    const updated = [...lines];
    updated[index][field] = value;
    
    // If user changes acCode manually, try to auto-resolve account
    if (field === 'acCode') {
      const match = accounts.find(a => a.acCode?.toString() === value.trim());
      if (match) {
        updated[index].acId = match.id;
        updated[index].acName = match.name || match.acName || '';
      } else {
        updated[index].acId = null;
        updated[index].acName = '';
      }
    }
    setLines(updated);
  };

  const addLine = () => {
    // Alternate DR/CR based on the last row for helper speed
    const lastDrCr = lines[lines.length - 1]?.drCr;
    const nextDrCr = lastDrCr === 'D' ? 'C' : 'D';
    setLines([...lines, { acId: null, acCode: '', acName: '', drCr: nextDrCr, amount: 0.0, narration: '' }]);
  };

  const removeLine = (index) => {
    if (lines.length <= 1) return;
    setLines(lines.filter((_, idx) => idx !== index));
  };

  const openAccountFinder = (index) => {
    setActiveLineIndex(index);
    setAccountSearch('');
    setShowAccountModal(true);
  };

  const selectAccount = (acc) => {
    if (activeLineIndex !== null) {
      const updated = [...lines];
      updated[activeLineIndex].acId = acc.id;
      updated[activeLineIndex].acCode = acc.acCode?.toString() || '';
      updated[activeLineIndex].acName = acc.name || acc.acName || '';
      setLines(updated);
    }
    setShowAccountModal(false);
    setActiveLineIndex(null);
  };

  // Calculations
  const totalDr = lines
    .filter(l => l.drCr === 'D')
    .reduce((sum, l) => sum + (parseFloat(l.amount) || 0), 0);

  const totalCr = lines
    .filter(l => l.drCr === 'C')
    .reduce((sum, l) => sum + (parseFloat(l.amount) || 0), 0);

  const diff = Math.abs(totalDr - totalCr);
  const isBalanced = diff < 0.01 && totalDr > 0;

  const handleSave = async () => {
    if (!voucherNo) {
      alert('Voucher number is required');
      return;
    }
    if (lines.some(l => !l.acCode || !l.acId)) {
      alert('Please select valid accounts for all lines');
      return;
    }
    if (lines.some(l => (parseFloat(l.amount) || 0) <= 0)) {
      alert('All line amounts must be greater than zero');
      return;
    }
    if (!isBalanced) {
      alert(`Voucher is not balanced! Difference is ${diff.toFixed(2)}`);
      return;
    }

    const payload = {
      voucherNo,
      voucherDate,
      totalDr,
      totalCr,
      lines: lines.map(l => ({
        acId: l.acId,
        acCode: l.acCode,
        acName: l.acName,
        drCr: l.drCr,
        amount: parseFloat(l.amount) || 0.0,
        narration: l.narration,
      })),
    };

    try {
      await createVoucher(payload);
      alert('Voucher saved successfully');
      onBack();
    } catch (err) {
      console.error('Save failed', err);
      alert('Failed to save voucher. Check inputs.');
    }
  };

  const filteredAccounts = accounts.filter(a =>
    (a.name || a.acName || '').toLowerCase().includes(accountSearch.toLowerCase()) ||
    (a.acCode || '').toString().includes(accountSearch)
  );

  // Styled components mimicking Windows retro style
  const panelStyle = {
    background: '#e8e8e8',
    border: '1px solid #808080',
    padding: '10px',
    fontFamily: 'Tahoma, sans-serif',
    fontSize: '11px',
    color: '#000',
  };

  const btnStyle = {
    height: '24px',
    background: '#e8e8e8',
    color: '#000',
    border: '1px solid #808080',
    padding: '0 10px',
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

  const labelStyle = {
    fontWeight: 'bold',
    color: '#000',
    fontSize: '11px',
  };

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: '#d6dbe2', padding: '10px' }}>
      
      {/* Title Bar */}
      <div style={{ height: '26px', background: '#000080', color: 'white', display: 'flex', alignItems: 'center', padding: '0 8px', fontWeight: 'bold', fontSize: '11px', flexShrink: 0 }}>
        <span>CB VOUCHER ENTRY</span>
      </div>

      {/* Header Info Panel */}
      <div style={{ ...panelStyle, marginTop: '5px', display: 'flex', gap: '30px', alignItems: 'center', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={labelStyle}>VOUCHER NO:</span>
          <input
            style={{ ...inputStyle, width: '100px', background: '#e0e0e0', fontWeight: 'bold' }}
            value={voucherNo}
            readOnly
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={labelStyle}>DATE:</span>
          <input
            type="date"
            style={{ ...inputStyle, width: '130px' }}
            value={voucherDate}
            onChange={(e) => setVoucherDate(e.target.value)}
          />
        </div>
      </div>

      {/* Grid Container */}
      <div style={{ flex: 1, background: '#fff', border: '1px solid #808080', marginTop: '5px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        
        {/* Table Head */}
        <div style={{ overflowY: 'scroll', background: '#e8e8e8', borderBottom: '1px solid #808080', flexShrink: 0 }}>
          <table style={{ width: '100%', tableLayout: 'fixed', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={thStyle(45)}>DR/CR</th>
                <th style={thStyle(80)}>A/C CODE</th>
                <th style={thStyle(220)}>ACCOUNT NAME</th>
                <th style={thStyle(120)}>AMOUNT</th>
                <th style={thStyle()}>NARRATION</th>
                <th style={thStyle(40)}>ACT</th>
              </tr>
            </thead>
          </table>
        </div>

        {/* Table Body Rows */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <table style={{ width: '100%', tableLayout: 'fixed', borderCollapse: 'collapse' }}>
            <tbody>
              {lines.map((line, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #e0e0e0' }}>
                  
                  {/* DR/CR selector */}
                  <td style={tdStyle(45)}>
                    <select
                      value={line.drCr}
                      onChange={(e) => handleLineChange(idx, 'drCr', e.target.value)}
                      style={{ ...inputStyle, width: '100%', height: '20px', padding: 0 }}
                    >
                      <option value="D">DR</option>
                      <option value="C">CR</option>
                    </select>
                  </td>

                  {/* Account Code */}
                  <td style={tdStyle(80)}>
                    <div style={{ display: 'flex', width: '100%', alignItems: 'center' }}>
                      <input
                        value={line.acCode}
                        onChange={(e) => handleLineChange(idx, 'acCode', e.target.value)}
                        style={{ ...inputStyle, width: '100%', height: '20px', textAlign: 'center' }}
                        placeholder="Code"
                      />
                    </div>
                  </td>

                  {/* Account Name */}
                  <td style={tdStyle(220)}>
                    <div style={{ display: 'flex', width: '100%', alignItems: 'center', gap: '2px' }}>
                      <input
                        value={line.acName}
                        readOnly
                        style={{ ...inputStyle, flex: 1, height: '20px', background: '#f0f0f0' }}
                        placeholder="Click Find to select Account..."
                      />
                      <button
                        onClick={() => openAccountFinder(idx)}
                        style={{ ...btnStyle, height: '20px', padding: '0 4px', display: 'flex', alignItems: 'center' }}
                        title="Find Account"
                      >
                        <FaSearch size={10} />
                      </button>
                    </div>
                  </td>

                  {/* Amount */}
                  <td style={tdStyle(120)}>
                    <input
                      type="number"
                      value={line.amount || ''}
                      onChange={(e) => handleLineChange(idx, 'amount', e.target.value)}
                      style={{ ...inputStyle, width: '100%', height: '20px', textAlign: 'right', fontWeight: 'bold' }}
                      placeholder="0.00"
                    />
                  </td>

                  {/* Narration */}
                  <td style={tdStyle()}>
                    <input
                      value={line.narration}
                      onChange={(e) => handleLineChange(idx, 'narration', e.target.value)}
                      style={{ ...inputStyle, width: '100%', height: '20px' }}
                      placeholder="Line narration..."
                    />
                  </td>

                  {/* Delete Button */}
                  <td style={tdStyle(40, 'center')}>
                    <button
                      onClick={() => removeLine(idx)}
                      style={{ background: 'none', border: 'none', color: '#cc0000', cursor: 'pointer', padding: 0 }}
                      title="Remove Row"
                    >
                      <FaTrash size={11} />
                    </button>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals Row */}
        <div style={{ borderTop: '2px solid #808080', background: '#f0f0f0', padding: '5px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0, fontSize: '11px', fontWeight: 'bold' }}>
          <div style={{ display: 'flex', gap: '20px' }}>
            <span>TOTAL DEBIT (DR): <span style={{ color: '#003399' }}>{totalDr.toFixed(2)}</span></span>
            <span>TOTAL CREDIT (CR): <span style={{ color: '#003399' }}>{totalCr.toFixed(2)}</span></span>
          </div>
          <div>
            {diff > 0.01 ? (
              <span style={{ color: '#cc0000' }}>Difference: {diff.toFixed(2)} (NOT BALANCED)</span>
            ) : (
              <span style={{ color: '#006600' }}>Voucher Balanced</span>
            )}
          </div>
        </div>

      </div>

      {/* Command Actions Bar */}
      <div style={{ ...panelStyle, marginTop: '5px', display: 'flex', gap: '10px', justifyContent: 'flex-end', flexShrink: 0 }}>
        <button onClick={addLine} style={btnStyle}>
          <FaPlus style={{ marginRight: '4px', display: 'inline' }} /> <u>A</u>DD ROW
        </button>
        <button
          onClick={handleSave}
          disabled={!isBalanced}
          style={{
            ...btnStyle,
            background: isBalanced ? '#d4f0d4' : '#f0f0f0',
            color: isBalanced ? '#006600' : '#808080',
            cursor: isBalanced ? 'pointer' : 'not-allowed'
          }}
        >
          <u>S</u>AVE VOUCHER
        </button>
        <button onClick={onBack} style={{ ...btnStyle, color: '#cc0000' }}>
          <u>C</u>ANCEL
        </button>
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
                      onClick={() => selectAccount(a)}
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

function thStyle(width) {
  return {
    width: width ? `${width}px` : 'auto',
    padding: '4px 6px',
    textAlign: 'left',
    background: '#e8e8e8',
    borderRight: '1px solid #808080',
    fontWeight: 'bold',
    fontSize: '11px',
    color: '#000',
    position: 'sticky',
    top: 0,
    boxShadow: 'inset 1px 1px #fff, inset -1px -1px #a0a0a0',
  };
}

function tdStyle(width, align = 'left') {
  return {
    width: width ? `${width}px` : 'auto',
    padding: '4px 6px',
    textAlign: align,
    borderRight: '1px solid #e0e0e0',
    fontSize: '11px',
  };
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
