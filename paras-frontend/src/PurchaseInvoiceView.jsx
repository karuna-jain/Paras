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
    if (!window.confirm("Are you sure?")) return;
    try {
      await deletePurchaseInvoice(id);
      loadInvoices();
    } catch (err) {
      console.error("Delete failed", err);
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
            <FaFolderOpen size={20} color="white" />
          </div>
          <span style={{ fontWeight: 'bold', color: '#003399', fontSize: '1.2rem' }}>PURCHASES</span>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => { setSelectedInvoice(null); setViewMode('entry'); }}
            style={{ backgroundColor: '#003399', color: 'white', border: '1px solid #000', padding: '6px 15px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            ADD PURCHASE
          </button>
          <button onClick={onExit} style={{ backgroundColor: '#f0f0f0', color: '#cc0000', border: '1px solid #cc0000', padding: '6px 15px', fontWeight: 'bold', cursor: 'pointer' }}>
            RETURN
          </button>
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'hidden', padding: '10px' }}>
        {loading ? (
          <p style={{ padding: '1rem' }}>Loading...</p>
        ) : invoices.length === 0 ? (
          <p style={{ padding: '1rem', color: '#666' }}>No records found.</p>
        ) : (
          <div className="data-table-container" style={{ border: '1px solid #003399' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>SUPPLIER NAME</th>
                  <th style={{ textAlign: 'right' }}>AMOUNT</th>
                  <th>CITY</th>
                  <th>DATE</th>
                  <th>INVOICE NO</th>
                  <th style={{ textAlign: 'center' }}>ACT</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv, idx) => (
                  <tr key={inv.id} style={{ backgroundColor: idx % 2 === 0 ? '#fff' : '#f2f7ff' }}>
                    <td><strong>{inv.supplierName}</strong></td>
                    <td style={{ textAlign: 'right', fontWeight: 'bold', color: '#003399' }}>{inv.amount?.toFixed(2) || '0.00'}</td>
                    <td>{inv.city || ''}</td>
                    <td>{inv.invoiceDate || ''}</td>
                    <td>{inv.supplierInvoiceNo || ''}</td>
                    <td style={{ textAlign: 'center' }}>
                      <button onClick={(e) => handleDelete(e, inv.id)} style={{ color: 'red', fontWeight: 'bold', background: 'none', border: 'none', cursor: 'pointer' }}>×</button>
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
