import axios from "axios"
import { useState } from "react"
import { useNavigate } from "react-router"
import SharedHeader from "../../Components/SharedHeader"

type LoginFormType = {
    email: string
    password: string
}

type LoginResponse = {
    token: string
}

function SignupHeader(){
    const navigate = useNavigate()
    const [warning, setWarning] = useState<string>("")
    
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
    const [loginFormData, setLoginFormData] = useState<LoginFormType>({
        email: "",
        password: ""
    })

    const loginInputStyles = "rounded-md border border-gray-300 px-3 py-1 text-sm outline-none focus:border-gray-500"

    const handleLogin = async (submittedFormData: FormData) => {
        setWarning("")
        setIsSubmitting(true)

        try {
            const response = await axios.post<LoginResponse>("http://localhost:8080/api/v1/auth/login", {
                email: submittedFormData.get("email"),
                password: submittedFormData.get("password")
            })

            const data: LoginResponse = response.data
           
            localStorage.setItem("token", data.token)
            navigate("/home")
        } catch (error) {
            if (axios.isAxiosError(error)) {
                setWarning(error.response?.data || "Login failed")
            } else {
                setWarning("Login failed")
            }
        } finally {
            setIsSubmitting(false)
        }
    }

    return(
        <SharedHeader>
        <form className="flex items-center gap-2" action={handleLogin}>

                
                <div className="text-sm text-red-600">{warning}</div>
         
                <input type="email" name="email" className={loginInputStyles} placeholder="Email" value={loginFormData.email} onChange={(event) => setLoginFormData((prev:LoginFormType) => { return {...prev, email: event.target.value}} )} required />

                <input type="password" name="password" className={loginInputStyles} placeholder="Password" value={loginFormData.password} onChange={(event) => setLoginFormData((prev:LoginFormType) => { return {...prev, password: event.target.value}} )} required />

                <button type="submit" disabled={isSubmitting} className="rounded-md bg-gray-800 px-4 py-1 text-sm font-medium text-white hover:bg-gray-700 disabled:cursor-not-allowed disabled:bg-gray-500  ">
                    {isSubmitting ? "Logging in..." : "Login"}
                </button>



        </form>
        </SharedHeader>
    )

}


export default SignupHeader 
