import { useState, useEffect } from 'react';
import { getSalesOrders, createSalesOrder, deleteSalesOrder } from './api';
import { FaShoppingCart } from 'react-icons/fa';
import SalesOrderEntry from './SalesOrderEntry';

export default function SalesOrderView({ onExit }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'entry'
  const [selectedOrder, setSelectedOrder] = useState(null);

  const loadOrders = async () => {
    try {
      const data = await getSalesOrders();
      setOrders(data);
    } catch (err) {
      console.error("Failed to load orders", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleDelete = async (e, id) => {
    e.stopPropagation(); // prevent row click
    try {
      await deleteSalesOrder(id);
      loadOrders();
    } catch (err) {
      console.error("Failed to delete order", err);
    }
  };

  if (viewMode === 'entry') {
    return <SalesOrderEntry order={selectedOrder} onBack={() => { setViewMode('list'); setSelectedOrder(null); loadOrders(); }} />;
  }

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>

      {/* Legacy Toolbar Area */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#90cdf4',
        padding: '8px 16px',
        border: '3px solid #63b3ed',
        marginBottom: '10px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ backgroundColor: '#fff', padding: '5px', borderRadius: '50%', border: '1px solid #63b3ed' }}>
            <FaShoppingCart size={24} color="#3182ce" />
          </div>
          <span style={{ fontWeight: 'bold', color: '#1a365d', fontSize: '1.1rem' }}>Press &lt;Enter&gt; To Select Sales Order</span>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => { setSelectedOrder(null); setViewMode('entry'); }}
            style={{ backgroundColor: '#ebf8ff', border: '1px solid #3182ce', padding: '6px 16px', fontWeight: 'bold', cursor: 'pointer', color: '#1a365d' }}
          >
            ADD NEW S.ORDER
          </button>
          <button style={{ backgroundColor: '#fc8181', border: '1px solid #c53030', padding: '6px 16px', fontWeight: 'bold', cursor: 'pointer', color: '#1a202c' }}>
            DELETE S.ORDER
          </button>
          <button style={{ backgroundColor: '#ebf8ff', border: '1px solid #3182ce', padding: '6px 16px', fontWeight: 'bold', cursor: 'pointer', color: '#1a365d' }}>
            TOTAL
          </button>
          <button
            onClick={onExit}
            style={{
              backgroundColor: '#fed7d7',
              border: '1px solid #c53030',
              padding: '6px 16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              color: '#1a202c'
            }}
          >
            RETURN
          </button>
        </div>
      </div>

      <div className="card" style={{ flex: 1, padding: 0, overflow: 'hidden', border: '3px solid #63b3ed' }}>
        {loading ? (
          <p style={{ padding: '1rem' }}>Loading orders...</p>
        ) : orders.length === 0 ? (
          <p style={{ padding: '1rem', color: 'var(--text-muted)' }}>No sales orders found.</p>
        ) : (
          <div className="data-table-container" style={{ margin: 0, border: 'none', height: '100%' }}>
            <table className="data-table" style={{ width: '100%', margin: 0 }}>
              <thead>
                <tr style={{ backgroundColor: '#ebf8ff' }}>
                  <th style={{ color: '#1a365d', borderBottom: '1px solid #90cdf4', borderRight: '1px solid #90cdf4' }}>NAME OF THE PARTY</th>
                  <th style={{ color: '#1a365d', borderBottom: '1px solid #90cdf4', borderRight: '1px solid #90cdf4' }}>N AMOUNT</th>
                  <th style={{ color: '#1a365d', borderBottom: '1px solid #90cdf4', borderRight: '1px solid #90cdf4' }}>City</th>
                  <th style={{ color: '#1a365d', borderBottom: '1px solid #90cdf4', borderRight: '1px solid #90cdf4' }}>Date</th>
                  <th style={{ color: '#1a365d', borderBottom: '1px solid #90cdf4', borderRight: '1px solid #90cdf4' }}>REMARKS</th>
                  <th style={{ color: '#1a365d', borderBottom: '1px solid #90cdf4', borderRight: '1px solid #90cdf4' }}>PARTY CD</th>
                  <th style={{ color: '#1a365d', borderBottom: '1px solid #90cdf4' }}>ACT</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o, idx) => (
                  <tr
                    key={o.id}
                    onClick={() => { setSelectedOrder(o); setViewMode('entry'); }}
                    style={{ cursor: 'pointer', backgroundColor: idx % 2 === 0 ? '#fff' : '#f7fafc' }}
                    onMouseOver={e => e.currentTarget.style.backgroundColor = '#ebf8ff'}
                    onMouseOut={e => e.currentTarget.style.backgroundColor = idx % 2 === 0 ? '#fff' : '#f7fafc'}
                  >
                    <td style={{ borderRight: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}><strong>{o.customerName}</strong></td>
                    <td style={{ borderRight: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', textAlign: 'right' }}>{o.amount?.toFixed(2) || '0'}</td>
                    <td style={{ borderRight: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>{o.city || ''}</td>
                    <td style={{ borderRight: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>{o.orderDate || ''}</td>
                    <td style={{ borderRight: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>{o.remarks || ''}</td>
                    <td style={{ borderRight: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>{o.partyCd || ''}</td>
                    <td style={{ borderBottom: '1px solid #e2e8f0', textAlign: 'center' }}>
                      <button onClick={(e) => handleDelete(e, o.id)} style={{ color: 'red', fontWeight: 'bold', background: 'none', border: 'none', cursor: 'pointer' }}>X</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
