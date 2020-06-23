const db = require('../util/database');


module.exports = class User {
    constructor(name, password, email) {
        this.name = name;
        this.password = password;
        this.email = email;
    }

    save() {
        this.id = Math.round(Math.random() * 99999);
        return db.execute(
            'INSERT INTO userinfo (id,name,password,email) VALUES (?,?,?,?)',
            [this.id, this.name, this.password, this.email]
        );
    }

    static userRequest(name, password) {
        console.log(name,password);
        return db.execute(
            'SELECT * FROM userinfo WHERE name=? AND password=?',
            [name, password]
        );
    }
    static fetchUserById(userId){
        return db.execute('SELECT * from userinfo WHERE id='+ userId)
    }
}