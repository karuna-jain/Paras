import { useState } from 'react';
import { FaCogs } from 'react-icons/fa';

export default function SetupView({ onExit, title = 'Settings' }) {
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
            <FaCogs size={20} color="white" />
          </div>
          <span style={{ fontWeight: 'bold', color: '#003399', fontSize: '1.2rem' }}>{title.toUpperCase()}</span>
        </div>

        <button onClick={onExit} style={{ backgroundColor: '#f0f0f0', color: '#cc0000', border: '1px solid #cc0000', padding: '6px 15px', fontWeight: 'bold', cursor: 'pointer' }}>
          RETURN
        </button>
      </div>

      <div style={{ padding: '20px', flex: 1, backgroundColor: '#f0f0f0' }}>
        <div style={{ background: 'white', padding: '30px', border: '1px solid #003399', maxWidth: '700px', margin: '0 auto' }}>
          <h2 style={{ color: '#003399', marginTop: 0, borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
            {title} Configuration
          </h2>
          
          <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <p style={{ color: '#666' }}>
              This section allows you to configure {title.toLowerCase()} parameters. 
              Currently, these settings are set to their default values.
            </p>
            
            <div style={{ padding: '20px', border: '1px dashed #ccc', textAlign: 'center', borderRadius: '8px' }}>
              <p style={{ fontWeight: 'bold', margin: 0 }}>Module Under Maintenance</p>
              <p style={{ fontSize: '14px', color: '#888' }}>Please contact administrator for manual configuration.</p>
            </div>

            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
              <button style={{ padding: '10px 25px', background: '#ccc', color: '#666', border: 'none', cursor: 'not-allowed' }}>
                SAVE CHANGES
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
