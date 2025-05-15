import React from 'react'
import SignupForm from './Compnents/SinnupForm'
import {BrowserRouter,Route ,Routes } from "react-router-dom"
import LoginForm from './Compnents/LoginForm'
import Home from './Compnents/Home'
import UploadTask from './Compnents/Uploadtask'
import Assignment from './Compnents/Assignment'
function App() {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path='/signup' element={<SignupForm/>}></Route>
          <Route path='/login' element={<LoginForm/>}></Route>
          <Route path='/home' element={<Home/>}></Route>
          <Route path="/upload-task" element={<UploadTask />} />
          <Route path="/assignment-upload" element={<Assignment/>} />
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App
