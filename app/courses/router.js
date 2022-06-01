var express = require('express');
const isAuth = require('../../middlewares/isAuth');
const isRole = require('../../middlewares/isRole');
var router = express.Router();
const {
  createCourse,
  joinCourse,
  getCourseswithStudents,
  deleteCourse,
} = require('./controller');

/* GET home page. */
router.post('/courses', isAuth, isRole(['teacher']), createCourse);
router.post('/join-course/:id', isAuth, isRole(['student']), joinCourse);
router.get('/courses', getCourseswithStudents);
router.delete('/courses/:id', isAuth, isRole(['teacher']), deleteCourse);
module.exports = router;