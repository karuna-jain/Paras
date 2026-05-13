import { useState } from 'react';
import { FaChartBar } from 'react-icons/fa';

export default function ReportView({ onExit, title = 'Report' }) {
  const [dateRange, setDateRange] = useState({ from: '', to: '' });

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
            <FaChartBar size={20} color="white" />
          </div>
          <span style={{ fontWeight: 'bold', color: '#003399', fontSize: '1.2rem' }}>{title.toUpperCase()}</span>
        </div>

        <button onClick={onExit} style={{ backgroundColor: '#f0f0f0', color: '#cc0000', border: '1px solid #cc0000', padding: '6px 15px', fontWeight: 'bold', cursor: 'pointer' }}>
          RETURN
        </button>
      </div>

      <div style={{ padding: '20px', flex: 1, backgroundColor: '#f0f0f0' }}>
        <div style={{ background: 'white', padding: '20px', border: '1px solid #003399', maxWidth: '600px', margin: '0 auto' }}>
          <h3 style={{ color: '#003399', marginTop: 0 }}>Report Parameters</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '15px', alignItems: 'center' }}>
            <label style={{ fontWeight: 'bold' }}>From Date:</label>
            <input type="date" style={{ padding: '5px', border: '1px solid #ccc' }} />
            
            <label style={{ fontWeight: 'bold' }}>To Date:</label>
            <input type="date" style={{ padding: '5px', border: '1px solid #ccc' }} />
            
            <label style={{ fontWeight: 'bold' }}>Report Type:</label>
            <select style={{ padding: '5px', border: '1px solid #ccc' }}>
              <option>Summary</option>
              <option>Detailed</option>
              <option>Party-wise</option>
            </select>
          </div>
          
          <div style={{ marginTop: '30px', display: 'flex', gap: '10px' }}>
            <button style={{ flex: 1, padding: '10px', background: '#003399', color: 'white', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>
              VIEW REPORT
            </button>
            <button style={{ flex: 1, padding: '10px', background: '#28a745', color: 'white', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>
              PRINT REPORT
            </button>
          </div>
        </div>
        
        <div style={{ marginTop: '20px', padding: '20px', textAlign: 'center', color: '#666' }}>
          <p>No data selected. Please choose parameters and click 'View Report'.</p>
        </div>
      </div>
    </div>
  );
}
