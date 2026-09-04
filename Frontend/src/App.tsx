

import './App.css'
import { BrowserRouter, Routes, Route } from "react-router";

import HomePage from "./Home/HomePage.tsx"
import SingupPage from "./Signup/Signup.tsx"

function App() {


  return (
    <>

    <BrowserRouter>
    <Routes>
      <Route path = "/" element={<SingupPage />} />
      <Route path = "/home" element={<HomePage />} />
    </Routes>
    </BrowserRouter>

   
    </>
  )
}

export default App
