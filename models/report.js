const db = require('../util/database');

module.exports = class Report {

    constructor(title, location, image, description, userId) {
        this.id = Math.round(Math.random() * 99999);
        this.title = title;
        this.location = location;
        this.image = image;
        this.description = description;
        this.userId = userId;
    }

    save() {
        return db.execute(
            'INSERT INTO complaint VALUES (?, ?, ?, ?, ?,?)',
            [this.id, this.title, this.description, this.image, this.location, this.userId]
        );
    }
    static fetchAll() {
        return db.execute('SELECT * FROM complaint');
    }
    static fetchUserNameOfReport(reportId) {
        return db.execute('SELECT name FROM userinfo,complaint WHERE userinfo.id =' + reportId + ' LIMIT 1')
    }
    static fetchMyReports(userId) {
        return db.execute('SELECT * FROM complaint WHERE UserInfo_idPessoa = ' + userId);
    }
    static deleteById(id) {
        return db.execute('DELETE from complaint WHERE idComplaint=' + id);
    }
    static fetchMyReport(reportId) {
        return db.execute('SELECT * FROM complaint WHERE idComplaint = ' + reportId);
    }
    static editReport(reportId, updatedTitle, updatedLocation, updatedImage, updatedDescription) {
        return db.execute(
            'UPDATE complaint SET title=?,description=?,image=?,location=? WHERE idComplaint = ?',
            [updatedTitle, updatedDescription, updatedImage, updatedLocation, reportId]
        )
    };
    static editReportKeepImage(reportId, updatedTitle, updatedLocation, updatedDescription) {
        return db.execute(
            'UPDATE complaint SET title=?,description=?,location=? WHERE idComplaint = ?',
            [updatedTitle, updatedDescription, updatedLocation, reportId]
        );
    };
    // static likeReport(){

    // }
};
