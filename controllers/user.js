const Report = require('../models/report');
const User = require('../models/user')
const db = require('../util/database');
const ReportLike = require('../models/reportLike');
const fileDeleteHelper = require('../util/file');

const apiAWSUpload = require('../util/api/awsImgUpload');


exports.getIndex = (req, res, next) => {

    // Report.fetchAll().then(([rows, fieldData]) => {

    //     // console.log(rows);
    //     const modifiedRows = rows.map(el => {

    //         Report.fetchUserNameOfReport(el.UserInfo_idPessoa).then(([rows, fieldData]) => {
    //             console.log(rows);
    //             return {
    //                 ...el,
    //                 userOfReport: 'Joao'
    //             };
    //         }).catch(err => console.log(err));
    //         // return{
    //         //     ...el,
    //         //     userOfReport: 'Joao'
    //         // };

    //     });

    //     res.render('user/index', { reports: rows, pageTitle: 'Social Reporter', path: '/' }); 
    // }).catch(err => console.log(err));

    let userIdSession = null;

    if (req.session.userData) {
        userIdSession = req.session.userData.id;
    }

    Report.fetchAll().then(([rows, fieldData]) => {
        let likeType = 3;

        // console.log(rows);
        const modifiedRowPromises = rows.map(el => { //looping each element
            //console.log(el);
            return ReportLike.fetchLikeByUserId(el.idComplaint, userIdSession).then(([fetchLikeByUserIdRows, fieldData]) => {
                return ReportLike.fetchDislikeByUserId(el.idComplaint, userIdSession).then(([fetchDislikeByUserIdRows, fieldData]) => {
                    return ReportLike.fetchLikeById(el.idComplaint).then(([countLikeRow, fieldData]) => {
                        return ReportLike.fetchDislikeById(el.idComplaint).then(([countDislikeRow, fieldData]) => {
                            return Report.fetchUserNameOfReport(el.UserInfo_idPessoa).then(([rowsName, fieldData]) => {
                                return {
                                    ...el,
                                    userOfReport: rowsName[0].name,
                                    likeCount: countLikeRow[0].likeCount,
                                    dislikeCount: countDislikeRow[0].dislikeCount,
                                    isLike: fetchLikeByUserIdRows[0].likeCount,
                                    isDislike: fetchDislikeByUserIdRows[0].dislikeCount
                                };
                            });
                        });
                    });
                });
            });
        });
        Promise.all(modifiedRowPromises).then(modifiedRows => { //we use this because we got an asych issue when manipulating at fetchUserNameOfReport
            //console.log(modifiedRowPromises);
            res.render('user/index', { reports: modifiedRows, pageTitle: 'Social Reporter', path: '/', userIdSession: userIdSession, isAuthenticated: req.session ? req.session.isLoggedIn : '' });
        }).catch(console.log);
    }).catch(err => console.log(err));

};

exports.getReport = (req, res, next) => {
    let auth = '';
    if (req.session) {
        auth = req.session.isLoggedIn;
    }
    res.render('user/report', { pageTitle: 'Report Now', path: '/report', isAuthenticated: auth })
};

exports.postReport = (req, res, next) => {

    // if(!req.session.isLoggedIn){ //route protection
    //     res.redirect('/user/login');
    // } //cons we need to add to every route we need to protect

    const newTitle = req.body.title;
    const newLocation = req.body.location;
    let newImage = req.files[0].location;
    const newDescription = req.body.description;
    const userId = req.session.userData.id;

    // console.log(req.files[0]);

    if (!newImage) { //if image has not the right mimetype as set on multer
        newImage = '';
    }
    if (!(req.files[0].mimetype.toLowerCase() === 'image/png' || req.files[0].mimetype === 'image/jpg' || req.files[0].mimetype === 'image/jpeg' || req.files[0].mimetype === 'image/gif' || req.files[0].mimetype === 'image/heic')) {
        return res.redirect('/report');
    }

    //const imageUrl = newImage.path; //we store the path where the image has been store
    //notice that we dont store the image in the database, that would be inefficient, so we store only the image path

    const newReport = new Report(newTitle, newLocation, newImage, newDescription, userId);
    //console.log(newReport);

    newReport.save().then(() => {
        res.redirect('/');
    }).catch(err => {
        console.log(err);
        res.redirect('/');
    })
};

exports.getMyReports = (req, res, next) => {
    const userId = req.session.userData.id;

    Report.fetchMyReports(userId).then(([rows, fieldData]) => {
        res.render('user/myReports', { reports: rows, pageTitle: 'My Reports', path: '/myReports' });
    }).catch(err => {
        console.log(err);
    });
};

exports.getDeleteReport = (req, res, next) => {
    const reportId = req.params.id;
    const userId = req.session.userData.id;

    Report.fetchMyReport(reportId).then(([rows, fieldData]) => {
        const report = rows[0];


        //const imagePath = report.image;
        // fileDeleteHelper.deleteFile(imagePath); //NEEDS TO BE REPLACE TO ALSO DELETE ON AWS
        if (report.UserInfo_idPessoa === userId) { //if its not the user post, they cant delete it
            Report.deleteById(reportId).then(msg => {
                // console.log(msg);
                res.redirect('/myReports');
                next();
            }).catch(err => console.log(err));
        } else {
            res.redirect('/');
            next();
        }


    });
};

exports.getEditReport = (req, res, next) => {
    const reportId = req.params.id;
    const userId = req.session.userData.id;

    Report.fetchMyReport(reportId).then(([rows, fieldData]) => {
        const report = rows[0];
        if (report.UserInfo_idPessoa === userId) { //if its not the user post, they cant edit it
            res.render('user/editReport', { report: report, pageTitle: 'Edit Report', path: '/editReport', isAuthenticated: req.session ? req.session.isLoggedIn : '' });
        } else {
            res.redirect('/');
            next();
        }

    }).catch(err => console.log(err));

}

exports.postEditReport = (req, res, next) => {
    const updatedTitle = req.body.title;
    const updatedLocation = req.body.location;
    const image = req.body.imagePath;
    const updatedDescription = req.body.description;
    const reportId = req.body.id;
    // console.log("POST ID  = " + reportId);

    let newImage = '';

    // console.log(req.files);

    if (req.files.length) {
        newImage = req.files[0].location;
    }


    // let auxImage = req.file;
    // let updatedImage = '';

    if (newImage) {
        // fileDeleteHelper.deleteFile(image);
        // updatedImage = auxImage.path;

        Report.editReport(reportId, updatedTitle, updatedLocation, newImage, updatedDescription).then(msg => { //we must change it, this saves all property always
            res.redirect('/myReports');
        }).catch(err => console.log(err));

    } else {
        Report.editReportKeepImage(reportId, updatedTitle, updatedLocation, updatedDescription).then(msg => { //we must change it, this saves all property always
            res.redirect('/myReports');
        }).catch(err => console.log(err));
    }
};

exports.getLike = (req, res, next) => {
    const idComplaint = req.params.idComplaint;
    const isLike = req.params.isLike;
    const complaint_userId = req.params.complaint_userId; //whose post is this one? You cant like your own post buddy
    const userId = req.session.userData.id;
    //console.log(idComplaint, isLike, userId, complaint_userId);

    ReportLike.fetchAnyLikeById(idComplaint, userId).then(([fetchAnyLikeByIdRows, fieldData]) => {

        if (fetchAnyLikeByIdRows[0].anyLikeCount) {
            ReportLike.fetchLikeById(idComplaint, userId).then(([fetchLikeByIdRows, fieldData]) => {
                if (fetchLikeByIdRows[0].likeCount) {
                    ReportLike.unlikeReport(idComplaint, userId).then(() => {
                        res.redirect('/');
                    }).catch(err => console.log(err));
                } else {
                    res.redirect('/');
                }

                console.log('You already got a like there buddy');
            });
        } else {
            if (+complaint_userId !== +userId && +isLike) {

                const newLike = new ReportLike(idComplaint, 1, 0, userId);

                newLike.save().then(() => {
                    res.redirect('/');
                }).catch(err => console.log(err));
            } else if (!userId) {
                res.redirect('/login');
            }
            else {
                res.redirect('/');
                console.log('You cant like your own post buddy');
            }
        }
    });
};

exports.getUnlike = (req, res, next) => {
    const idComplaint = req.params.idComplaint;
    const isUnlike = req.params.isUnlike;
    const complaint_userId = req.params.complaint_userId; //whose post is this one? You cant like your own post buddy
    const userId = req.session.userData.id;



    ReportLike.fetchAnyLikeById(idComplaint, userId).then(([fetchAnyLikeByIdRows, fieldData]) => {
        //console.log(fetchAnyLikeByIdRows[0].anyLikeCount);

        let wait;

        if (fetchAnyLikeByIdRows[0].anyLikeCount) {
            ReportLike.fetchDislikeByUserId(idComplaint, userId).then(([fetchDislikeByUserIdRows, fieldData]) => {
                if (fetchDislikeByUserIdRows[0].dislikeCount) {
                    ReportLike.unlikeReport(idComplaint, userId).then(msg => {
                        res.redirect('/');
                    }).catch(err => console.log(err));
                } else {
                    res.redirect('/');
                }
                console.log('You already got a like there buddy - ' + fetchDislikeByUserIdRows[0].dislikeCount);
            });
        } else {
            if (+complaint_userId !== +userId && +isUnlike) {

                const newLike = new ReportLike(idComplaint, 0, 1, userId);

                newLike.save().then(() => {
                    res.redirect('/');
                }).catch(err => console.log(err));

            } else if (!userId) {
                res.redirect('/login');
            }
            else {
                res.redirect('/');
                console.log('You cant like your own post buddy');
            }
        }
    });
}