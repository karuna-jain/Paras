import { useState, useEffect } from 'react';
import { getHSNMaster, createHSNEntry, deleteHSNEntry } from './api';
import { FaBook } from 'react-icons/fa';

export default function HSNMaster({ onExit }) {
  const [hsnList, setHsnList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    hsnCode: '',
    description: '',
    gstRate: 18,
    cgstRate: 9,
    sgstRate: 9,
    igstRate: 18
  });

  const loadHSN = async () => {
    try {
      const data = await getHSNMaster();
      setHsnList(data);
    } catch (err) {
      console.error("Failed to load HSN", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadHSN(); }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await createHSNEntry(formData);
      setShowForm(false);
      setFormData({ hsnCode: '', description: '', gstRate: 18, cgstRate: 9, sgstRate: 9, igstRate: 18 });
      loadHSN();
    } catch (err) {
      console.error("Save failed", err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this HSN?")) return;
    try {
      await deleteHSNEntry(id);
      loadHSN();
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: '#dfe8ef' }}>
      <div style={{ height: '26px', background: '#eef3f7', borderBottom: '1px solid #9caab7', display: 'flex', alignItems: 'center', paddingLeft: '10px', fontSize: '11px', gap: '40px' }}>
        <span>HSN Master</span>
        <span>PARAS AUTO PARTS</span>
      </div>

      <div style={{ background: '#c5dcf0', borderBottom: '2px solid #4a6fa5', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginRight: '20px' }}>
          <div style={{ background: '#003399', padding: '5px 7px', borderRadius: '3px' }}>
            <FaBook size={16} color="white" />
          </div>
          <span style={{ fontWeight: 'bold', color: '#003399', fontSize: '13px' }}>HSN / SAC MASTER</span>
        </div>

        <button onClick={() => setShowForm(true)} style={btnStyle('#003399', 'white')}>ADD HSN</button>
        <button onClick={onExit} style={{ ...btnStyle('#e8e8e8', '#cc0000'), marginLeft: 'auto' }}>RETURN</button>
      </div>

      <div style={{ flex: 1, padding: '10px', overflow: 'auto' }}>
        {showForm && (
          <div style={{ background: 'white', padding: '15px', border: '1px solid #4a6fa5', marginBottom: '15px', borderRadius: '4px' }}>
            <h3 style={{ marginTop: 0, fontSize: '14px', borderBottom: '1px solid #eee', paddingBottom: '8px' }}>ADD NEW HSN CODE</h3>
            <form onSubmit={handleSave} style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              <div>
                <label style={labelStyle}>HSN CODE</label>
                <input required style={inputStyle} value={formData.hsnCode} onChange={e => setFormData({...formData, hsnCode: e.target.value})} />
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={labelStyle}>DESCRIPTION</label>
                <input style={inputStyle} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              </div>
              <div>
                <label style={labelStyle}>GST RATE %</label>
                <input type="number" style={inputStyle} value={formData.gstRate} onChange={e => {
                    const val = parseFloat(e.target.value) || 0;
                    setFormData({...formData, gstRate: val, cgstRate: val/2, sgstRate: val/2, igstRate: val});
                }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '10px', gridColumn: 'span 2' }}>
                <button type="submit" style={btnStyle('#003399', 'white')}>SAVE</button>
                <button type="button" onClick={() => setShowForm(false)} style={btnStyle('#666', 'white')}>CANCEL</button>
              </div>
            </form>
          </div>
        )}

        <div style={{ background: 'white', border: '1px solid #7a9cbf' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
            <thead>
              <tr style={{ background: '#c5dcf0' }}>
                <th style={thStyle}>HSN CODE</th>
                <th style={thStyle}>DESCRIPTION</th>
                <th style={thStyle}>GST %</th>
                <th style={thStyle}>CGST %</th>
                <th style={thStyle}>SGST %</th>
                <th style={thStyle}>IGST %</th>
                <th style={thStyle}>ACT</th>
              </tr>
            </thead>
            <tbody>
              {hsnList.map((h, i) => (
                <tr key={h.id} style={{ background: i % 2 === 0 ? '#fff' : '#f0f6fc', borderBottom: '1px solid #d0dce8' }}>
                  <td style={tdStyle}>{h.hsnCode}</td>
                  <td style={tdStyle}>{h.description}</td>
                  <td style={tdStyle}>{h.gstRate}</td>
                  <td style={tdStyle}>{h.cgstRate}</td>
                  <td style={tdStyle}>{h.sgstRate}</td>
                  <td style={tdStyle}>{h.igstRate}</td>
                  <td style={{ ...tdStyle, textAlign: 'center' }}>
                    <button onClick={() => handleDelete(h.id)} style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 'bold' }}>×</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const btnStyle = (bg, color) => ({
  background: bg, color, border: '1px solid #444', padding: '5px 15px', fontWeight: 'bold', fontSize: '11px', cursor: 'pointer', borderRadius: '2px'
});

const labelStyle = { display: 'block', fontSize: '10px', fontWeight: 'bold', marginBottom: '2px', color: '#4a6fa5' };
const inputStyle = { width: '100%', padding: '6px', border: '1px solid #9caab7', fontSize: '12px' };
const thStyle = { textAlign: 'left', padding: '6px 10px', borderBottom: '2px solid #4a6fa5', borderRight: '1px solid #9caab7' };
const tdStyle = { padding: '6px 10px', borderRight: '1px solid #d0dce8' };
