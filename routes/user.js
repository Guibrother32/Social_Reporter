const path = require('path');

const express = require('express');

const userController = require('../controllers/user');

const router = express.Router();

const isAuth = require('../middleware/is-auth');

const apiAWSUpload = require('../util/api/awsImgUpload');

router.get('/', userController.getIndex);

router.get('/report', isAuth, userController.getReport); //isAuth -> Guard // here the orders matter, isAuth will be called first

router.get('/myreports', isAuth, userController.getMyReports);

router.get('/deleteReport/:id', isAuth, userController.getDeleteReport); //change it

router.get('/editReport/:id', isAuth, userController.getEditReport);

router.get('/likeReport/:idComplaint/:complaint_userId/:isLike', isAuth, userController.getLike);

router.get('/unLikeReport/:idComplaint/:complaint_userId/:isUnlike', isAuth, userController.getUnlike);

router.post('/report/sendreport', isAuth, apiAWSUpload.upload.array('image', 1), userController.postReport);

router.post('/report/editReport', isAuth, apiAWSUpload.upload.array('image', 1), userController.postEditReport);

module.exports = router;