import axios from "axios"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router"

import PostCard, { type Post } from "../Components/PostCard"

function UserPosts({ showAll = false }: { showAll?: boolean }) {
    const navigate = useNavigate()
    const [posts, setPosts] = useState<Post[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState("")

    useEffect(() => {
        const token = localStorage.getItem("token")
        if (!token) {
            navigate("/", { replace: true })
            return
        }
        const controller = new AbortController()
        const getUserPosts = async () => {
            try {
                const response = await axios.get<Post[]>("http://localhost:8080/api/v1/posts/get-user-posts", {
                    headers: { Authorization: `Bearer ${token}` },
                    signal: controller.signal
                })
                if (!controller.signal.aborted) setPosts(response.data)
            } catch (requestError) {
                if (controller.signal.aborted) return
                if (axios.isAxiosError(requestError) && requestError.response?.status === 401) {
                    localStorage.removeItem("token")
                    navigate("/", { replace: true })
                    return
                }
                if (!controller.signal.aborted) setError("Could not load your posts. Please refresh to try again.")
            } finally {
                if (!controller.signal.aborted) setIsLoading(false)
            }
        }

        void getUserPosts()
        return () => controller.abort()
    }, [navigate])

    return (
        <section aria-labelledby="user-posts-heading" className="mt-8 rounded-xl bg-white/90 p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <h2 id="user-posts-heading" className="text-xl font-semibold text-gray-800">Your posts</h2>
                {!showAll && (
                    <button type="button" onClick={() => navigate("/allPosts")} className="rounded-md bg-gray-800 px-4 py-2 text-sm font-medium text-white transition-transform duration-200 ease-in-out hover:bg-gray-700 active:scale-95">See all posts</button>
                )}
            </div>
            {isLoading ? (
                <p role="status" className="text-sm text-gray-600">Loading your posts...</p>
            ) : error ? (
                <p role="alert" className="text-sm text-red-600">{error}</p>
            ) : posts.length === 0 ? (
                <p className="text-sm text-gray-600">You haven't posted any items yet.</p>
            ) : (
                <div tabIndex={showAll ? undefined : 0} role="region" aria-label={showAll ? "All your posts" : "Your posts, scroll horizontally to see more"} className={showAll ? "grid grid-cols-1 items-start gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5" : "grid grid-flow-col auto-cols-[220px] gap-4 overflow-x-auto pb-2 xl:auto-cols-[calc((100%-4rem)/5)]"}>
                    {(showAll ? posts : posts.slice(0, 5)).map(post => <PostCard key={post.id} post={post} />)}
                </div>
            )}
        </section>
    )
}

export default UserPosts

