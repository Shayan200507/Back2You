import axios from "axios"
import { useCallback, useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router"
import SharedHeader from "../Components/SharedHeader"
import defaultProfilePic from "../assets/default-profile.svg"
import homeBackground from "../assets/home-background.png"

type Role = "USER" | "ADMIN"

type UserDto = {
    id: number
    firstname: string
    lastname: string
    universityName: string
    email: string
    role: Role
}

function HomePage(){

    const navigate = useNavigate()
    const [user, setUser] = useState<UserDto | null>(null)
    const [profileImageUrl, setProfileImageUrl] = useState<string>("")
    const [profileImageFile, setProfileImageFile] = useState<File | null>(null)
    const [isUploadingProfileImage, setIsUploadingProfileImage] = useState<boolean>(false)
    const selectedProfileImageUrl = useMemo(() => {
        if (!profileImageFile) {
            return ""
        }

        return URL.createObjectURL(profileImageFile)
    }, [profileImageFile])

    const handleLogout = useCallback(() => {
        localStorage.removeItem("token")
        navigate("/")
    }, [navigate])

    const handleProfileImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0] || null
        setProfileImageFile(file)
    }

    const handleConfirmProfileImage = async () => {
        const token = localStorage.getItem("token")

        if (!token) {
            handleLogout()
            return
        }

        if (!profileImageFile) {
            return
        }

        const uploadFormData = new FormData()
        uploadFormData.append("file", profileImageFile)
        setIsUploadingProfileImage(true)

        try {
            await axios.post("http://localhost:8080/api/v1/users/post-profile-image", uploadFormData, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })

            const profileImageResponse = await axios.get<Blob>("http://localhost:8080/api/v1/users/profile-image", {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                responseType: "blob"
            })

            const imageUrl = URL.createObjectURL(profileImageResponse.data)
            setProfileImageUrl(imageUrl)
            setProfileImageFile(null)
        } catch {
            setProfileImageFile(null)
        } finally {
            setIsUploadingProfileImage(false)
        }
    }

    useEffect(() => {
        const token = localStorage.getItem("token")

        if (!token) {
            handleLogout()
            return
        }

        const getCurrentUser = async () => {
            try {
                const response = await axios.get<UserDto>("http://localhost:8080/api/v1/users/me", {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                })

                const data: UserDto = response.data
                setUser(data)
            } catch {
                handleLogout()
                return
            }

            try {
                const profileImageResponse = await axios.get<Blob>("http://localhost:8080/api/v1/users/profile-image", {
                    headers: {
                        Authorization: `Bearer ${token}`
                    },
                    responseType: "blob"
                })

                const imageUrl = URL.createObjectURL(profileImageResponse.data)
                setProfileImageUrl(imageUrl)
            } catch {
                setProfileImageUrl("")
            }
        }

        getCurrentUser()
    }, [handleLogout])

    useEffect(() => {
        return () => {
            if (profileImageUrl) {
                URL.revokeObjectURL(profileImageUrl)
            }
        }
    }, [profileImageUrl])

    useEffect(() => {
        return () => {
            if (selectedProfileImageUrl) {
                URL.revokeObjectURL(selectedProfileImageUrl)
            }
        }
    }, [selectedProfileImageUrl])

    return(
        <div className="min-h-dvh w-full bg-gray-200 bg-cover bg-center bg-no-repeat" style={{backgroundImage: `url(${homeBackground})`}}>
            <SharedHeader>
                <button type="button" onClick={handleLogout} className="rounded-md bg-gray-800 px-4 py-1 text-sm font-medium text-white hover:bg-gray-700">
                    Logout
                </button>
            </SharedHeader>

            <main className="p-6">
                <div className="flex items-center justify-between gap-6">
                    <div className="flex flex-col items-start gap-[25px]">
                   
                    <label className="relative h-24 w-24 cursor-pointer rounded-full transition-transform duration-200 ease-in-out hover:scale-105 active:scale-95">
                        <img src={selectedProfileImageUrl || profileImageUrl || defaultProfilePic} alt="" className="h-full w-full rounded-full object-cover" />
                        <input type="file" accept="image/*" onChange={handleProfileImageChange} className="absolute inset-0 h-full w-full cursor-pointer rounded-full opacity-0" />
                    </label>
                    {profileImageFile && (
                        <button type="button" onClick={handleConfirmProfileImage} disabled={isUploadingProfileImage} className="rounded-md bg-gray-800 px-4 py-1 text-sm font-medium text-white hover:bg-gray-700 disabled:cursor-not-allowed disabled:bg-gray-500">
                            {isUploadingProfileImage ? "Uploading..." : "Confirm"}
                        </button>
                    )}
                    
                    <div className="flex items-center gap-4">
                        <div className="flex flex-col items-start gap-1 text-gray-800">
                            {user && <h1 className="text-2xl font-semibold">Hello, {user.firstname}</h1>}
                            <p className="text-sm font-semibold text-gray-600">Find what's lost. Help it get back.</p>
                            <p className="text-xs text-gray-500">Browse recent lost and found items or report something new.</p>
                        </div>
                    </div>
                    </div>

                    <div className="flex items-center justify-end gap-8 mt-[20px]">
                        <button type="button" className="flex min-w-[240px] items-center justify-center gap-3 rounded-md bg-gray-800 px-5 py-3 text-left text-sm font-semibold text-white transition-transform duration-200 ease-in-out hover:bg-gray-700 active:scale-95">
                            <span className="text-lg">+</span>
                            <span className="flex flex-col gap-1">
                                <span>Report an Item</span>
                                <span className="text-xs font-normal text-gray-300">Lost or found something?</span>
                            </span>
                        </button>

                        <button type="button" className="flex min-w-[240px] items-center justify-center gap-3 rounded-md border border-gray-200 bg-white px-5 py-3 text-left text-sm font-semibold text-gray-800 shadow-sm transition-transform duration-200 ease-in-out hover:bg-gray-50 active:scale-95">
                            <span className="text-lg">?</span>
                            <span className="flex flex-col gap-1">
                                <span>Browse Posts</span>
                                <span className="text-xs font-normal text-gray-500">See new Posts</span>
                            </span>
                        </button>
                    </div>
                </div>
            </main>
        </div>
    )

}

export default HomePage
