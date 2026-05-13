import { useState, useEffect } from 'react';

export default function PartsView() {

  const [parts, setParts] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [currentNavIndex, setCurrentNavIndex] = useState(null);
  const [showHelp, setShowHelp] = useState(false);
  const [multipleModels, setMultipleModels] = useState(false);
  const [selectedModels, setSelectedModels] = useState([]);
  const [showMultiModel, setShowMultiModel] = useState(false);

  const [formData, setFormData] = useState({
    brand: '',
    partNo: '',
    description: '',
    model: '',
    hsn: '',
    hsnDesc: '',
    gst: '',
    purchasePrice: '',
    purchaseDiscount: '',
    wholesalePrice: '',
    wholesaleDiscount: '',
    retailPrice: '',
    retailDiscount: '',
    opening: '',
    reorder: '',
    maxLvl: '',
    itemUnit: '',
    packOf: '',
    locationI: '',
    remarks: '',
  });

  const [brands, setBrands] = useState([])
  const [models, setModels] = useState([])
  const hsnList = [
    { code: '8714', desc: 'Parts And Accessories', gst: '18' },
    { code: '8409', desc: 'Engine Parts', gst: '28' },
  ];

  const priceColumns = [
    { title: 'PURCHASE PRICE', priceField: 'purchasePrice', discountField: 'purchaseDiscount' },
    { title: 'WHOLE SALE PRICE', priceField: 'wholesalePrice', discountField: 'wholesaleDiscount' },
    { title: 'RETAIL SALE', priceField: 'retailPrice', discountField: 'retailDiscount' },
  ];

  useEffect(() => {

    fetchParts()

    fetch('/api/brands')
      .then(res => res.json())
      .then(data => setBrands(data))

    fetch('/api/models')
      .then(res => res.json())
      .then(data => setModels(data))

  }, [])
  const fetchParts = async () => {
    try {
      const response = await fetch('/api/parts');
      const data = await response.json();
      setParts(data);
    } catch (error) {
      console.log(error);
    }
  };

  const calcFinal = (price, discount) => {
    const p = parseFloat(price) || 0;
    const d = parseFloat(discount) || 0;
    if (p === 0) return '';
    return (p - (p * d) / 100).toFixed(2);
  };

  const handleChange = (field, value) => {
    if (field === 'hsn') {
      const selectedHsn = hsnList.find((h) => h.code === value);
      setFormData((prev) => ({
        ...prev,
        hsn: value,
        gst: selectedHsn?.gst || '',
        hsnDesc: selectedHsn?.desc || '',
      }));
      return;
    }
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.brand.trim()) { alert('Brand is required'); return false; }
    if (!formData.partNo.trim()) { alert('Part Number is required'); return false; }
    const purchase = parseFloat(formData.purchasePrice || 0);
    const wholesale = parseFloat(formData.wholesalePrice || 0);
    const retail = parseFloat(formData.retailPrice || 0);
    if (purchase > wholesale) { alert('Wholesale price must be greater than Purchase price'); return false; }
    if (retail < wholesale) { alert('Retail price must be greater than Wholesale price'); return false; }
    return true;
  };

  const resetForm = () => {
    setFormData({
      brand: '', partNo: '', description: '', model: '',
      hsn: '', hsnDesc: '', gst: '',
      purchasePrice: '', purchaseDiscount: '',
      wholesalePrice: '', wholesaleDiscount: '',
      retailPrice: '', retailDiscount: '',
      opening: '', reorder: '', maxLvl: '',
      itemUnit: '', packOf: '', locationI: '', remarks: '',
    });
    setSelectedIndex(null);
    setCurrentNavIndex(null);
    setMultipleModels(false);
    setSelectedModels([]);
  };

  // ── CRUD ──────────────────────────────────────────────────────────────
  const handleAdd = async () => {
    if (!validateForm()) return;
    try {
      const response = await fetch('/api/parts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildPayload(null)),
      });
      if (response.ok) {
        await fetchParts();   // ← re-fetch all from DB, IDs are always correct
        resetForm();
      } else {
        const err = await response.text();
        alert('Add failed: ' + err);
      }
    } catch (error) { console.log(error); }
  };

  const handleEdit = async () => {
    if (selectedIndex === null) { alert('Select a part first'); return; }
    if (!validateForm()) return;
    const dbId = parts[selectedIndex].id;
    try {
      const response = await fetch(`/api/parts/${dbId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildPayload(dbId)),
      });
      if (response.ok) {
        await fetchParts();   // ← re-fetch all from DB
        resetForm();
      } else {
        const err = await response.text();
        alert('Edit failed: ' + err);
      }
    } catch (error) { console.log(error); }
  };

  const handleDelete = async () => {
    if (selectedIndex === null) { alert('Select a part first'); return; }
    if (!window.confirm('Delete this part?')) return;
    const dbId = parts[selectedIndex].id;
    try {
      await fetch(`/api/parts/${dbId}`, { method: 'DELETE' });
      await fetchParts();   // ← re-fetch all from DB
      resetForm();
    } catch (error) { console.log(error); }
  };

  // ── Navigation ────────────────────────────────────────────────────────
  const loadPartAt = (index) => {
    if (index < 0 || index >= parts.length) return;
    const item = parts[index];
    setSelectedIndex(index);
    setCurrentNavIndex(index);
    setFormData({
      brand: item.brand || '',
      partNo: item.partNo || '',
      description: item.description || '',
      model: item.model || '',
      hsn: item.hsn || '',
      hsnDesc: item.hsnDesc || '',
      gst: item.gst || '',
      purchasePrice: item.purchasePrice || '',
      purchaseDiscount: item.purchaseDiscount || '',
      wholesalePrice: item.wholesalePrice || '',
      wholesaleDiscount: item.wholesaleDiscount || '',
      retailPrice: item.retailPrice || '',
      retailDiscount: item.retailDiscount || '',
      opening: item.opening || '',
      reorder: item.reorder || '',
      maxLvl: item.maxLvl || '',
      itemUnit: item.itemUnit || '',
      packOf: item.packOf || '',
      locationI: item.locationI || '',
      remarks: item.remarks || '',
    });
    setMultipleModels(Array.isArray(item.models) && item.models.length > 1);
    setSelectedModels(Array.isArray(item.models) ? item.models : []);
  };

  const handleFirst = () => {
    if (parts.length === 0) return;
    loadPartAt(0);
  };

  const handlePrev = () => {
    const idx = currentNavIndex !== null ? currentNavIndex : selectedIndex;
    if (idx === null || idx <= 0) return;
    loadPartAt(idx - 1);
  };

  const handleNext = () => {
    const idx = currentNavIndex !== null ? currentNavIndex : selectedIndex;
    if (idx === null || idx >= parts.length - 1) return;
    loadPartAt(idx + 1);
  };

  const handleLast = () => {
    if (parts.length === 0) return;
    loadPartAt(parts.length - 1);
  };

  const handleSelect = (item, index) => {
    loadPartAt(index);
  };

  // ── Multi-model toggle ────────────────────────────────────────────────
  const toggleModelSelection = (model) => {
    setSelectedModels((prev) =>
      prev.includes(model) ? prev.filter((m) => m !== model) : [...prev, model]
    );
  };

  // ── buildPayload (keep existing structure) ──────────────────────────
  const buildPayload = (existingId) => ({
    id: existingId || null,
    ...formData,
    purchasePrice: formData.purchasePrice ? parseFloat(formData.purchasePrice) : null,
    purchaseDiscount: formData.purchaseDiscount ? parseFloat(formData.purchaseDiscount) : null,
    wholesalePrice: formData.wholesalePrice ? parseFloat(formData.wholesalePrice) : null,
    wholesaleDiscount: formData.wholesaleDiscount ? parseFloat(formData.wholesaleDiscount) : null,
    retailPrice: formData.retailPrice ? parseFloat(formData.retailPrice) : null,
    retailDiscount: formData.retailDiscount ? parseFloat(formData.retailDiscount) : null,
    opening: formData.opening ? parseInt(formData.opening) : null,
    reorder: formData.reorder ? parseInt(formData.reorder) : null,
    maxLvl: formData.maxLvl ? parseInt(formData.maxLvl) : null,
    packOf: formData.packOf ? parseInt(formData.packOf) : null,
    models: multipleModels ? selectedModels.join(',') : formData.model || null,
  });

  return (
    <div className="w-screen min-h-screen bg-[#dfe8ef] p-[6px] pb-[90px] text-[11px] text-[#1d2d5a] font-['Tahoma'] overflow-y-auto">

      {/* HEADER */}
      <div className="h-[26px] border border-[#9caab7] bg-[#eef3f7] flex items-center px-[8px]">
        <div className="w-[180px]">Part Master Entry</div>
        <div className="w-[180px] text-center">05-05-2026 (TUESDAY)</div>
        <div className="w-[220px] text-center">PARAS AUTO PARTS</div>
        <div>(OPER)</div>
      </div>

      {/* TITLE */}
      <div className="h-[32px] flex items-center pl-[10px] text-[16px] tracking-[1px] text-[#2d3fa5] underline font-bold">
        PARTS - DETAILS
      </div>

      {/* MAIN */}
      <div className="flex min-h-[540px] border border-[#aab7c3] bg-[#c9e7fb]">

        {/* LEFT */}
        <div className="w-[55%] border-r border-[#8da4b5] bg-[#abd7f3] p-[10px]">

          {/* FORM GRID */}
          <div className="grid grid-cols-[85px_120px_1fr] gap-y-[6px] items-center">

            <label>BRAND</label>

            <div className="relative">

              <input
                list="brand-list"
                value={formData.brand}
                onChange={(e) =>
                  handleChange('brand', e.target.value)
                }
                placeholder="Select Brand"
                className="
      w-full
      h-[22px]
      border
      border-[#6e7d88]
      bg-white
      px-[4px]
    "
              />

              <datalist id="brand-list">

                {brands.map((b) => (

                  <option
                    key={b.id}
                    value={b.code}
                  >
                    {b.code} - {b.name}
                  </option>

                ))}

              </datalist>

            </div>

            <div className="pl-[8px] text-red-600 font-bold">
              {formData.brand}
            </div>

            <label>PART NO.</label>
            <input
              value={formData.partNo}
              onChange={(e) => handleChange('partNo', e.target.value)}
              className="h-[22px] border border-[#6e7d88] bg-white px-[4px]"
            />
            <div />

            <label>DESC.</label>
            <input
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              className="col-span-2 h-[22px] border border-[#6e7d88] bg-white px-[4px]"
            />

            <label>MODEL NO.</label>

            <input
              list="model-list"
              value={formData.model}
              onChange={(e) =>
                handleChange('model', e.target.value)
              }
              disabled={multipleModels}
              placeholder="Select Model"
              className="
    h-[22px]
    border
    border-[#6e7d88]
    bg-white
    px-[4px]
    disabled:opacity-50
  "
            />

            <datalist id="model-list">

              {models.map((m) => (

                <option
                  key={m.id}
                  value={m.code}
                >
                  {m.code} - {m.name}
                </option>

              ))}

            </datalist>

            <div className="flex items-center gap-[12px]">

              <label className="flex items-center gap-[4px] font-bold cursor-pointer">

                <input
                  type="checkbox"
                  checked={multipleModels}
                  onChange={(e) => {

                    setMultipleModels(
                      e.target.checked
                    );

                    if (!e.target.checked) {

                      setSelectedModels([]);

                    }

                  }}
                />

                MULTIPLE MODELS

              </label>

              <button
                onClick={() => {

                  if (multipleModels) {

                    setShowMultiModel(true);

                  }

                }}
                className={`
      h-[24px]
      border
      border-[#6e7d88]
      px-[10px]
      text-[11px]
      font-bold
      ${multipleModels
                    ? 'bg-[#ffffa0] cursor-pointer'
                    : 'bg-[#d4d4d4] opacity-50 cursor-not-allowed'
                  }
    `}
              >
                MULTY - MODELS
              </button>

            </div>

          </div>

          {/* HSN */}
          <div className="mt-[8px] border border-[#89a7bd] bg-[#59c0ef] p-[8px]">
            <div className="grid grid-cols-[80px_120px_1fr_50px_50px] gap-[8px] items-center">
              <label>HSN CODE</label>
              <select
                value={formData.hsn}
                onChange={(e) => handleChange('hsn', e.target.value)}
                className="h-[22px] border border-[#6e7d88] bg-white px-[4px]"
              >
                <option value="">SELECT</option>
                {hsnList.map((h) => <option key={h.code} value={h.code}>{h.code}</option>)}
              </select>
              <div />
              <label>GST %</label>
              <input
                value={formData.gst}
                readOnly
                className="h-[22px] border border-[#6e7d88] bg-white px-[4px]"
              />
            </div>
            <div className="mt-[8px] grid grid-cols-[80px_1fr] gap-[8px] items-center">
              <label>HSN DESC</label>
              <input
                value={formData.hsnDesc || ''}
                readOnly
                className="h-[22px] border border-[#6e7d88] bg-white px-[4px]"
              />
            </div>
          </div>

          {/* PRICE with DISCOUNT */}
          <div className="mt-[8px] border border-[#7d9eb7] bg-[#7ec4ea] flex">
            {priceColumns.map((col, index) => (
              <div
                key={col.title}
                className={`w-1/3 px-[10px] pt-[8px] pb-[8px] ${index !== 2 ? 'border-r border-[#6e8ea8]' : ''}`}
              >
                <div className="text-center underline text-[12px] font-bold mb-[10px]">
                  {col.title}
                </div>

                {/* LIST price */}
                <div className="mb-[6px]">
                  <div className="mb-[2px]">LIST</div>
                  <input
                    value={formData[col.priceField]}
                    onChange={(e) => handleChange(col.priceField, e.target.value)}
                    className="h-[20px] w-full border border-[#6e7d88] bg-white px-[4px]"
                    placeholder="0.00"
                  />
                </div>

                {/* DISCOUNT % */}
                <div className="mb-[6px]">
                  <div className="mb-[2px]">DISC %</div>
                  <input
                    value={formData[col.discountField]}
                    onChange={(e) => handleChange(col.discountField, e.target.value)}
                    className="h-[20px] w-full border border-[#6e7d88] bg-[#ffffd0] px-[4px]"
                    placeholder="0"
                  />
                </div>

                {/* FINAL price (calculated, read-only) */}
                <div>
                  <div className="mb-[2px] font-bold text-[#003366]">FINAL</div>
                  <input
                    value={calcFinal(formData[col.priceField], formData[col.discountField])}
                    readOnly
                    className="h-[20px] w-full border border-[#6e7d88] bg-[#d0ffd0] px-[4px] font-bold text-[#003300]"
                    placeholder="0.00"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* LOWER FIELDS */}
          <div className="mt-[8px] grid grid-cols-3 gap-[10px]">
            <div>
              <div className="mb-[3px]">OPENING</div>
              <input value={formData.opening} onChange={(e) => handleChange('opening', e.target.value)} className="w-full h-[22px] border border-[#6e7d88] bg-white px-[4px]" />
            </div>
            <div>
              <div className="mb-[3px]">RE-ORDER</div>
              <input value={formData.reorder} onChange={(e) => handleChange('reorder', e.target.value)} className="w-full h-[22px] border border-[#6e7d88] bg-white px-[4px]" />
            </div>
            <div>
              <div className="mb-[3px]">MAX. LVL</div>
              <input value={formData.maxLvl} onChange={(e) => handleChange('maxLvl', e.target.value)} className="w-full h-[22px] border border-[#6e7d88] bg-white px-[4px]" />
            </div>
          </div>

          <div className="mt-[8px] grid grid-cols-3 gap-[10px]">
            <div>
              <div className="mb-[3px]">ITEM UNIT</div>
              <input value={formData.itemUnit} onChange={(e) => handleChange('itemUnit', e.target.value)} className="w-full h-[22px] border border-[#6e7d88] bg-white px-[4px]" />
            </div>
            <div>
              <div className="mb-[3px]">PACK OF</div>
              <input value={formData.packOf} onChange={(e) => handleChange('packOf', e.target.value)} className="w-full h-[22px] border border-[#6e7d88] bg-white px-[4px]" />
            </div>
            <div>
              <div className="mb-[3px]">LOCATION-I</div>
              <input value={formData.locationI} onChange={(e) => handleChange('locationI', e.target.value)} className="w-full h-[22px] border border-[#6e7d88] bg-white px-[4px]" />
            </div>
          </div>

          <div className="mt-[8px]">
            <div className="mb-[3px]">REMARKS</div>
            <input value={formData.remarks} onChange={(e) => handleChange('remarks', e.target.value)} className="w-full h-[24px] border border-[#6e7d88] bg-white px-[4px]" />
          </div>

        </div>

        {/* RIGHT — parts list */}
        <div className="w-[45%] bg-[#d4edf9] p-[6px]">
          <div className="mb-[4px] text-[10px] text-[#1d2d5a]">
            {parts.length} record(s) &nbsp;
            {selectedIndex !== null && `| Selected: ${selectedIndex + 1} of ${parts.length}`}
          </div>
          <div className="h-[460px] border border-[#677d8c] overflow-y-scroll bg-white">
            <table className="w-full border-collapse text-[11px]">
              <thead className="bg-[#7fc6ea] sticky top-0">
                <tr>
                  <th className="border border-[#758896] px-[4px] text-left">Brand</th>
                  <th className="border border-[#758896] px-[4px] text-left">Description</th>
                  <th className="border border-[#758896] px-[4px] text-left">Model</th>
                  <th className="border border-[#758896] px-[4px] text-left">Part No.</th>
                </tr>
              </thead>
              <tbody>
                {parts.map((item, index) => (
                  <tr
                    key={item.id || index}
                    onClick={() => handleSelect(item, index)}
                    className={`cursor-pointer ${selectedIndex === index ? 'bg-[#c5e6ff]' : index % 2 === 0 ? 'bg-white' : 'bg-[#f0f8ff]'}`}
                  >
                    <td className="border border-[#758896] px-[4px]">{item.brand}</td>
                    <td className="border border-[#758896] px-[4px]">{item.description}</td>
                    <td className="border border-[#758896] px-[4px]">{item.model}</td>
                    <td className="border border-[#758896] px-[4px]">{item.partNo}</td>
                  </tr>
                ))}
                {parts.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center py-[10px] text-[#888]">No parts found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* ── BUTTON PANEL — fixed bottom-left ── */}
      <div className="fixed bottom-[12px] left-[12px] w-[360px] border border-[#6d8ca3] bg-[#8fd4ff] p-[8px] z-50">
        <div className="grid grid-cols-4 gap-[5px]">
          <button onClick={handleAdd} className="h-[32px] border border-[#596c7b] bg-[#f5f5f5] font-bold hover:bg-[#e0e0e0] active:bg-[#d0d0d0]">ADD</button>
          <button onClick={handleEdit} className="h-[32px] border border-[#596c7b] bg-[#f5f5f5] font-bold hover:bg-[#e0e0e0] active:bg-[#d0d0d0]">EDIT</button>
          <button onClick={handleDelete} className="h-[32px] border border-[#596c7b] bg-[#f5f5f5] font-bold hover:bg-[#ffe0e0] active:bg-[#ffc0c0]">DELETE</button>
          <button onClick={() => setShowHelp(true)} className="h-[32px] border border-[#596c7b] bg-[#b8ffb8] font-bold hover:bg-[#90ee90]">HELP</button>
        </div>
        <div className="mt-[5px] grid grid-cols-5 gap-[5px]">
          <button onClick={handleFirst} disabled={parts.length === 0} className="h-[28px] border border-[#596c7b] bg-[#f5f5f5] text-[11px] font-bold hover:bg-[#e0e0e0] disabled:opacity-40 disabled:cursor-not-allowed">FIRST</button>
          <button onClick={handlePrev} disabled={parts.length === 0 || currentNavIndex === 0} className="h-[28px] border border-[#596c7b] bg-[#f5f5f5] text-[11px] font-bold hover:bg-[#e0e0e0] disabled:opacity-40 disabled:cursor-not-allowed">{'<<PREV'}</button>
          <button onClick={handleNext} disabled={parts.length === 0 || currentNavIndex === parts.length - 1} className="h-[28px] border border-[#596c7b] bg-[#f5f5f5] text-[11px] font-bold hover:bg-[#e0e0e0] disabled:opacity-40 disabled:cursor-not-allowed">{'NEXT>>'}</button>
          <button onClick={handleLast} disabled={parts.length === 0} className="h-[28px] border border-[#596c7b] bg-[#f5f5f5] text-[11px] font-bold hover:bg-[#e0e0e0] disabled:opacity-40 disabled:cursor-not-allowed">LAST</button>
          <button
            onClick={() => {
              window.location.href = '/';
            }} className="h-[28px] border border-[#7a0000] bg-[#ff1f1f] text-white text-[11px] font-bold hover:bg-[#cc0000]">CLOSE</button>
        </div>
      </div>

      {/* ── HELP MODAL ── */}
      {showHelp && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-[200]">
          <div className="w-[400px] border-2 border-[#1d2d5a] bg-[#eef3f7] font-['Tahoma'] text-[11px] text-[#1d2d5a]">
            <div className="bg-[#1d2d5a] text-white px-[10px] py-[5px] font-bold flex justify-between items-center">
              <span>HELP — PARTS MASTER ENTRY</span>
              <button onClick={() => setShowHelp(false)} className="text-white font-bold hover:text-yellow-300">✕</button>
            </div>
            <div className="p-[14px] space-y-[6px]">
              <div className="font-bold underline mb-[8px]">BUTTON FUNCTIONS</div>
              <div><span className="font-bold w-[70px] inline-block">ADD</span> — Save a new part record</div>
              <div><span className="font-bold w-[70px] inline-block">EDIT</span> — Update selected part record</div>
              <div><span className="font-bold w-[70px] inline-block">DELETE</span> — Remove selected part record</div>
              <div><span className="font-bold w-[70px] inline-block">FIRST</span> — Go to first record</div>
              <div><span className="font-bold w-[70px] inline-block">&lt;&lt;PREV</span> — Go to previous record</div>
              <div><span className="font-bold w-[70px] inline-block">NEXT&gt;&gt;</span> — Go to next record</div>
              <div><span className="font-bold w-[70px] inline-block">LAST</span> — Go to last record</div>
              <div><span className="font-bold w-[70px] inline-block">CLOSE</span> — Clear / reset the form</div>
              <div className="font-bold underline mt-[10px] mb-[6px]">PRICE FIELDS</div>
              <div>Enter LIST price and DISC % — FINAL price is auto-calculated.</div>
              <div className="font-bold underline mt-[10px] mb-[6px]">MULTIPLE MODELS</div>
              <div>Check MULTIPLE MODELS then click MULTY-MODELS to assign more than one model to a part.</div>
            </div>
            <div className="px-[14px] pb-[12px] flex justify-end">
              <button onClick={() => setShowHelp(false)} className="h-[28px] px-[20px] border border-[#596c7b] bg-[#d4d4d4] font-bold hover:bg-[#b8b8b8]">CLOSE</button>
            </div>
          </div>
        </div>
      )}

      {/* ── MULTI-MODEL PICKER MODAL ── */}
      {showMultiModel && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-[200]">
          <div className="w-[320px] border-2 border-[#1d2d5a] bg-[#eef3f7] font-['Tahoma'] text-[11px] text-[#1d2d5a]">
            <div className="bg-[#1d2d5a] text-white px-[10px] py-[5px] font-bold flex justify-between items-center">
              <span>SELECT MODELS</span>
              <button onClick={() => setShowMultiModel(false)} className="text-white font-bold hover:text-yellow-300">✕</button>
            </div>
            <div className="p-[12px]">
              <div className="text-[10px] text-[#444] mb-[8px]">Select all applicable models for this part:</div>
              <div className="border border-[#9caab7] bg-white p-[8px] space-y-[6px] max-h-[200px] overflow-y-auto">
                {models.map((m) => (
                  <label key={m.id} className="flex items-center gap-[8px] cursor-pointer hover:bg-[#e8f4ff] px-[4px] py-[2px]">
                    <input
                      type="checkbox"
                      checked={selectedModels.includes(m.code)}
                      onChange={() => toggleModelSelection(m.code)}
                    />
                    <span>
                      {m.code} - {m.name}
                    </span>
                  </label>
                ))}
              </div>
              <div className="mt-[8px] text-[10px] text-[#1d2d5a]">
                Selected: <span className="font-bold">{selectedModels.join(', ') || 'None'}</span>
              </div>
            </div>
            <div className="px-[12px] pb-[12px] flex gap-[8px] justify-end">
              <button
                onClick={() => setShowMultiModel(false)}
                className="h-[28px] px-[16px] border border-[#596c7b] bg-[#b8ffb8] font-bold hover:bg-[#90ee90]"
              >
                OK
              </button>
              <button
                onClick={() => { setSelectedModels([]); setShowMultiModel(false); }}
                className="h-[28px] px-[16px] border border-[#596c7b] bg-[#d4d4d4] font-bold hover:bg-[#b8b8b8]"
              >
                CLEAR
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}