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
// import MentorPortal from './Compnents/Mentor/MentorPortal'
import MentorHome from './Compnents/MentorPortal/MentorHome'
import Task from './Compnents/MentorPortal/Task/Task'
import MentorAssignment from './Compnents/MentorPortal/MentorAssignment/MentorAssignment'
import ContactMentee from './Compnents/MentorPortal/ContactMentee/ContactMentee'
import AdminLogin from './Compnents/AdminPanel/Login/AdminLogin'
import AssignPage from './Compnents/AdminPanel/AdminHome/AssignPage'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AddMentor from './Compnents/AdminPanel/AddMentor/AddMentor'
import AddMentee from './Compnents/AdminPanel/AddMentee/AddMentee'
import AllUsers from './Compnents/AdminPanel/AllUsers/AllUsers'
import AdminAccountRequests from './Compnents/AdminPanel/AdminAccountRequest/AdminAccountRequests'
import ChatApp from './Compnents/ChatBox/ChatBox'
import MentorKanban from './Compnents/MentorPortal/Kanban/MentorKanban'
import TaskDetailPage from './Compnents/TaskDetail/TaskDetailPage'
import MentorTaskDetailPage from './Compnents/MentorTaskDetailPage/MentorTaskDetailPage'
import MentorAssignmentDetail from './Compnents/MentorPortal/MentorAssignmentDetails/MentorAssignmentDetails'

function App() {
  return (
    <div>
      <BrowserRouter>
      <ToastContainer />

        <Routes>
        <Route path="*" element={<h2 style={{ textAlign: 'center', marginTop: '50px' }}>404 - Page Not Found</h2>} />
          <Route path='/' element={<Navigate to="/login"/>}/>


          <Route path='/signup' element={<SignupForm/>}></Route>
          <Route path='/login' element={<LoginForm/>}></Route>
          <Route path='/home' element={<Home/>}></Route>
          <Route path="/upload-task" element={<UploadTask />} />
          <Route path="/assignment-upload" element={<Assignment/>} />
          <Route path="/mentee/kanban" element={<ViewRecords />} />
          <Route path="/timeline" element={<Timeline/>} />
          <Route path='/details/:id' element={<TaskDetails/>}/>
          <Route path='/contact-mentor' element={<ContactMentor/>}/>
          <Route path='/analysis' element={<Analysis/>}/>
         


          {/* mentors */}
          <Route path="/kanban" element={<MentorKanban/> } />
      

          <Route path="/mentor/home" element={<MentorHome />} />
          <Route path="/mentor/task" element={<Task/>}/>
          <Route path="/mentor/assignment" element={<MentorAssignment/>}/>
          <Route path="/contant-mentee" element={<ContactMentee/>}/>

          { /* Admin panel */}
          <Route path='/admin/login' element={<AdminLogin/>}/>
          <Route path='/admin/dashboard' element={<AssignPage/>}/>


          { /*  admin pannel add users that is mentor and mentee  */ }
          <Route path='/admin/add/mentor' element={<AddMentor/>} />
          <Route path='/admin/add/mentee' element={<AddMentee/>}/>

          { /* List all users */ }
          <Route path='/admin/all/users' element={<AllUsers/>}/>


          { /* Password requests */}
          <Route path='/admin/user/add/requests' element={<AdminAccountRequests/>}/>


          {/* Chat page  */}
        <Route path="/chat" element={<ChatApp userEmail={localStorage.getItem("userEmail")} />} />



        {/* Task details */}
        <Route path="/task/:id" element={<TaskDetailPage   />} />


        {/*  Task detail for mentor task detail  */}
        <Route path="/mentor/tasks/:id" element={<MentorTaskDetailPage/>} />


        {/* Assignment details for mentor view  */}
        <Route path="/mentor/assignments/:id" element={<MentorAssignmentDetail />} />

        </Routes>



        
       
      </BrowserRouter>
    </div>
  )
}

export default App