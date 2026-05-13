import { useEffect, useState } from 'react'

export default function BrandMaster() {

    const [brands, setBrands] = useState([])

    const [selectedBrand, setSelectedBrand] =
        useState(null)

    const [formData, setFormData] = useState({
        code: '',
        name: ''
    })

    useEffect(() => {

        fetchBrands()

    }, [])

    const fetchBrands = async () => {

        try {

            const response =
                await fetch('/api/brands')

            const data = await response.json()

            setBrands(data)

        } catch (error) {

            console.log(error)

        }
    }

    const resetForm = () => {

        setFormData({
            code: '',
            name: ''
        })

        setSelectedBrand(null)
    }

    const handleAdd = async () => {

        if (!formData.code.trim()) {

            alert('Brand code required')

            return
        }

        if (formData.code.length > 3) {

            alert(
                'Brand code max 3 characters'
            )

            return
        }

        const alreadyExists = brands.some(
            (b) =>
                b.code.toUpperCase() ===
                formData.code.toUpperCase()
        )

        if (alreadyExists) {

            alert('Brand code already exists')

            return
        }

        if (!formData.name.trim()) {

            alert('Brand name required')

            return
        }

        try {

            await fetch('/api/brands', {

                method: 'POST',

                headers: {
                    'Content-Type':
                        'application/json'
                },

                body: JSON.stringify(formData)

            })

            fetchBrands()

            resetForm()

        } catch (error) {

            console.log(error)

        }
    }

    const handleEdit = async () => {

        if (!selectedBrand) {

            alert('Select Brand')

            return
        }

        try {

            await fetch(
                `/api/brands/${selectedBrand.id}`,
                {

                    method: 'PUT',

                    headers: {
                        'Content-Type':
                            'application/json'
                    },

                    body: JSON.stringify(formData)

                }
            )

            fetchBrands()

            resetForm()

        } catch (error) {

            console.log(error)

        }
    }

    const handleDelete = async () => {

        if (!selectedBrand) {

            alert('Select Brand')

            return
        }

        try {

            await fetch(
                `/api/brands/${selectedBrand.id}`,
                {
                    method: 'DELETE'
                }
            )

            fetchBrands()

            resetForm()

        } catch (error) {

            console.log(error)

        }
    }

    const handleSelect = (brand) => {

        setSelectedBrand(brand)

        setFormData({
            code: brand.code || '',
            name: brand.name || ''
        })
    }

    return (

        <div
            className="
        w-screen
        h-screen
        bg-[#dfe8ef]
        p-[8px]
        font-['Tahoma']
        text-[11px]
        overflow-hidden
      "
        >

            {/* HEADER */}

            <div
                className="
          h-[30px]
          border
          border-[#8fa2b5]
          bg-[#eef3f7]
          flex
          items-center
          px-[10px]
          font-bold
          text-[#1d2d5a]
        "
            >
                BRAND MASTER
            </div>

            {/* MAIN WINDOW */}

            <div
                className="
          mt-[6px]
          h-[620px]
          border
          border-[#9caab7]
          bg-[#cfe8ff]
          flex
        "
            >

                {/* LEFT PANEL */}

                <div
                    className="
            w-[38%]
            border-r
            border-[#9caab7]
            p-[14px]
            flex
            flex-col
          "
                >

                    {/* BRAND CODE */}

                    <div className="mb-[18px]">

                        <div
                            className="
                mb-[5px]
                font-bold
                text-[#1d2d5a]
              "
                        >
                            BRAND CODE
                        </div>

                        <input
                            maxLength={3}
                            value={formData.code}
                            onChange={(e) => {

                                const value =
                                    e.target.value
                                        .toUpperCase()
                                        .replace(
                                            /[^A-Z]/g,
                                            ''
                                        )

                                setFormData({
                                    ...formData,
                                    code: value
                                })
                            }}
                            className="
                w-[130px]
                h-[30px]
                border
                border-[#6f7f8f]
                bg-white
                px-[6px]
                uppercase
                font-bold
              "
                        />

                    </div>

                    {/* BRAND NAME */}

                    <div className="mb-[24px]">

                        <div
                            className="
                mb-[5px]
                font-bold
                text-[#1d2d5a]
              "
                        >
                            BRAND NAME
                        </div>

                        <input
                            value={formData.name}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    name: e.target.value
                                })
                            }
                            className="
                w-full
                h-[32px]
                border
                border-[#6f7f8f]
                bg-white
                px-[6px]
              "
                        />

                    </div>

                    {/* BUTTONS */}

                    <div
                        className="
              flex
              flex-wrap
              gap-[8px]
            "
                    >

                        <button
                            onClick={handleAdd}
                            className="
                w-[90px]
                h-[36px]
                border
                border-[#5b6c7b]
                bg-[#edf1f5]
                font-bold
              "
                        >
                            ADD
                        </button>

                        <button
                            onClick={handleEdit}
                            className="
                w-[90px]
                h-[36px]
                border
                border-[#5b6c7b]
                bg-[#edf1f5]
                font-bold
              "
                        >
                            EDIT
                        </button>

                        <button
                            onClick={handleDelete}
                            className="
                w-[90px]
                h-[36px]
                border
                border-[#a94444]
                bg-[#ffe3e3]
                text-red-700
                font-bold
              "
                        >
                            DELETE
                        </button>

                        <button
                            onClick={() => {
                                window.location.href = '/'
                            }}
                            className="
                w-[90px]
                h-[36px]
                border
                border-[#466a99]
                bg-[#dbe8ff]
                text-[#1d2d5a]
                font-bold
              "
                        >
                            RETURN
                        </button>

                    </div>

                </div>

                {/* RIGHT PANEL */}

                <div
                    className="
            w-[62%]
            bg-white
            overflow-y-auto
          "
                >

                    <table
                        className="
              w-full
              border-collapse
              text-[12px]
            "
                    >

                        <thead
                            className="
                sticky
                top-0
                bg-[#7fb9e3]
              "
                        >

                            <tr>

                                <th
                                    className="
                    border
                    border-[#8ea0b1]
                    px-[6px]
                    py-[6px]
                    text-left
                  "
                                >
                                    CODE
                                </th>

                                <th
                                    className="
                    border
                    border-[#8ea0b1]
                    px-[6px]
                    py-[6px]
                    text-left
                  "
                                >
                                    BRAND NAME
                                </th>

                            </tr>

                        </thead>

                        <tbody>

                            {brands.map((brand) => (

                                <tr
                                    key={brand.id}
                                    onClick={() =>
                                        handleSelect(brand)
                                    }
                                    className="
                    cursor-pointer
                    hover:bg-[#dbeeff]
                  "
                                >

                                    <td
                                        className="
                      border
                      border-[#b7c4cf]
                      px-[6px]
                      py-[5px]
                      font-bold
                    "
                                    >
                                        {brand.code}
                                    </td>

                                    <td
                                        className="
                      border
                      border-[#b7c4cf]
                      px-[6px]
                      py-[5px]
                    "
                                    >
                                        {brand.name}
                                    </td>

                                </tr>

                            ))}

                        </tbody>

                    </table>

                </div>

            </div>

        </div>
    )
}