import axios from "axios"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router"
import SharedHeader from "../Components/SharedHeader"
import PostCard, { type Post } from "../Components/PostCard"

const postEndpoints = {
    resolved: "ResolvedPosts",
    found: "FoundPosts",
    lost: "LostPosts"
}

type PostType = keyof typeof postEndpoints

function BrowsePage() {
    const navigate = useNavigate()
    const [page, setPage] = useState<number>(0)
    const [postType, setPostType] = useState<PostType>("found")
    const [posts, setPosts] = useState<Post[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState("")
    const [hasMore, setHasMore] = useState(true)
    const [retryCount, setRetryCount] = useState(0)

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

    useEffect(() => {
        const token = localStorage.getItem("token")
        if (!token) return

        const controller = new AbortController()

        const fetchPosts = async () => {
            setIsLoading(true)
            setError("")

            try {
                const response = await axios.get<Post[]>(`http://localhost:8080/api/v1/posts/${postEndpoints[postType]}`, {
                    headers: { Authorization: `Bearer ${token}` },
                    params: { page },
                    signal: controller.signal
                })

                if (!controller.signal.aborted) {
                    setPosts(previousPosts => page === 0 ? response.data : [...previousPosts, ...response.data])
                    setHasMore(response.data.length === 10)
                }
            } catch (requestError) {
                if (controller.signal.aborted || axios.isCancel(requestError)) return
                setError("Could not load posts. Please try again.")
            } finally {
                if (!controller.signal.aborted) setIsLoading(false)
            }
        }

        void fetchPosts()
        return () => controller.abort()
    }, [postType, page, retryCount])

    return (
        <div className="min-h-dvh w-full bg-gray-200">
            <SharedHeader>
                <button type="button" onClick={() => navigate("/home")} className="rounded-md bg-gray-800 px-4 py-1 text-sm font-medium text-white hover:bg-gray-700 transition-transform ease-in-out duration-200 active:scale-95">
                    Back
                </button>
            </SharedHeader>
            <main className="p-6">
                <label htmlFor="post-type" className="mb-2 block text-sm font-semibold text-gray-800">
                    Post type
                </label>
                <select id="post-type" name="postType" value={postType} onChange={(event) => {
                    setPostType(event.target.value as PostType)
                    setPage(0)
                    setPosts([])
                    setHasMore(true)
                    setError("")
                    setIsLoading(true)
                }} className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500">
                    <option value="found">Found</option>
                    <option value="resolved">Resolved</option>
                    <option value="lost">Lost</option>
                </select>
                <div className="mt-6">
                    {posts.length > 0 && (
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                            {posts.map(post => <PostCard key={post.id} post={post} />)}
                        </div>
                    )}
                    {isLoading && <p role="status" className="mt-4 text-sm text-gray-600">Loading posts...</p>}
                    {error && <p role="alert" className="mt-4 text-sm text-red-600">{error}</p>}
                    {!isLoading && !error && posts.length === 0 && (
                        <p className="text-sm text-gray-600">No posts found.</p>
                    )}
                    {(error || (posts.length > 0 && hasMore)) && (
                        <button type="button" disabled={isLoading} onClick={() => {
                            setIsLoading(true)
                            if (error) {
                                setRetryCount(previousCount => previousCount + 1)
                            } else {
                                setPage(previousPage => previousPage + 1)
                            }
                        }} className="mt-6 rounded-md bg-gray-800 px-5 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50">
                            {isLoading ? "Loading..." : error ? "Try again" : "Load more"}
                        </button>
                    )}
                </div>
            </main>
        </div>
    )
}

export default BrowsePage
