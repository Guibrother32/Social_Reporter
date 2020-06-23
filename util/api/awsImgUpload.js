var express = require('express'), // "^4.13.4"
    aws = require('aws-sdk'), // ^2.2.41
    multer = require('multer'), // "multer": "^1.1.0"
    multerS3 = require('multer-s3'); //"^1.4.1"

const router = express.Router();

aws.config.update({
    secretAccessKey: '**********************',
    accessKeyId: '*************',
    region: 'sa-east-1',
    signatureVersion: 'v4'
});


var s3 = new aws.S3();

var upload = multer({
    storage: multerS3({
        s3: s3,
        acl: 'public-read',
        bucket: 'social-reporter-images-bucket',
        key: function (req, file, cb) {
            console.log(file);
            cb(null, Date.now() + '-' + file.originalname); //use Date.now() for unique file keys
        }
    }),
    limits: { fileSize: 6000000 }
});

const deleteFile = (key) =>{
    s3.deleteObject({
        Bucket: 'social-reporter-images-bucket',
        Key: key
      },function (err,data){})
}//'some/subfolders/nameofthefile1.extension' <- key

exports.upload = upload;

