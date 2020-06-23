const db = require('../util/database');

module.exports = class ReportLike{
    constructor(idComplaint_FK, isLike, isUnlike, userId){
        this.idComplaint_FK = idComplaint_FK;
        this.isLike = isLike;
        this.isUnlike = isUnlike;
        this.id = Math.round(Math.random() * 99999);
        this.userId = userId;
    };

    save(){
        return db.execute('INSERT INTO complaintlike VALUES (?, ?, ?,?,?)',
        [this.idComplaint_FK,this.id,this.isLike,this.isUnlike,this.userId]
        );
    };

    static fetchLikeById(idComplaint){
        return db.execute('SELECT COUNT(*) AS likeCount FROM complaintlike WHERE idComplaint_FK = ? && isLike = 1', [idComplaint]);
    }; 
    static fetchDislikeById(idComplaint){
        return db.execute('SELECT COUNT(*) AS dislikeCount FROM complaintlike WHERE idComplaint_FK = ? && isUnlike = 1', [idComplaint]);
    };
    static fetchAnyLikeById(idComplaint,userId){
        return db.execute('SELECT COUNT(*) AS anyLikeCount FROM complaintlike WHERE idComplaint_FK = ? && userId=? && (isLike = 1 || isUnlike= 1)', [idComplaint,userId]);
    }
    static fetchAll(){
        return db.execute('SELECT * FROM complaintlike');
    }
    static fetchReportLike(userId,idComplaint_FK){
        return db.execute('SELECT isLike FROM complaintlike WHERE userId = 58472 && idComplaint_FK = 13087');
    }
    static fetchLikeByUserId(idComplaint,userId){
        return db.execute('SELECT COUNT(*) AS likeCount FROM complaintlike WHERE idComplaint_FK = ? && isLike = 1 && userId = ?', [idComplaint,userId]);
    }; 
    static fetchDislikeByUserId(idComplaint,userId){
        return db.execute('SELECT COUNT(*) AS dislikeCount FROM complaintlike WHERE idComplaint_FK = ? && isUnlike = 1 && userId = ?', [idComplaint,userId]);
    };
    static unlikeReport(idComplaint,userId){
        return db.execute('DELETE FROM complaintlike WHERE idComplaint_FK = ? && userId = ?',[idComplaint,userId]);
    }
}