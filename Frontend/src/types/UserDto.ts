export type UserDto = {
    id: number
    firstname: string
    lastname: string
    universityName: string
    email: string
    role: "USER" | "ADMIN"
}
