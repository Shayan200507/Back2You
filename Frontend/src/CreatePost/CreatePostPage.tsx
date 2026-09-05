import axios from "axios"
import { useEffect } from "react"
import { useNavigate } from "react-router"
import SharedHeader from "../Components/SharedHeader"

function CreatePostPage() {
    const navigate = useNavigate()

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
        <div className="flex min-h-dvh w-full flex-col bg-gray-200">
            <SharedHeader>
                <button type="button" onClick={() => navigate("/home")} className="rounded-md bg-gray-800 px-4 py-1 text-sm font-medium text-white hover:bg-gray-700">
                    Back
                </button>
            </SharedHeader>
            <main className="flex flex-1 flex-col items-center justify-center gap-6 p-6 sm:flex-row">
                <button type="button" onClick={() => navigate("/foundPost")} className="min-h-[150px] max-h-[150px] w-full max-w-[300px] rounded-xl bg-gray-800 px-8 py-8 text-2xl font-semibold text-white hover:bg-gray-700  transition-transform ease-in-out duration-200 active:scale-95">
                    <span className="block">Found Posts</span>
                    <span className="mt-2 block text-sm font-normal text-gray-300">Found an item? Help it get home.</span>
                </button>
                <button type="button" onClick={() => navigate("/lostPost")} className="min-h-[150px] max-h-[150px] w-full max-w-[300px] rounded-xl bg-gray-800 px-8 py-8 text-2xl font-semibold text-white hover:bg-gray-700 transition-transform ease-in-out duration-200 active:scale-95">
                    <span className="block">Lost Posts</span>
                    <span className="mt-2 block text-sm font-normal text-gray-300">Lost an item? Let others help you find it.</span>
                </button>
            </main>
        </div>
    )
}

export default CreatePostPage
