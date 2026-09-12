


import axios from "axios"
import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router"
import SharedHeader from "../Components/SharedHeader"
import type { PostDto } from "../types/PostDto"

import type { UserDto } from "../types/UserDto"

function PostDetails() {
    const { postId } = useParams<{ postId: string }>()
    const navigate = useNavigate()
    const [user, setUser] = useState<UserDto | null>(null)
    const [post, setPost] = useState<PostDto | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState("")
    const [isDeleting, setIsDeleting] = useState(false)
    const [deleteError, setDeleteError] = useState("")
    const [isResolving, setIsResolving] = useState(false)
    const [resolveError, setResolveError] = useState("")





    const handleResolve = async () => {
        if (!user || !post || post.userId !== user.id || post.postType === "RESOLVED" || isResolving || isDeleting) return
        const token = localStorage.getItem("token")
        if (!token) {
            navigate("/", { replace: true })
            return
        }
        setIsResolving(true)
        setResolveError("")
        try {
            await axios.patch("http://localhost:8080/api/v1/posts/resolved-post", null, {
                params: { postId: post.id },
                headers: { Authorization: `Bearer ${token}` }
            })
            setPost(current => current?.id === post.id ? { ...current, postType: "RESOLVED" } : current)
        } catch (requestError) {
            if (axios.isAxiosError(requestError) && requestError.response?.status === 401) {
                localStorage.removeItem("token")
                navigate("/", { replace: true })
                return
            }
            setResolveError("Could not resolve the post. Please try again.")
        } finally {
            setIsResolving(false)
        }
    }

    const handleDelete = async () => {
        if (!user || !post || post.userId !== user.id || isDeleting || isResolving) return
        const token = localStorage.getItem("token")
        if (!token) {
            navigate("/", { replace: true })
            return
        }

        setIsDeleting(true)
        setDeleteError("")
        try {
            await axios.delete(`http://localhost:8080/api/v1/posts/${post.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            navigate("/home", { replace: true })
        } catch (requestError) {
            let message = "Could not delete the post. Please try again."
            if (axios.isAxiosError(requestError)) {
                if (requestError.response?.status === 401) {
                    localStorage.removeItem("token")
                    navigate("/", { replace: true })
                    return
                }
                const data: unknown = requestError.response?.data
                if (typeof data === "string" && data.trim()) {
                    message = data
                } else if (data && typeof data === "object") {
                    const body = data as Record<string, unknown>
                    const serverMessage = [body.detail, body.message, body.error].find(
                        value => typeof value === "string" && value.trim()
                    )
                    if (typeof serverMessage === "string") message = serverMessage
                }
            }
            setDeleteError(message)
        } finally {
            setIsDeleting(false)
        }
    }

    useEffect(() => {
        const token = localStorage.getItem("token")
        if (!token) {
            navigate("/", { replace: true })
            return
        }

        const controller = new AbortController()
        const loadDetails = async () => {
            setIsLoading(true)
            setError("")
            setDeleteError("")
            setResolveError("")
            setUser(null)
            setPost(null)
            const config = {
                headers: { Authorization: `Bearer ${token}` },
                signal: controller.signal
            }

            try {
                const userResponse = await axios.get<UserDto>("http://localhost:8080/api/v1/users/me", config)
                if (controller.signal.aborted) return
                setUser(userResponse.data)

                if (!postId || !/^\d+$/.test(postId) || !Number.isSafeInteger(Number(postId)) || Number(postId) < 1) {
                    setError("Invalid post ID.")
                    return
                }

                const postResponse = await axios.get<PostDto>(`http://localhost:8080/api/v1/posts/${postId}`, config)
                if (!controller.signal.aborted) setPost(postResponse.data)
            } catch (requestError) {
                if (controller.signal.aborted) return
                const status = axios.isAxiosError(requestError) ? requestError.response?.status : undefined
                if (status === 401) {
                    localStorage.removeItem("token")
                    navigate("/", { replace: true })
                    return
                }
                setError(status === 404 ? "The user or post could not be found."
                    : status === 403 ? "You do not have permission to view this post."
                    : "Could not load the post details. Please refresh to try again.")
            } finally {
                if (!controller.signal.aborted) setIsLoading(false)
            }
        }

        void loadDetails()
        return () => controller.abort()
    }, [postId, navigate])

    return (
        <div className="min-h-dvh bg-gray-200">
            <SharedHeader>
                <button type="button" onClick={() => navigate("/home")} className="cursor-pointer rounded-lg bg-gray-800 px-4 py-1.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-gray-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-800">Home</button>
            </SharedHeader>
            <main className="mx-auto max-w-2xl p-6">
                <section className="rounded-xl bg-white p-6 shadow-sm">
                    {isLoading ? <p role="status">Loading post details...</p>
                        : error ? <p role="alert" className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>
                        : user && post ? (
                            <div className="flex flex-col gap-4">
                                <h1 className="break-words text-2xl font-semibold text-gray-800">{post.itemName}</h1>
                                {(post.postType === "RESOLVED") && <p className="self-start rounded-full bg-gray-700 px-3 py-1 text-sm font-medium text-white">Resolved</p>}
                                <p className="text-sm font-medium text-gray-600">{post.postType === "RESOLVED" ? "Resolved" : post.postType === "LOST" ? "Lost" : "Found"}{post.userId === user.id ? " · Your post" : ""}</p>
                                {post.imageUrls.length > 0 && (
                                    <div className="flex flex-wrap gap-3">
                                        {post.imageUrls.map((url, index) => <img key={url} src={url} alt={`${post.itemName}, photo ${index + 1}`} className="h-48 w-full rounded-md bg-gray-100 object-contain sm:w-60" />)}
                                    </div>
                                )}
                                <p className="whitespace-pre-wrap break-words text-gray-700">{post.itemDescription}</p>
                                <p className="text-sm text-gray-600">Location: {post.location || "Not provided"}</p>
                                <p className="text-sm text-gray-600">Date: {post.date || "Not provided"}</p>
                                {(post.postType === "FOUND" || (post.postType === "RESOLVED" && post.securityQuestions.length > 0)) && (
                                    <section className="rounded-md border border-gray-200 bg-gray-50 p-4">
                                        <h2 className="text-base font-semibold text-gray-800">Security questions</h2>
                                        {post.securityQuestions.length > 0 ? (
                                            <ol className="mt-2 list-decimal space-y-2 pl-5 text-sm text-gray-700">
                                                {post.securityQuestions.map((question, index) => (
                                                    <li key={index} className="whitespace-pre-wrap break-words">{question}</li>
                                                ))}
                                            </ol>
                                        ) : (
                                            <p className="mt-2 text-sm text-gray-500">No security questions provided.</p>
                                        )}
                                    </section>
                                )}
                                {post.userId === user.id && (
                                    <div className="mt-2 flex flex-wrap items-center gap-3 border-t border-gray-100 pt-5">
                                        {resolveError && <p role="alert" className="w-full rounded-md bg-red-50 p-3 text-sm text-red-700">{resolveError}</p>}
                                        {post.postType !== "RESOLVED" && (
                                            <button type="button" onClick={handleResolve} disabled={isResolving || isDeleting} className="inline-flex h-11 w-36 shrink-0 items-center justify-center cursor-pointer rounded-lg border border-transparent bg-green-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-green-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-700 disabled:cursor-not-allowed disabled:opacity-60">
                                                {isResolving ? "Resolving..." : "Resolve post"}
                                            </button>
                                        )}
                                        {deleteError && <p role="alert" className="w-full rounded-md bg-red-50 p-3 text-sm text-red-700">{deleteError}</p>}
                                        <button type="button" onClick={handleDelete} disabled={isDeleting || isResolving} className="inline-flex h-11 w-36 shrink-0 items-center justify-center cursor-pointer rounded-lg border border-red-200 bg-red-50 px-5 py-2.5 text-sm font-semibold text-red-700 shadow-sm transition-colors hover:bg-red-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 disabled:cursor-not-allowed disabled:opacity-60">
                                            {isDeleting ? "Deleting..." : "Delete post"}
                                        </button>

                                        {<button
                                                        type="button"
                                                        className="inline-flex h-11 w-36 shrink-0 items-center justify-center cursor-pointer rounded-lg border border-transparent bg-gray-800 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-gray-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-800"
                                                        onClick={() => navigate(`/Claim/${post.id}`)}
                                                    >
                                                        Claim
                                                    </button>}

                                    </div>
                                )}

                            </div>
                        ) : null}
                </section>
            </main>
        </div>
    )
}



export default PostDetails
