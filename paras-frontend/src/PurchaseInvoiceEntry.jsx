import { useState, useEffect } from 'react';
import { getParts, getAccounts, createPurchaseInvoice, getNextPurchaseNo } from './api';
import { FaPlus, FaMinus, FaSearch, FaFileInvoice } from 'react-icons/fa';

export default function PurchaseInvoiceEntry({ invoice, onBack }) {
  const [formData, setFormData] = useState({
    id: invoice?.id || null,
    billNo: invoice?.billNo || '',
    billDate: invoice?.billDate || new Date().toISOString().split('T')[0],
    type: invoice?.type || 'CREDIT',
    changeYn: invoice?.changeYn || 'N',
    supplierCode: invoice?.supplierCode || '',
    supplierName: invoice?.supplierName || '',
    address: invoice?.address || '',
    city: invoice?.city || '',
    totalAmount: invoice?.totalAmount || 0.0,
    cgst: invoice?.cgst || 0.0,
    sgst: invoice?.sgst || 0.0,
    igst: invoice?.igst || 0.0,
    netAmount: invoice?.netAmount || 0.0,
    inState: 'Y', // local state helper for tax split
  });

  const [items, setItems] = useState(
    invoice?.items?.map(i => ({
      id: i.id || null,
      brand: i.brand || '',
      partNo: i.partNo || '',
      description: i.description || '',
      model: i.model || '',
      qty: i.qty || 1.0,
      purchaseRate: i.purchaseRate || 0.0,
      amount: i.amount || 0.0,
      hsn: i.hsn || '',
      gstPercent: i.gstPercent || 18.0,
    })) || []
  );

  const [parts, setParts] = useState([]);
  const [accounts, setAccounts] = useState([]);
  
  const [showPartModal, setShowPartModal] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [partSearch, setPartSearch] = useState('');
  const [accountSearch, setAccountSearch] = useState('');
  const [selectedItemIndex, setSelectedItemIndex] = useState(null);

  useEffect(() => {
    getParts().then(setParts).catch(console.error);
    getAccounts().then(setAccounts).catch(console.error);
    
    if (!invoice) {
      getNextPurchaseNo().then(no => setFormData(f => ({ ...f, billNo: no }))).catch(console.error);
    }
  }, [invoice]);

  // Recalculate CGST, SGST, IGST and Net amount
  useEffect(() => {
    const totalAmount = items.reduce((s, i) => s + (i.amount || 0), 0);
    let cgstSum = 0;
    let sgstSum = 0;
    let igstSum = 0;

    items.forEach(i => {
      const gst = parseFloat(i.gstPercent) || 0;
      const taxVal = i.amount * (gst / 100);
      if (formData.inState === 'Y') {
        cgstSum += taxVal / 2;
        sgstSum += taxVal / 2;
      } else {
        igstSum += taxVal;
      }
    });

    const netValue = totalAmount + cgstSum + sgstSum + igstSum;

    setFormData(f => ({
      ...f,
      totalAmount: +totalAmount.toFixed(2),
      cgst: +cgstSum.toFixed(2),
      sgst: +sgstSum.toFixed(2),
      igst: +igstSum.toFixed(2),
      netAmount: Math.round(netValue),
    }));
  }, [items, formData.inState]);

  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    setFormData(f => ({ ...f, [name]: value }));
  };

  const handleAccountBlur = () => {
    if (!formData.supplierCode) return;
    const acc = accounts.find(a => a.acCode?.toString() === formData.supplierCode.trim());
    if (acc) {
      fillFromAccount(acc);
    } else {
      setAccountSearch(formData.supplierCode);
      setShowAccountModal(true);
    }
  };

  const fillFromAccount = (acc) => {
    setFormData(f => ({
      ...f,
      supplierCode: acc.acCode?.toString() || '',
      supplierName: acc.name || acc.acName || '',
      address: acc.addressOff || acc.address || '',
      city: acc.city || '',
      inState: acc.inState || 'Y',
    }));
    setShowAccountModal(false);
  };

  // Add Item to Purchase Grid
  const addPartToGrid = (part) => {
    // Determine default rate (purchasePrice or purchaseFinal)
    const rate = parseFloat(part.purchasePrice || part.purchaseFinal || 0);
    const gst = parseFloat(part.gst) || 18.0;

    const newItem = {
      brand: part.brand || '',
      partNo: part.partNo || '',
      description: part.description || '',
      model: part.model || '',
      qty: 1.0,
      purchaseRate: rate,
      amount: rate * 1.0,
      hsn: part.hsn || '',
      gstPercent: gst,
    };

    setItems([...items, newItem]);
    setShowPartModal(false);
  };

  const updateItemField = (idx, field, value) => {
    setItems(prev => {
      const updated = [...prev];
      const item = { ...updated[idx], [field]: value };
      
      const qty = parseFloat(item.qty) || 0;
      const rate = parseFloat(item.purchaseRate) || 0;
      item.amount = +(qty * rate).toFixed(2);
      
      updated[idx] = item;
      return updated;
    });
  };

  const removeItem = (idx) => {
    setItems(prev => prev.filter((_, i) => i !== idx));
    setSelectedItemIndex(null);
  };

  const handleSave = async () => {
    if (!formData.supplierCode || !formData.supplierName) {
      alert('Supplier is required');
      return;
    }
    if (items.length === 0) {
      alert('Please add at least one item');
      return;
    }
    if (items.some(i => !i.partNo || (parseFloat(i.qty) || 0) <= 0)) {
      alert('All items must have valid part details and quantity > 0');
      return;
    }

    const payload = {
      ...formData,
      items: items.map(i => ({
        id: i.id,
        brand: i.brand,
        partNo: i.partNo,
        description: i.description,
        model: i.model,
        qty: parseFloat(i.qty) || 0.0,
        purchaseRate: parseFloat(i.purchaseRate) || 0.0,
        amount: parseFloat(i.amount) || 0.0,
        hsn: i.hsn,
        gstPercent: parseFloat(i.gstPercent) || 0.0,
      }))
    };

    try {
      await createPurchaseInvoice(payload);
      alert('Purchase saved successfully');
      onBack();
    } catch (err) {
      console.error('Failed to save purchase', err);
      alert('Error saving purchase invoice');
    }
  };

  const filteredParts = parts.filter(p =>
    (p.partNo || '').toLowerCase().includes(partSearch.toLowerCase()) ||
    (p.description || '').toLowerCase().includes(partSearch.toLowerCase()) ||
    (p.brand || '').toLowerCase().includes(partSearch.toLowerCase())
  );

  const filteredAccounts = accounts.filter(a =>
    (a.acCode || '').toString().includes(accountSearch) ||
    (a.name || a.acName || '').toLowerCase().includes(accountSearch.toLowerCase())
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
    width: '100px',
    display: 'inline-block',
  };

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: '#d6dbe2', padding: '10px' }}>
      
      {/* Title Bar */}
      <div style={{ height: '26px', background: '#000080', color: 'white', display: 'flex', alignItems: 'center', padding: '0 8px', fontWeight: 'bold', fontSize: '11px', flexShrink: 0 }}>
        <span>PURCHASE ENTRY</span>
      </div>

      {/* Two-Column Header Info Panel */}
      <div style={{ ...panelStyle, marginTop: '5px', display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px', flexShrink: 0 }}>
        {/* Left Column - Supplier Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={labelStyle}>SUPPLIER CODE:</span>
            <input
              style={{ ...inputStyle, width: '100px', fontWeight: 'bold' }}
              value={formData.supplierCode}
              onChange={(e) => setFormData(f => ({ ...f, supplierCode: e.target.value }))}
              onBlur={handleAccountBlur}
              placeholder="Code"
            />
            <button onClick={() => { setAccountSearch(''); setShowAccountModal(true); }} style={btnStyle}>🔍 FIND</button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={labelStyle}>NAME:</span>
            <input
              style={{ ...inputStyle, flex: 1, background: '#f5f5f5' }}
              value={formData.supplierName}
              readOnly
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={labelStyle}>ADDRESS/CITY:</span>
            <input
              style={{ ...inputStyle, width: '160px', background: '#f5f5f5' }}
              value={formData.address}
              readOnly
            />
            <input
              style={{ ...inputStyle, width: '100px', background: '#f5f5f5' }}
              value={formData.city}
              readOnly
            />
          </div>
        </div>

        {/* Right Column - Bill Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={labelStyle}>BILL/INV NO:</span>
            <input
              style={{ ...inputStyle, width: '120px', fontWeight: 'bold' }}
              name="billNo"
              value={formData.billNo}
              onChange={handleFieldChange}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={labelStyle}>BILL DATE:</span>
            <input
              type="date"
              style={{ ...inputStyle, width: '120px' }}
              name="billDate"
              value={formData.billDate}
              onChange={handleFieldChange}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={labelStyle}>TYPE / TAX:</span>
            <select
              style={{ ...inputStyle, width: '100px' }}
              name="type"
              value={formData.type}
              onChange={handleFieldChange}
            >
              <option value="CREDIT">CREDIT</option>
              <option value="CASH">CASH</option>
            </select>
            <select
              style={{ ...inputStyle, width: '80px' }}
              name="inState"
              value={formData.inState}
              onChange={handleFieldChange}
            >
              <option value="Y">Local (CGST/SGST)</option>
              <option value="N">Interstate (IGST)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid Toolbar */}
      <div style={{ ...panelStyle, borderTop: 'none', background: '#e0e0e0', padding: '4px 10px', display: 'flex', gap: '10px', flexShrink: 0 }}>
        <button onClick={() => { setPartSearch(''); setShowPartModal(true); }} style={btnStyle}>
          <FaPlus style={{ marginRight: '4px', display: 'inline' }} /> ADD ITEM
        </button>
        <button
          onClick={() => { if (selectedItemIndex !== null) removeItem(selectedItemIndex); }}
          disabled={selectedItemIndex === null}
          style={{
            ...btnStyle,
            color: selectedItemIndex !== null ? '#cc0000' : '#808080',
            cursor: selectedItemIndex !== null ? 'pointer' : 'not-allowed'
          }}
        >
          <FaMinus style={{ marginRight: '4px', display: 'inline' }} /> DELETE ITEM
        </button>
      </div>

      {/* Grid Container */}
      <div style={{ flex: 1, background: '#fff', border: '1px solid #808080', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        
        {/* Table Head */}
        <div style={{ overflowY: 'scroll', background: '#e8e8e8', borderBottom: '1px solid #808080', flexShrink: 0 }}>
          <table style={{ width: '100%', tableLayout: 'fixed', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={thStyle(150)}>PART NO</th>
                <th style={thStyle(220)}>DESCRIPTION</th>
                <th style={thStyle(100)}>BRAND</th>
                <th style={thStyle(90)}>MODEL</th>
                <th style={thStyle(60)}>QTY</th>
                <th style={thStyle(100)}>PUR. RATE</th>
                <th style={thStyle(100)}>AMOUNT</th>
                <th style={thStyle(80)}>HSN</th>
                <th style={thStyle(60)}>GST %</th>
              </tr>
            </thead>
          </table>
        </div>

        {/* Table Body Rows */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <table style={{ width: '100%', tableLayout: 'fixed', borderCollapse: 'collapse' }}>
            <tbody>
              {items.map((item, idx) => (
                <tr
                  key={idx}
                  onClick={() => setSelectedItemIndex(idx)}
                  style={{
                    background: selectedItemIndex === idx ? '#b8d4f0' : idx % 2 === 0 ? '#ffffff' : '#f5f5f5',
                    borderBottom: '1px solid #e0e0e0',
                    cursor: 'pointer'
                  }}
                >
                  <td style={{ ...tdStyle(150), fontWeight: 'bold' }}>{item.partNo}</td>
                  <td style={tdStyle(220)}>{item.description}</td>
                  <td style={tdStyle(100)}>{item.brand}</td>
                  <td style={tdStyle(90)}>
                    <input
                      value={item.model}
                      onChange={(e) => updateItemField(idx, 'model', e.target.value)}
                      style={{ ...inputStyle, width: '100%', height: '18px' }}
                    />
                  </td>
                  <td style={tdStyle(60)}>
                    <input
                      type="number"
                      value={item.qty}
                      onChange={(e) => updateItemField(idx, 'qty', e.target.value)}
                      style={{ ...inputStyle, width: '100%', height: '18px', textAlign: 'center', background: '#ffffcc', fontWeight: 'bold' }}
                    />
                  </td>
                  <td style={tdStyle(100)}>
                    <input
                      type="number"
                      value={item.purchaseRate}
                      onChange={(e) => updateItemField(idx, 'purchaseRate', e.target.value)}
                      style={{ ...inputStyle, width: '100%', height: '18px', textAlign: 'right', background: '#ffffcc' }}
                    />
                  </td>
                  <td style={{ ...tdStyle(100), textAlign: 'right', fontWeight: 'bold', color: '#000080' }}>
                    {item.amount?.toFixed(2)}
                  </td>
                  <td style={tdStyle(80)}>
                    <input
                      value={item.hsn}
                      onChange={(e) => updateItemField(idx, 'hsn', e.target.value)}
                      style={{ ...inputStyle, width: '100%', height: '18px' }}
                    />
                  </td>
                  <td style={tdStyle(60)}>
                    <input
                      type="number"
                      value={item.gstPercent}
                      onChange={(e) => updateItemField(idx, 'gstPercent', e.target.value)}
                      style={{ ...inputStyle, width: '100%', height: '18px', textAlign: 'center' }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals Row */}
        <div style={{ borderTop: '2px solid #808080', background: '#f0f0f0', padding: '8px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexShrink: 0, fontSize: '11px' }}>
          <div>
            <div style={{ display: 'flex', gap: '15px', marginBottom: '4px' }}>
              <span>ITEMS TOTAL: <strong>{formData.totalAmount?.toFixed(2)}</strong></span>
              {formData.inState === 'Y' ? (
                <>
                  <span>CGST: <strong>{formData.cgst?.toFixed(2)}</strong></span>
                  <span>SGST: <strong>{formData.sgst?.toFixed(2)}</strong></span>
                </>
              ) : (
                <span>IGST: <strong>{formData.igst?.toFixed(2)}</strong></span>
              )}
            </div>
            <span style={{ fontSize: '12px', color: '#000080' }}>
              NET PAYABLE AMOUNT: <strong>Rs. {formData.netAmount} (Rounded)</strong>
            </span>
          </div>
        </div>

      </div>

      {/* Command Actions Bar */}
      <div style={{ ...panelStyle, marginTop: '5px', display: 'flex', gap: '10px', justifyContent: 'flex-end', flexShrink: 0 }}>
        <button onClick={handleSave} style={{ ...btnStyle, background: '#d4f0d4', color: '#006600' }}>
          <u>S</u>AVE PURCHASE
        </button>
        <button onClick={onBack} style={{ ...btnStyle, color: '#cc0000' }}>
          <u>C</u>LOSE
        </button>
      </div>

      {/* Part Search Modal */}
      {showPartModal && (
        <div style={overlayStyle}>
          <div style={{ ...modalStyle, width: '750px' }}>
            <div style={modalHeaderStyle}>
              <span>ADD PART / ITEM</span>
              <button onClick={() => setShowPartModal(false)} style={closeXStyle}>✕</button>
            </div>
            <div style={{ padding: '8px 10px', display: 'flex', gap: '5px', background: '#e8e8e8', borderBottom: '1px solid #808080' }}>
              <input
                placeholder="Search part by number, brand, description..."
                value={partSearch}
                onChange={e => setPartSearch(e.target.value)}
                style={{ ...inputStyle, flex: 1 }}
                autoFocus
              />
            </div>
            <div style={{ height: '300px', overflowY: 'auto', background: '#fff' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#e0e0e0', borderBottom: '1px solid #808080', position: 'sticky', top: 0 }}>
                    <th style={modalThStyle(140)}>PART NO</th>
                    <th style={modalThStyle()}>DESCRIPTION</th>
                    <th style={modalThStyle(100)}>BRAND</th>
                    <th style={modalThStyle(100)}>MODEL</th>
                    <th style={modalThStyle(80)}>PUR. RATE</th>
                    <th style={modalThStyle(60)}>STOCK</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredParts.map((p, idx) => (
                    <tr
                      key={idx}
                      onClick={() => addPartToGrid(p)}
                      style={{ cursor: 'pointer', background: idx % 2 === 0 ? '#fff' : '#f4f4f4', borderBottom: '1px solid #e8e8e8' }}
                      className="hover:bg-blue-100"
                    >
                      <td style={{ ...modalTdStyle(140), fontWeight: 'bold' }}>{p.partNo}</td>
                      <td style={modalTdStyle()}>{p.description}</td>
                      <td style={modalTdStyle(100)}>{p.brand}</td>
                      <td style={modalTdStyle(100)}>{p.model}</td>
                      <td style={modalTdStyle(80, 'right')}>{p.purchasePrice || p.purchaseFinal || '0.00'}</td>
                      <td style={modalTdStyle(60, 'center')}>{p.opening || 0}</td>
                    </tr>
                  ))}
                  {filteredParts.length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ padding: '15px', textAlign: 'center', color: '#666' }}>No matching parts found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Account Finder Modal */}
      {showAccountModal && (
        <div style={overlayStyle}>
          <div style={{ ...modalStyle, width: '550px' }}>
            <div style={modalHeaderStyle}>
              <span>SELECT SUPPLIER ACCOUNT</span>
              <button onClick={() => setShowAccountModal(false)} style={closeXStyle}>✕</button>
            </div>
            <div style={{ padding: '8px 10px', display: 'flex', gap: '5px', background: '#e8e8e8', borderBottom: '1px solid #808080' }}>
              <input
                placeholder="Search supplier by code or name..."
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
                      onClick={() => selectAccount ? selectAccount(a) : fillFromAccount(a)}
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
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
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
