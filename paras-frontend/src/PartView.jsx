import { useState, useEffect } from 'react';

export default function PartsView() {
  const [parts, setParts] = useState([

  ]);

  const [selectedIndex, setSelectedIndex] = useState(null);

  const [formData, setFormData] = useState({
    brand: '',
    partNo: '',
    description: '',
    model: '',
    hsn: '',
    gst: '',
  });

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };
  useEffect(() => {
    fetchParts();
  }, []);

  const fetchParts = async () => {
    try {
      const response = await fetch('/api/parts');

      if (!response.ok) {
        throw new Error('Failed to fetch parts');
      }

      const data = await response.json();

      setParts(data);

    } catch (error) {
      console.log('Error fetching parts:', error);
    }
  };

  const handleAdd = async () => {
    if (!formData.partNo) return;

    try {
      const response = await fetch('/api/parts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },

        body: JSON.stringify({
          brand: formData.brand || '',
          partNo: formData.partNo || '',
          description: formData.description || '',
          model: formData.model || '',
          hsn: formData.hsn || '',
          gst: formData.gst || '',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save part');
      }

      const savedPart = await response.json();

      setParts((prev) => [...prev, savedPart]);

      setFormData({
        brand: '',
        partNo: '',
        description: '',
        model: '',
        hsn: '',
        gst: '',
      });

    } catch (error) {
      console.log('Error saving part:', error);
    }
  };
  const handleEdit = async () => {
    if (selectedIndex === null) return;

    try {
      const selectedPart = parts[selectedIndex];

      const response = await fetch(`/api/parts/${selectedPart.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },

        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to update part');
      }

      const updatedPart = await response.json();

      const updated = [...parts];

      updated[selectedIndex] = updatedPart;

      setParts(updated);

    } catch (error) {
      console.log(error);
    }
  };

  const handleDelete = async () => {
    if (selectedIndex === null) return;

    try {
      const selectedPart = parts[selectedIndex];

      await fetch(`/api/parts/${selectedPart.id}`, {
        method: 'DELETE',
      });

      const updated = parts.filter((_, i) => i !== selectedIndex);

      setParts(updated);

      setSelectedIndex(null);

    } catch (error) {
      console.log(error);
    }
  };

  const handleSelect = (item, index) => {
    setSelectedIndex(index);

    setFormData({
      brand: item.brand || '',
      partNo: item.partNo || '',
      description: item.description || '',
      model: item.model || '',
      hsn: item.hsn || '',
      gst: item.gst || '',
    });
  };

  return (
    <div
      className="
        w-[1280px]
        h-[720px]
        bg-[#dfe8ef]
        p-[6px]
        text-[11px]
        text-[#1d2d5a]
        font-['Tahoma']
        overflow-hidden
        mt-[10px]
        ml-[10px]
        scale-[0.93]
        origin-top-left
      "
    >
      {/* HEADER */}
      <div className="h-[26px] border border-[#9caab7] bg-[#eef3f7] flex items-center px-[8px]">
        <div className="w-[180px]">Part Master Entry</div>

        <div className="w-[180px] text-center">
          05-05-2026 (TUESDAY)
        </div>

        <div className="w-[220px] text-center">
          PARAS AUTO PARTS
        </div>

        <div>(OPER)</div>
      </div>

      {/* TITLE */}
      <div className="h-[32px] flex items-center pl-[10px] text-[16px] tracking-[1px] text-[#2d3fa5] underline font-bold">
        PARTS - DETAILS
      </div>

      {/* MAIN */}
      <div className="flex h-[545px] border border-[#aab7c3] bg-[#c9e7fb]">
        {/* LEFT */}
        <div className="w-[665px] border-r border-[#8da4b5] bg-[#abd7f3] p-[10px]">
          {/* FORM */}
          <div className="grid grid-cols-[85px_120px_1fr] gap-y-[6px] items-center">
            <label className="text-[#2b4594]">BRAND</label>

            <input
              value={formData.brand}
              onChange={(e) => handleChange('brand', e.target.value)}
              className="h-[20px] border border-[#6e7d88] bg-white px-[4px] text-[11px] outline-none"
            />

            <div className="pl-[8px] text-red-600 font-bold">
              AAR-VEE
            </div>

            <label className="text-[#2b4594]">PART NO.</label>

            <input
              value={formData.partNo}
              onChange={(e) => handleChange('partNo', e.target.value)}
              className="h-[20px] border border-[#6e7d88] bg-white px-[4px] text-[11px] outline-none"
            />

            <div />

            <label className="text-[#2b4594]">DESC.</label>

            <input
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              className="col-span-2 h-[20px] border border-[#6e7d88] bg-white px-[4px] text-[11px] outline-none"
            />

            <label className="text-[#2b4594]">MODEL NO.</label>

            <input
              value={formData.model}
              onChange={(e) => handleChange('model', e.target.value)}
              className="h-[20px] w-[90px] border border-[#6e7d88] bg-white px-[4px] text-[11px] outline-none"
            />

            <div className="flex items-center gap-[12px]">
              <div className="flex items-center gap-[4px]">
                <input type="checkbox" />

                <span className="font-bold text-[#2b4594]">
                  MULTIPLE MODELS
                </span>
              </div>

              <button className="h-[24px] border border-[#6e7d88] bg-[#d4d4d4] px-[10px] text-[11px] font-bold">
                MULTY - MODELS
              </button>
            </div>
          </div>

          {/* HSN */}
          <div className="mt-[8px] border border-[#89a7bd] bg-[#59c0ef] p-[8px]">
            <div className="grid grid-cols-[80px_100px_1fr_50px_40px] gap-[8px] items-center">
              <label>HSN CODE</label>

              <input
                value={formData.hsn}
                onChange={(e) => handleChange('hsn', e.target.value)}
                className="h-[20px] border border-[#6e7d88] bg-white px-[4px]"
              />

              <div />

              <label>GST %</label>

              <input
                value={formData.gst}
                onChange={(e) => handleChange('gst', e.target.value)}
                className="h-[20px] border border-[#6e7d88] bg-white px-[4px]"
              />
            </div>

            <div className="mt-[8px] grid grid-cols-[80px_1fr] gap-[8px] items-center">
              <label>HSN DESC</label>

              <input className="h-[20px] border border-[#6e7d88] bg-white px-[4px]" />
            </div>
          </div>

          {/* PRICE AREA */}
          <div className="mt-[8px] h-[212px] border border-[#7d9eb7] bg-[#7ec4ea] flex">
            {['PURCHASE PRICE', 'WHOLE SALE PRICE', 'RETAIL SALE'].map(
              (title, index) => (
                <div
                  key={title}
                  className={`w-1/3 px-[10px] pt-[8px] ${index !== 2
                    ? 'border-r border-[#6e8ea8]'
                    : ''
                    }`}
                >
                  <div className="text-center underline text-[12px] font-bold mb-[14px]">
                    {title}
                  </div>

                  <div className="mb-[18px]">
                    <div className="mb-[3px]">LIST</div>

                    <input className="h-[20px] w-[72px] border border-[#6e7d88] bg-white px-[4px]" />
                  </div>

                  <div className="mb-[18px]">
                    <div className="mb-[3px]">DISC %</div>

                    <input className="h-[20px] w-[72px] border border-[#6e7d88] bg-white px-[4px]" />
                  </div>

                  <div>
                    <div className="mb-[3px]">
                      {index === 0
                        ? 'PUR. NET'
                        : index === 1
                          ? 'SAL. NET'
                          : 'RS. NET'}
                    </div>

                    <input className="h-[20px] w-[72px] border border-[#6e7d88] bg-white px-[4px]" />
                  </div>
                </div>
              )
            )}
          </div>

          {/* LOWER */}
          <div className="mt-[10px] grid grid-cols-3 gap-x-[14px] gap-y-[8px]">
            {[
              'OPENING',
              'RE-ORDER',
              'MAX. LVL',
              'ITEM UNIT',
              'PACK OF',
              'LOCATION-I',
            ].map((field) => (
              <div key={field}>
                <div className="mb-[2px]">{field}</div>

                <input className="h-[20px] w-full border border-[#6e7d88] bg-white px-[4px]" />
              </div>
            ))}
          </div>

          <div className="mt-[8px]">
            <div className="mb-[2px]">REMARKS</div>

            <input className="h-[20px] w-full border border-[#6e7d88] bg-white px-[4px]" />
          </div>
        </div>

        {/* RIGHT */}
        <div className="w-[635px] bg-[#d4edf9] p-[6px]">
          {/* TABLE */}
          <div className="h-[470px] border border-[#677d8c] overflow-y-scroll bg-white">
            <table className="w-full border-collapse text-[11px]">
              <thead className="bg-[#7fc6ea] text-[11px] sticky top-0">
                <tr className="h-[20px]">
                  <th className="border border-[#758896] px-[4px] py-[1px] text-left">
                    Brnd
                  </th>

                  <th className="border border-[#758896] px-[4px] py-[1px] text-left">
                    Part Description
                  </th>

                  <th className="border border-[#758896] px-[4px] py-[1px] text-left">
                    Model
                  </th>

                  <th className="border border-[#758896] px-[4px] py-[1px] text-left">
                    Part No.
                  </th>
                </tr>
              </thead>

              <tbody>
                {parts.map((item, index) => (
                  <tr
                    key={index}
                    onClick={() => handleSelect(item, index)}
                    className={`h-[18px] cursor-pointer ${selectedIndex === index
                      ? 'bg-[#c5e6ff]'
                      : 'bg-white'
                      }`}
                  >
                    <td className="border border-[#758896] px-[4px] py-[1px]">
                      {item.brand}
                    </td>

                    <td className="border border-[#758896] px-[4px] py-[1px]">
                      {item.description}
                    </td>

                    <td className="border border-[#758896] px-[4px] py-[1px]">
                      {item.model}
                    </td>

                    <td className="border border-[#758896] px-[4px] py-[1px]">
                      {item.partNo}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* FAST SEARCH */}
          <div className="mt-[6px] border-t border-[#8ca3b5] pt-[4px]">
            <div className="text-[16px] text-[#2e46a5] font-bold mb-[4px]">
              FAST - SEARCH -&gt;
            </div>

            <div className="grid grid-cols-4 gap-[6px]">
              <input
                placeholder="BRAND"
                className="h-[20px] border border-[#6e7d88] bg-white px-[4px]"
              />

              <input
                placeholder="PART NO."
                className="h-[20px] border border-[#6e7d88] bg-white px-[4px]"
              />

              <input
                placeholder="MODEL"
                className="h-[20px] border border-[#6e7d88] bg-white px-[4px]"
              />

              <input
                placeholder="DESCRIPTION"
                className="h-[20px] border border-[#6e7d88] bg-white px-[4px]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* BUTTON PANEL */}
      <div className="mt-[10px] ml-[2px] w-[330px] border border-[#6d8ca3] bg-[#8fd4ff] p-[8px]">
        <div className="grid grid-cols-4 gap-[5px]">
          <button
            onClick={handleAdd}
            className="h-[30px] border border-[#596c7b] bg-[#f5f5f5] text-[11px] font-bold"
          >
            ADD
          </button>

          <button
            onClick={handleEdit}
            className="h-[30px] border border-[#596c7b] bg-[#f5f5f5] text-[11px] font-bold"
          >
            EDIT
          </button>

          <button
            onClick={handleDelete}
            className="h-[30px] border border-[#596c7b] bg-[#f5f5f5] text-[11px] font-bold"
          >
            DELETE
          </button>

          <button className="h-[30px] border border-[#596c7b] bg-[#b8ffb8] text-[11px] font-bold">
            HELP
          </button>
        </div>

        <div className="mt-[5px] grid grid-cols-5 gap-[5px]">
          <button className="h-[28px] border border-[#596c7b] bg-[#f5f5f5] text-[11px] font-bold">
            FIRST
          </button>

          <button className="h-[28px] border border-[#596c7b] bg-[#f5f5f5] text-[11px] font-bold">
            {'<<PREV'}
          </button>

          <button className="h-[28px] border border-[#596c7b] bg-[#f5f5f5] text-[11px] font-bold">
            {'NEXT>>'}
          </button>

          <button className="h-[28px] border border-[#596c7b] bg-[#f5f5f5] text-[11px] font-bold">
            LAST
          </button>

          <button className="h-[28px] border border-[#7a0000] bg-[#ff1f1f] text-white text-[11px] font-bold">
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
}