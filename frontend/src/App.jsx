import { Routes, Route, Navigate, Outlet } from "react-router";
import Layout from './Layout';
import Course from './course';
import CourseDetail from './course/CoursDetail';
import TeacherList from './users/UserList';
import CourseEdit from './course/CourseEdit';
import './App.css';
import StatusList from "./feedback/StudentStatusList";
import { useAuth } from "./auth/AuthContext";

function App() {
    const { user, isAuthenticated } = useAuth();
    
    return (
      <Routes>
            <Route path="/" element={<Layout />}>
                <Route index element={<Course />} />
                <Route path="courses/:id" element={<CourseDetail />} />
                <Route path="courses/edit/:id" element={<CourseEdit />} />
                <Route path='teachers' element={<TeacherList />} />
                <Route path='status' element={<StatusList/>} />

                {/* Protected Routes with Redirection */}
                <Route element={<ProtectedRoute isAuthenticated={isAuthenticated} />}> {/* New wrapper route */}
                    <Route path="my-courses/" element={<Course key="my-courses" instructor={user?.id} />} />
                    <Route path="enrolled-courses/" element={<Course key="enrolled-courses" student={user?.id} />} />
                </Route>
            </Route>
        </Routes>
    );
  }
  
  const ProtectedRoute = ({ isAuthenticated, children }) => {
    if (!isAuthenticated) {
        return <Navigate to="/" replace />;
    }
    return <Outlet/>;
};


export default App;