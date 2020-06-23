const User = require('../models/user')
const db = require('../util/database');
const Report = require('../models/report');
const bcryptjs = require('bcryptjs');

exports.getSignUp = (req, res, next) => {
    res.render('auth/signup', { pageTitle: 'Social Reporter', path: '/user/signup', isAuthenticated: req.session.isLoggedIn });
}

exports.postSignUp = (req, res, next) => {
    const newName = req.body.name;
    const newPassword = req.body.password;
    const newEmail = req.body.email;

    //we should also check if the email already exists

    if (newName != '' && newPassword != '' && newEmail != '') {
        return bcryptjs.hash(newPassword, 12).then(hashedPassowrd => {
            const newUser = new User(newName, hashedPassowrd, newEmail);
            console.log(newUser);
            newUser.save().then(() => {
                return res.redirect('/user/login');
            }).catch(err => {
                console.log(err);
                return res.redirect('/user/signup');
            })
        }); //check 255 if problems with then async func

    }

    // return res.redirect('/user/signin');
}



exports.getLogIn = (req, res, next) => {
    res.render('auth/login', { pageTitle: 'Login - Social Reporter', path: '/user/login', isAuthenticated: req.session.isLoggedIn });
}

exports.postLogIn = (req, res, next) => {
    const reqName = req.body.name;
    const reqPassword = req.body.password;
    console.log(reqName, reqPassword);

    // db.query('SELECT * FROM userinfo WHERE name = ? AND password = ?', [reqName, reqPassword], results => {
    //     console.log(results.toString());
    //     console.log(error);
    //     console.log('qirwoe');
    //     res.end();
    //     return res.redirect('/');
    // });

    async function loginAttempt() {
        let [rows, fields] = await db.execute('SELECT * FROM userinfo WHERE name = ?', [reqName]);

        // const userId = rows[0].id;
        // const userName = rows[0].name;
        if (rows.length > 0) {
            bcryptjs.compare(reqPassword, rows[0].password).then(doMatch => {
                if (doMatch) {
                    req.session.isLoggedIn = true;
                    console.log(req.session.isLoggedIn);
                    req.session.user = rows[0].name;
                    req.session.userData = rows[0];
                    console.log(req.session.user);
                    return req.session.save(err => {
                        console.log(err);
                        res.redirect('/');
                    });
                    // return res.redirect('/'); SAVE IS REALLY NEED?
                }
                res.redirect('/user/login');
            }).catch(err => {
                console.log(err);
                res.redirect('/user/login');
            });
            // console.log(rows[0].id);
            // console.log(rows[0].password);

            // Report.fetchAll().then(([rows, fieldData]) => {
            //     res.render('user/index', { reports: rows, pageTitle: 'Social Reporter', path: '/', session:'active', sessionId:userId, sessionName:userName});
            // }).catch(err => console.log(err));


            //cookies
            // res.setHeader('Set-Cookie','loggedIn=true');
            // const isLoggedIn = req.get('Cookie').split('=')[1];
            // console.log(req.get('Cookie'));
            // console.log(isLoggedIn);


            // Report.fetchAll().then(([rows, fieldData]) => {
            //     res.render('user/index', { reports: rows, pageTitle: 'Social Reporter', path: '/',isAuthenticated:isLoggedIn});
            // }).catch(err => console.log(err)); 

        } else {
            res.send('Incorrect Username and/or Password!');
        }
    }

    loginAttempt();

    // User.userRequest(reqName,reqPassword, userInfo =>{
    //     console.log();
    //     if(userInfo.length>0){
    //         console.log('fail');
    //         // return res.render('user/fail')
    //     }
    //     console.log('aproved!');
    //     // return res.render('user/index',{user:userInfo,pageTitle:'Social Reporter',path:'/'})
    //     res.redirect('/');
    // });
}


exports.postLogout = (req, res, next) => {
    req.session.destroy(err => {
        console.log(err);
        res.redirect('/');
    });
}