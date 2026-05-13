import { useState, useEffect } from 'react';
import { getCustomers, createCustomer, deleteCustomer } from './api';

export default function CustomerView() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({ name: '', phone: '', address: '' });

  const loadCustomers = async () => {
    try {
      const data = await getCustomers();
      setCustomers(data);
    } catch (err) {
      console.error("Failed to load customers", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) return;

    try {
      await createCustomer(formData);
      setFormData({ name: '', phone: '', address: '' });
      loadCustomers();
    } catch (err) {
      console.error("Failed to create customer", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteCustomer(id);
      loadCustomers();
    } catch (err) {
      console.error("Failed to delete customer", err);
    }
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (c.phone && c.phone.includes(searchTerm))
  );

  return (
    <div style={{ padding: '20px', height: '100%', overflowY: 'auto', background: '#d6dbe2' }}>
      {/* Header Section */}
      <div style={{ 
        background: '#1c2f5c', 
        color: 'white', 
        padding: '10px 20px', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        borderRadius: '4px 4px 0 0',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>Customer Directory</h2>
        <div style={{ display: 'flex', alignItems: 'center', background: 'white', borderRadius: '4px', padding: '2px 10px' }}>
          <span style={{ color: '#666', marginRight: '8px' }}>🔍</span>
          <input 
            type="text" 
            placeholder="Search Customers..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ 
              border: 'none', 
              outline: 'none', 
              padding: '6px', 
              fontSize: '14px', 
              width: '250px',
              color: '#333'
            }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', gap: '20px', marginTop: '10px' }}>
        {/* LEFT: Add Customer Form */}
        <div style={{ 
          width: '300px', 
          background: 'white', 
          padding: '20px', 
          borderRadius: '4px', 
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          height: 'fit-content'
        }}>
          <h3 style={{ marginTop: 0, borderBottom: '1px solid #eee', paddingBottom: '10px', fontSize: '16px' }}>Add New Customer</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group" style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: 'bold' }}>Full Name</label>
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. John Doe"
                required
                style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
              />
            </div>
            <div className="form-group" style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: 'bold' }}>Phone Number</label>
              <input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="e.g. 555-0192"
                style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
              />
            </div>
            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: 'bold' }}>Address</label>
              <input
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="e.g. 123 Main St"
                style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '10px', background: '#2448b8', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
              Create Customer
            </button>
          </form>
        </div>

        {/* RIGHT: Customer Table */}
        <div style={{ 
          flex: 1, 
          background: 'white', 
          padding: '0', 
          borderRadius: '4px', 
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          overflow: 'hidden'
        }}>
          {loading ? (
            <div style={{ padding: '20px' }}>Loading customers...</div>
          ) : filteredCustomers.length === 0 ? (
            <div style={{ padding: '20px', color: '#666' }}>No customers found.</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                  <th style={tableHeaderStyle}>Sr. No</th>
                  <th style={tableHeaderStyle}>Name</th>
                  <th style={tableHeaderStyle}>Phone</th>
                  <th style={tableHeaderStyle}>Address</th>
                  <th style={tableHeaderStyle}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((c, index) => (
                  <tr key={c.id} style={{ 
                    background: index % 2 === 0 ? '#ffffff' : '#f2f7ff',
                    borderBottom: '1px solid #eee'
                  }}>
                    <td style={tableCellStyle}>{index + 1}</td>
                    <td style={tableCellStyle}><strong>{c.name}</strong></td>
                    <td style={tableCellStyle}>{c.phone || '-'}</td>
                    <td style={tableCellStyle}>{c.address || '-'}</td>
                    <td style={tableCellStyle}>
                      <button 
                        onClick={() => handleDelete(c.id)} 
                        style={{ 
                          background: '#ff4d4f', 
                          color: 'white', 
                          border: 'none', 
                          padding: '4px 8px', 
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '11px'
                        }}
                      >
                        Delete
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

const tableHeaderStyle = {
  padding: '12px 10px',
  textAlign: 'left',
  fontWeight: 'bold',
  color: '#495057',
  borderBottom: '1px solid #dee2e6'
};

const tableCellStyle = {
  padding: '10px',
  color: '#333'
};
