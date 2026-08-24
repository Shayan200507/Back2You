

import './App.css'
import { BrowserRouter, Routes, Route } from "react-router";

import SingupPage from "./Signup/Signup.tsx"

function App() {


  return (
    <>

    <BrowserRouter>
    <Routes>
      <Route path = "/" element={<SingupPage />} />
    </Routes>
    </BrowserRouter>

   
    </>
  )
}

export default App
