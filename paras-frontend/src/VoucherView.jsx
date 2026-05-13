import { useState, useEffect } from 'react';
import { getVouchers, deleteVoucher } from './api';
import { FaMoneyBillWave } from 'react-icons/fa';

import VoucherEntry from './VoucherEntry';

export default function VoucherView({ onExit, type = 'Cash/Bank' }) {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('list');
  const [selectedVoucher, setSelectedVoucher] = useState(null);

  const loadVouchers = async () => {
    try {
      const data = await getVouchers();
      setVouchers(data);
    } catch (err) {
      console.error("Failed to load vouchers", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVouchers();
  }, []);

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm("Delete this voucher?")) return;
    try {
      await deleteVoucher(id);
      loadVouchers();
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  if (viewMode === 'entry') {
    return (
      <VoucherEntry
        voucher={selectedVoucher}
        onBack={() => { setViewMode('list'); loadVouchers(); }}
      />
    );
  }

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#ebf3ff',
        padding: '10px 15px',
        borderBottom: '3px solid #003399',
        borderTop: '1px solid #003399'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ backgroundColor: '#003399', padding: '6px', borderRadius: '4px' }}>
            <FaMoneyBillWave size={20} color="white" />
          </div>
          <span style={{ fontWeight: 'bold', color: '#003399', fontSize: '1.2rem' }}>{type.toUpperCase()} VOUCHERS</span>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => { setSelectedVoucher(null); setViewMode('entry'); }}
            style={{ backgroundColor: '#003399', color: 'white', border: '1px solid #000', padding: '6px 15px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            ADD VOUCHER
          </button>
          <button onClick={onExit} style={{ backgroundColor: '#f0f0f0', color: '#cc0000', border: '1px solid #cc0000', padding: '6px 15px', fontWeight: 'bold', cursor: 'pointer' }}>
            RETURN
          </button>
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'hidden', padding: '10px' }}>
        {loading ? (
          <p style={{ padding: '1rem' }}>Loading...</p>
        ) : vouchers.length === 0 ? (
          <p style={{ padding: '1rem', color: '#666' }}>No vouchers found.</p>
        ) : (
          <div className="data-table-container" style={{ border: '1px solid #003399' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>PARTY NAME</th>
                  <th style={{ textAlign: 'right' }}>AMOUNT</th>
                  <th>TYPE</th>
                  <th>DATE</th>
                  <th>REMARKS</th>
                  <th style={{ textAlign: 'center' }}>ACT</th>
                </tr>
              </thead>
              <tbody>
                {vouchers.map((v, idx) => (
                  <tr key={v.id} style={{ backgroundColor: idx % 2 === 0 ? '#fff' : '#f2f7ff' }}>
                    <td><strong>{v.partyName}</strong></td>
                    <td style={{ textAlign: 'right', fontWeight: 'bold', color: '#003399' }}>{v.amount?.toFixed(2) || '0.00'}</td>
                    <td>{v.voucherType || ''}</td>
                    <td>{v.voucherDate || ''}</td>
                    <td>{v.remarks || ''}</td>
                    <td style={{ textAlign: 'center' }}>
                      <button onClick={(e) => handleDelete(e, v.id)} style={{ color: 'red', fontWeight: 'bold', background: 'none', border: 'none', cursor: 'pointer' }}>×</button>
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
