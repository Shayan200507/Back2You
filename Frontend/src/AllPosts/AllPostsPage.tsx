import { useNavigate } from "react-router"
import SharedHeader from "../Components/SharedHeader"
import UserPosts from "../Home/UserPosts"

function AllPostsPage() {
    const navigate = useNavigate()

    return (
        <div className="min-h-dvh bg-gray-200">
            <SharedHeader>
                <button type="button" onClick={() => navigate("/home")} className="rounded-md bg-gray-800 px-4 py-1 text-sm font-medium text-white hover:bg-gray-700">Home</button>
            </SharedHeader>
            <main className="mx-auto max-w-7xl p-6">
                <h1 className="text-2xl font-semibold text-gray-800">All your posts</h1>
                <UserPosts showAll />
            </main>
        </div>
    )
}

export default AllPostsPage
