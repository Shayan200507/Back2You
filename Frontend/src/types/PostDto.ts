import type { Post } from "../Components/PostCard"

export type PostDto = Post & {
    itemDescription: string
    date: string | null
    location: string | null
    securityQuestions: string[]
}
