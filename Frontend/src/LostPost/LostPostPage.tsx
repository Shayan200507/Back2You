import axios from "axios"
import { useCallback, useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router"
import SharedHeader from "../Components/SharedHeader"
import { useDropzone } from "react-dropzone"

type ItemPhoto = {
    id: string
    url: string
    file: File
}

type LostPostForm = {
    itemName: string
    itemDescription: string
    lostLocation: string
    dateLost: string
}

function MyDropzone({ onDrop }: { onDrop: (files: File[]) => void }) {
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { "image/*": [] },
        maxSize: 5 * 1024 * 1024
    })

    return (
        <div {...getRootProps({ role: "button", "aria-label": "Add item photos" })} className={`cursor-pointer rounded-md border-2 border-dashed p-6 text-center text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-gray-800 ${isDragActive ? "border-gray-800 bg-gray-100" : "border-gray-300 bg-gray-50 hover:border-gray-500 hover:bg-gray-100"}`}>
            <input {...getInputProps({ "aria-label": "Item photos" })} />
            <p className="text-gray-600">{isDragActive ? "Drop your photos here" : "Drag photos here, or click to choose (Max 3 Images)"}</p>
        </div>
    )
}

function LostPostPage() {
    const navigate = useNavigate()
    const [formData, setFormData] = useState<LostPostForm>({
        itemName: "",
        itemDescription: "",
        lostLocation: "",
        dateLost: ""
    })
    const [picList, setpicList] = useState<ItemPhoto[]>([])
    const imageUrls = useRef<string[]>([])







    const onDrop = useCallback((acceptedFiles: File[]) => {
        const remainingSlots = Math.max(0, 3 - imageUrls.current.length)
        const photos = acceptedFiles.slice(0, remainingSlots).map(file => ({
            id: crypto.randomUUID(),
            url: URL.createObjectURL(file),
            file
        }))


       


       

        
        imageUrls.current.push(...photos.map(photo => photo.url))
        setpicList(picList => [...picList, ...photos])
    }, [])

    const handleDeletePhoto = (id: string) => {
        const photoToDelete = picList.find(photo => photo.id === id)

        if (!photoToDelete) {
            return
        }

        const urlIndex = imageUrls.current.indexOf(photoToDelete.url)
        if (urlIndex !== -1) {
            imageUrls.current.splice(urlIndex, 1)
        }

        URL.revokeObjectURL(photoToDelete.url)
        setpicList(currentPictures => currentPictures.filter(photo => photo.id !== id))
    }

    const handleSubmit = () => {
        const submissionData = new FormData()

        submissionData.append("itemName", formData.itemName.trim())
        submissionData.append("itemDescription", formData.itemDescription.trim())
        submissionData.append("lostLocation", formData.lostLocation.trim())
        submissionData.append("dateLost", formData.dateLost)
        picList.forEach(photo => submissionData.append("photos", photo.file))

        console.log("Lost item submission:", submissionData, {
            ...formData,
            photos: picList.map(photo => photo.file)
        })
    }

    
    
    useEffect(() => {
        const urls = imageUrls.current
        return () => urls.forEach(url => URL.revokeObjectURL(url))
    }, [])
   
   
   
   
    useEffect(() => {
        const token = localStorage.getItem("token")

        if (!token) {
            navigate("/home", { replace: true })
            return
        }

        const controller = new AbortController()

        const checkCurrentUser = async () => {
            try {
                await axios.get("http://localhost:8080/api/v1/users/me", {
                    headers: { Authorization: `Bearer ${token}` },
                    signal: controller.signal
                })
            } catch {
                if (!controller.signal.aborted) {
                    navigate("/home", { replace: true })
                }
            }
        }

        void checkCurrentUser()
        return () => controller.abort()
    }, [navigate])

    return (
        <div className="min-h-dvh w-full bg-gray-200">
            <SharedHeader>
                <div className="flex items-center gap-3">
                    <button type="button" onClick={() => navigate("/home")} className="rounded-md bg-gray-800 px-4 py-1 text-sm font-medium text-white hover:bg-gray-700">
                        Home
                    </button>
                    <button type="button" onClick={() => navigate("/createPost")} className="rounded-md bg-gray-800 px-4 py-1 text-sm font-medium text-white hover:bg-gray-700">
                        Back
                    </button>
                </div>
            </SharedHeader>
            <main className="mx-auto w-full max-w-xl p-6">
                <form action={handleSubmit} className="flex flex-col gap-5 rounded-xl bg-white p-6 shadow-sm">
                    <h1 className="text-2xl font-semibold text-gray-800">Report a Lost Item</h1>

                    <div className="flex flex-col gap-2">
                        <p className="text-sm font-medium text-gray-800">Item photos <span className="font-normal text-gray-500">(optional)</span></p>
                        {picList.length < 3 ? <MyDropzone onDrop={onDrop} /> : null}
                        {picList.length > 0 && (
                            <div className="flex flex-wrap gap-3">
                                {picList.map((photo, index) => (
                                    <div key={photo.id} className="flex flex-col items-center gap-2">
                                        <img src={photo.url} alt={`Selected item photo ${index + 1}`} className="h-20 w-20 rounded-md border border-gray-200 object-cover" />
                                        <button type="button" onClick={() => handleDeletePhoto(photo.id)} className="rounded-md bg-red-600 px-3 py-1 text-xs font-medium text-white hover:bg-red-500">
                                            Delete
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col gap-2">
                        <label htmlFor="itemName" className="text-sm font-medium text-gray-800">Item name</label>
                        <input id="itemName" name="itemName" value={formData.itemName} onChange={(event) => { const value = event.target.value; setFormData(previous => ({ ...previous, itemName: value })) }} type="text" required placeholder="e.g. Black wallet" className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-800 focus:outline-none focus:ring-1 focus:ring-gray-800" />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label htmlFor="itemDescription" className="text-sm font-medium text-gray-800">Item description</label>
                        <textarea id="itemDescription" name="itemDescription" value={formData.itemDescription} onChange={(event) => { const value = event.target.value; setFormData(previous => ({ ...previous, itemDescription: value })) }} rows={3} required placeholder="Describe the item and any identifying details" className="w-full resize-y rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-800 focus:outline-none focus:ring-1 focus:ring-gray-800" />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label htmlFor="lostLocation" className="text-sm font-medium text-gray-800">Approximate lost location <span className="font-normal text-gray-500">(optional)</span></label>
                        <input id="lostLocation" name="lostLocation" value={formData.lostLocation} onChange={(event) => { const value = event.target.value; setFormData(previous => ({ ...previous, lostLocation: value })) }} type="text" placeholder="e.g. Near the library" className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-800 focus:outline-none focus:ring-1 focus:ring-gray-800" />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label htmlFor="dateLost" className="text-sm font-medium text-gray-800">Approximate date lost <span className="font-normal text-gray-500">(optional)</span></label>
                        <input id="dateLost" name="dateLost" value={formData.dateLost} onChange={(event) => { const value = event.target.value; setFormData(previous => ({ ...previous, dateLost: value })) }} type="date" className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-800 focus:outline-none focus:ring-1 focus:ring-gray-800" />
                    </div>

                    {formData.itemName.trim() && formData.itemDescription.trim() ? (
                        <button type="submit" className="rounded-md bg-gray-800 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700">
                            Submit Lost Item
                        </button>
                    ) : null}
                </form>
            </main>
        </div>
    )
}

export default LostPostPage
