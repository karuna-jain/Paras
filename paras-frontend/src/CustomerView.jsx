import { useState, useEffect } from 'react';
import { getCustomers, createCustomer, deleteCustomer } from './api';

export default function CustomerView() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
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

  return (
    <div className="dashboard-grid">
      <div className="card">
        <h2>Add New Customer</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. John Doe"
              required
            />
          </div>
          <div className="form-group">
            <label>Phone Number</label>
            <input
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="e.g. 555-0192"
            />
          </div>
          <div className="form-group">
            <label>Address</label>
            <input
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="e.g. 123 Main St"
            />
          </div>
          <button type="submit" className="btn btn-primary">Create Customer</button>
        </form>
      </div>

      <div className="card">
        <h2>Customer Directory</h2>
        {loading ? (
          <p>Loading customers...</p>
        ) : customers.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No customers found. Add one to get started.</p>
        ) : (
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Address</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c.id}>
                    <td><strong>{c.name}</strong></td>
                    <td>{c.phone || '-'}</td>
                    <td>{c.address || '-'}</td>
                    <td>
                      <button
                        onClick={() => handleDelete(c.id)}
                        className="btn btn-danger"
                      >
                        Delete
                      </button>
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
