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
      // Filter by type if needed, but since backend stores all, we display them all or we can filter.
      // For now we display all vouchers.
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
    if (!window.confirm("Are you sure you want to delete this voucher?")) return;
    try {
      await deleteVoucher(id);
      loadVouchers();
    } catch (err) {
      console.error("Delete failed", err);
      alert("Failed to delete voucher");
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

  // Classic Windows 98/XP styles
  const outerContainerStyle = {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    background: '#d6dbe2',
    fontFamily: 'Tahoma, sans-serif',
    fontSize: '11px',
    padding: '10px',
  };

  const titleBarStyle = {
    height: '26px',
    background: '#000080',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    padding: '0 8px',
    fontWeight: 'bold',
    justifyContent: 'space-between',
    flexShrink: 0,
  };

  const actionBarStyle = {
    background: '#e8e8e8',
    border: '1px solid #808080',
    padding: '6px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '4px',
    flexShrink: 0,
  };

  const btnStyle = {
    height: '24px',
    background: '#e8e8e8',
    color: '#000',
    border: '1px solid #808080',
    padding: '0 12px',
    fontWeight: 'bold',
    fontFamily: 'Tahoma, sans-serif',
    fontSize: '11px',
    cursor: 'pointer',
    borderRadius: '0',
    boxShadow: 'inset 1px 1px #fff, inset -1px -1px #a0a0a0',
  };

  return (
    <div style={outerContainerStyle}>
      {/* Title Bar */}
      <div style={titleBarStyle}>
        <span>{type.toUpperCase()} VOUCHERS LIST</span>
      </div>

      {/* Action Bar */}
      <div style={actionBarStyle}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <FaMoneyBillWave size={14} color="#000080" />
          <span style={{ fontWeight: 'bold' }}>MANAGE VOUCHERS</span>
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            onClick={() => { setSelectedVoucher(null); setViewMode('entry'); }}
            style={btnStyle}
          >
            <u>A</u>DD VOUCHER
          </button>
          <button onClick={onExit} style={{ ...btnStyle, color: '#cc0000' }}>
            <u>R</u>ETURN
          </button>
        </div>
      </div>

      {/* Grid Table */}
      <div style={{ flex: 1, background: '#fff', border: '1px solid #808080', marginTop: '4px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ overflowY: 'scroll', background: '#e8e8e8', borderBottom: '1px solid #808080', flexShrink: 0 }}>
          <table style={{ width: '100%', tableLayout: 'fixed', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={thStyle(80)}>VOUCHER NO</th>
                <th style={thStyle(85)}>DATE</th>
                <th style={thStyle(250)}>ACCOUNTS AFFECTED</th>
                <th style={thStyle(100)}>TOTAL DR</th>
                <th style={thStyle(100)}>TOTAL CR</th>
                <th style={thStyle(40)}>ACT</th>
              </tr>
            </thead>
          </table>
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {loading ? (
            <div style={{ padding: '20px', textAlign: 'center' }}>Loading vouchers...</div>
          ) : vouchers.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>No vouchers found.</div>
          ) : (
            <table style={{ width: '100%', tableLayout: 'fixed', borderCollapse: 'collapse' }}>
              <tbody>
                {vouchers.map((v, idx) => {
                  const accountsList = v.lines ? v.lines.map(l => `${l.drCr === 'D' ? 'Dr ' : 'Cr '}${l.acName}`).join(', ') : '';
                  return (
                    <tr
                      key={v.id}
                      style={{
                        background: idx % 2 === 0 ? '#fff' : '#f5f5f5',
                        borderBottom: '1px solid #e0e0e0',
                      }}
                    >
                      <td style={tdStyle(80, 'center')}><strong>{v.voucherNo}</strong></td>
                      <td style={tdStyle(85, 'center')}>{v.voucherDate}</td>
                      <td style={{ ...tdStyle(), overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={accountsList}>
                        {accountsList}
                      </td>
                      <td style={tdStyle(100, 'right', true)}>{v.totalDr?.toFixed(2) || '0.00'}</td>
                      <td style={tdStyle(100, 'right', true)}>{v.totalCr?.toFixed(2) || '0.00'}</td>
                      <td style={tdStyle(40, 'center')}>
                        <button
                          onClick={(e) => handleDelete(e, v.id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#cc0000',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            padding: 0
                          }}
                          title="Delete Voucher"
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

function thStyle(width) {
  return {
    width: width ? `${width}px` : 'auto',
    padding: '5px 8px',
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

function tdStyle(width, align = 'left', bold = false) {
  return {
    width: width ? `${width}px` : 'auto',
    padding: '5px 8px',
    textAlign: align,
    borderRight: '1px solid #e0e0e0',
    fontSize: '11px',
    fontWeight: bold ? 'bold' : 'normal',
    color: bold ? '#000080' : '#000',
  };
}
