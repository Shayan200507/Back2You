import axios from "axios"
import { useState } from "react"
import { useNavigate } from "react-router"

type FormType = {
   dob: string
   email: string
   First_Name: string
   Last_Name: string
   University_Name: string
   password: string
   retypedPassword: string
}

type RegisterResponse = {
    token: string
}

function RegisterCard(){

    const navigate = useNavigate()
    const [warning, setWarning] = useState<string>("")
   
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
    const [formData,setformData] = useState<FormType>({
        dob: "",
        email: "",
        First_Name: "",
        Last_Name: "",
        University_Name: "",
        password: "",
        retypedPassword: ""
    })

    const inputStyles = "rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-gray-500"
    const labelStyles = "text-sm font-medium text-gray-700"

    const handleRegister = async (submittedFormData: FormData) => {
        setWarning("")

        const password = String(submittedFormData.get("password") || "")
        const retypedPassword = String(submittedFormData.get("retypedPassword") || "")
        const firstname = String(submittedFormData.get("First_Name") || "")
        const lastname = String(submittedFormData.get("Last_Name") || "")
        const email = String(submittedFormData.get("email") || "")
        const universityName = String(submittedFormData.get("University_Name") || "")
        const birthDate = String(submittedFormData.get("dob") || "")

        if (password !== retypedPassword) {
            setWarning("Passwords do not match")
            setformData(formData => ({
                ...formData,
                password: "",
                retypedPassword: ""
                }))
            return
        }

        setIsSubmitting(true)

        try {
            const response = await axios.post<RegisterResponse>("http://localhost:8080/api/v1/auth/register", {
                firstname,
                lastname,
                email,
                universityName,
                birthDate,
                password
            })

            const data: RegisterResponse = response.data
        
            localStorage.setItem("token",data.token)
            navigate("/home")
            
        } catch (error) {
            if (axios.isAxiosError(error)) {
                setWarning(error.response?.data || "Registration failed")
            } else {
                setWarning("Registration failed")
            }
        } finally {
            setIsSubmitting(false)
        }
    }



    return(

        <div className="flex items-center justify-evenly">



        <div className="mt-[10px] w-[360px] rounded-lg bg-white p-6 shadow-sm">

        <h1 className="text-2xl font-semibold text-gray-800">Signup Today!</h1>

        <form className="mt-5 flex flex-col gap-3" action={handleRegister}>


            <label htmlFor="dob" className={labelStyles}>Date of birth:</label>
            <input id="dob" type="date" name="dob" className={inputStyles} value={formData.dob} onChange={(event) => setformData((prev:FormType) => { return {...prev,dob: event.target.value}} )} required/>

            
            <label htmlFor="First_Name" className={labelStyles}>Name:</label>
            <input id="First_Name" type="text" name="First_Name" className={inputStyles} placeholder="First Name" value={formData.First_Name}  onChange={(event) => setformData((prev:FormType) => { return {...prev, First_Name: event.target.value}} )} required />
            
            
            <input type="text" name="Last_Name" className={inputStyles} placeholder="Last Name" value={formData.Last_Name} onChange={(event) => setformData((prev:FormType) => { return {...prev, Last_Name: event.target.value}} )} required />

            <label htmlFor="University_Name" className={labelStyles}>University name:</label>
            <input id="University_Name" type="text" name="University_Name" className={inputStyles} placeholder="University Name" value={formData.University_Name} onChange={(event) => setformData((prev:FormType) => { return {...prev, University_Name: event.target.value}} )} required />
            


            <label htmlFor="email" className={labelStyles}>Email address:</label>
            <input id="email" type="email" name="email" className={inputStyles} placeholder="...@email.com" value={formData.email} onChange={(event) => setformData((prev:FormType) => { return {...prev, email: event.target.value}} )} required />


            <label htmlFor="password" className={labelStyles}>Password:</label>

            <input id="password" type="password" name="password" className={inputStyles} placeholder="Password" pattern="^\S{8,}$" title="no spaces allowed in the password and length must be 8 characters" value={formData.password} onChange={(event) => setformData((prev:FormType) => { return {...prev, password: event.target.value}} )} required />

                
        
            <input type="password" name="retypedPassword" className={inputStyles} placeholder="Retype Password" pattern="^\S{8,}$" title="no spaces allowed" value={formData.retypedPassword} onChange={(event) => setformData((prev:FormType) => { return {...prev, retypedPassword: event.target.value}} )} required />
        


            <button type="submit" disabled={isSubmitting} className="mt-2 rounded-md bg-gray-800 px-4 py-2 font-medium text-white hover:bg-gray-700 disabled:cursor-not-allowed disabled:bg-gray-500">
                {isSubmitting ? "Submitting..." : "Submit"}
            </button>



        </form>

        <div className="mt-3 text-sm text-red-600"><h1>{warning}</h1></div>
       












        </div>
        </div>
        




    )









}


export default RegisterCard
