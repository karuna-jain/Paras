import { useState, useEffect } from 'react';
import { getSalesInvoices, createSalesInvoice, deleteSalesInvoice } from './api';
import { FaFileInvoiceDollar } from 'react-icons/fa';

import SalesInvoiceEntry from './SalesInvoiceEntry';

export default function SalesInvoiceView({ onExit, type = 'Whole-Sale', prefilledData, onClearPrefilled }) {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState(prefilledData ? 'entry' : 'list'); // 'list' or 'entry'
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  useEffect(() => {
    if (prefilledData) {
      setSelectedInvoice(prefilledData);
      setViewMode('entry');
    }
  }, [prefilledData]);

  const loadInvoices = async () => {
    try {
      const data = await getSalesInvoices();
      setInvoices(data);
    } catch (err) {
      console.error("Failed to load invoices", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvoices();
  }, []);

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this invoice?")) return;
    try {
      await deleteSalesInvoice(id);
      loadInvoices();
    } catch (err) {
      console.error("Failed to delete invoice", err);
    }
  };

  if (viewMode === 'entry') {
    return (
      <SalesInvoiceEntry
        invoice={selectedInvoice}
        onBack={() => {
          setViewMode('list');
          loadInvoices();
          if (onClearPrefilled) onClearPrefilled();
        }}
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
            <FaFileInvoiceDollar size={20} color="white" />
          </div>
          <span style={{ fontWeight: 'bold', color: '#003399', fontSize: '1.2rem' }}>{type.toUpperCase()} LIST</span>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => { setSelectedInvoice(null); setViewMode('entry'); }}
            style={{ backgroundColor: '#003399', color: 'white', border: '1px solid #000', padding: '6px 15px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            ADD NEW INVOICE
          </button>
          <button onClick={onExit} style={{ backgroundColor: '#f0f0f0', color: '#cc0000', border: '1px solid #cc0000', padding: '6px 15px', fontWeight: 'bold', cursor: 'pointer' }}>
            RETURN
          </button>
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'hidden', padding: '10px' }}>
        {loading ? (
          <p style={{ padding: '1rem' }}>Loading invoices...</p>
        ) : invoices.length === 0 ? (
          <p style={{ padding: '1rem', color: '#666' }}>No invoices found.</p>
        ) : (
          <div className="data-table-container" style={{ border: '1px solid #003399' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>NAME OF THE PARTY</th>
                  <th style={{ textAlign: 'right' }}>AMOUNT</th>
                  <th>CITY</th>
                  <th>DATE</th>
                  <th>REMARKS</th>
                  <th style={{ textAlign: 'center' }}>ACT</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv, idx) => (
                  <tr key={inv.id} style={{ backgroundColor: idx % 2 === 0 ? '#fff' : '#f2f7ff' }}>
                    <td><strong>{inv.customerName}</strong></td>
                    <td style={{ textAlign: 'right', fontWeight: 'bold', color: '#003399' }}>{inv.amount?.toFixed(2) || '0.00'}</td>
                    <td>{inv.city || ''}</td>
                    <td>{inv.invoiceDate || ''}</td>
                    <td>{inv.remarks || ''}</td>
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
