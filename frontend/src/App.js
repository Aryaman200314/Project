import React from 'react'
import SignupForm from './Compnents/SinnupForm'
import {BrowserRouter,Navigate,Route ,Routes } from "react-router-dom"
import LoginForm from './Compnents/LoginForm'
import Home from './Compnents/Home'
import UploadTask from './Compnents/Uploadtask'
import Assignment from './Compnents/Assignment'
import ViewRecords from './Compnents/ViewRecords'
import Timeline from './Compnents/Timeline'
import TaskDetails from './Compnents/TaskDetails'
import ContactMentor from './Compnents/ContactMentor'
import Analysis from './Compnents/Analysis/Analysis'
import MentorPortal from './Compnents/Mentor/MentorPortal'
import MentorHome from './Compnents/MentorPortal/MentorHome'
import Task from './Compnents/MentorPortal/Task/Task'
import MentorAssignment from './Compnents/MentorPortal/MentorAssignment/MentorAssignment'
import ContactMentee from './Compnents/MentorPortal/ContactMentee/ContactMentee'
import AdminLogin from './Compnents/Admin panel/Login/AdminLogin'
import AssignPage from './Compnents/Admin panel/AdminHome/AssignPage'
function App() {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Navigate to="/login"/>}/>


          <Route path='/signup' element={<SignupForm/>}></Route>
          <Route path='/login' element={<LoginForm/>}></Route>
          <Route path='/home' element={<Home/>}></Route>
          <Route path="/upload-task" element={<UploadTask />} />
          <Route path="/assignment-upload" element={<Assignment/>} />
          <Route path="/view-records" element={<ViewRecords />} />
          <Route path="/timeline" element={<Timeline/>} />
          <Route path='/details/:id' element={<TaskDetails/>}/>
          <Route path='/contact-mentor' element={<ContactMentor/>}/>
          <Route path='/analysis' element={<Analysis/>}/>
         


          {/* mentors */}
          <Route path="/mentor/approve" element={<MentorPortal />} />
      

          <Route path="/mentor/home" element={<MentorHome />} />
          <Route path="/mentor/task" element={<Task/>}/>
          <Route path="/mentor/assignment" element={<MentorAssignment/>}/>
          <Route path="/contant-mentee" element={<ContactMentee/>}/>

          { /* Admin panel */}
          <Route path='/admin/login' element={<AdminLogin/>}/>
          <Route path='/admin/dashboard' element={<AssignPage/>}/>



        </Routes>


       
      </BrowserRouter>
    </div>
  )
}

export default App
