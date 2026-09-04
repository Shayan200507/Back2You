
import axios from "axios"
import { useEffect } from "react"
import { useNavigate } from "react-router"
import SignupHeader from "./Components/SignupHeader"
import RegisterCard from "./Components/RegisterCard"


function SingupPage(){

    const navigate = useNavigate()

    useEffect(() => {
        const token = localStorage.getItem("token")

        if (!token) {
            return
        }

        const checkCurrentUser = async () => {
            try {
                await axios.get("http://localhost:8080/api/v1/users/me", {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                })

                navigate("/home")
            } catch {
                localStorage.removeItem("token")
            }
        }

        checkCurrentUser()
    }, [navigate])

    return(

        <>
        <div className="min-h-dvh w-full bg-gray-200 flex flex-col">
            <SignupHeader />


            <div className="flex flex-1 items-center justify-center">
                <RegisterCard />
            </div>

            
                  

        </div>
        
        
        
        </>



    )

    



}

export default SingupPage
