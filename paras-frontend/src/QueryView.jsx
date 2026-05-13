import { useState } from 'react';
import { FaSearch } from 'react-icons/fa';

export default function QueryView({ onExit, title = 'Query' }) {
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
            <FaSearch size={20} color="white" />
          </div>
          <span style={{ fontWeight: 'bold', color: '#003399', fontSize: '1.2rem' }}>{title.toUpperCase()}</span>
        </div>

        <button onClick={onExit} style={{ backgroundColor: '#f0f0f0', color: '#cc0000', border: '1px solid #cc0000', padding: '6px 15px', fontWeight: 'bold', cursor: 'pointer' }}>
          RETURN
        </button>
      </div>

      <div style={{ padding: '20px', flex: 1, backgroundColor: '#f0f0f0' }}>
        <div style={{ background: 'white', padding: '20px', border: '1px solid #003399', maxWidth: '800px', margin: '0 auto' }}>
          <h3 style={{ color: '#003399', marginTop: 0 }}>Search Parameters</h3>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <input 
              type="text" 
              placeholder={`Search ${title}...`} 
              style={{ flex: 1, padding: '10px', border: '1px solid #ccc' }} 
            />
            <button style={{ padding: '10px 20px', background: '#003399', color: 'white', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>
              SEARCH
            </button>
          </div>
          
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead>
              <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                <th style={{ padding: '10px', textAlign: 'left' }}>Code</th>
                <th style={{ padding: '10px', textAlign: 'left' }}>Description</th>
                <th style={{ padding: '10px', textAlign: 'left' }}>Balance/Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan="3" style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
                  Enter search criteria to view results
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
