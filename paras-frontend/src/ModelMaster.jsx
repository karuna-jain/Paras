import { useEffect, useState } from 'react'

export default function ModelMaster() {

    const [models, setModels] = useState([])

    const [selectedModel, setSelectedModel] =
        useState(null)

    const [formData, setFormData] = useState({
        code: '',
        name: ''
    })

    useEffect(() => {

        fetchModels()

    }, [])

    const fetchModels = async () => {

        try {

            const response =
                await fetch('/api/models')

            const data = await response.json()

            setModels(data)

        } catch (error) {

            console.log(error)

        }
    }

    const resetForm = () => {

        setFormData({
            code: '',
            name: ''
        })

        setSelectedModel(null)
    }

    const handleAdd = async () => {

        if (!formData.code.trim()) {

            alert('Model code required')

            return
        }

        if (!formData.name.trim()) {

            alert('Model name required')

            return
        }

        const alreadyExists = models.some(
            (m) =>
                m.code.toUpperCase() ===
                formData.code.toUpperCase()
        )

        if (alreadyExists) {

            alert('Model code already exists')

            return
        }

        try {

            await fetch('/api/models', {

                method: 'POST',

                headers: {
                    'Content-Type':
                        'application/json'
                },

                body: JSON.stringify(formData)

            })

            fetchModels()

            resetForm()

        } catch (error) {

            console.log(error)

        }
    }

    const handleEdit = async () => {

        if (!selectedModel) {

            alert('Select Model')

            return
        }

        try {

            await fetch(
                `/api/models/${selectedModel.id}`,
                {

                    method: 'PUT',

                    headers: {
                        'Content-Type':
                            'application/json'
                    },

                    body: JSON.stringify(formData)

                }
            )

            fetchModels()

            resetForm()

        } catch (error) {

            console.log(error)

        }
    }

    const handleDelete = async () => {

        if (!selectedModel) {

            alert('Select Model')

            return
        }

        try {

            await fetch(
                `/api/models/${selectedModel.id}`,
                {
                    method: 'DELETE'
                }
            )

            fetchModels()

            resetForm()

        } catch (error) {

            console.log(error)

        }
    }

    const handleSelect = (model) => {

        setSelectedModel(model)

        setFormData({
            code: model.code || '',
            name: model.name || ''
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
                MODEL MASTER
            </div>

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

                {/* LEFT */}

                <div
                    className="
            w-[38%]
            border-r
            border-[#9caab7]
            p-[14px]
          "
                >

                    <div className="mb-[18px]">

                        <div className="mb-[5px] font-bold">
                            MODEL CODE
                        </div>

                        <input
                            value={formData.code}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    code: e.target.value
                                })
                            }
                            className="
                w-[140px]
                h-[30px]
                border
                border-[#6f7f8f]
                bg-white
                px-[6px]
              "
                        />

                    </div>

                    <div className="mb-[22px]">

                        <div className="mb-[5px] font-bold">
                            MODEL NAME
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

                    <div className="flex gap-[8px] flex-wrap">

                        <button
                            onClick={handleAdd}
                            className="
                w-[90px]
                h-[36px]
                border
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
                bg-[#dbe8ff]
                font-bold
              "
                        >
                            RETURN
                        </button>

                    </div>

                </div>

                {/* RIGHT */}

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

                        <thead className="bg-[#7fb9e3]">

                            <tr>

                                <th className="border px-[6px] py-[6px] text-left">
                                    CODE
                                </th>

                                <th className="border px-[6px] py-[6px] text-left">
                                    MODEL NAME
                                </th>

                            </tr>

                        </thead>

                        <tbody>

                            {models.map((model) => (

                                <tr
                                    key={model.id}
                                    onClick={() =>
                                        handleSelect(model)
                                    }
                                    className="
                    cursor-pointer
                    hover:bg-[#dbeeff]
                  "
                                >

                                    <td className="border px-[6px] py-[5px]">
                                        {model.code}
                                    </td>

                                    <td className="border px-[6px] py-[5px]">
                                        {model.name}
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