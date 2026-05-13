import { useState, useEffect } from 'react';
import { getPurchaseOrders, createPurchaseOrder, deletePurchaseOrder } from './api';
import { FaShoppingBag } from 'react-icons/fa';

import PurchaseOrderEntry from './PurchaseOrderEntry';

export default function PurchaseOrderView({ onExit }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('list');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(null);

  const loadOrders = async () => {
    try {
      const data = await getPurchaseOrders();
      setOrders(data);
    } catch (err) {
      console.error('Failed to load purchase orders', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadOrders(); }, []);

  const handleDeleteSelected = () => {
    if (selectedIndex === null) {
      alert('Please select an order to delete');
      return;
    }
    const order = orders[selectedIndex];
    if (!window.confirm(`Delete order for ${order.supplierName}?`)) return;
    deletePurchaseOrder(order.id)
      .then(() => { loadOrders(); setSelectedIndex(null); })
      .catch(err => console.error('Failed to delete', err));
  };

  const handleRowClick = (order, index) => {
    setSelectedIndex(index);
    setSelectedOrder(order);
  };

  const handleEdit = () => {
    if (selectedOrder) setViewMode('entry');
    else alert('Please select an order to edit');
  };

  if (viewMode === 'entry') {
    return (
      <PurchaseOrderEntry
        order={selectedOrder}
        onBack={() => { setViewMode('list'); loadOrders(); }}
      />
    );
  }

  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: '#dfe8ef',
      fontFamily: 'Tahoma, Verdana, sans-serif',
      fontSize: '12px',
      color: '#1d2d5a',
      overflow: 'hidden'
    }}>

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
            <FaShoppingBag size={16} color="white" />
          </div>
          <span style={{
            fontWeight: 'bold',
            color: '#003399',
            fontSize: '13px',
            letterSpacing: '0.5px'
          }}>
            PURCHASE ORDERS
          </span>
        </div>

        <button
          onClick={() => { setSelectedOrder(null); setViewMode('entry'); }}
          style={btnStyle('#003399', 'white')}
        >
          ADD NEW P.ORDER
        </button>

        <button
          onClick={handleEdit}
          style={btnStyle('#ffcc00', '#1d2d5a')}
        >
          EDIT P.ORDER
        </button>

        <button
          onClick={handleDeleteSelected}
          style={btnStyle('#cc2200', 'white')}
        >
          DELETE P.ORDER
        </button>

        <button
          onClick={onExit}
          style={{ ...btnStyle('#e8e8e8', '#cc0000'), marginLeft: 'auto' }}
        >
          RETURN
        </button>
      </div>

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
              No purchase orders found.
            </div>
          ) : (
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '12px'
            }}>
              <thead>
                <tr style={{
                  background: '#c5dcf0',
                  position: 'sticky',
                  top: 0,
                  zIndex: 1
                }}>
                  {[
                    ['SUPPLIER NAME', '30%', 'left'],
                    ['AMOUNT', '15%', 'right'],
                    ['CITY', '15%', 'left'],
                    ['DATE', '15%', 'left'],
                    ['REMARKS', '25%', 'left'],
                  ].map(([label, width, align]) => (
                    <th key={label} style={{
                      width,
                      textAlign: align,
                      padding: '5px 8px',
                      borderBottom: '2px solid #4a6fa5',
                      borderRight: '1px solid #9caab7',
                      color: '#1d2d5a',
                      fontWeight: 'bold'
                    }}>
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {orders.map((o, idx) => (
                  <tr
                    key={`po-${o.id}-${idx}`}
                    onClick={() => handleRowClick(o, idx)}
                    style={{
                      background: selectedIndex === idx
                        ? '#b8d4f0'
                        : idx % 2 === 0 ? '#ffffff' : '#f0f6fc',
                      cursor: 'pointer',
                      borderBottom: '1px solid #d0dce8'
                    }}
                  >
                    <td style={tdStyle('left', true)}>{o.supplierName}</td>
                    <td style={{ ...tdStyle('right'), color: '#003399', fontWeight: 'bold' }}>
                      {o.amount?.toFixed(2) || '0.00'}
                    </td>
                    <td style={tdStyle('left')}>{o.city || ''}</td>
                    <td style={tdStyle('left')}>{o.orderDate || ''}</td>
                    <td style={tdStyle('left')}>{o.remarks || ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

function btnStyle(bg, color) {
  return {
    background: bg,
    color: color,
    border: `1px solid ${color === 'white' ? '#00000044' : '#8899aa'}`,
    padding: '5px 14px',
    fontWeight: 'bold',
    fontSize: '11px',
    cursor: 'pointer',
    borderRadius: '2px',
    boxShadow: '1px 1px 2px rgba(0,0,0,0.2)',
    whiteSpace: 'nowrap'
  };
}

function tdStyle(align = 'left', bold = false) {
  return {
    padding: '4px 8px',
    textAlign: align,
    borderRight: '1px solid #d0dce8',
    fontWeight: bold ? 'bold' : 'normal',
    whiteSpace: 'nowrap'
  };
}
