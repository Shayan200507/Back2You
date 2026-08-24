


import SignupHeader from "./Components/SignupHeader"
import RegisterCard from "./Components/RegisterCard"


function SingupPage(){

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
