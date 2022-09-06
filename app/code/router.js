var express = require('express');
const isAuth = require('../../middlewares/isAuth');
const isRole = require('../../middlewares/isRole');
const { submitWork, testWork, getCode } = require('./controller');
var router = express.Router();

router.post('/works/:id/submit-work', isAuth, isRole(['student']), submitWork);
router.post('/works/:id/test-work', isAuth, isRole(['student']), testWork);
router.get('/code-aja', getCode);

module.exports = router;