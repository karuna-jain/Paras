import { useState, useEffect } from 'react';
import { getSalesOrders, createSalesOrder, deleteSalesOrder, getAccounts } from './api';
import { FaShoppingCart } from 'react-icons/fa';
import SalesOrderEntry from './SalesOrderEntry';

export default function SalesOrderView({ onExit, reportMode = false, onCreateBill }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('list');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [accountSearch, setAccountSearch] = useState('');
  const [prefilledAccount, setPrefilledAccount] = useState(null);

  const loadOrders = async () => {
    try {
      const data = await getSalesOrders(false); // Only fetch unbilled (pick slip not created)
      setOrders(data);
    } catch (err) {
      console.error('Failed to load orders', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
    if (!reportMode) {
      getAccounts().then(setAccounts).catch(console.error);
    }
  }, [reportMode]);

  const handleDeleteSelected = () => {
    if (selectedIndex === null) {
      alert('Please select an order to delete');
      return;
    }
    const order = orders[selectedIndex];
    if (!window.confirm(`Delete order for ${order.customerName}?`)) return;
    deleteSalesOrder(order.id)
      .then(() => { loadOrders(); setSelectedIndex(null); })
      .catch(err => console.error('Failed to delete', err));
  };

  const handleRowClick = (order, index) => {
    setSelectedIndex(index);
    setSelectedOrder(order);
    setViewMode('entry');
  };

  const handleAddNew = () => {
    setShowAccountModal(true);
  };

  const selectAccountForOrder = (acc) => {
    setPrefilledAccount(acc);
    setShowAccountModal(false);
    setSelectedOrder(null);
    setViewMode('entry');
  };

  const filteredAccounts = accounts.filter(a =>
    (a.acName || a.name || '').toLowerCase().includes(accountSearch.toLowerCase()) ||
    (a.acCode || '').toString().includes(accountSearch)
  );

  if (viewMode === 'entry') {
    return (
      <SalesOrderEntry
        order={selectedOrder}
        prefilledAccount={prefilledAccount}
        reportMode={reportMode}
        onBack={() => {
          setViewMode('list');
          setSelectedOrder(null);
          setSelectedIndex(null);
          setPrefilledAccount(null);
          loadOrders();
        }}
        onClose={onExit}
        onCreateBill={onCreateBill}
      />
    );
  }

  return (
    <div style={{
      width: '100%',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: '#dfe8ef',
      fontFamily: 'Tahoma, Verdana, sans-serif',
      fontSize: '12px',
      color: '#1d2d5a',
      overflow: 'hidden'
    }}>

      {/* ── HEADER BAR ── */}
      <div style={{
        height: '26px',
        background: '#eef3f7',
        borderBottom: '1px solid #9caab7',
        display: 'flex',
        alignItems: 'center',
        paddingLeft: '10px',
        fontSize: '11px',
        gap: '40px',
        flexShrink: 0
      }}>
        <span>{reportMode ? 'Pick Slip Report' : 'S.Orders'}</span>
        <span>05-05-2026 (TUESDAY)</span>
        <span>PARAS AUTO PARTS</span>
        <span>(OPER)</span>
      </div>

      {/* ── TOP ACTION BAR ── */}
      <div style={{
        background: '#c5dcf0',
        borderBottom: '2px solid #4a6fa5',
        padding: '8px 12px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        flexShrink: 0
      }}>
        {/* Icon + Title */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginRight: '20px'
        }}>
          <div style={{
            background: '#003399',
            padding: '5px 7px',
            borderRadius: '3px',
            display: 'flex',
            alignItems: 'center'
          }}>
            <FaShoppingCart size={16} color="white" />
          </div>
          <span style={{
            fontWeight: 'bold',
            color: '#003399',
            fontSize: '13px',
            letterSpacing: '0.5px'
          }}>
            {reportMode ? 'Pick Slip Report (Pending Sales Orders)' : 'Press <Enter> To Select Sales Order'}
          </span>
        </div>

        {/* Action Buttons */}
        {!reportMode && (
          <>
            <button
              onClick={handleAddNew}
              style={btnStyle('#003399', 'white')}
            >
              ADD NEW S.ORDER
            </button>

            <button
              onClick={handleDeleteSelected}
              style={btnStyle('#cc2200', 'white')}
            >
              DELETE S.ORDER
            </button>
          </>
        )}

        {reportMode && (
          <button
            onClick={() => window.print()}
            style={btnStyle('#28a745', 'white')}
          >
            PRINT PICK SLIP
          </button>
        )}

        <button style={btnStyle('#e8e8e8', '#1d2d5a')}>
          TOTAL
        </button>

        <button
          onClick={onExit}
          style={{ ...btnStyle('#e8e8e8', '#cc0000'), marginLeft: 'auto' }}
        >
          RETURN
        </button>
      </div>

      {/* ── ACCOUNT SELECTION MODAL ── */}
      {showAccountModal && (
        <div style={overlayStyle}>
          <div style={{ ...modalStyle, width: '600px' }}>
            <div style={modalHeaderStyle}>
              <span>SELECT ACCOUNT FOR NEW ORDER</span>
              <button onClick={() => setShowAccountModal(false)} style={closeXStyle}>✕</button>
            </div>
            <div style={{ padding: '8px 10px', background: '#eef3f7' }}>
              <input
                autoFocus
                placeholder="Search account by name, city or code..."
                value={accountSearch}
                onChange={e => setAccountSearch(e.target.value)}
                style={inputStyle}
              />
            </div>
            <div style={{ height: '350px', overflow: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ position: 'sticky', top: 0, background: '#c5dcf0' }}>
                  <tr>
                    <th style={{ ...tdStyle(), width: '60%' }}>Name</th>
                    <th style={{ ...tdStyle(), width: '20%' }}>City</th>
                    <th style={{ ...tdStyle(), width: '20%' }}>Code</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAccounts.map((a, idx) => (
                    <tr
                      key={idx}
                      onClick={() => selectAccountForOrder(a)}
                      style={{ cursor: 'pointer', background: idx % 2 === 0 ? '#fff' : '#f0f8ff', borderBottom: '1px solid #eee' }}
                    >
                      <td style={tdStyle()}>{a.acName || a.name}</td>
                      <td style={tdStyle()}>{a.city}</td>
                      <td style={tdStyle('right', true)}>{a.acCode}</td>
                    </tr>
                  ))}
                  {filteredAccounts.length === 0 && (
                    <tr><td colSpan={3} style={{ padding: '20px', textAlign: 'center' }}>No accounts found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── TABLE AREA ── */}
      <div style={{
        flex: 1,
        overflow: 'hidden',
        padding: '8px',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{
          flex: 1,
          border: '1px solid #7a9cbf',
          overflow: 'auto',
          background: 'white',
          boxShadow: '1px 1px 4px rgba(0,0,0,0.12)'
        }}>
          {loading ? (
            <div style={{ padding: '20px', color: '#666', textAlign: 'center' }}>
              Loading orders...
            </div>
          ) : orders.length === 0 ? (
            <div style={{ padding: '20px', color: '#888', textAlign: 'center' }}>
              No sales orders found.
            </div>
          ) : (
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '12px',
              fontFamily: 'Tahoma, Verdana, sans-serif'
            }}>
              <thead>
                <tr style={{
                  background: '#c5dcf0',
                  position: 'sticky',
                  top: 0,
                  zIndex: 1
                }}>
                  {[
                    ['NAME OF THE PARTY', '28%', 'left'],
                    ['N.AMOUNT', '10%', 'right'],
                    ['CITY', '12%', 'left'],
                    ['DATE', '10%', 'left'],
                    ['REMARKS', '22%', 'left'],
                    ['PARTY CD', '10%', 'left'],
                  ].map(([label, width, align]) => (
                    <th key={label} style={{
                      width,
                      textAlign: align,
                      padding: '5px 8px',
                      borderBottom: '2px solid #4a6fa5',
                      borderRight: '1px solid #9caab7',
                      color: '#1d2d5a',
                      fontWeight: 'bold',
                      fontSize: '11px',
                      whiteSpace: 'nowrap'
                    }}>
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {orders.map((o, idx) => (
                  <tr
                    key={`order-${o.id}-${idx}`}
                    onClick={() => handleRowClick(o, idx)}
                    style={{
                      background: selectedIndex === idx
                        ? '#b8d4f0'
                        : idx % 2 === 0 ? '#ffffff' : '#f0f6fc',
                      cursor: 'pointer',
                      borderBottom: '1px solid #d0dce8'
                    }}
                    onMouseEnter={e => {
                      if (selectedIndex !== idx)
                        e.currentTarget.style.background = '#daeaf8';
                    }}
                    onMouseLeave={e => {
                      if (selectedIndex !== idx)
                        e.currentTarget.style.background =
                          idx % 2 === 0 ? '#ffffff' : '#f0f6fc';
                    }}
                  >
                    <td style={tdStyle('left', true)}>
                      {o.customerName}
                    </td>
                    <td style={{ ...tdStyle('right'), color: '#003399', fontWeight: 'bold' }}>
                      {o.amount != null ? o.amount.toFixed(2) : '0'}
                    </td>
                    <td style={tdStyle('left')}>{o.city || ''}</td>
                    <td style={tdStyle('left')}>
                      {o.orderDate ? (() => {
                        const parts = o.orderDate.split('-');
                        if (parts.length === 3) {
                          return `${parts[2]}-${parts[1]}-${parts[0].slice(2)}`;
                        }
                        return o.orderDate;
                      })() : ''}
                    </td>
                    <td style={tdStyle('left')}>{o.remarks || ''}</td>
                    <td style={tdStyle('left')}>{o.partyCd || ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Record count footer */}
        <div style={{
          marginTop: '4px',
          fontSize: '11px',
          color: '#4a6a8a',
          paddingLeft: '4px'
        }}>
          {orders.length} order(s)
          {selectedIndex !== null && ` • Selected: ${selectedIndex + 1} of ${orders.length}`}
        </div>
      </div>

    </div>
  );
}

// ── Style helpers ────────────────────────────────────────────────
function btnStyle(bg, color) {
  return {
    background: bg,
    color: color,
    border: `1px solid ${color === 'white' ? '#00000044' : '#8899aa'}`,
    padding: '5px 14px',
    fontWeight: 'bold',
    fontSize: '11px',
    fontFamily: 'Tahoma, Verdana, sans-serif',
    cursor: 'pointer',
    borderRadius: '2px',
    boxShadow: '1px 1px 2px rgba(0,0,0,0.2)',
    whiteSpace: 'nowrap',
    letterSpacing: '0.3px'
  };
}

const overlayStyle = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 };
const modalStyle = { background: 'white', border: '2px solid #1d2d5a', display: 'flex', flexDirection: 'column', maxHeight: '90vh', overflow: 'hidden' };
const modalHeaderStyle = { background: '#1d2d5a', color: 'white', padding: '6px 10px', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const closeXStyle = { background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' };
const inputStyle = { height: '24px', border: '1px solid #7a9cbf', background: 'white', padding: '0 4px', fontSize: '12px', fontFamily: 'Tahoma,sans-serif', width: '100%' };

function tdStyle(align = 'left', bold = false) {
  return {
    padding: '4px 8px',
    textAlign: align,
    borderRight: '1px solid #d0dce8',
    fontWeight: bold ? 'bold' : 'normal',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: '200px'
  };
}