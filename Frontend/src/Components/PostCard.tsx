import { useState } from "react"
import { useNavigate } from "react-router"

export type Post = {
    id: number
    userId: number | null
    imageUrls: string[]
    itemName: string
    postType: "LOST" | "FOUND"
}

type PostCardProps = {
    post: Post
}

function PostCard({ post }: PostCardProps) {
    const navigate = useNavigate()
    const [imageFailed, setImageFailed] = useState(false)
    const firstImage = post.imageUrls[0]

    return (
        <button type="button" onClick={() => navigate(`/postDetails/${post.id}`)} className="w-full cursor-pointer overflow-hidden rounded-lg border border-gray-200 bg-white text-left shadow-sm transition-transform duration-200 ease-in-out active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-800">
            {firstImage && !imageFailed ? (
                <img src={firstImage} alt={post.itemName} loading="lazy" onError={() => setImageFailed(true)} className="h-40 w-full object-cover" />
            ) : (
                <span className="flex h-40 items-center justify-center bg-gray-100 text-sm text-gray-500">No image available</span>
            )}
            <span className="flex flex-col items-start gap-2 p-4">
                <span className="w-full break-words text-base font-semibold text-gray-800">{post.itemName}</span>
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${post.postType === "LOST" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                    {post.postType === "LOST" ? "Lost" : "Found"}
                </span>
            </span>
        </button>
    )
}

export default PostCard

