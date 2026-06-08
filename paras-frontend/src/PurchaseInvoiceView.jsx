import { useState, useEffect } from 'react';
import { getPurchaseInvoices, deletePurchaseInvoice } from './api';
import { FaFolderOpen } from 'react-icons/fa';

import PurchaseInvoiceEntry from './PurchaseInvoiceEntry';

export default function PurchaseInvoiceView({ onExit }) {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('list');
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const loadInvoices = async () => {
    try {
      const data = await getPurchaseInvoices();
      setInvoices(data);
    } catch (err) {
      console.error("Failed to load purchase invoices", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvoices();
  }, []);

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this purchase invoice?")) return;
    try {
      await deletePurchaseInvoice(id);
      loadInvoices();
    } catch (err) {
      console.error("Delete failed", err);
      alert("Failed to delete purchase invoice");
    }
  };

  if (viewMode === 'entry') {
    return (
      <PurchaseInvoiceEntry
        invoice={selectedInvoice}
        onBack={() => { setViewMode('list'); loadInvoices(); }}
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
        <span>PURCHASES INVOICES LIST</span>
      </div>

      {/* Action Bar */}
      <div style={actionBarStyle}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <FaFolderOpen size={14} color="#000080" />
          <span style={{ fontWeight: 'bold' }}>MANAGE PURCHASES</span>
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            onClick={() => { setSelectedInvoice(null); setViewMode('entry'); }}
            style={btnStyle}
          >
            <u>A</u>DD PURCHASE
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
                <th style={thStyle(100)}>INVOICE NO</th>
                <th style={thStyle(90)}>BILL DATE</th>
                <th style={thStyle(250)}>SUPPLIER NAME</th>
                <th style={thStyle(100)}>CITY</th>
                <th style={thStyle(70)}>TYPE</th>
                <th style={thStyle(110)}>NET AMOUNT</th>
                <th style={thStyle(40)}>ACT</th>
              </tr>
            </thead>
          </table>
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {loading ? (
            <div style={{ padding: '20px', textAlign: 'center' }}>Loading purchases...</div>
          ) : invoices.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>No purchase records found.</div>
          ) : (
            <table style={{ width: '100%', tableLayout: 'fixed', borderCollapse: 'collapse' }}>
              <tbody>
                {invoices.map((inv, idx) => (
                  <tr
                    key={inv.id}
                    style={{
                      background: idx % 2 === 0 ? '#fff' : '#f5f5f5',
                      borderBottom: '1px solid #e0e0e0',
                    }}
                  >
                    <td style={tdStyle(100, 'center')}><strong>{inv.billNo}</strong></td>
                    <td style={tdStyle(90, 'center')}>{inv.billDate}</td>
                    <td style={tdStyle(250)}>{inv.supplierName}</td>
                    <td style={tdStyle(100)}>{inv.city || ''}</td>
                    <td style={tdStyle(70, 'center')}>{inv.type || 'CREDIT'}</td>
                    <td style={tdStyle(110, 'right', true)}>{inv.netAmount?.toFixed(2) || '0.00'}</td>
                    <td style={tdStyle(40, 'center')}>
                      <button
                        onClick={(e) => handleDelete(e, inv.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#cc0000',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          padding: 0
                        }}
                        title="Delete Invoice"
                      >
                        ✕
                      </button>
                    </td>
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
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  };
}
