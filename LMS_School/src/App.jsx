import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import WhyChooseUs from "./components/WhyChooseUs";
import CallToAction from "./components/CallToAction";
import Footer from "./components/Footer";
import Courses from "./components/Courses";
import StudentCorner from "./StudentCorner/StudentCorner";
import ContactUs from "./components/ContactUs";
import SignIn from "./SchoolAdmin/SchoolAdminLogin";
import TeacherLogin from "./SchoolTeacher/TeacherLogin";
import SchoolDashboard from "./SchoolAdmin/SchoolDashboard";
import TeacherManagement from "./SchoolAdmin/TeacherManagement";
import StudentManagement from "./SchoolAdmin/StudentManagement";
import FeeManagement from "./SchoolAdmin/FeeManagement";
import AttendanceManagement from "./SchoolAdmin/AttendanceManagement";
import StudentDashboard from "./StudentCorner/StudentDashboard";
import StudentProfile from "./StudentCorner/StudentProfilePage";
import StudentAttendance from "./StudentCorner/StudentAttendance";
import StudentResults from "./StudentCorner/StudentResults";
import StudentHomework from "./StudentCorner/StudentHomework";
import TeacherDashboard from "./SchoolTeacher/TeacherDashboard";
import TeacherProfile from "./SchoolTeacher/TeacherProfile";
import TeacherAttendance from "./SchoolTeacher/TeacherAttendance";
import TeacherClasses from "./SchoolTeacher/TeacherClasses";
import TeacherStudents from "./SchoolTeacher/TeacherStudents";
import TeacherHome from "./SchoolTeacher/TeacherHome";
import FeeReceiptComponent from "./StudentCorner/FeeReceiptComponent";
import ClassTeacherAssignment from './SchoolAdmin/ClassTeacherAssignment';
import "./App.css";

function App() {
  const location = useLocation();

  // ❌ Navbar should NOT be visible on dashboards or login pages
  const hideNavbarRoutes = [
    "/sign-in",
    "/teacherlogin",
    "/school-dashboard",
    "/teacher",
    "/student/dashboard"
  ];

  const shouldHideNavbar = hideNavbarRoutes.some((path) =>
    location.pathname.toLowerCase().startsWith(path.toLowerCase())
  );

  return (
    <>
      {/* Show Navbar ONLY on normal public pages */}
      {!shouldHideNavbar && <Navbar />}

      <Routes>
        <Route
          path="/"
          element={
            <>
              <HeroSection />
              <WhyChooseUs />
              <CallToAction />
              <Footer />
            </>
          }
        />

        <Route path="/courses" element={<Courses />} />
        <Route path="/student-corner" element={<StudentCorner />} />
        <Route path="/contact-us" element={<ContactUs />} />
        <Route path="/sign-in" element={<SignIn />} />
        <Route path="/TeacherLogin" element={<TeacherLogin />} />

        {/* ✅ Student Dashboard */}
        <Route path="/student/dashboard" element={<StudentDashboard />}>
          <Route index element={<StudentProfile />} />
          <Route path="profile" element={<StudentProfile />} />
          <Route path="attendance" element={<StudentAttendance />} />
          <Route path="results" element={<StudentResults />} />
          <Route path="homework" element={<StudentHomework />} />
          <Route path="FeeReceiptComponent" element={<FeeReceiptComponent />} />
        </Route>

        {/* ✅ Teacher Dashboard */}
        <Route path="/teacher" element={<TeacherDashboard />}>
          <Route index element={<TeacherHome />} />
          <Route path="profile" element={<TeacherProfile />} />
          <Route path="attendance" element={<TeacherAttendance />} />
          <Route path="classes" element={<TeacherClasses />} />
          <Route path="students" element={<TeacherStudents />} />
          <Route
            path="student-attendance"
            element={<AttendanceManagement type="student" lockType={true} />}
          />
        </Route>

        {/* ✅ School Admin Dashboard */}
        <Route path="/school-dashboard" element={<SchoolDashboard />}>
          <Route index element={<h2>Welcome to School Dashboard</h2>} />
          <Route path="teacher" element={<TeacherManagement />} />
          <Route path="student" element={<StudentManagement />} />
          <Route path="attendance" element={<AttendanceManagement />} />
          <Route path="fees" element={<FeeManagement />} />
          <Route path="class-teacher-assignment" element={<ClassTeacherAssignment />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
