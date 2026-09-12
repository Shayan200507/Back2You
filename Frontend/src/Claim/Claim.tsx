
import { useParams } from "react-router"
import SharedHeader from "../Components/SharedHeader"
import { useEffect,useState } from "react"
import { useNavigate } from "react-router"
import type {PostDto} from "../types/PostDto"
import type { UserDto } from "../types/UserDto"

import axios from "axios"



function Claim(){

    const { postId } = useParams<{ postId: string }>()
    const navigate = useNavigate()
    const [postData,setPostData] = useState<PostDto>()
    const [userData,setUserData] = useState<UserDto>()
    const[Submitting,SetSubmitting] = useState<boolean>()
    const [securityResponses,setsecurityResponses] = useState<string[]>(Array(postData ? postData.securityQuestions.length: 0).fill(""))


    useEffect(()=>{
        
        
        const controller = new AbortController
        async function getPostDetails() {
            

            try{

                const token = localStorage.getItem("token")

                if (!token){ navigate("/",{ replace: true });return }
                


                const postResponse = await axios.get<PostDto>(`http://localhost:8080/api/v1/posts/${postId}`,{
                    signal: controller.signal,
                    headers: {
                    Authorization: `Bearer ${token}`
                    }

                })

                if(!controller.signal.aborted){
                    setPostData(postResponse.data)

                    
                }
                else{ return}

            }
            catch(requestError){

                  if (controller.signal.aborted) return
                const status = axios.isAxiosError(requestError) ? requestError.response?.status : undefined
                if (status === 401) {
                    localStorage.removeItem("token")
                    navigate("/", { replace: true })
                    return
                }
                

            }
            
        }


         void getPostDetails()


        return ()=>controller.abort()
    },[])





        useEffect(()=>{
        
        
        const controller = new AbortController
        async function getUserDetails() {
            

            try{

                const token = localStorage.getItem("token")

                if (!token){ navigate("/",{ replace: true });return }
                


                const userResponse = await axios.get<UserDto>(`http://localhost:8080/api/v1/users/me`,{
                    signal: controller.signal,
                    headers: {
                    Authorization: `Bearer ${token}`
                    }

                })

                if(!controller.signal.aborted){
                    setUserData(userResponse.data)

                    
                }
                else{ return}

            }
            catch(requestError){

                  if (controller.signal.aborted) return
                const status = axios.isAxiosError(requestError) ? requestError.response?.status : undefined
                if (status === 401) {
                    localStorage.removeItem("token")
                    navigate("/", { replace: true })
                    return
                }
                

            }
            
        }


         void getUserDetails()


        return ()=>controller.abort()
    },[])




    async function handleSubmit(params:type) {
        
    }








    return(
        <>

        <div className="flex min-h-dvh w-full flex-col bg-gray-200">
            <SharedHeader>
                 <button type="button" onClick={() => navigate(`/postDetails/${postData?.id}`)} className="rounded-md bg-gray-800 px-4 py-1 text-sm font-medium text-white hover:bg-gray-700">Back</button>
            </SharedHeader>


            <main className="flex items-center justify-center ">

                <form action={handleSubmit} className="flex flex-col gap-5 rounded-xl bg-white p-6 shadow-sm mt-[30px]">

                    <h1 className="text-2xl font-semibold text-gray-800">Submit a Claim</h1>



                    {postData?.securityQuestions.map((question,index)=>
                      <div className="flex flex-col gap-2">
                        <label htmlFor={`q${index}`} className="text-sm font-medium text-gray-800">{question}</label>
                        <input id={`q${index}`} name={`q${index}`} value={securityResponses.at(index)} onChange={(event) => { const value = event.target.value; setsecurityResponses(list => {const update = [...list]; update[index] = value; return update}) }} type="text" required placeholder="Answer" className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-800 focus:outline-none focus:ring-1 focus:ring-gray-800" />
                    </div>
                    )}







                    <button type="submit" disabled={Submitting} className="rounded-md bg-gray-800 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-60">{Submitting ? "Submitting..." : "Submit Claim"}</button>

                </form>





            </main>


        </div>

        </>
    )
}

export default Claim