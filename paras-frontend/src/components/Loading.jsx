import React from 'react';

export default function Loading({ text = 'Loading...' }) {
  return (
    <div style={{
      padding: '40px',
      textAlign: 'center',
      color: '#4a6a8a',
      fontFamily: 'Tahoma',
      fontSize: '12px'
    }}>
      <div style={{ marginBottom: '8px' }}>⏳</div>
      {text}
    </div>
  );
}
