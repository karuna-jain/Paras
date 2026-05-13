import { useState, useEffect } from 'react';
import { getAccounts, createAccount, updateAccount, deleteAccount } from './api';

const labelStyle = {
  fontWeight: 'bold',
  color: '#003399',
  fontSize: '14px',
};

const inputStyle = {
  border: '1px solid #003399',
  padding: '2px 4px',
  outline: 'none',
  height: '24px',
  fontSize: '14px',
};

const formRowStyle = {
  display: 'grid',
  gridTemplateColumns: '110px 1fr 110px 1fr',
  gap: '5px',
  marginBottom: '5px',
  alignItems: 'center'
};

const smallBtnStyle = {
  background: '#e0e0e0',
  border: '1px solid #003399',
  padding: '0 6px',
  cursor: 'pointer',
  fontWeight: 'bold',
  fontSize: '12px',
  height: '24px'
};

const thStyle = {
  padding: '6px',
  textAlign: 'left',
  borderBottom: '1px solid #003399',
  borderRight: '1px solid #003399',
  fontWeight: 'bold',
  fontSize: '13px',
  background: '#e0e0e0',
  position: 'sticky',
  top: 0
};

const tdStyle = {
  padding: '4px 6px',
  borderRight: '1px solid #ddd',
  fontSize: '13px',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis'
};

const actionBtnStyle = {
  width: '80px',
  height: '34px',
  background: '#f0f0f0',
  border: '1px solid #003399',
  fontWeight: 'bold',
  color: '#003399',
  cursor: 'pointer',
  fontSize: '13px',
  boxShadow: 'inset 1px 1px 2px white, 1px 1px 2px #666'
};

const navBtnStyle = {
  background: '#f0f0f0',
  border: '1px solid #003399',
  padding: '5px 15px',
  fontSize: '12px',
  fontWeight: 'bold',
  color: '#003399',
  cursor: 'pointer',
  boxShadow: 'inset 1px 1px 1px white, 1px 1px 1px #666'
};

export default function AccountView({ onExit, onSelect }) {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(null);

  const initialFormData = {
    headCode: '1',
    acCode: '',
    name: '',
    addressOff: '',
    addressRes: '',
    city: '',
    dist: '',
    pinCode: '',
    state: 'MP',
    inState: 'Y',
    stdCode: '',
    trackRoute: '0',
    trackType: '',
    phO: '',
    phR: '',
    contactPerson: '',
    mobileNo: '',
    mobileSms: '',
    transport: '',
    emailId: '',
    rateType: 'W',
    bankName: '',
    branchName: '',
    bankAcNo: '',
    ifsc: '',
    gstin: '',
    crLimitDays: 0,
    gstCatg: 'U',
    gstEffDate: '07-01-2017',
    closeDay: '',
    salesPerson: '',
    remarks: '',
    acOpenDate: new Date().toLocaleDateString('en-GB').replace(/\//g, '-'),
    openingBalance: 0.0,
    balance: 0.0
  };

  const [formData, setFormData] = useState(initialFormData);

  const getNextAcCode = (accountsList) => {
    if (!accountsList || accountsList.length === 0) return '100001';
    const codes = accountsList
      .map(a => parseInt(a.acCode))
      .filter(c => !isNaN(c));
    if (codes.length === 0) return '100001';
    return (Math.max(...codes) + 1).toString();
  };

  const loadAccounts = async (shouldSetNextCode = false) => {
    try {
      const data = await getAccounts();
      setAccounts(data);
      if (shouldSetNextCode) {
        const nextCode = getNextAcCode(data);
        setFormData({ ...initialFormData, acCode: nextCode });
      }
    } catch (err) {
      console.error("Failed to load accounts", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAccounts(true);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSelect = (account, index) => {
    setSelectedIndex(index);
    setFormData(account);
  };

  const handleConfirmSelect = () => {
    if (onSelect && formData.id) {
      onSelect(formData);
    } else if (onSelect) {
      alert("Please select an existing account first.");
    }
  };

  const handleSubmit = async (type) => {
    if (!formData.name) {
      alert("Name is required");
      return;
    }

    try {
      if (type === 'ADD') {
        const saved = await createAccount(formData);
        alert("Account added successfully");
        loadAccounts(true);
      } else if (type === 'EDIT') {
        if (formData.id) {
          await updateAccount(formData.id, formData);
          alert("Account updated successfully");
          loadAccounts(false);
        } else {
          alert("Select an account to edit");
        }
      }
    } catch (err) {
      console.error("Operation failed", err);
      alert("Error saving account");
    }
  };

  const handleDelete = async () => {
    if (!formData.id) {
      alert("Select an account to delete");
      return;
    }
    if (!window.confirm("Are you sure you want to delete this account?")) return;

    try {
      await deleteAccount(formData.id);
      setSelectedIndex(null);
      loadAccounts(true);
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  const handleFirst = () => { if (accounts.length > 0) handleSelect(accounts[0], 0); };
  const handleLast = () => { if (accounts.length > 0) handleSelect(accounts[accounts.length - 1], accounts.length - 1); };
  const handlePrev = () => { if (selectedIndex > 0) handleSelect(accounts[selectedIndex - 1], selectedIndex - 1); };
  const handleNext = () => {
    if (selectedIndex !== null && selectedIndex < accounts.length - 1) {
      handleSelect(accounts[selectedIndex + 1], selectedIndex + 1);
    }
  };

  const filteredAccounts = accounts.filter(a =>
    a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (a.city && a.city.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (a.acCode && String(a.acCode).includes(searchTerm))
  );

  return (
    <div style={{ padding: '0px', height: '100vh', overflow: 'hidden', background: '#cce6ff', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ padding: '10px', height: '100%', display: 'flex', flexDirection: 'column' }}>
        
        {/* Header Section */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
          <div style={{ background: '#003399', padding: '5px' }}>
            <div style={{ width: '24px', height: '24px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#003399', fontWeight: 'bold', fontSize: '16px' }}>A</span>
            </div>
          </div>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold', color: '#003399', textDecoration: 'underline' }}>ACCOUNTS - MASTER</h2>
          
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '10px', alignItems: 'center' }}>
            <label style={{ fontWeight: 'bold', color: '#003399' }}>SEARCH:</label>
            <input 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search accounts..." 
              style={{ ...inputStyle, width: '250px', background: 'white' }}
            />
          </div>
        </div>

        {/* Main Content Ratio 60/40 */}
        <div style={{ display: 'flex', gap: '10px', flex: 1, overflow: 'hidden' }}>
          
          {/* LEFT: FORM SECTION (60%) */}
          <div style={{
            flex: '0 0 60%',
            background: '#cce6ff',
            border: '1px solid #003399',
            padding: '15px',
            overflowY: 'auto',
            boxShadow: 'inset 0 0 5px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr 100px 120px', gap: '8px', marginBottom: '8px' }}>
              <label style={labelStyle}>HEAD CODE</label>
              <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                <input name="headCode" value={formData.headCode} onChange={handleChange} style={{ width: '40px', ...inputStyle }} />
                <span style={{ color: '#003399', fontWeight: 'bold', fontSize: '13px' }}>SUNDRY DEBTORS</span>
              </div>
              <label style={{ ...labelStyle, textAlign: 'right' }}>A/C CODE</label>
              <input name="acCode" value={formData.acCode} onChange={handleChange} style={{ ...inputStyle, background: '#ffccff', fontWeight: 'bold', color: 'red', textAlign: 'center' }} />
            </div>

            <div style={formRowStyle}>
              <label style={labelStyle}>A/C NAME</label>
              <input name="name" value={formData.name} onChange={handleChange} style={{ gridColumn: 'span 3', ...inputStyle, background: 'white' }} />
            </div>

            <div style={formRowStyle}>
              <label style={labelStyle}>ADD (OFF)</label>
              <input name="addressOff" value={formData.addressOff} onChange={handleChange} style={{ gridColumn: 'span 3', ...inputStyle, background: 'white' }} />
            </div>

            <div style={{ ...formRowStyle, gridTemplateColumns: '110px 1fr 60px 140px' }}>
              <label style={{ ...labelStyle, color: 'red' }}>CITY</label>
              <div style={{ display: 'flex', gap: '2px' }}>
                <input name="city" value={formData.city} onChange={handleChange} style={{ flex: 1, ...inputStyle, background: '#ffffcc' }} />
                <button style={smallBtnStyle}>L</button>
              </div>
              <label style={{ ...labelStyle, textAlign: 'right', color: 'red' }}>DIST.</label>
              <input name="dist" value={formData.dist} onChange={handleChange} style={{ ...inputStyle, background: '#ffffcc' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '110px 100px 60px 60px 100px 40px 90px 1fr', gap: '5px', alignItems: 'center', marginBottom: '8px' }}>
              <label style={labelStyle}>PIN CODE</label>
              <input name="pinCode" value={formData.pinCode} onChange={handleChange} style={{ ...inputStyle, background: '#ffffcc' }} />
              <label style={{ ...labelStyle, color: 'red', textAlign: 'right' }}>STATE</label>
              <input name="state" value={formData.state} onChange={handleChange} style={{ ...inputStyle, background: '#ffffcc', color: 'red', fontWeight: 'bold', textAlign: 'center' }} />
              <label style={{ ...labelStyle, fontSize: '11px' }}>In State</label>
              <input name="inState" value={formData.inState} onChange={handleChange} style={{ ...inputStyle, background: '#ffffcc', textAlign: 'center' }} />
              <label style={{ ...labelStyle, textAlign: 'right' }}>STD</label>
              <input name="stdCode" value={formData.stdCode} onChange={handleChange} style={{ ...inputStyle, background: '#ffffcc' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '110px 60px 110px 80px 70px 1fr', gap: '8px', marginBottom: '8px' }}>
              <label style={labelStyle}>TRACK / ROUTE</label>
              <input name="trackRoute" value={formData.trackRoute} onChange={handleChange} style={{ ...inputStyle, background: '#ffffcc' }} />
              <label style={labelStyle}>TRACK TYPE</label>
              <input name="trackType" value={formData.trackType} onChange={handleChange} style={{ ...inputStyle, background: '#ffffcc' }} />
              <label style={{ ...labelStyle, textAlign: 'right' }}>Ph (O)</label>
              <input name="phO" value={formData.phO} onChange={handleChange} style={inputStyle} />
            </div>

            <div style={formRowStyle}>
              <label style={labelStyle}>C. PERSON</label>
              <input name="contactPerson" value={formData.contactPerson} onChange={handleChange} style={{ gridColumn: 'span 3', ...inputStyle }} />
            </div>

            <div style={formRowStyle}>
              <label style={labelStyle}>MOBILE NO.</label>
              <input name="mobileNo" value={formData.mobileNo} onChange={handleChange} style={inputStyle} />
              <label style={{ ...labelStyle, textAlign: 'right' }}>MOBILE (SMS)</label>
              <input name="mobileSms" value={formData.mobileSms} onChange={handleChange} style={inputStyle} />
            </div>

            <div style={{ ...formRowStyle, gridTemplateColumns: '110px 1fr 40px' }}>
              <label style={labelStyle}>TRANSPORT.</label>
              <input name="transport" value={formData.transport} onChange={handleChange} style={inputStyle} />
              <button style={smallBtnStyle}>L</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr 150px 40px', gap: '8px', marginBottom: '8px' }}>
              <label style={labelStyle}>Email ID.</label>
              <input name="emailId" value={formData.emailId} onChange={handleChange} style={inputStyle} />
              <div style={{ textAlign: 'right' }}>
                <span style={{ color: 'red', fontWeight: 'bold', fontSize: '11px' }}>RATE TYPE (R/W)</span>
              </div>
              <input name="rateType" value={formData.rateType} onChange={handleChange} style={{ ...inputStyle, width: '30px', textAlign: 'center' }} />
            </div>

            <div style={formRowStyle}>
              <label style={labelStyle}>ADD (RES)</label>
              <input name="addressRes" value={formData.addressRes} onChange={handleChange} style={{ gridColumn: 'span 3', ...inputStyle }} />
            </div>

            <div style={formRowStyle}>
              <div style={{ gridColumn: 'span 2' }}></div>
              <label style={{ ...labelStyle, textAlign: 'right' }}>Ph (R)</label>
              <input name="phR" value={formData.phR} onChange={handleChange} style={inputStyle} />
            </div>

            <div style={formRowStyle}>
              <label style={labelStyle}>BANK NAME</label>
              <input name="bankName" value={formData.bankName} onChange={handleChange} style={{ gridColumn: 'span 3', ...inputStyle }} />
            </div>

            <div style={formRowStyle}>
              <label style={labelStyle}>BRANCH NAME</label>
              <input name="branchName" value={formData.branchName} onChange={handleChange} style={inputStyle} />
              <label style={{ ...labelStyle, textAlign: 'right' }}>IFSC</label>
              <input name="ifsc" value={formData.ifsc} onChange={handleChange} style={inputStyle} />
            </div>

            <div style={formRowStyle}>
              <label style={labelStyle}>BANK A/c No.</label>
              <input name="bankAcNo" value={formData.bankAcNo} onChange={handleChange} style={inputStyle} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '110px 140px 1fr 140px 80px', gap: '8px', marginBottom: '8px' }}>
              <label style={labelStyle}>GSTIN</label>
              <input name="gstin" value={formData.gstin} onChange={handleChange} style={inputStyle} />
              <div style={{ flex: 1 }}></div>
              <label style={{ ...labelStyle, textAlign: 'right' }}>CR. LIMIT (Days)</label>
              <input name="crLimitDays" type="number" value={formData.crLimitDays} onChange={handleChange} style={inputStyle} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '110px 60px 1fr 110px 120px', gap: '8px', marginBottom: '8px' }}>
              <label style={{ ...labelStyle, fontSize: '11px' }}>GST-CATG</label>
              <input name="gstCatg" value={formData.gstCatg} onChange={handleChange} style={{ ...inputStyle, background: '#ffffcc', width: '30px', textAlign: 'center' }} />
              <div style={{ fontSize: '10px', color: '#666' }}>(R-Reg, C-Comp, U-URD)</div>
              <label style={{ ...labelStyle, textAlign: 'right' }}>GST Eff.Date</label>
              <input name="gstEffDate" value={formData.gstEffDate} onChange={handleChange} style={{ ...inputStyle, background: '#ffffcc' }} />
            </div>

            <div style={formRowStyle}>
              <label style={labelStyle}>CLOSE DAY</label>
              <input name="closeDay" value={formData.closeDay} onChange={handleChange} style={{ width: '120px', ...inputStyle }} />
            </div>

            <div style={formRowStyle}>
              <label style={labelStyle}>S/PERSON</label>
              <input name="salesPerson" value={formData.salesPerson} onChange={handleChange} style={{ gridColumn: 'span 3', ...inputStyle }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr 110px 120px', gap: '8px', marginBottom: '8px' }}>
              <label style={labelStyle}>REMARKS</label>
              <input name="remarks" value={formData.remarks} onChange={handleChange} style={inputStyle} />
              <label style={{ ...labelStyle, textAlign: 'right' }}>A/C Open Dt</label>
              <input name="acOpenDate" value={formData.acOpenDate} onChange={handleChange} style={inputStyle} />
            </div>
          </div>

          {/* RIGHT: TABLE SECTION (40%) */}
          <div style={{
            flex: '0 0 40%',
            background: 'white',
            border: '1px solid #003399',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: '2px 2px 5px rgba(0,0,0,0.1)'
          }}>
            <div style={{ overflowY: 'auto', flex: 1 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={thStyle}>Account Name</th>
                    <th style={thStyle}>City</th>
                    <th style={thStyle}>Code</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAccounts.map((a, idx) => (
                    <tr
                      key={a.id || idx}
                      onClick={() => handleSelect(a, idx)}
                      onDoubleClick={() => onSelect && onSelect(a)}
                      style={{
                        cursor: 'pointer',
                        background: selectedIndex === idx ? '#000080' : (idx % 2 === 0 ? '#f9f9f9' : 'white'),
                        color: selectedIndex === idx ? 'white' : 'black',
                        borderBottom: '1px solid #eee'
                      }}
                    >
                      <td style={tdStyle}>{a.name}</td>
                      <td style={tdStyle}>{a.city}</td>
                      <td style={tdStyle}>{a.acCode}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* FOOTER: BUTTONS */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px' }}>
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            <div style={{ display: 'flex', border: '1px solid #003399', padding: '5px', background: '#f0f0f0', gap: '8px', borderRadius: '4px' }}>
              <button onClick={() => {
                const nextCode = getNextAcCode(accounts);
                setFormData({ ...initialFormData, acCode: nextCode });
                setSelectedIndex(null);
              }} style={actionBtnStyle}>NEW</button>
              <button onClick={() => handleSubmit('ADD')} style={actionBtnStyle}>ADD</button>
              <button onClick={() => handleSubmit('EDIT')} style={actionBtnStyle}>EDIT</button>
              <button onClick={handleDelete} style={{ ...actionBtnStyle, color: 'red' }}>DELETE</button>
              {onSelect && (
                <button onClick={handleConfirmSelect} style={{ ...actionBtnStyle, background: '#e6fffa', color: '#234e52', width: '100px' }}>SELECT</button>
              )}
            </div>
            
            <div style={{ display: 'flex', border: '1px solid #003399', padding: '5px', background: '#f0f0f0', gap: '3px', borderRadius: '4px' }}>
              <button onClick={handleFirst} style={navBtnStyle}>FIRST</button>
              <button onClick={handlePrev} style={navBtnStyle}>{"<PREV"}</button>
              <button onClick={handleNext} style={navBtnStyle}>{"NEXT>"}</button>
              <button onClick={handleLast} style={navBtnStyle}>LAST</button>
            </div>

            <button onClick={onExit} style={{
              background: '#cc0000',
              color: 'white',
              border: '2px solid #000',
              height: '40px',
              width: '100px',
              fontWeight: 'bold',
              fontSize: '14px',
              cursor: 'pointer',
              boxShadow: '2px 2px 4px #666',
              borderRadius: '4px'
            }}>CLOSE</button>
          </div>

          <div style={{ fontWeight: 'bold', color: '#003399', fontSize: '12px' }}>
            TOTAL ACCOUNTS: {accounts.length}
          </div>
        </div>
      </div>
    </div>
  );
}
