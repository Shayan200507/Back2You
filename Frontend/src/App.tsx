

import './App.css'
import { BrowserRouter, Routes, Route } from "react-router";

import HomePage from "./Home/HomePage.tsx"
import SingupPage from "./Signup/Signup.tsx"
import CreatePostPage from "./CreatePost/CreatePostPage"
import BrowsePage from "./Browse/BrowsePage"
import LostPostPage from "./LostPost/LostPostPage"
import FoundPostPage from "./FoundPost/FoundPostPage"

function App() {


  return (
    <>

    <BrowserRouter>
    <Routes>
      <Route path = "/" element={<SingupPage />} />
      <Route path = "/home" element={<HomePage />} />
      <Route path = "/createPost" element={<CreatePostPage />} />
      <Route path = "/browse" element={<BrowsePage />} />
      <Route path = "/lostPost" element={<LostPostPage />} />
      <Route path = "/foundPost" element={<FoundPostPage />} />
    </Routes>
    </BrowserRouter>

   
    </>
  )
}

export default App
