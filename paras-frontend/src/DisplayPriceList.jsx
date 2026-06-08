import { useState, useEffect } from 'react';
import { getBrands, getModels, getPriceList } from './api';
import { FaFileInvoiceDollar, FaSearch, FaTimes } from 'react-icons/fa';

export default function DisplayPriceList({ onExit }) {
  const [brands, setBrands] = useState([]);
  const [models, setModels] = useState([]);
  const [parts, setParts] = useState([]);
  
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [selectedModel, setSelectedModel] = useState(null);
  
  // UI Dialog flow state: 'brand-picker' | 'model-picker' | 'results'
  const [step, setStep] = useState('brand-picker');
  
  const [brandSearch, setBrandSearch] = useState('');
  const [modelSearch, setModelSearch] = useState('');
  const [partsSearch, setPartsSearch] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getBrands().then(setBrands).catch(console.error);
    getModels().then(setModels).catch(console.error);
  }, []);

  const handleBrandSelect = (brandName) => {
    setSelectedBrand(brandName);
    setStep('model-picker');
  };

  const handleModelSelect = (modelName) => {
    setSelectedModel(modelName);
    fetchPrices(selectedBrand, modelName);
  };

  const fetchPrices = async (brand, model) => {
    setLoading(true);
    try {
      const data = await getPriceList(brand, model);
      setParts(data);
      setStep('results');
    } catch (err) {
      console.error("Failed to load price list", err);
    } finally {
      setLoading(false);
    }
  };

  const resetFlow = () => {
    setSelectedBrand(null);
    setSelectedModel(null);
    setParts([]);
    setStep('brand-picker');
  };

  const filteredBrands = brands.filter(b => 
    (b.headName || b.name || b.shortName || '').toLowerCase().includes(brandSearch.toLowerCase())
  );

  // Collect unique models from models list or filter them
  const filteredModels = models.filter(m =>
    (m.modelName || m.name || '').toLowerCase().includes(modelSearch.toLowerCase())
  );

  const filteredParts = parts.filter(p =>
    (p.partNo || '').toLowerCase().includes(partsSearch.toLowerCase()) ||
    (p.description || '').toLowerCase().includes(partsSearch.toLowerCase())
  );

  // Styled helper definitions
  const panelStyle = {
    background: '#e8e8e8',
    border: '2px solid #808080',
    boxShadow: 'inset 1px 1px #fff, inset -1px -1px #a0a0a0',
    fontFamily: 'Tahoma, sans-serif',
    fontSize: '11px',
    color: '#000',
    display: 'flex',
    flexDirection: 'column',
    maxHeight: '90vh',
    overflow: 'hidden',
  };

  const titleBarStyle = {
    height: '24px',
    background: '#000080',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    padding: '0 8px',
    fontWeight: 'bold',
    justifyContent: 'space-between',
    fontSize: '11px',
  };

  const btnStyle = {
    height: '24px',
    background: '#e8e8e8',
    color: '#000',
    border: '1px solid #808080',
    padding: '0 12px',
    fontWeight: 'bold',
    fontFamily: 'Tahoma, sans-serif',
    fontSize: '11px',
    cursor: 'pointer',
    borderRadius: '0',
    boxShadow: 'inset 1px 1px #fff, inset -1px -1px #a0a0a0',
  };

  const inputStyle = {
    height: '22px',
    border: '1px solid #808080',
    background: '#fff',
    padding: '0 4px',
    fontFamily: 'Tahoma, sans-serif',
    fontSize: '11px',
    borderRadius: '0',
    outline: 'none',
  };

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#d6dbe2', padding: '20px' }}>
      
      {/* Dialog 1: Brand Picker */}
      {step === 'brand-picker' && (
        <div style={{ ...panelStyle, width: '450px' }}>
          <div style={titleBarStyle}>
            <span>PARTICULAR BRAND HELP</span>
            <button onClick={onExit} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
          </div>
          
          <div style={{ padding: '8px 10px', background: '#e8e8e8', borderBottom: '1px solid #808080', display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ fontWeight: 'bold' }}>SEARCH BRAND:</span>
            <input
              placeholder="Type to filter brands..."
              style={{ ...inputStyle, flex: 1 }}
              value={brandSearch}
              onChange={e => setBrandSearch(e.target.value)}
              autoFocus
            />
          </div>

          <div style={{ height: '280px', overflowY: 'auto', background: '#fff' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                <tr 
                  onClick={() => handleBrandSelect('ALL')}
                  style={{ cursor: 'pointer', background: '#fff9e6', borderBottom: '1px solid #e0e0e0', fontWeight: 'bold' }}
                >
                  <td style={tdStyle(80, 'center')}>ALL</td>
                  <td style={tdStyle()}>&lt; ALL BRANDS &gt;</td>
                </tr>
                {filteredBrands.map((b, idx) => {
                  const bName = b.headName || b.name || b.shortName;
                  const bCode = b.headCode || b.id || '';
                  return (
                    <tr 
                      key={idx}
                      onClick={() => handleBrandSelect(bName)}
                      style={{ cursor: 'pointer', background: idx % 2 === 0 ? '#fff' : '#f5f5f5', borderBottom: '1px solid #e0e0e0' }}
                    >
                      <td style={tdStyle(80, 'center')}>{bCode}</td>
                      <td style={tdStyle()}>{bName}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div style={{ padding: '8px 10px', display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #808080', background: '#e8e8e8' }}>
            <button onClick={onExit} style={btnStyle}><u>C</u>LOSE</button>
          </div>
        </div>
      )}

      {/* Dialog 2: Model Picker */}
      {step === 'model-picker' && (
        <div style={{ ...panelStyle, width: '450px' }}>
          <div style={titleBarStyle}>
            <span>MODEL LOOKUP HELP</span>
            <button onClick={resetFlow} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
          </div>
          
          <div style={{ padding: '8px 10px', background: '#e8e8e8', borderBottom: '1px solid #808080', display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ fontWeight: 'bold' }}>SEARCH MODEL:</span>
            <input
              placeholder="Type to filter models..."
              style={{ ...inputStyle, flex: 1 }}
              value={modelSearch}
              onChange={e => setModelSearch(e.target.value)}
              autoFocus
            />
          </div>

          <div style={{ height: '280px', overflowY: 'auto', background: '#fff' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                <tr 
                  onClick={() => handleModelSelect('ALL')}
                  style={{ cursor: 'pointer', background: '#fff9e6', borderBottom: '1px solid #e0e0e0', fontWeight: 'bold' }}
                >
                  <td style={tdStyle(80, 'center')}>ALL</td>
                  <td style={tdStyle()}>&lt; ALL MODELS &gt;</td>
                </tr>
                {filteredModels.map((m, idx) => {
                  const mName = m.modelName || m.name || '';
                  return (
                    <tr 
                      key={idx}
                      onClick={() => handleModelSelect(mName)}
                      style={{ cursor: 'pointer', background: idx % 2 === 0 ? '#fff' : '#f5f5f5', borderBottom: '1px solid #e0e0e0' }}
                    >
                      <td style={tdStyle(80, 'center')}>{m.id || idx + 1}</td>
                      <td style={tdStyle()}>{mName}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div style={{ padding: '8px 10px', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #808080', background: '#e8e8e8' }}>
            <button onClick={resetFlow} style={btnStyle}>&lt; <u>B</u>ACK</button>
            <button onClick={onExit} style={btnStyle}><u>C</u>LOSE</button>
          </div>
        </div>
      )}

      {/* Step 3: Scrollable Price List Catalog */}
      {step === 'results' && (
        <div style={{ ...panelStyle, width: '90%', height: '85vh' }}>
          <div style={titleBarStyle}>
            <span>PRICE LIST CATALOG ({selectedBrand} - {selectedModel})</span>
            <button onClick={resetFlow} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
          </div>

          {/* Quick Filters */}
          <div style={{ padding: '8px 10px', background: '#e8e8e8', borderBottom: '1px solid #808080', display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
              <span style={{ fontWeight: 'bold' }}>SEARCH IN RESULTS:</span>
              <input
                placeholder="Search by part number, description..."
                style={{ ...inputStyle, width: '220px' }}
                value={partsSearch}
                onChange={e => setPartsSearch(e.target.value)}
                autoFocus
              />
            </div>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
              <button onClick={resetFlow} style={btnStyle}>CHANGE FILTER</button>
              <button onClick={() => window.print()} style={btnStyle}><u>P</u>RINT</button>
              <button onClick={onExit} style={{ ...btnStyle, color: '#cc0000' }}><u>R</u>ETURN</button>
            </div>
          </div>

          {/* Price List Grid Table */}
          <div style={{ flex: 1, background: '#fff', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ overflowY: 'scroll', background: '#e8e8e8', borderBottom: '1px solid #808080', flexShrink: 0 }}>
              <table style={{ width: '100%', tableLayout: 'fixed', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={thStyle(120)}>BRAND</th>
                    <th style={thStyle(100)}>MODEL</th>
                    <th style={thStyle(150)}>PART NO</th>
                    <th style={thStyle(220)}>DESCRIPTION</th>
                    <th style={thStyle(90)}>WHOLESALE</th>
                    <th style={thStyle(90)}>RETAIL</th>
                    <th style={thStyle(90)}>MRP</th>
                    <th style={thStyle(60)}>STOCK</th>
                  </tr>
                </thead>
              </table>
            </div>

            <div style={{ flex: 1, overflowY: 'auto' }}>
              {loading ? (
                <div style={{ padding: '20px', textAlign: 'center' }}>Loading price list...</div>
              ) : filteredParts.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>No parts matching criteria.</div>
              ) : (
                <table style={{ width: '100%', tableLayout: 'fixed', borderCollapse: 'collapse' }}>
                  <tbody>
                    {filteredParts.map((p, idx) => (
                      <tr 
                        key={p.id}
                        style={{
                          background: idx % 2 === 0 ? '#fff' : '#f5f5f5',
                          borderBottom: '1px solid #e0e0e0'
                        }}
                      >
                        <td style={tdStyle(120)}>{p.brand}</td>
                        <td style={tdStyle(100)}>{p.model}</td>
                        <td style={{ ...tdStyle(150), fontWeight: 'bold', color: '#000080' }}>{p.partNo}</td>
                        <td style={tdStyle(220)}>{p.description}</td>
                        <td style={tdStyle(90, 'right')}>{p.wholesaleFinal?.toFixed(2) || p.wholesalePrice?.toFixed(2) || '0.00'}</td>
                        <td style={tdStyle(90, 'right')}>{p.retailFinal?.toFixed(2) || p.retailPrice?.toFixed(2) || '0.00'}</td>
                        <td style={tdStyle(90, 'right', true)}>{p.mrp?.toFixed(2) || '0.00'}</td>
                        <td style={tdStyle(60, 'center')}>{p.opening || 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

function thStyle(width) {
  return {
    width: width ? `${width}px` : 'auto',
    padding: '5px 8px',
    textAlign: 'left',
    background: '#e8e8e8',
    borderRight: '1px solid #808080',
    fontWeight: 'bold',
    fontSize: '11px',
    color: '#000',
    position: 'sticky',
    top: 0,
    boxShadow: 'inset 1px 1px #fff, inset -1px -1px #a0a0a0',
  };
}

function tdStyle(width, align = 'left', bold = false) {
  return {
    width: width ? `${width}px` : 'auto',
    padding: '5px 8px',
    textAlign: align,
    borderRight: '1px solid #e0e0e0',
    fontSize: '11px',
    fontWeight: bold ? 'bold' : 'normal',
    color: '#000',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  };
}
