import logo from "../../assets/back2you-logo-transparent.png"





function SignupHeader(){

    return(<>

    <header className="w-full h-[50px] bg-white flex items-center ">
       
        <div className="flex items-center ml-[8px]">
        <img src={logo} alt="" className="w-[40px]" />
        <h1 className="font-system-ui font-medium">Back2You</h1>
        </div>




    </header >
    
    </>)

}


export default SignupHeader 