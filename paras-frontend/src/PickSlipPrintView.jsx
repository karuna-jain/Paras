import { useRef, useState } from 'react';
import html2pdf from 'html2pdf.js';

// Utility: convert number to words (Indian style)
function numberToWords(num) {
  const a = ['', 'ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE',
    'TEN', 'ELEVEN', 'TWELVE', 'THIRTEEN', 'FOURTEEN', 'FIFTEEN', 'SIXTEEN',
    'SEVENTEEN', 'EIGHTEEN', 'NINETEEN'];
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
}

// Group items by category
function groupByCategory(items) {
  const groups = [];
  const seen = {};
  items.forEach(item => {
    const cat = (item.brand || 'GENERAL').toUpperCase();
    if (!seen[cat]) {
      seen[cat] = { category: cat, items: [] };
      groups.push(seen[cat]);
    }
    seen[cat].items.push(item);
  });
  return groups;
}

const cellStyle = (extra = {}) => ({
  padding: '5px 8px',
  fontSize: '12.5px',
  fontFamily: "'Segoe UI', Arial, sans-serif",
  borderBottom: 'none',
  ...extra,
});

const thStyle = (extra = {}) => ({
  padding: '6px 8px',
  fontSize: '12.5px',
  fontFamily: "'Segoe UI', Arial, sans-serif",
  fontWeight: 'bold',
  borderBottom: '2px solid #000',
  borderTop: '1px solid #ccc',
  background: 'none',
  ...extra,
});

export default function PickSlipPrintView({ formData, items, totalAmount, onBack, onCreateBill, fromOrderId }) {
  const printAreaRef = useRef(null);
  const [generating, setGenerating] = useState(false);

  const groups = groupByCategory(items);
  const totalPcs = items.reduce((s, i) => s + Number(i.qty || 0), 0);
  const totalItems = items.length;

  const handlePrint = () => window.print();
  
  const handleCreateBill = () => {
    if (onCreateBill) {
      onCreateBill({
        ...formData,
        fromOrderId: fromOrderId,
        amount: totalAmount,
        items: items.map(i => ({
          ...i,
          qty: i.qty || i.ordQty || 0,
          rate: i.rate || i.list || 0,
          discount: i.discount || i.dis || 0
        }))
      });
    }
  };

  const getPdfFile = async () => {
    const element = printAreaRef.current;
    const opt = {
      margin: 0.3,
      filename: `PickSlip_${(formData.customerName || 'order').replace(/[^a-z0-9]/gi, '_')}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    const pdfBlob = await html2pdf().set(opt).from(element).outputPdf('blob');
    return new File([pdfBlob], opt.filename, { type: 'application/pdf' });
  };

  const sharePdf = async (appType) => {
    setGenerating(true);
    try {
      const file = await getPdfFile();
      const bodyText = `Hello ${formData.customerName},\n\nPlease find your Pick Slip / Sales Order attached.\n\nThank you,\nPARAS AUTO PARTS`;
      const textParam = encodeURIComponent(bodyText);

      if (navigator.canShare && navigator.canShare({ files: [file] }) && appType !== 'Save') {
        await navigator.share({ files: [file], title: `Pick Slip - ${formData.customerName}`, text: bodyText });
      } else {
        const url = URL.createObjectURL(file);
        const a = document.createElement('a');
        a.href = url; a.download = file.name;
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
        setTimeout(() => {
          if (appType === 'Save') {
            alert(`PDF saved as "${file.name}".`);
          } else {
            alert(`PDF downloaded as "${file.name}".\nPlease attach it to your ${appType} message.`);
            if (appType === 'email') {
              window.open(`mailto:?subject=${encodeURIComponent(`Pick Slip - ${formData.customerName}`)}&body=${textParam}`);
            } else if (appType === 'WhatsApp') {
              const phone = (formData.cellNo || formData.phone || '').replace(/[^0-9]/g, '');
              window.open(`https://wa.me/${phone || ''}?text=${textParam}`, '_blank');
            }
          }
        }, 500);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to generate PDF.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div style={{ backgroundColor: 'white', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Action Buttons */}
      <div className="no-print" style={{
        padding: '10px 15px', backgroundColor: '#e2e8f0',
        display: 'flex', gap: '10px', justifyContent: 'center',
        borderBottom: '1px solid #cbd5e0', flexWrap: 'wrap'
      }}>
        {[
          { label: 'Print Challan', color: '#3182ce', action: handlePrint },
          { label: 'Create Bill', color: '#ff8c00', action: handleCreateBill },
          { label: generating ? 'Generating...' : 'Save PDF', color: '#4a5568', action: () => sharePdf('Save') },
          { label: generating ? 'Generating...' : 'Email PDF', color: '#dd6b20', action: () => sharePdf('email') },
          { label: generating ? 'Generating...' : 'WhatsApp PDF', color: '#38a169', action: () => sharePdf('WhatsApp') },
          { label: 'Back to Order', color: '#718096', action: onBack },
        ].map(btn => (
          <button key={btn.label} onClick={btn.action} disabled={generating}
            style={{
              padding: '8px 20px', fontWeight: 'bold', backgroundColor: btn.color,
              color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px'
            }}>
            {btn.label}
          </button>
        ))}
      </div>

      {/* Challan Print Area */}
      <div ref={printAreaRef} className="print-area" style={{
        padding: '20px', maxWidth: '900px', margin: '0 auto',
        width: '100%', color: 'black', fontFamily: "'Segoe UI', Arial, sans-serif",
        display: 'flex', flexDirection: 'column', minHeight: '100vh', boxSizing: 'border-box'
      }}>

        {/* ── PARTY INFO ── */}
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          padding: '6px 0', fontSize: '12.5px',
          borderBottom: '2px solid #000', marginBottom: '4px'
        }}>
          <div style={{ lineHeight: '1.8' }}>
            <span style={{ fontWeight: 'bold' }}>TRANSPORT: </span>{formData.transport || '—'}<br />
            <span style={{ fontWeight: 'bold' }}>ADDRESS: </span>{formData.address || '—'}<br />
            <span style={{ fontWeight: 'bold' }}>NAME: </span>{formData.customerName || '—'}<br />
            <span style={{ fontWeight: 'bold' }}>CITY: </span>{formData.city || '—'}
          </div>
          <div style={{ textAlign: 'right', lineHeight: '1.8' }}>
            <span style={{ fontWeight: 'bold' }}>SR: </span>{formData.partyCd || '—'}<br />
            <span style={{ fontWeight: 'bold' }}>DATE: </span>{formData.orderDate || '—'}<br />
            <span style={{ fontWeight: 'bold' }}>PHONE: </span>{formData.phone || formData.cellNo || '—'}<br />
            <span style={{ fontWeight: 'bold' }}>PAGE: </span>1
          </div>
        </div>

        {/* ── NOTICE ── */}
        <div style={{
          padding: '3px 0', fontSize: '11.5px', fontStyle: 'italic', color: '#555',
          marginBottom: '8px'
        }}>
          The following goods of your order are ready. Please confirm the rates &amp; Qty. immediately.
        </div>

        {/* ── ITEMS TABLE ── */}
        <table style={{ width: '100%', borderCollapse: 'collapse', borderTop: '1px solid #ccc' }}>
          <thead>
            <tr>
              {['SR', 'BRAND', 'PART NO', 'QTY', 'DESCRIPTION', 'MODEL', 'MRP', 'PERC', 'NET AMOUNT'].map((h) => (
                <th key={h} style={thStyle({
                  textAlign: ['QTY', 'MRP', 'PERC', 'NET AMOUNT'].includes(h) ? 'right' : 'left',
                  width: h === 'SR' ? '30px' : h === 'QTY' ? '40px' : h === 'NET AMOUNT' ? '90px' : 'auto'
                })}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {groups.map(group => {
              const groupTotal = group.items.reduce((s, i) => s + Number(i.amount || 0), 0);
              return (
                <>
                  {/* Category Header Row */}
                  <tr key={`cat-${group.category}`}>
                    <td colSpan={8} style={{
                      ...cellStyle(), fontWeight: 'bold', fontStyle: 'italic',
                      color: '#333', borderBottom: '1px solid #ddd',
                      fontSize: '11.5px', paddingTop: '8px'
                    }}>
                      {group.category}
                    </td>
                  </tr>

                  {/* Items */}
                  {group.items.map((item, idx) => (
                    <tr key={idx}>
                      <td style={cellStyle({ textAlign: 'center' })}>{item.srNo || idx + 1}</td>
                      <td style={cellStyle()}>{item.partNo}</td>
                      <td style={cellStyle({ textAlign: 'right' })}>{item.qty}</td>
                      <td style={cellStyle()}>{item.description}</td>
                      <td style={cellStyle()}>{item.model || 'COMMON'}</td>
                      <td style={cellStyle({ textAlign: 'right' })}>{Number(item.mrp || item.rate || 0).toFixed(2)}</td>
                      <td style={cellStyle({ textAlign: 'right' })}>{Number(item.perc || item.rate || 0).toFixed(3)}</td>
                      <td style={cellStyle({ textAlign: 'right' })}>{Number(item.amount || 0).toFixed(2)}</td>
                    </tr>
                  ))}

                  {/* Category Subtotal */}
                  <tr key={`sub-${group.category}`}>
                    <td colSpan={8} style={{
                      ...cellStyle(), textAlign: 'right',
                      fontSize: '11px', color: '#666',
                      borderBottom: '1px solid #bbb', paddingRight: '8px',
                      fontStyle: 'italic'
                    }}>
                      LV {groupTotal.toFixed(2)}&nbsp;&nbsp;&nbsp;NV {groupTotal.toFixed(2)}
                    </td>
                  </tr>
                </>
              );
            })}

            {items.length === 0 && (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '20px', color: '#999', fontSize: '12px' }}>
                  No items in this order.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Spacer pushes footer to bottom */}
        <div style={{ flex: 1 }} />

        {/* ── FOOTER: always at bottom of page ── */}
        <div style={{ marginTop: '20px' }}>

          {/* Totals line */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            borderTop: '2px solid #000', borderBottom: '1px solid #ccc',
            padding: '6px 0', fontSize: '12.5px', fontWeight: 'bold'
          }}>
            <span>Type Of Items : {totalItems}</span>
            <span>Total Pcs : {totalPcs}</span>
            <span>G.TOTAL [Rs.] (R/OFF) &nbsp; {totalAmount.toFixed(2)}</span>
          </div>

          {/* Amount in words */}
          <div style={{ padding: '4px 0', fontSize: '12px', borderBottom: '1px solid #ccc' }}>
            Rs. {numberToWords(totalAmount)}
          </div>

          {/* Remarks */}
          <div style={{ padding: '6px 0', fontSize: '12px', borderBottom: '1px solid #ccc' }}>
            <strong>Remarks:</strong> {formData.remarks || ''}
          </div>

          {/* Signatures */}


        </div>
      </div>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          body, html { background: white !important; -webkit-print-color-adjust: economy; color-adjust: economy; }
          .print-area {
            padding: 15px !important;
            max-width: 100% !important;
            min-height: 100vh !important;
            display: flex !important;
            flex-direction: column !important;
          }
        }
      `}</style>
    </div>
  );
}
