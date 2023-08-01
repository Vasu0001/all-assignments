const express = require('express');
const app = express();

app.use(express.json());

let ADMINS = [];
let USERS = [];
let COURSES = [];

const adminAuthentication = (req,res,next) => {
  const {username , password} = req.headers;
  const admin = ADMINS.find(element => element.username === username && element.password === password );
  if(admin){
    next();
  }else{
    res.status(403).json({message: "Admin authentication failed"});
  }
}

const userAuthentication = (req,res,next) => {
  const {username , password} = req.headers;
  const user = USERS.find(element => element.username === username && element.password === password);
  if(user){
    req.user = user;
    next();
  }else{
    res.status(403).json({message : "User authentication failed"})
  }
}

// Admin routes
app.post('/admin/signup', (req, res) => {
  const admin = req.body;
  const existingAdmin = ADMINS.find(element => element.username === admin.username);
  
  if(existingAdmin){
    res.status(403).json({message : "Admin already exist"});
  }else{
    ADMINS.push(admin);
    res.json({message : "Admin created successfully"});
  }
});

app.post('/admin/login',adminAuthentication, (req, res) => {
    res.json({message : "Logged in successfully "});
});

app.post('/admin/courses', adminAuthentication , (req, res) => {
  const course = req.body;
  course.id = Date.now();
  COURSES.push(course);
  res.json({massage : "Course created successfully" , courseId : course.id})
  
});

app.put('/admin/courses/:courseId',adminAuthentication, (req, res) => {
  const courseId = parseInt(req.params.courseId);
  const course = COURSES.find(element => element.id === courseId);
  if(course){
    Object.assign(course, req.body);
    res.json({message : "Course Update successfully"});
  }else{
    res.status(404).json({message : "Course not found"});
  }
});

app.get('/admin/courses',adminAuthentication ,(req, res) => {
  res.json({courses : COURSES});
});

// User routes
app.post('/users/signup', (req, res) => {
  const userCheck = USERS.find(element => element.username === req.body.username && element.password === req.body.password)
  if(userCheck){
    res.json({message: 'User already existed'});
  }else{
    const user = {...req.body, purchasedCourses: []};
  USERS.push(user);
  res.json({ message: 'User created successfully' });
  }
  
});

app.post('/users/login',userAuthentication ,(req, res) => {
  res.json({ message: 'Logged in successfully' });
});

app.get('/users/courses', userAuthentication,(req, res) => {
  res.json({ courses: COURSES.filter(element => element.published) });
});

app.post('/users/courses/:courseId',userAuthentication ,(req, res) => {
  const courseId = Number(req.params.courseId);
  const course = COURSES.find(c => c.id === courseId && c.published);
  if (course) {
    req.user.purchasedCourses.push(courseId);
    res.json({ message: 'Course purchased successfully' });
  } else {
    res.status(404).json({ message: 'Course not found or not available' });
  }
});

app.get('/users/purchasedCourses',userAuthentication, (req, res) => {
  // logic to view purchased courses
  const purchasedCourses = COURSES.filter(c => req.user.purchasedCourses.includes(c.id));
  // var purchasedCourseIds = req.user.purchasedCourses;
  // var purchasedCourses = [];
  // for(let i=0; i<COURSES.length;i++){
  //   if(purchasedCourseIds.indexOf(CORUSES[i].id) !== -1){
  //     purchasedCourses.push(COURSES[i]);
  //   }
     res.json({ purchasedCourses });
  // }
});

app.listen(3000, () => {
  console.log('Server is listening on port 3000');
});
