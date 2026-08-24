
import { useState } from "react"

type FormType = {

   dob: string
   email: string
   username: string
   First_Name: string
   Last_Name: string


}

function RegisterCard(){

    const [warning] = useState<string>("")
    const [formData,setformData] = useState<FormType>({

   dob: "",
   email: "",
   username: "",
   First_Name: "",
   Last_Name: ""
})

    const inputStyles = "rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-gray-500"
    const labelStyles = "text-sm font-medium text-gray-700"



    return(

        <div className="flex items-center justify-evenly">



        <div className="mt-[10px] w-[360px] rounded-lg bg-white p-6 shadow-sm">

        <h1 className="text-2xl font-semibold text-gray-800">Signup Today!</h1>

        <form className="mt-5 flex flex-col gap-3">


            <label htmlFor="dob" className={labelStyles}>Date of birth:</label>
            <input id="dob" type="date" name="dob" className={inputStyles} value={formData.dob} onChange={(event) => setformData((prev:FormType) => { return {...prev,dob: event.target.value}} )} required/>

            
            <label htmlFor="First_Name" className={labelStyles}>Name:</label>
            <input id="First_Name" type="text" name="First_Name" className={inputStyles} placeholder="First Name" value={formData.First_Name}  onChange={(event) => setformData((prev:FormType) => { return {...prev, First_Name: event.target.value}} )}      required />
            
            
            <input type="text" name="Last_Name" className={inputStyles} placeholder="Last Name"  value={formData.Last_Name}  onChange={(event) => setformData((prev:FormType) => { return {...prev, Last_Name: event.target.value}} )}   required />
            


            <label htmlFor="email" className={labelStyles}>Email address:</label>
            <input id="email" type="email" name="email" className={inputStyles} placeholder="...@email.com" value={formData.email}  onChange={(event) => setformData((prev:FormType) => { return {...prev, email: event.target.value}} )}       required />


            <label htmlFor="username" className={labelStyles}>Username:</label>

            <input id="username" type="text" name="username" className={inputStyles} placeholder="Username"  pattern="^[a-zA-Z0-9_\-]{1,20}$" 
            title="Username must be 1–20 characters and can only include letters, numbers, underscores (_), or hyphens (-)."  
            
            value={formData.username}
            onChange={(event) => setformData((prev:FormType) => { return {...prev, username: event.target.value}} )}
            
            
            
            
            required />



            <label htmlFor="password" className={labelStyles}>Password:</label>

            <input id="password" type="password" name="password" className={inputStyles} placeholder="Password" pattern="^\S{8,}$" title="no spaces allowed in the password and length must be 8 characters"  required />

                
        
            <input type="password" name="retypedPassword" className={inputStyles} placeholder="Retype Password" pattern="^\S{8,}$" title="no spaces allowed"  required />
        


            <button type="submit" className="mt-2 rounded-md bg-gray-800 px-4 py-2 font-medium text-white hover:bg-gray-700">Submit</button>



        </form>

        <div className="mt-3 text-sm text-red-600"><h1>{warning}</h1></div>












        </div>
        </div>
        




    )











}


export default RegisterCard
