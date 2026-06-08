import { useState, useEffect } from 'react';
import { getParts, getAccounts, createSalesInvoice, getNextBillNo, updatePickSlipInvNo, getLedgerQuery, getLedgerOpening } from './api';
import { FaFileInvoiceDollar, FaQuestionCircle, FaPlus, FaMinus } from 'react-icons/fa';

export default function SalesInvoiceEntry({ invoice, onBack, onClose, prefilledData, onClearPrefilled }) {

  const [formData, setFormData] = useState({
    billNo: '',
    billDate: new Date().toISOString().split('T')[0],
    dayName: getDayOfWeek(new Date().toISOString().split('T')[0]),
    type: 'CREDIT',
    changeYn: 'N',
    acNo: '',
    partyName: '',
    address: '',
    city: '',
    gstin: '',
    inState: 'Y',
    state: 'MP',
    code: '23',
    remarks: '',
    rateFormat: 'W', // Wholesale by default
    printCopies: 1,
    printDisc: 'Y',
    transporter: '',
    grNo: '',
    grDate: '',
    caseNo: '',
    pvtMarka: '',
    ewayBillNo: '',
    saleAmt: 0,
    cgst: 0,
    sgst: 0,
    igst: 0,
    postage: 0,
    freight: 0,
    hammali: 0,
    netAmt: 0,
    pickSlipId: null,
  });

  const [items, setItems] = useState([]);

  // UI state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showLedgerModal, setShowLedgerModal] = useState(false);
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [showConfirmPrint, setShowConfirmPrint] = useState(false);
  
  const [selectedItemIndex, setSelectedItemIndex] = useState(null);
  
  const [parts, setParts] = useState([]);
  const [accounts, setAccounts] = useState([]);

  const [filterPart, setFilterPart] = useState('');
  const [accountSearch, setAccountSearch] = useState('');
  
  const [ledgerTxs, setLedgerTxs] = useState([]);
  const [ledgerBal, setLedgerBal] = useState(0);

  // Load parts, accounts, next bill number
  useEffect(() => {
    getParts().then(setParts).catch(console.error);
    getAccounts().then(setAccounts).catch(console.error);
    
    if (!invoice && !prefilledData) {
      getNextBillNo().then(no => setFormData(f => ({ ...f, billNo: no }))).catch(console.error);
    }
  }, [invoice, prefilledData]);

  // Load prefilled data from Pick Slip / Sales Order or invoice edits
  useEffect(() => {
    if (invoice) {
      setFormData({
        ...invoice,
        billDate: invoice.billDate || new Date().toISOString().split('T')[0],
        dayName: invoice.dayName || getDayOfWeek(invoice.billDate || new Date().toISOString().split('T')[0]),
        items: undefined // discard
      });
      if (invoice.items) {
        setItems(invoice.items.map(i => ({
          brand: i.brand || '',
          partNo: i.partNo || '',
          description: i.description || '',
          stock: i.stock || 0,
          model: i.model || '',
          qty: i.qty || 1,
          listPrice: i.listPrice || i.rate || 0,
          discount: i.discount || 0,
          rate: i.rate || 0,
          amount: i.amount || 0,
          nPur: i.nPur || i.netPur || 0,
          hsn: i.hsn || '',
          gstPercent: i.gstPercent || 0,
        })));
      }
    } else if (prefilledData) {
      // prefilled from pick-slip list
      setFormData(f => ({
        ...f,
        acNo: prefilledData.partyCd || '',
        partyName: prefilledData.customerName || '',
        address: prefilledData.address || '',
        city: prefilledData.city || '',
        remarks: prefilledData.remarks || '',
        transporter: prefilledData.transport || '',
        pickSlipId: prefilledData.fromOrderId || null,
        rateFormat: prefilledData.rateType || 'W',
      }));
      if (prefilledData.items) {
        setItems(prefilledData.items.map(i => {
          const list = i.rate || i.list || 0;
          const dis = i.discount || i.dis || 0;
          const r = list - (list * dis / 100);
          const q = i.qty || i.ordQty || 1;
          return {
            brand: i.brand || '',
            partNo: i.partNo || '',
            description: i.description || '',
            stock: i.stock || 0,
            model: i.model || '',
            qty: q,
            listPrice: list,
            discount: dis,
            rate: r,
            amount: r * q,
            nPur: i.netPur || i.nPur || 0,
            hsn: i.hsn || '',
            gstPercent: parseFloat(i.gst) || i.gstPercent || 18.0
          };
        }));
      }
      if (onClearPrefilled) onClearPrefilled();
    }
  }, [invoice, prefilledData]);

  // Load ledger details
  useEffect(() => {
    if (showLedgerModal && formData.acNo) {
      getLedgerQuery(formData.acNo).then(setLedgerTxs).catch(console.error);
      getLedgerOpening(formData.acNo).then(data => setLedgerBal(data.amount || 0)).catch(console.error);
    }
  }, [showLedgerModal, formData.acNo]);

  // Calculate totals whenever items or charges change
  useEffect(() => {
    const saleAmt = items.reduce((s, i) => s + (i.amount || 0), 0);
    
    // CGST/SGST/IGST logic:
    // If inState = Y, cgst/sgst applies (split GST/2). If inState = N, igst applies (full GST).
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

    const netValue = saleAmt + cgstSum + sgstSum + igstSum +
      (parseFloat(formData.postage) || 0) +
      (parseFloat(formData.freight) || 0) +
      (parseFloat(formData.hammali) || 0);

    setFormData(f => ({
      ...f,
      saleAmt: +saleAmt.toFixed(2),
      cgst: +cgstSum.toFixed(2),
      sgst: +sgstSum.toFixed(2),
      igst: +igstSum.toFixed(2),
      netAmt: Math.round(netValue), // rounded total
    }));
  }, [items, formData.inState, formData.postage, formData.freight, formData.hammali]);

  function getDayOfWeek(dateStr) {
    if (!dateStr) return '';
    const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    return days[new Date(dateStr).getDay()];
  }

  const handleDateChange = (e) => {
    const d = e.target.value;
    setFormData(f => ({ ...f, billDate: d, dayName: getDayOfWeek(d) }));
  };

  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    setFormData(f => ({ ...f, [name]: value }));
  };

  const handleAccountBlur = () => {
    if (!formData.acNo) return;
    const acc = accounts.find(a => a.acCode?.toString() === formData.acNo);
    if (acc) {
      fillFromAccount(acc);
    } else {
      setAccountSearch(formData.acNo);
      setShowAccountModal(true);
    }
  };

  const fillFromAccount = (acc) => {
    setFormData(f => ({
      ...f,
      acNo: acc.acCode?.toString() || '',
      partyName: acc.acName || acc.name || '',
      address: acc.addOff1 || acc.addressOff || acc.address || '',
      city: acc.city || '',
      gstin: acc.gstin || '',
      inState: acc.inState || 'Y',
      state: acc.state || 'MP',
    }));
    setShowAccountModal(false);
  };

  // ── item manipulations ─────────────────────────────────────────
  const updateItemQtyOrPrice = (idx, field, value) => {
    setItems(prev => {
      const updated = [...prev];
      const i = { ...updated[idx], [field]: parseFloat(value) || 0 };
      i.rate = i.listPrice - (i.listPrice * i.discount / 100);
      i.amount = i.rate * i.qty;
      updated[idx] = i;
      return updated;
    });
  };

  const addItemFromModal = (part) => {
    const list = formData.rateFormat === 'W'
      ? parseFloat(part.wholesaleFinal || part.wholesalePrice || 0)
      : parseFloat(part.retailFinal || part.retailPrice || 0);
    const gstPercent = parseFloat(part.gst) || 18.0;

    const newItem = {
      brand: part.brand || '',
      partNo: part.partNo || '',
      description: part.description || '',
      stock: part.opening || 0,
      model: part.model || '',
      qty: 1,
      listPrice: list,
      discount: 0,
      rate: list,
      amount: list,
      nPur: parseFloat(part.purchaseFinal || part.purchasePrice || 0),
      hsn: part.hsn || '',
      gstPercent,
    };
    setItems(prev => [...prev, newItem]);
    setShowAddModal(false);
  };

  const handleConfirmSave = async () => {
    if (!formData.acNo && !formData.partyName) {
      alert("Account selection required.");
      return;
    }
    const payload = {
      ...formData,
      items
    };
    try {
      const res = await fetch('/api/sale-bills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const saved = await res.json();
      
      // Update invoice no in Pick slip order
      if (formData.pickSlipId) {
        await updatePickSlipInvNo(formData.pickSlipId, saved.billNo);
      }

      setShowConfirmPrint(true);
    } catch (err) {
      console.error(err);
      alert('Save failed');
    }
  };

  const filteredParts = parts.filter(p =>
    !filterPart || p.partNo?.toLowerCase().includes(filterPart.toLowerCase()) ||
    p.description?.toLowerCase().includes(filterPart.toLowerCase())
  );

  const filteredAccounts = accounts.filter(a =>
    !accountSearch || a.name?.toLowerCase().includes(accountSearch.toLowerCase()) ||
    a.acCode?.toString().includes(accountSearch)
  );

  // Styles
  const labelStyle = { fontSize: '11px', fontWeight: 'bold', color: '#1d2d5a', width: '80px', flexShrink: 0 };
  const inputStyle = { height: '22px', border: '1px solid #999', background: 'white', padding: '0 4px', fontSize: '11px', fontFamily: 'Tahoma,sans-serif', borderRadius: 0, flex: 1 };
  const btnStyle = (extra = {}) => ({
    background: '#e8e8e8',
    color: '#1d2d5a',
    border: '1px solid #999',
    height: '28px',
    padding: '4px 12px',
    borderRadius: 0,
    fontFamily: 'Tahoma, sans-serif',
    fontWeight: 'bold',
    fontSize: '11px',
    cursor: 'pointer',
    ...extra
  });

  if (showPrintPreview) {
    return (
      <TaxInvoicePrint
        formData={formData}
        items={items}
        onBack={() => {
          setShowPrintPreview(false);
          onBack();
        }}
      />
    );
  }

  return (
    <div style={{ width: '100%', height: '100vh', display: 'flex', flexDirection: 'column', background: '#dfe8ef', fontFamily: 'Tahoma,Verdana,sans-serif', fontSize: '11px', color: '#1d2d5a', overflow: 'hidden' }}>
      
      {/* ── HEADER ── */}
      <div style={{ height: '26px', background: '#eef3f7', borderBottom: '1px solid #9caab7', display: 'flex', alignItems: 'center', paddingLeft: '10px', gap: '40px', flexShrink: 0 }}>
        <span style={{ fontWeight: 'bold' }}>Sale Bill Entry</span>
        <span>21-05-2026 (THURSDAY)</span>
        <span>PARAS AUTO PARTS</span>
        <span>(OPER)</span>
      </div>

      {/* ── TWO ROW TOP SECTION ── */}
      <div style={{ background: '#c9e0f5', borderBottom: '1px solid #7a9cbf', padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: '6px', flexShrink: 0 }}>
        
        {/* Row 1 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr auto', gap: '20px', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={labelStyle}>BILL NO</span>
            <span style={{ fontWeight: 'bold', color: '#880000', fontSize: '12px', marginRight: '4px' }}>S</span>
            <input name="billNo" value={formData.billNo} onChange={handleFieldChange} disabled={formData.changeYn !== 'Y'} style={{ ...inputStyle, width: '80px', flex: 'none', fontWeight: 'bold' }} />
            <button style={{ ...btnStyle(), height: '22px', padding: '0 8px' }}>↑</button>
            <span style={{ marginLeft: '10px', fontWeight: 'bold' }}>CHANGE</span>
            <input type="checkbox" checked={formData.changeYn === 'Y'} onChange={e => setFormData(f => ({ ...f, changeYn: e.target.checked ? 'Y' : 'N' }))} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ ...labelStyle, width: '40px' }}>DATE</span>
            <input type="date" value={formData.billDate} onChange={handleDateChange} style={inputStyle} />
            <span style={{ fontWeight: 'bold', color: '#cc0000', marginLeft: '6px' }}>{formData.dayName}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ ...labelStyle, width: '40px' }}>TYPE</span>
            <select name="type" value={formData.type} onChange={handleFieldChange} style={{ ...inputStyle, height: '22px' }}>
              <option value="CREDIT">CREDIT</option>
              <option value="CASH">CASH</option>
            </select>
            <span style={{ ...labelStyle, width: '50px', marginLeft: '10px' }}>A/C NO</span>
            <input name="acNo" value={formData.acNo} onChange={handleFieldChange} onBlur={handleAccountBlur} style={{ ...inputStyle, width: '60px', flex: 'none' }} />
            <button onClick={() => setShowAccountModal(true)} style={{ ...btnStyle(), height: '22px', padding: '0 6px' }}>🔍</button>
          </div>

          {/* BILL RATE / FORMAT */}
          <div style={{ border: '1px solid #7a9cbf', background: '#e8f4ff', padding: '4px 10px', display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{ fontWeight: 'bold', color: 'red', fontSize: '10px' }}>BILL : RATE / FORMAT</div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '3px', cursor: 'pointer', fontWeight: 'bold' }}>
              <input type="radio" name="rateFormat" checked={formData.rateFormat === 'W'} onChange={() => setFormData(f => ({ ...f, rateFormat: 'W' }))} />
              <span>WholeSale</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '3px', cursor: 'pointer', fontWeight: 'bold' }}>
              <input type="radio" name="rateFormat" checked={formData.rateFormat === 'R'} onChange={() => setFormData(f => ({ ...f, rateFormat: 'R' }))} />
              <span>Retail</span>
            </label>
            <span>Copies:</span>
            <input name="printCopies" type="number" value={formData.printCopies} onChange={handleFieldChange} style={{ ...inputStyle, width: '30px', flex: 'none' }} />
            <span>Disc Y/N:</span>
            <input name="printDisc" value={formData.printDisc} onChange={handleFieldChange} style={{ ...inputStyle, width: '30px', flex: 'none' }} />
          </div>
        </div>

        {/* Row 2 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={labelStyle}>PARTY NAME</span>
              <input name="partyName" value={formData.partyName} onChange={handleFieldChange} style={inputStyle} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={labelStyle}>ADDRESS</span>
              <input name="address" value={formData.address} onChange={handleFieldChange} style={inputStyle} />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ ...labelStyle, width: '60px' }}>CITY</span>
              <input name="city" value={formData.city} onChange={handleFieldChange} style={inputStyle} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ ...labelStyle, width: '60px' }}>GSTIN</span>
              <input name="gstin" value={formData.gstin} onChange={handleFieldChange} style={inputStyle} />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ ...labelStyle, width: '70px' }}>REMARKS</span>
              <input name="remarks" value={formData.remarks} onChange={handleFieldChange} style={inputStyle} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ ...labelStyle, width: '70px' }}>IN-STATE Y/N</span>
              <input name="inState" value={formData.inState} onChange={handleFieldChange} style={{ ...inputStyle, width: '30px', flex: 'none' }} />
              <span style={{ ...labelStyle, width: '40px', marginLeft: '10px' }}>STATE</span>
              <input name="state" value={formData.state} onChange={handleFieldChange} style={{ ...inputStyle, width: '40px', flex: 'none' }} />
              <span style={{ ...labelStyle, width: '40px', marginLeft: '10px' }}>CODE</span>
              <input name="code" value={formData.code} onChange={handleFieldChange} style={{ ...inputStyle, width: '40px', flex: 'none' }} />
            </div>
          </div>
        </div>

      </div>

      {/* ── ITEMS SECTION ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
        
        {/* Buttons Bar */}
        <div style={{ background: '#d4edf9', borderBottom: '1px solid #7a9cbf', padding: '4px 8px', display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
          <strong style={{ color: '#003399', fontSize: '12px', marginRight: '15px' }}>ITEMS</strong>
          <button onClick={() => setShowAddModal(true)} style={btnStyle({ background: '#e0ffe0' })}>ADD</button>
          <button onClick={() => { if (selectedItemIndex !== null) setItems(prev => prev.filter((_, i) => i !== selectedItemIndex)); setSelectedItemIndex(null); }} style={btnStyle({ background: '#ffe3e3', color: 'red' })}>DELETE</button>
          <button style={btnStyle()}>CALCI</button>
          <button onClick={() => setShowAddModal(true)} style={btnStyle()}>EAST ADD</button>
          <button onClick={() => { if (formData.acNo) setShowLedgerModal(true); else alert('Select A/C first'); }} style={btnStyle()}>LEDGER</button>
        </div>

        {/* Items Table */}
        <div style={{ flex: 1, overflow: 'auto', background: '#cce6ff', border: '1px solid #7a9cbf', margin: '4px', paddingBottom: '90px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
            <thead style={{ background: '#7fc6ea', position: 'sticky', top: 0, zIndex: 1 }}>
              <tr>
                {['BRAND', 'PART NO', 'DESCRIPTION', 'STOCK', 'MODEL', 'QTY', 'LIST', 'DIS%', 'RATE', 'AMOUNT', 'N.PUR', 'HSN', 'GST%'].map(h => (
                  <th key={h} style={{ padding: '4px 6px', borderRight: '1px solid #5a8aaa', borderBottom: '2px solid #4a7a9a', textAlign: 'left', fontWeight: 'bold' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={idx} onClick={() => setSelectedItemIndex(idx)} style={{ background: selectedItemIndex === idx ? '#b8d4f0' : (idx % 2 === 0 ? '#fff' : '#e8f4ff'), cursor: 'pointer' }}>
                  <td style={{ padding: '4px 6px', borderRight: '1px solid #c0d8e8' }}>{item.brand}</td>
                  <td style={{ padding: '4px 6px', borderRight: '1px solid #c0d8e8', fontWeight: 'bold', color: '#003399' }}>{item.partNo}</td>
                  <td style={{ padding: '4px 6px', borderRight: '1px solid #c0d8e8' }}>{item.description}</td>
                  <td style={{ padding: '4px 6px', borderRight: '1px solid #c0d8e8', textAlign: 'center' }}>{item.stock}</td>
                  <td style={{ padding: '4px 6px', borderRight: '1px solid #c0d8e8' }}>{item.model}</td>
                  <td style={{ padding: 0, borderRight: '1px solid #c0d8e8' }}>
                    <input type="number" value={item.qty} onChange={e => updateItemQtyOrPrice(idx, 'qty', e.target.value)} style={{ width: '100%', border: 'none', background: '#ffffcc', textAlign: 'center', fontWeight: 'bold' }} />
                  </td>
                  <td style={{ padding: 0, borderRight: '1px solid #c0d8e8' }}>
                    <input type="number" value={item.listPrice} onChange={e => updateItemQtyOrPrice(idx, 'listPrice', e.target.value)} style={{ width: '100%', border: 'none', background: '#ffffcc', textAlign: 'right' }} />
                  </td>
                  <td style={{ padding: 0, borderRight: '1px solid #c0d8e8' }}>
                    <input type="number" value={item.discount} onChange={e => updateItemQtyOrPrice(idx, 'discount', e.target.value)} style={{ width: '100%', border: 'none', background: '#ffe8cc', textAlign: 'right' }} />
                  </td>
                  <td style={{ padding: '4px 6px', borderRight: '1px solid #c0d8e8', textAlign: 'right', fontWeight: 'bold', color: '#006600' }}>{item.rate?.toFixed(2)}</td>
                  <td style={{ padding: '4px 6px', borderRight: '1px solid #c0d8e8', textAlign: 'right', fontWeight: 'bold', color: '#003399' }}>{item.amount?.toFixed(2)}</td>
                  <td style={{ padding: '4px 6px', borderRight: '1px solid #c0d8e8', textAlign: 'right', color: '#666' }}>{item.nPur?.toFixed(2)}</td>
                  <td style={{ padding: '4px 6px', borderRight: '1px solid #c0d8e8' }}>{item.hsn}</td>
                  <td style={{ padding: '4px 6px', textAlign: 'right' }}>{item.gstPercent}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── TRANSPORT SECTION ── */}
        <div style={{ position: 'absolute', bottom: '44px', left: '4px', right: '4px', background: '#c9e0f5', border: '1px solid #7a9cbf', padding: '6px 10px', display: 'flex', gap: '15px', alignItems: 'center' }}>
          <span style={{ fontWeight: 'bold' }}>TRANSPORTER</span>
          <input name="transporter" value={formData.transporter} onChange={handleFieldChange} style={{ ...inputStyle, width: '150px', flex: 'none' }} />
          <span>GR NO</span>
          <input name="grNo" value={formData.grNo} onChange={handleFieldChange} style={{ ...inputStyle, width: '80px', flex: 'none' }} />
          <span>DATE</span>
          <input type="date" name="grDate" value={formData.grDate} onChange={handleFieldChange} style={{ ...inputStyle, width: '120px', flex: 'none', height: '22px' }} />
          <span>CASE</span>
          <input name="caseNo" value={formData.caseNo} onChange={handleFieldChange} style={{ ...inputStyle, width: '60px', flex: 'none' }} />
          <span>Pvt.MARKA</span>
          <input name="pvtMarka" value={formData.pvtMarka} onChange={handleFieldChange} style={{ ...inputStyle, width: '100px', flex: 'none' }} />
          <span>E-Way BILL No.</span>
          <input name="ewayBillNo" value={formData.ewayBillNo} onChange={handleFieldChange} style={inputStyle} />
        </div>

        {/* ── TOTALS & SAVE ACTIONS ── */}
        <div style={{ position: 'absolute', bottom: '4px', left: '4px', right: '4px', height: '36px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#ebf3ff', border: '1px solid #7a9cbf', padding: '0 10px' }}>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', fontSize: '10px', fontWeight: 'bold' }}>
            <span>SALE AMT: <strong style={{ fontSize: '11px', color: '#003399' }}>{formData.saleAmt}</strong></span>
            {formData.inState === 'Y' ? (
              <>
                <span>CGST: <strong>{formData.cgst}</strong></span>
                <span>SGST: <strong>{formData.sgst}</strong></span>
              </>
            ) : (
              <span>IGST: <strong>{formData.igst}</strong></span>
            )}
            <span>POSTAGE:</span>
            <input name="postage" type="number" value={formData.postage} onChange={handleFieldChange} style={{ ...inputStyle, width: '50px', flex: 'none', height: '20px' }} />
            <span>FRGHT:</span>
            <input name="freight" type="number" value={formData.freight} onChange={handleFieldChange} style={{ ...inputStyle, width: '50px', flex: 'none', height: '20px' }} />
            <span>HAMMALI:</span>
            <input name="hammali" type="number" value={formData.hammali} onChange={handleFieldChange} style={{ ...inputStyle, width: '50px', flex: 'none', height: '20px' }} />
            
            <span style={{ fontSize: '12px', marginLeft: '10px', color: '#cc0000' }}>NET AMT (R/off): <strong>Rs. {formData.netAmt}</strong></span>
          </div>
          
          <div style={{ display: 'flex', gap: '6px' }}>
            <button onClick={handleConfirmSave} style={btnStyle({ background: '#28a745', color: 'white' })}>CONFIRM</button>
            <button onClick={onBack} style={btnStyle()}>CANCEL</button>
          </div>
        </div>

      </div>

      {/* ── ADD ITEM MODAL ── */}
      {showAddModal && (
        <div style={overlayStyle}>
          <div style={{ ...modalStyle, width: '600px' }}>
            <div style={modalHeaderStyle}><span>SELECT PART TO ADD</span><button onClick={() => setShowAddModal(false)} style={closeXStyle}>✕</button></div>
            <div style={{ padding: '8px 10px', background: '#cfe8ff' }}>
              <input value={filterPart} onChange={e => setFilterPart(e.target.value)} placeholder="Type Part No or description to search..." style={inputStyle} autoFocus />
            </div>
            <div style={{ height: '300px', overflow: 'auto', background: 'white' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ background: '#7fc6ea', position: 'sticky', top: 0 }}>
                  <tr style={{ borderBottom: '1px solid #999' }}>
                    <th style={{ padding: '5px' }}>Brand</th>
                    <th style={{ padding: '5px' }}>Part No</th>
                    <th style={{ padding: '5px' }}>Description</th>
                    <th style={{ padding: '5px' }}>Model</th>
                    <th style={{ padding: '5px' }}>Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredParts.map((p, idx) => (
                    <tr key={idx} onClick={() => addItemFromModal(p)} style={{ cursor: 'pointer', background: idx % 2 === 0 ? '#fff' : '#f0f8ff', borderBottom: '1px solid #eee' }} onMouseEnter={e => e.currentTarget.style.background = '#dbeeff'} onMouseLeave={e => e.currentTarget.style.background = idx % 2 === 0 ? '#fff' : '#f0f8ff'}>
                      <td style={{ padding: '5px' }}>{p.brand}</td>
                      <td style={{ padding: '5px', fontWeight: 'bold' }}>{p.partNo}</td>
                      <td style={{ padding: '5px' }}>{p.description}</td>
                      <td style={{ padding: '5px' }}>{p.model}</td>
                      <td style={{ padding: '5px', textAlign: 'center' }}>{p.opening}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── ACCOUNT LOOKUP MODAL ── */}
      {showAccountModal && (
        <div style={overlayStyle}>
          <div style={{ ...modalStyle, width: '600px' }}>
            <div style={modalHeaderStyle}><span>SELECT ACCOUNT</span><button onClick={() => setShowAccountModal(false)} style={closeXStyle}>✕</button></div>
            <div style={{ padding: '8px 10px', background: '#cfe8ff' }}>
              <input value={accountSearch} onChange={e => setAccountSearch(e.target.value)} placeholder="Search name or code..." style={inputStyle} autoFocus />
            </div>
            <div style={{ height: '300px', overflow: 'auto', background: 'white' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  {filteredAccounts.map((a, idx) => (
                    <tr key={idx} onClick={() => fillFromAccount(a)} style={{ cursor: 'pointer', background: idx % 2 === 0 ? '#fff' : '#f0f8ff', borderBottom: '1px solid #eee' }} onMouseEnter={e => e.currentTarget.style.background = '#dbeeff'} onMouseLeave={e => e.currentTarget.style.background = idx % 2 === 0 ? '#fff' : '#f0f8ff'}>
                      <td style={{ padding: '5px', fontWeight: 'bold' }}>{a.acName || a.name}</td>
                      <td style={{ padding: '5px' }}>{a.city}</td>
                      <td style={{ padding: '5px', textAlign: 'right' }}>{a.acCode}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── LEDGER MODAL ── */}
      {showLedgerModal && (
        <div style={overlayStyle}>
          <div style={{ ...modalStyle, width: '800px', height: '480px' }}>
            <div style={modalHeaderStyle}><span>Account Ledger Summary</span><button onClick={() => setShowLedgerModal(false)} style={closeXStyle}>✕</button></div>
            <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, overflow: 'hidden' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', background: '#cfe8ff', padding: '6px', border: '1px solid #999', fontWeight: 'bold' }}>
                <span>Party: {formData.partyName}</span>
                <span>Code: {formData.acNo}</span>
                <span style={{ color: '#003399' }}>Ledger Balance: Rs. {ledgerBal.toFixed(2)}</span>
              </div>
              <div style={{ flex: 1, overflow: 'auto', border: '1px solid #ccc', background: 'white' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                  <thead style={{ background: '#7fc6ea', position: 'sticky', top: 0 }}>
                    <tr>
                      <th style={{ padding: '4px' }}>DATE</th>
                      <th style={{ padding: '4px' }}>NARRATION</th>
                      <th style={{ padding: '4px', textAlign: 'right' }}>DEBIT</th>
                      <th style={{ padding: '4px', textAlign: 'right' }}>CREDIT</th>
                      <th style={{ padding: '4px' }}>D/C</th>
                      <th style={{ padding: '4px', textAlign: 'right' }}>BALANCE</th>
                      <th style={{ padding: '4px' }}>SOURCE</th>
                      <th style={{ padding: '4px' }}>DOC NO</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ledgerTxs.map((tx, idx) => (
                      <tr key={idx} style={{ background: idx % 2 === 0 ? '#fff' : '#f0f8ff' }}>
                        <td style={{ padding: '4px' }}>{tx.date}</td>
                        <td style={{ padding: '4px' }}>{tx.narration}</td>
                        <td style={{ padding: '4px', textAlign: 'right' }}>{"D".equalsIgnoreCase(tx.dc) ? tx.amount?.toFixed(2) : ''}</td>
                        <td style={{ padding: '4px', textAlign: 'right' }}>{"C".equalsIgnoreCase(tx.dc) ? tx.amount?.toFixed(2) : ''}</td>
                        <td style={{ padding: '4px', textAlign: 'center' }}>{tx.dc}</td>
                        <td style={{ padding: '4px', textAlign: 'right', fontWeight: 'bold' }}>{tx.amount?.toFixed(2)}</td>
                        <td style={{ padding: '4px' }}>{tx.source}</td>
                        <td style={{ padding: '4px' }}>{tx.docNo}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}><button onClick={() => setShowLedgerModal(false)} style={btnStyle()}>CLOSE</button></div>
            </div>
          </div>
        </div>
      )}

      {/* ── PRINT CONFIRM DIALOG ── */}
      {showConfirmPrint && (
        <div style={overlayStyle}>
          <div style={{ ...modalStyle, width: '300px' }}>
            <div style={modalHeaderStyle}><span>CONFIRM PRINT</span><button onClick={() => setShowConfirmPrint(false)} style={closeXStyle}>✕</button></div>
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FaQuestionCircle size={32} color="#0055ff" />
                <span style={{ fontSize: '12px', fontWeight: 'bold' }}>PRINT BILL INVOICE ?</span>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => { setShowConfirmPrint(false); setShowPrintPreview(true); }} style={btnStyle({ background: '#003399', color: 'white' })}>Yes</button>
                <button onClick={() => { setShowConfirmPrint(false); onBack(); }} style={btnStyle()}>No</button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// ── PRINT INVOICE COMPONENT ──
function TaxInvoicePrint({ formData, items, onBack }) {
  const printItems = items;
  
  // Tax Invoice computations
  const totalQty = items.reduce((s, i) => s + (i.qty || 0), 0);
  const totalVal = items.reduce((s, i) => s + (i.amount || 0), 0);
  const totalTax = formData.cgst + formData.sgst + formData.igst;

  const numberToWords = (num) => {
    const a = ['', 'ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE', 'TEN', 'ELEVEN', 'TWELVE', 'THIRTEEN', 'FOURTEEN', 'FIFTEEN', 'SIXTEEN', 'SEVENTEEN', 'EIGHTEEN', 'NINETEEN'];
    const b = ['', '', 'TWENTY', 'THIRTY', 'FORTY', 'FIFTY', 'SIXTY', 'SEVENTY', 'EIGHTY', 'NINETY'];
    const n = Math.round(num);
    if (n === 0) return 'ZERO';
    function inWords(n) {
      if (n < 20) return a[n];
      if (n < 100) return b[Math.floor(n / 10)] + (n % 10 ? ' ' + a[n % 10] : '');
      if (n < 1000) return a[Math.floor(n / 100)] + ' HUNDRED' + (n % 100 ? ' ' + inWords(n % 100) : '');
      if (n < 100000) return inWords(Math.floor(n / 1000)) + ' THOUSAND' + (n % 1000 ? ' ' + inWords(n % 1000) : '');
      if (n < 10000000) return inWords(Math.floor(n / 100000)) + ' LAKH' + (n % 100000 ? ' ' + inWords(n % 100000) : '');
      return inWords(Math.floor(n / 10000000)) + ' CRORE' + (n % 10000000 ? ' ' + inWords(n % 10000000) : '');
    }
    return inWords(n) + ' ONLY';
  };

  return (
    <div style={{ background: 'white', minHeight: '100vh', padding: '15px', color: 'black', fontFamily: "'Segoe UI', Arial, sans-serif" }}>
      
      {/* Action buttons */}
      <div className="no-print" style={{ background: '#f0f0f0', padding: '8px', display: 'flex', gap: '10px', justifyContent: 'center', borderBottom: '1px solid #ccc' }}>
        <button onClick={() => window.print()} style={{ background: '#003399', color: 'white', border: 'none', padding: '6px 20px', fontWeight: 'bold', cursor: 'pointer' }}>PRINT INVOICE</button>
        <button onClick={onBack} style={{ background: '#999', color: 'white', border: 'none', padding: '6px 20px', fontWeight: 'bold', cursor: 'pointer' }}>RETURN</button>
      </div>

      {/* Invoice Area */}
      <div style={{ maxWidth: '850px', margin: '20px auto', border: '1px solid #000', padding: '12px', boxSizing: 'border-box' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', borderBottom: '1px solid #000', paddingBottom: '6px' }}>
          <div style={{ fontSize: '18px', fontWeight: 'bold' }}>TAX INVOICE</div>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#1a365d' }}>PARAS AUTO PARTS</div>
          <div style={{ fontSize: '12px' }}>MAIN ROAD, KHIRKIYA (M.P.)</div>
          <div style={{ fontSize: '12px' }}>Mob: 9993150250 / 6264255250</div>
          <div style={{ fontSize: '11px', fontStyle: 'italic' }}>Deals in: 2-Wheeler Spare Parts, OIL, TYER, TUBE</div>
          <div style={{ fontSize: '12px', fontWeight: 'bold' }}>GSTIN: 23AMJPJ1775A1ZG</div>
        </div>

        {/* Invoice Grid Details */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', borderBottom: '1px solid #000', fontSize: '11px' }}>
          <div style={{ borderRight: '1px solid #000', padding: '4px', lineHeight: '1.6' }}>
            <div><strong>Invoice No:</strong> {formData.billNo}</div>
            <div><strong>Invoice Date:</strong> {formData.billDate}</div>
            <div><strong>State:</strong> {formData.state} | <strong>Code:</strong> {formData.code}</div>
            <div><strong>Transporter:</strong> {formData.transporter || '—'}</div>
          </div>
          <div style={{ padding: '4px', lineHeight: '1.6' }}>
            <div><strong>Gr No:</strong> {formData.grNo || '—'} | <strong>Gr Date:</strong> {formData.grDate || '—'}</div>
            <div><strong>Case No:</strong> {formData.caseNo || '—'}</div>
            <div><strong>Pvt.Marka:</strong> {formData.pvtMarka || '—'}</div>
            <div><strong>E-Way Bill No:</strong> {formData.ewayBillNo || '—'}</div>
          </div>
        </div>

        {/* Bill to Party */}
        <div style={{ borderBottom: '1px solid #000', padding: '5px', fontSize: '11px', lineHeight: '1.6' }}>
          <div style={{ fontWeight: 'bold', textDecoration: 'underline' }}>Bill to Party:</div>
          <div><strong>Name:</strong> {formData.partyName}</div>
          <div><strong>Address:</strong> {formData.address}, {formData.city}</div>
          <div><strong>GSTIN:</strong> {formData.gstin || '—'}</div>
        </div>

        {/* Table items */}
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #000', background: '#f2f2f2' }}>
              <th style={thS}>SR</th>
              <th style={thS}>PART NO.</th>
              <th style={thS}>DESCRIPTION</th>
              <th style={thS}>MODEL</th>
              <th style={thS}>HSN</th>
              <th style={thS}>QTY</th>
              <th style={thS}>RATE</th>
              <th style={thS}>DISC%</th>
              <th style={thS}>TAXABLE</th>
              <th style={thS}>GST%</th>
              <th style={thS}>AMOUNT</th>
            </tr>
          </thead>
          <tbody>
            {printItems.map((item, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ ...tdS, textAlign: 'center' }}>{idx + 1}</td>
                <td style={{ ...tdS, fontWeight: 'bold' }}>{item.partNo}</td>
                <td style={tdS}>{item.description}</td>
                <td style={tdS}>{item.model}</td>
                <td style={tdS}>{item.hsn}</td>
                <td style={{ ...tdS, textAlign: 'center' }}>{item.qty}</td>
                <td style={{ ...tdS, textAlign: 'right' }}>{item.listPrice?.toFixed(2)}</td>
                <td style={{ ...tdS, textAlign: 'right' }}>{item.discount?.toFixed(1)}%</td>
                <td style={{ ...tdS, textAlign: 'right' }}>{item.amount?.toFixed(2)}</td>
                <td style={{ ...tdS, textAlign: 'right' }}>{item.gstPercent}%</td>
                <td style={{ ...tdS, textAlign: 'right', fontWeight: 'bold' }}>{item.amount?.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Tax breakdown summary */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', borderTop: '1px solid #000', fontSize: '11px' }}>
          <div style={{ borderRight: '1px solid #000', padding: '6px', lineHeight: '1.6' }}>
            <div><strong>Amount in words:</strong> Rupee {numberToWords(formData.netAmt)}</div>
            <div style={{ marginTop: '10px', fontSize: '10px', color: '#555' }}>
              * Declaration: We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.
            </div>
          </div>
          <div style={{ padding: '6px', lineHeight: '1.8' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Taxable Value:</span><span>Rs. {totalVal.toFixed(2)}</span></div>
            {formData.inState === 'Y' ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>CGST Total:</span><span>Rs. {formData.cgst.toFixed(2)}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>SGST Total:</span><span>Rs. {formData.sgst.toFixed(2)}</span></div>
              </>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>IGST Total:</span><span>Rs. {formData.igst.toFixed(2)}</span></div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Postage / Freight:</span><span>Rs. {(formData.postage + formData.freight).toFixed(2)}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #000', fontWeight: 'bold', fontSize: '12px' }}>
              <span>GRAND TOTAL:</span>
              <span>Rs. {formData.netAmt.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Signatures */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '40px', fontSize: '11px', borderTop: '1px solid #000', paddingTop: '10px' }}>
          <div>
            <div>Customer Signature</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div>For PARAS AUTO PARTS</div>
            <div style={{ marginTop: '30px', fontWeight: 'bold' }}>Authorized Signatory</div>
          </div>
        </div>

      </div>

      <style>{`
        @media print {
          .no-print { display: none !important; }
        }
      `}</style>
    </div>
  );
}

const thS = { padding: '4px', borderRight: '1px solid #000', borderBottom: '1px solid #000', textAlign: 'left', fontWeight: 'bold' };
const tdS = { padding: '4px', borderRight: '1px solid #000' };

const overlayStyle = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 };
const modalStyle = { background: 'white', border: '2px solid #1d2d5a', display: 'flex', flexDirection: 'column', maxHeight: '90vh', overflow: 'hidden', fontFamily: 'Tahoma,sans-serif', fontSize: '11px' };
const modalHeaderStyle = { background: '#1d2d5a', color: 'white', padding: '6px 10px', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const closeXStyle = { background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' };
