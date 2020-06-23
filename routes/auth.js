const path = require('path');

const express = require('express');

const authController = require('../controllers/auth');

const router = express.Router();





router.get('/user/signup',authController.getSignUp);

router.post('/user/signup',authController.postSignUp);

router.get('/user/login',authController.getLogIn);

router.post('/user/attemptLogin',authController.postLogIn);

router.post('/user/logout', authController.postLogout);

module.exports = router;