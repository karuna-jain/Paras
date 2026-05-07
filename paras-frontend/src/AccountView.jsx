import { useState, useEffect } from 'react';
import { getAccounts, createAccount, deleteAccount } from './api';

export default function AccountView() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ 
    acCode: '', headCode: '1', name: '', city: '', phone: '', openingBalance: '' 
  });

  const loadAccounts = async () => {
    try {
      const data = await getAccounts();
      setAccounts(data);
    } catch (err) {
      console.error("Failed to load accounts", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAccounts();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) return;
    
    const payload = {
      ...formData,
      acCode: parseInt(formData.acCode) || null,
      headCode: parseInt(formData.headCode),
      openingBalance: parseFloat(formData.openingBalance) || 0.0,
      balance: parseFloat(formData.openingBalance) || 0.0 // Set initial balance
    };

    try {
      await createAccount(payload);
      setFormData({ acCode: '', headCode: '1', name: '', city: '', phone: '', openingBalance: '' });
      loadAccounts();
    } catch (err) {
      console.error("Failed to create account", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteAccount(id);
      loadAccounts();
    } catch (err) {
      console.error("Failed to delete account", err);
    }
  };

  return (
    <div className="dashboard-grid">
      <div className="card">
        <h2>Add New Account</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Account Name</label>
            <input name="name" value={formData.name} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>A/C Code</label>
            <input name="acCode" type="number" value={formData.acCode} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Account Type</label>
            <select 
              name="headCode" 
              value={formData.headCode} 
              onChange={handleChange}
              style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid var(--border)' }}
            >
              <option value="1">Debtor (Customer)</option>
              <option value="2">Creditor (Supplier)</option>
            </select>
          </div>
          <div className="form-group">
            <label>City</label>
            <input name="city" value={formData.city} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Phone</label>
            <input name="phone" value={formData.phone} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Opening Balance</label>
            <input name="openingBalance" type="number" step="0.01" value={formData.openingBalance} onChange={handleChange} />
          </div>
          <button type="submit" className="btn btn-primary">Create Account</button>
        </form>
      </div>

      <div className="card">
        <h2>Accounts Ledger</h2>
        {loading ? (
          <p>Loading accounts...</p>
        ) : accounts.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No accounts found.</p>
        ) : (
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>A/C Code</th>
                  <th>Name</th>
                  <th>Type</th>
                  <th>City</th>
                  <th>Balance</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {accounts.map((a) => (
                  <tr key={a.id}>
                    <td>{a.acCode || '-'}</td>
                    <td><strong>{a.name}</strong></td>
                    <td>{a.headCode === 1 ? 'Debtor' : 'Creditor'}</td>
                    <td>{a.city || '-'}</td>
                    <td>${a.balance?.toFixed(2)}</td>
                    <td>
                      <button onClick={() => handleDelete(a.id)} className="btn btn-danger">Delete</button>
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
