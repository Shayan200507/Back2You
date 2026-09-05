import axios from "axios"
import { useEffect } from "react"
import { useNavigate } from "react-router"
import SharedHeader from "../Components/SharedHeader"

function BrowsePage() {
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
        <div className="min-h-dvh w-full bg-gray-200">
            <SharedHeader>
                <button type="button" onClick={() => navigate("/home")} className="rounded-md bg-gray-800 px-4 py-1 text-sm font-medium text-white hover:bg-gray-700 transition-transform ease-in-out duration-200 active:scale-95">
                    Back
                </button>
            </SharedHeader>
        </div>
    )
}

export default BrowsePage
