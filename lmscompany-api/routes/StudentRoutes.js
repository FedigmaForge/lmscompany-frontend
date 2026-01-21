const express = require("express");
const router = express.Router(); 
const multer = require("multer");
const { protect } = require("../middleware/auth");

const {
  addStudent,
  getStudents,
  updateStudent,
  deleteStudent,
  studentLogin,
  searchStudents,    
  studentProfile
} = require("../controllers/StudentController");



// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Make sure this folder exists
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  }
});

const upload = multer({ storage });

//  Add Student
router.post("/add", upload.single("profilePhoto"), addStudent);

//  Get All Students
router.get("/", getStudents);

//  SEARCH Students (new)
router.get("/search", searchStudents);

//  Update Student
router.put("/update/:id", upload.single("profilePhoto"), updateStudent);

//  Delete Student
router.delete("/delete/:id", deleteStudent);

//  Login
router.post("/login", studentLogin);

//  Protected profile
router.get("/profile", protect, studentProfile);

module.exports = router;