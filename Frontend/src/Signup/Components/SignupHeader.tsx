import logo from "../../assets/back2you-logo-transparent.png"
import { useState } from "react"


function SignupHeader(){
        const [warning] = useState<string>("")
    const loginInputStyles = "rounded-md border border-gray-300 px-3 py-1 text-sm outline-none focus:border-gray-500"

    return(<>

    <header className="w-full h-[50px] bg-white flex items-center justify-between ">
       
        <div className="flex items-center ml-[8px]">
        <img src={logo} alt="" className="w-[40px]" />
        <h1 className="font-system-ui font-medium">Back2You</h1>
        </div>


        <div className="flex  items-center mr-[20px]">
            
        <form className="flex items-center gap-2">

                
                <div className="text-sm text-red-600">{warning}</div>
                <input type="text" name="username" className={loginInputStyles} placeholder="Username" required />

                <input type="password" name="password" className={loginInputStyles} placeholder="Password" required />

                <button type="submit" className="rounded-md bg-gray-800 px-4 py-1 text-sm font-medium text-white hover:bg-gray-700">Login</button>



        </form>

        </div>




    </header >
    
    </>)

}


export default SignupHeader 
