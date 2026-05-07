import { useState, useEffect } from 'react';
import { getParts, getAccounts, createSalesOrder } from './api';
import { FaShoppingCart } from 'react-icons/fa';
import PickSlipPrintView from './PickSlipPrintView';

export default function SalesOrderEntry({ order, onBack }) {
  const [formData, setFormData] = useState(order ? {
    partyCd: order.partyCd || '',
    customerName: order.customerName || '',
    address: order.address || '',
    city: order.city || '',
    remarks: order.remarks || '',
    orderDate: order.orderDate || new Date().toISOString().split('T')[0],
    contact: '',
    phone: '',
    cellNo: ''
  } : {
    partyCd: '',
    customerName: '',
    address: '',
    city: '',
    remarks: '',
    orderDate: new Date().toISOString().split('T')[0],
    contact: '',
    phone: '',
    cellNo: ''
  });

  const [items, setItems] = useState(order && order.items ? order.items.map(i => ({
    partNo: i.partNo,
    description: i.description,
    stock: '',
    qty: i.qty,
    rate: i.rate,
    amount: i.amount
  })) : []);

  const [showModal, setShowModal] = useState(false);
  const [showPrintDialog, setShowPrintDialog] = useState(false);
  const [showPickSlip, setShowPickSlip] = useState(false);
  const [parts, setParts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    getParts().then(setParts).catch(console.error);
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAccountBlur = async () => {
    if (formData.partyCd) {
      try {
        const accounts = await getAccounts();
        const acc = accounts.find(a => a.acCode?.toString() === formData.partyCd);
        if (acc) {
          setFormData(prev => ({
            ...prev,
            customerName: acc.name || '',
            address: acc.address || '',
            city: acc.city || '',
            phone: acc.phone || ''
          }));
        }
      } catch (err) {
        console.error("Failed to fetch accounts", err);
      }
    }
  };

  const addItem = (part) => {

    setItems([
      ...items,
      {
        brand: part.brand || '',
        partNo: part.partNo || '',
        description: part.description || '',
        stock: part.stock || '',
        qty: 1,
        rate: part.mrp || 0,
        amount: (part.mrp || 0) * 1,
      },
    ]);

    setShowModal(false);
  };

  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    if (field === 'qty' || field === 'rate') {
      newItems[index].amount = (parseFloat(newItems[index].qty) || 0) * (parseFloat(newItems[index].rate) || 0);
    }
    setItems(newItems);
  };

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const totalAmount = items.reduce((sum, item) => sum + (item.amount || 0), 0);

  const handleSave = async () => {

    if (items.length === 0) {
      alert('No items to save');
      return;
    }

    const payload = {
      ...formData,
      amount: totalAmount,

      items: items.map(i => ({
        brand: i.brand,
        partNo: i.partNo,
        description: i.description,
        qty: parseFloat(i.qty) || 0,
        rate: parseFloat(i.rate) || 0,
        amount: i.amount || 0
      }))
    };

    try {

      if (order && order.id) {

        await fetch(`/api/sales-orders/${order.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });

      } else {

        await createSalesOrder(payload);

      }

      setShowPrintDialog(true);

    } catch (err) {
      console.error("Save failed", err);
    }
  };

  if (showPickSlip) {
    return <PickSlipPrintView formData={formData} items={items} totalAmount={totalAmount} onBack={() => setShowPickSlip(false)} />;
  }

  const filteredParts = parts.filter((p) =>
    (p.description || '')
      .toLowerCase()
      .includes((searchTerm || '').toLowerCase())
  );
  const resetOrder = () => {

    setFormData({
      partyCd: '',
      customerName: '',
      address: '',
      city: '',
      remarks: '',
      orderDate: new Date().toISOString().split('T')[0],
      contact: '',
      phone: '',
      cellNo: ''
    });

    setItems([]);

    setShowPrintDialog(false);

    setShowPickSlip(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#ebf8ff', padding: '10px' }}>
      {/* Top Section */}
      <div style={{ backgroundColor: '#bee3f8', padding: '10px', border: '1px solid #90cdf4', marginBottom: '10px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>

          <div>
            <div style={{ display: 'flex', marginBottom: '5px' }}>
              <label style={{ width: '80px', fontWeight: 'bold' }}>A/C</label>
              <input name="partyCd" value={formData.partyCd} onChange={handleInputChange} onBlur={handleAccountBlur} style={{ width: '80px', border: '1px solid #cbd5e0', padding: '2px' }} />
            </div>
            <div style={{ display: 'flex', marginBottom: '5px' }}>
              <label style={{ width: '80px', fontWeight: 'bold' }}>NAME</label>
              <input name="customerName" value={formData.customerName} onChange={handleInputChange} style={{ flex: 1, border: '1px solid #cbd5e0', padding: '2px' }} />
            </div>
            <div style={{ display: 'flex', marginBottom: '5px' }}>
              <label style={{ width: '80px', fontWeight: 'bold' }}>ADDRESS</label>
              <input name="address" value={formData.address} onChange={handleInputChange} style={{ flex: 1, border: '1px solid #cbd5e0', padding: '2px' }} />
            </div>
            <div style={{ display: 'flex', marginBottom: '5px' }}>
              <label style={{ width: '80px', fontWeight: 'bold' }}>CITY</label>
              <input name="city" value={formData.city} onChange={handleInputChange} style={{ flex: 1, border: '1px solid #cbd5e0', padding: '2px' }} />
            </div>
            <div style={{ display: 'flex' }}>
              <label style={{ width: '80px', fontWeight: 'bold' }}>REMARKS</label>
              <input name="remarks" value={formData.remarks} onChange={handleInputChange} style={{ flex: 1, border: '1px solid #cbd5e0', padding: '2px' }} />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', marginBottom: '5px' }}>
              <label style={{ width: '80px', fontWeight: 'bold' }}>CONTACT</label>
              <input name="contact" value={formData.contact} onChange={handleInputChange} style={{ flex: 1, border: '1px solid #cbd5e0', padding: '2px' }} />
            </div>
            <div style={{ display: 'flex', marginBottom: '5px' }}>
              <label style={{ width: '80px', fontWeight: 'bold' }}>PHONE</label>
              <input name="phone" value={formData.phone} onChange={handleInputChange} style={{ flex: 1, border: '1px solid #cbd5e0', padding: '2px' }} />
            </div>
            <div style={{ display: 'flex', marginBottom: '5px' }}>
              <label style={{ width: '80px', fontWeight: 'bold' }}>CELL NO.</label>
              <input name="cellNo" value={formData.cellNo} onChange={handleInputChange} style={{ flex: 1, border: '1px solid #cbd5e0', padding: '2px' }} />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', marginBottom: '5px', justifyContent: 'flex-end' }}>
              <label style={{ fontWeight: 'bold', marginRight: '10px' }}>DATE</label>
              <input type="date" name="orderDate" value={formData.orderDate} onChange={handleInputChange} style={{ border: '1px solid #cbd5e0', padding: '2px' }} />
            </div>
            <div style={{ border: '1px solid #90cdf4', padding: '10px', marginTop: '20px', backgroundColor: '#e2e8f0', textAlign: 'center' }}>
              <strong>APPLY - RATE</strong>
              <div style={{ marginTop: '5px' }}>
                <label><input type="radio" name="rateType" defaultChecked /> WholeSale</label>
                <label style={{ marginLeft: '10px' }}><input type="radio" name="rateType" /> Retail</label>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', backgroundColor: '#90cdf4', padding: '8px', border: '2px solid #63b3ed', marginBottom: '5px', overflowX: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginRight: '20px' }}>
          <div style={{ backgroundColor: '#fff', padding: '3px', borderRadius: '50%', border: '1px solid #63b3ed' }}>
            <FaShoppingCart size={20} color="#3182ce" />
          </div>
          <strong style={{ color: '#1a365d', whiteSpace: 'nowrap' }}>S.ORDER</strong>
        </div>
        <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
          <button onClick={() => setShowModal(true)} style={{ padding: '4px 12px', fontWeight: 'bold', backgroundColor: '#ebf8ff', border: '1px solid #3182ce', whiteSpace: 'nowrap' }}>ADD</button>
          <button style={{ padding: '4px 12px', fontWeight: 'bold', backgroundColor: '#ebf8ff', border: '1px solid #3182ce', whiteSpace: 'nowrap' }}>DELETE</button>
          <button style={{ padding: '4px 12px', fontWeight: 'bold', backgroundColor: '#ebf8ff', border: '1px solid #3182ce', whiteSpace: 'nowrap' }}>CALC</button>
          <button style={{ padding: '4px 12px', fontWeight: 'bold', backgroundColor: '#ebf8ff', border: '1px solid #3182ce', whiteSpace: 'nowrap' }}>TOTAL</button>

          <button style={{ padding: '4px 12px', fontWeight: 'bold', backgroundColor: '#ebf8ff', border: '1px solid #3182ce', whiteSpace: 'nowrap' }}>OTHERS</button>
          <button style={{ padding: '4px 12px', fontWeight: 'bold', backgroundColor: '#ebf8ff', border: '1px solid #3182ce', whiteSpace: 'nowrap' }}>LEDGER</button>
          <button style={{ padding: '4px 12px', fontWeight: 'bold', backgroundColor: '#ebf8ff', border: '1px solid #3182ce', whiteSpace: 'nowrap' }}>SMART ADD</button>
          <button onClick={() => setShowModal(true)} style={{ padding: '4px 12px', fontWeight: 'bold', backgroundColor: '#e6fffa', border: '1px solid #319795', color: '#234e52', whiteSpace: 'nowrap' }}>FAST ADD</button>
          <button style={{ padding: '4px 12px', fontWeight: 'bold', backgroundColor: '#ebf8ff', border: '1px solid #3182ce', whiteSpace: 'nowrap' }}>ITEM FIND</button>
        </div>
      </div>

      {/* Grid */}
      <div style={{ flex: 1, backgroundColor: '#e2e8f0', border: '1px solid #a0aec0', overflow: 'hidden', position: 'relative', display: 'flex', flexDirection: 'column' }}>
        <div style={{ overflow: 'auto', flex: 1 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', backgroundColor: 'white' }}>
            <thead style={{ backgroundColor: '#bee3f8', position: 'sticky', top: 0, zIndex: 10 }}>
              <tr>
                <th style={{ border: '1px solid #90cdf4', padding: '6px', textAlign: 'left' }}>PART NO.</th>
                <th style={{ border: '1px solid #90cdf4', padding: '6px', textAlign: 'left' }}>DESCRIPTION</th>
                <th style={{ border: '1px solid #90cdf4', padding: '6px', textAlign: 'center' }}>STOCK</th>
                <th style={{ border: '1px solid #90cdf4', padding: '6px', textAlign: 'center' }}>ORD.QTY</th>
                <th style={{ border: '1px solid #90cdf4', padding: '6px', textAlign: 'right' }}>RATE</th>
                <th style={{ border: '1px solid #90cdf4', padding: '6px', textAlign: 'right' }}>AMOUNT</th>
                <th style={{ border: '1px solid #90cdf4', padding: '6px', textAlign: 'center' }}>ACT</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={idx} style={{ backgroundColor: idx % 2 === 0 ? '#fff' : '#f7fafc' }}>
                  <td style={{ border: '1px solid #e2e8f0', padding: '4px' }}>{item.partNo}</td>
                  <td style={{ border: '1px solid #e2e8f0', padding: '4px' }}>{item.description}</td>
                  <td style={{ border: '1px solid #e2e8f0', padding: '4px', textAlign: 'center' }}>{item.stock}</td>
                  <td style={{ border: '1px solid #e2e8f0', padding: '0' }}>
                    <input
                      type="number"
                      value={item.qty}
                      onChange={(e) => updateItem(idx, 'qty', e.target.value)}
                      style={{ width: '100%', border: 'none', padding: '4px', textAlign: 'center', backgroundColor: 'transparent' }}
                    />
                  </td>
                  <td style={{ border: '1px solid #e2e8f0', padding: '0' }}>
                    <input
                      type="number"
                      value={item.rate}
                      onChange={(e) => updateItem(idx, 'rate', e.target.value)}
                      style={{ width: '100%', border: 'none', padding: '4px', textAlign: 'right', backgroundColor: 'transparent' }}
                    />
                  </td>
                  <td style={{ border: '1px solid #e2e8f0', padding: '4px', textAlign: 'right' }}>{(item.amount || 0).toFixed(2)}</td>
                  <td style={{ border: '1px solid #e2e8f0', padding: '4px', textAlign: 'center' }}>
                    <button onClick={() => removeItem(idx)} style={{ color: 'red', fontWeight: 'bold', background: 'none', border: 'none', cursor: 'pointer' }}>X</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Floating Action Box (Save/Close/Pick-Slip) */}
        <div style={{
          position: 'absolute',
          bottom: '20px',
          right: '20px',
          backgroundColor: '#90cdf4',
          padding: '8px',
          border: '2px solid #63b3ed',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', gap: '5px' }}>
            <button onClick={handleSave} style={{ padding: '6px 16px', fontWeight: 'bold', backgroundColor: '#ebf8ff', border: '1px solid #3182ce', color: '#1a365d', cursor: 'pointer' }}>SAVE</button>
            <button onClick={onBack} style={{ padding: '6px 16px', fontWeight: 'bold', backgroundColor: '#ebf8ff', border: '1px solid #3182ce', color: '#1a365d', cursor: 'pointer' }}>CLOSE</button>
            <button onClick={() => setShowPickSlip(true)} style={{ padding: '6px 16px', fontWeight: 'bold', backgroundColor: '#ebf8ff', border: '1px solid #3182ce', color: '#1a365d', cursor: 'pointer' }}>PICK-SLIP</button>
          </div>
          <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#1a365d', marginTop: '2px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
              <input type="checkbox" />
              PICK-SLIP FOR AVAILABLE ITEMS
            </label>
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'right', padding: '10px', backgroundColor: '#e2e8f0', fontWeight: 'bold', fontSize: '1.2rem', border: '1px solid #cbd5e0', marginTop: '5px' }}>
        TOTAL: ${totalAmount.toFixed(2)}
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{ backgroundColor: 'white', padding: '10px', borderRadius: '4px', width: '850px', maxHeight: '85vh', display: 'flex', flexDirection: 'column', border: '1px solid #ccc', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>

            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #ccc', paddingBottom: '8px', marginBottom: '10px' }}>
              <strong style={{ color: 'blue', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.9rem' }}>
                <span style={{ fontSize: '1.2rem' }}>📁</span> ADD PARTS / JOBS
              </strong>
              <div style={{ display: 'flex', gap: '15px' }}>
                <button style={{ fontWeight: 'bold', background: 'none', border: 'none', cursor: 'pointer', color: '#666' }}>_</button>
                <button style={{ fontWeight: 'bold', background: 'none', border: 'none', cursor: 'pointer', color: '#666' }}>☐</button>
                <button onClick={() => setShowModal(false)} style={{ fontWeight: 'bold', background: 'none', border: 'none', cursor: 'pointer', color: '#666' }}>X</button>
              </div>
            </div>

            {/* Filter Inputs */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1.5fr 1.5fr 2fr', gap: '8px', marginBottom: '10px', padding: '0 5px' }}>
              <div>
                <div style={{ color: 'blue', fontWeight: 'bold', fontSize: '0.75rem', marginBottom: '2px' }}>BRAND</div>
                <input style={{ width: '100%', border: '1px solid #ccc', padding: '2px' }} />
              </div>
              <div>
                <div style={{ color: 'blue', fontWeight: 'bold', fontSize: '0.75rem', marginBottom: '2px' }}>BRAND / COMPANY</div>
                <input style={{ width: '100%', border: '1px solid #ccc', padding: '2px' }} />
              </div>
              <div>
                <div style={{ color: 'blue', fontWeight: 'bold', fontSize: '0.75rem', marginBottom: '2px' }}>PART / ITEM</div>
                <input
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  style={{ width: '100%', border: '1px solid #ccc', padding: '2px' }}
                />
              </div>
              <div>
                <div style={{ color: 'blue', fontWeight: 'bold', fontSize: '0.75rem', marginBottom: '2px' }}>MODEL / CATG</div>
                <input style={{ width: '100%', border: '1px solid #ccc', padding: '2px' }} />
              </div>
              <div>
                <div style={{ color: 'blue', fontWeight: 'bold', fontSize: '0.75rem', marginBottom: '2px' }}>DESCRIPTION</div>
                <input style={{ width: '100%', border: '1px solid #ccc', padding: '2px' }} />
              </div>
            </div>

            {/* Table */}
            <div style={{ overflowY: 'auto', flex: 1, border: '1px solid #ccc', margin: '0 5px 5px 5px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead style={{ backgroundColor: '#f3f4f6', position: 'sticky', top: 0 }}>
                  <tr>
                    <th style={{ textAlign: 'left', padding: '4px', border: '1px solid #ccc', fontWeight: 'normal' }}>Brand</th>
                    <th style={{ textAlign: 'left', padding: '4px', border: '1px solid #ccc', fontWeight: 'normal' }}>Brand/Company</th>
                    <th style={{ textAlign: 'left', padding: '4px', border: '1px solid #ccc', fontWeight: 'normal' }}>Part Number</th>
                    <th style={{ textAlign: 'left', padding: '4px', border: '1px solid #ccc', fontWeight: 'normal' }}>Model</th>
                    <th style={{ textAlign: 'left', padding: '4px', border: '1px solid #ccc', fontWeight: 'normal' }}>Part Description</th>
                    <th style={{ textAlign: 'right', padding: '4px', border: '1px solid #ccc', fontWeight: 'normal' }}>MRP</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredParts.map(p => (
                    <tr key={p.id} onClick={() => addItem(p)} style={{ cursor: 'pointer', borderBottom: '1px solid #eee' }} onMouseOver={e => e.currentTarget.style.backgroundColor = '#ebf8ff'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'white'}>
                      <td style={{ padding: '4px', borderRight: '1px solid #e2e8f0' }}>{p.brand || ''}</td>
                      <td style={{ padding: '4px', borderRight: '1px solid #e2e8f0' }}>{p.company || ''}</td>
                      <td style={{ padding: '4px', borderRight: '1px solid #e2e8f0', border: '1px solid blue' }}>{p.id}</td>
                      <td style={{ padding: '4px', borderRight: '1px solid #e2e8f0' }}>{p.model || ''}</td>
                      <td style={{ padding: '4px', borderRight: '1px solid #e2e8f0' }}>{p.description}</td>
                      <td style={{ padding: '4px', textAlign: 'right' }}>{p.rate}</td>
                    </tr>
                  ))}
                  {filteredParts.length === 0 && (
                    <tr>
                      <td colSpan="6" style={{ padding: '10px', textAlign: 'center', color: '#718096' }}>No parts found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Print Confirmation Modal */}
      {showPrintDialog && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000
        }}>
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '4px', width: '400px', display: 'flex', flexDirection: 'column', border: '1px solid #ccc', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <h3 style={{ marginTop: 0, color: '#1a365d' }}>Sales Order Saved</h3>
            <p style={{ margin: '10px 0', fontSize: '1.1rem' }}>Would you like to print this Sales Order?</p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <button onClick={() => {
                setShowPrintDialog(false);
                setShowPickSlip(true);
              }} style={{ padding: '8px 16px', fontWeight: 'bold', backgroundColor: '#3182ce', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Yes, Print</button>
              <button onClick={onBack} style={{ padding: '8px 16px', fontWeight: 'bold', backgroundColor: '#e2e8f0', color: '#1a202c', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>No</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
