import { useState, useEffect } from 'react';
import { getAccounts } from './api';

export default function LedgerQuery({ onExit }) {
  const [view, setView] = useState('popup'); // 'popup', 'account_list', 'ledger_details'
  const [selectedCall, setSelectedCall] = useState('NAME');
  
  const [accounts, setAccounts] = useState([]);
  const [filteredAccounts, setFilteredAccounts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAccount, setSelectedAccount] = useState(null);

  useEffect(() => {
    if (view === 'account_list') {
      getAccounts().then(data => {
        setAccounts(data);
        setFilteredAccounts(data);
      }).catch(console.error);
    }
  }, [view]);

  const handleConfirm = () => {
    setView('account_list');
  };

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    const filtered = accounts.filter(acc => 
      (acc.name && acc.name.toLowerCase().includes(query)) ||
      (acc.city && acc.city.toLowerCase().includes(query))
    );
    setFilteredAccounts(filtered);
  };

  const handleAccountSelect = (account) => {
    setSelectedAccount(account);
    setView('ledger_details');
  };

  const handleKeyDown = (e, account) => {
    if (e.key === 'Enter') {
      handleAccountSelect(account);
    }
  };

  const renderHeader = (title) => (
    <div style={{
      height: '26px',
      background: '#eaffda',
      borderBottom: '1px solid #c0c0c0',
      display: 'flex',
      alignItems: 'center',
      paddingLeft: '10px',
      fontSize: '11px',
      color: '#000',
      gap: '40px',
      flexShrink: 0
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
        <span role="img" aria-label="folder">📂</span>
        <span>{title}</span>
      </div>
      <span style={{ marginLeft: '150px' }}>18-05-2026 (MONDAY)</span>
      <span>PARAS AUTO PARTS</span>
      <span>(OPER)</span>
      <button 
        onClick={onExit} 
        style={{ marginLeft: 'auto', marginRight: '10px', background: 'transparent', border: 'none', cursor: 'pointer' }}
      >
        _ □ ✕
      </button>
    </div>
  );

  if (view === 'popup') {
    return (
      <div style={containerStyle}>
        {renderHeader('A/c Info')}
        <div style={{
          position: 'absolute',
          top: '150px',
          left: '100px',
          width: '280px',
          background: '#b5d0e8',
          border: '1px solid #7a9cbf',
          boxShadow: '2px 2px 5px rgba(0,0,0,0.3)',
          display: 'flex',
          padding: '1px'
        }}>
          <div style={{ flex: 1, padding: '15px 10px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {[
              { id: 'NAME', label: 'CALL BY NAME' },
              { id: 'HEAD', label: 'CALL BY HEAD' },
              { id: 'CITY', label: 'CALL BY CITY' },
              { id: 'AC_NO', label: 'CALL BY A/C NO.' }
            ].map(opt => (
              <label key={opt.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: 'bold', color: '#1d2d5a', cursor: 'pointer' }}>
                <div style={radioOuterStyle}>
                  {selectedCall === opt.id && <div style={radioInnerStyle} />}
                </div>
                <input 
                  type="radio" 
                  name="callType" 
                  style={{ display: 'none' }} 
                  checked={selectedCall === opt.id}
                  onChange={() => setSelectedCall(opt.id)}
                />
                <span style={selectedCall === opt.id ? { border: '1px dotted #888', padding: '1px 3px' } : { padding: '2px 4px' }}>
                  {opt.label}
                </span>
              </label>
            ))}
          </div>
          <div style={{ width: '80px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '10px 10px 10px 0', gap: '8px' }}>
            <button onClick={handleConfirm} style={btnStyle}>CONFIRM</button>
            <button onClick={onExit} style={btnStyle}>CANCEL</button>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'account_list') {
    return (
      <div style={containerStyle}>
        {renderHeader('A/C List')}
        <div style={{ padding: '10px 20px', display: 'flex', flexDirection: 'column', height: 'calc(100% - 26px)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '10px' }}>
            <span style={{ fontWeight: 'bold', fontSize: '14px' }}>SEARCH &nbsp;&nbsp;&nbsp; ACCOUNT</span>
            <span style={{ fontWeight: 'bold', fontSize: '14px', marginLeft: '20px' }}>PRESS ENTER TO SELECT ACCOUNT</span>
          </div>
          
          <div style={{ flex: 1, border: '1px solid #a0a0a0', background: 'white', display: 'flex', flexDirection: 'column' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead style={{ background: '#e0e8f0', position: 'sticky', top: 0 }}>
                <tr>
                  <th style={thStyle}>achead</th>
                  <th style={thStyle}>accity</th>
                  <th style={thStyle}>acdist</th>
                  <th style={thStyle}>acadd1</th>
                  <th style={thStyle}>acadd2</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: '0', borderRight: '1px solid #c0c0c0' }}>
                    <input 
                      type="text" 
                      value={searchQuery}
                      onChange={handleSearch}
                      autoFocus
                      style={{ width: '100%', border: '2px solid #000', outline: 'none', padding: '2px 4px' }}
                    />
                  </td>
                  <td style={{ borderRight: '1px solid #c0c0c0' }}></td>
                  <td style={{ borderRight: '1px solid #c0c0c0' }}></td>
                  <td style={{ borderRight: '1px solid #c0c0c0' }}></td>
                  <td style={{ borderRight: '1px solid #c0c0c0' }}></td>
                </tr>
                {filteredAccounts.map((acc, idx) => (
                  <tr 
                    key={acc.id || idx} 
                    onClick={() => handleAccountSelect(acc)}
                    onKeyDown={(e) => handleKeyDown(e, acc)}
                    tabIndex={0}
                    style={{ background: '#dcecf5', cursor: 'pointer', outline: 'none' }}
                    onFocus={(e) => e.currentTarget.style.background = '#c0d9eb'}
                    onBlur={(e) => e.currentTarget.style.background = '#dcecf5'}
                  >
                    <td style={tdListStyle}>{acc.name}</td>
                    <td style={tdListStyle}>{acc.city}</td>
                    <td style={tdListStyle}>{acc.dist}</td>
                    <td style={tdListStyle}>{acc.addressOff}</td>
                    <td style={tdListStyle}>{acc.addressRes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'ledger_details' && selectedAccount) {
    return (
      <div style={containerStyle}>
        {renderHeader('A/c Info')}
        <div style={{ padding: '20px', background: '#d6dbe2', height: 'calc(100% - 26px)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          
          <div style={{ width: '850px', background: '#e0e8f0', border: '2px solid #b0c4de', padding: '15px' }}>
            
            <div style={{ display: 'grid', gridTemplateColumns: '120px 300px 100px 120px', gap: '5px 10px', alignItems: 'center', marginBottom: '15px' }}>
              
              <div style={lblStyle}>ACCOUNT OF</div>
              <div style={valStyle}>{selectedAccount.name}</div>
              
              <div style={{...lblStyle, textAlign: 'right'}}>A/C CODE</div>
              <div style={valStyle}>{selectedAccount.acCode}</div>
              
              <div style={lblStyle}>ADDRESS</div>
              <div style={valStyle}>{selectedAccount.addressOff}</div>
              <div style={{gridColumn: '3/5'}}></div>
              
              <div></div>
              <div style={valStyle}>{selectedAccount.addressRes}</div>
              <div style={{...lblStyle, textAlign: 'right'}}>CITY</div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={valStyle}>{selectedAccount.city}</div>
                <div style={lblStyle}>DIST.</div>
                <div style={valStyle}>{selectedAccount.dist}</div>
              </div>

              <div style={{gridColumn: '1/5', height: '10px'}}></div>

              <div style={lblStyle}>STD CODE</div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={valStyle}>{selectedAccount.stdCode}</div>
                <div style={lblStyle}>PH [Off]</div>
                <div style={valStyle}>{selectedAccount.phO}</div>
              </div>
              <div style={{...lblStyle, textAlign: 'right'}}>PH [Res]</div>
              <div style={valStyle}>{selectedAccount.phR}</div>

              <div style={lblStyle}>CONTACT PERS.</div>
              <div style={valStyle}>{selectedAccount.contactPerson}</div>
              <div style={{...lblStyle, textAlign: 'right'}}>CELL NO</div>
              <div style={valStyle}>{selectedAccount.mobileNo}</div>
              
            </div>

            <div style={{ border: '2px solid #b0c4de', background: 'white', display: 'flex', flexDirection: 'column', height: '350px' }}>
              <div style={{ background: '#dcecf5', padding: '5px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #b0c4de' }}>
                <span style={{ fontWeight: 'bold', color: '#1d2d5a', fontSize: '13px' }}>ACCOUNT DETAILS</span>
                <div style={{ display: 'flex' }}>
                  <button style={topBtnStyle}>CALC|</button>
                  <button style={{...topBtnStyle, borderLeft: 'none'}} onClick={() => setView('account_list')}>RETURN</button>
                </div>
              </div>
              
              <div style={{ flex: 1, overflow: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', fontFamily: 'Tahoma' }}>
                  <thead style={{ background: '#f0f4f8', color: '#1d2d5a' }}>
                    <tr>
                      <th style={thLedgerStyle}>ENTRY DT</th>
                      <th style={thLedgerStyle}>NARRATION</th>
                      <th style={thLedgerStyle}>DEBIT</th>
                      <th style={thLedgerStyle}>CREDIT</th>
                      <th style={thLedgerStyle}>D/C</th>
                      <th style={thLedgerStyle}>BALANCE</th>
                      <th style={thLedgerStyle}>SOURCE</th>
                      <th style={thLedgerStyle}>DOC NO</th>
                      <th style={thLedgerStyle}>BILL DT</th>
                      <th style={thLedgerStyle}>TRANSPORTER</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{...tdLedgerStyle, color: '#cc0000'}}>01-04-2026</td>
                      <td style={{...tdLedgerStyle, color: '#cc0000'}}>* OPENING BALANCE *</td>
                      <td style={{...tdLedgerStyle, color: '#cc0000', textAlign: 'right'}}>{(selectedAccount.openingBalance || 0).toFixed(2)}</td>
                      <td style={tdLedgerStyle}></td>
                      <td style={{...tdLedgerStyle, color: '#cc0000'}}>D</td>
                      <td style={{...tdLedgerStyle, color: '#cc0000', textAlign: 'right'}}>{(selectedAccount.openingBalance || 0).toFixed(2)}</td>
                      <td style={tdLedgerStyle}></td>
                      <td style={tdLedgerStyle}></td>
                      <td style={tdLedgerStyle}></td>
                      <td style={tdLedgerStyle}></td>
                    </tr>
                    <tr>
                      <td style={{...tdLedgerStyle, color: '#cc0000'}}>31-03-2027</td>
                      <td style={{...tdLedgerStyle, color: '#cc0000'}}>* CLOSING BALANCE *</td>
                      <td style={{...tdLedgerStyle, color: '#cc0000', textAlign: 'right'}}>{(selectedAccount.balance || 0).toFixed(2)}</td>
                      <td style={{...tdLedgerStyle, color: '#cc0000', textAlign: 'right'}}>0.00</td>
                      <td style={{...tdLedgerStyle, color: '#cc0000'}}>D</td>
                      <td style={{...tdLedgerStyle, color: '#cc0000', textAlign: 'right'}}>{(selectedAccount.balance || 0).toFixed(2)}</td>
                      <td style={tdLedgerStyle}></td>
                      <td style={tdLedgerStyle}></td>
                      <td style={tdLedgerStyle}></td>
                      <td style={tdLedgerStyle}></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>
      </div>
    );
  }

  return null;
}

// Styles
const containerStyle = {
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  background: '#ffffff',
  fontFamily: 'Tahoma, Verdana, sans-serif',
  position: 'relative'
};

const radioOuterStyle = {
  width: '12px',
  height: '12px',
  borderRadius: '50%',
  background: 'white',
  border: '1px solid #888',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: 'inset 1px 1px 2px rgba(0,0,0,0.3)'
};

const radioInnerStyle = {
  width: '6px',
  height: '6px',
  borderRadius: '50%',
  background: 'black'
};

const btnStyle = {
  background: '#f0f0f0',
  border: '2px solid',
  borderColor: '#ffffff #888888 #888888 #ffffff',
  padding: '4px',
  fontSize: '11px',
  fontWeight: 'bold',
  cursor: 'pointer',
  fontFamily: 'Tahoma, sans-serif'
};

const thStyle = {
  padding: '4px 6px',
  textAlign: 'left',
  borderRight: '1px solid #c0c0c0',
  borderBottom: '1px solid #c0c0c0',
  fontWeight: 'normal',
  color: '#555'
};

const tdListStyle = {
  padding: '2px 6px',
  borderRight: '1px solid #c0c0c0',
  borderBottom: '1px solid #c0c0c0',
  color: '#003399'
};

const lblStyle = {
  fontSize: '11px',
  fontWeight: 'bold',
  color: '#1d2d5a',
  whiteSpace: 'nowrap'
};

const valStyle = {
  background: 'white',
  border: '1px solid #b0c4de',
  padding: '2px 4px',
  fontSize: '11px',
  color: '#003399',
  minHeight: '16px',
  boxShadow: 'inset 1px 1px 2px rgba(0,0,0,0.1)'
};

const topBtnStyle = {
  background: '#f0f4f8',
  border: '1px solid #b0c4de',
  color: '#1d2d5a',
  padding: '2px 10px',
  fontSize: '11px',
  fontWeight: 'bold',
  cursor: 'pointer'
};

const thLedgerStyle = {
  padding: '4px',
  textAlign: 'left',
  borderRight: '1px solid #b0c4de',
  borderBottom: '1px solid #b0c4de',
  fontWeight: 'bold'
};

const tdLedgerStyle = {
  padding: '2px 4px',
  borderRight: '1px solid #b0c4de',
  borderBottom: '1px solid #eee'
};
