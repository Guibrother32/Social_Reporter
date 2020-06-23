const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');

const db = require('./util/database');

var session = require('express-session');
var MySQLStore = require('express-mysql-session')(session);

var csrf = require('csurf'); //CSRF ATTACK PROTECTION


// var cookieParser = require('cookie-parser'); IF YOU WANT TO SET ON COOKIE
// var csrfProtection = csrf({ cookie: true });
// app.use(cookieParser())
const app = express();

var options = {                             ///CHANGE HERE AS WELL WHENEVER SWITCHING DBs 2 finished
    host: 'us-cdbr-east-06.cleardb.net',
    user: 'bb5b1eafda0483',
    password: '01f25e13',
    database: 'heroku_0956afd54f3bb46'
};

var sessionStore = new MySQLStore(options);

app.use(session({
    secret: 'mySecret',
    store: sessionStore,
    resave: false,
    saveUninitialized: false
}));


app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const userRoutes = require('./routes/user');
const authRoutes = require('./routes/auth');

app.use(bodyParser.urlencoded({ extended: false })); //body parser urlencoded basicly parses strings only


//app.use(multer({ storage: fileStorage, fileFilter: fileFilter }).single('image'));//storage gives us some setup options so we create a filestorage var and stores it //tell multer that its gonna be a single file upload and the argument is the input name

app.use(express.static(path.join(__dirname, 'public')));

app.use('/images', express.static(path.join(__dirname, 'images')));

var csrfProtection = csrf();//must place it after calling the session and after multer
/************************* CSRF PROTECTION ********************************/


//app.use(csrfProtection);//this must be after initializing the session //now without setting it, all post requests will be failed

app.use((req, res, next) => { //setting properties for all renders 
    res.locals.isAuthenticated = req.session.isLoggedIn;
    res.locals.user = req.session.user;
    //var token = req.csrfToken();
    // res.cookie('XSRF-TOKEN', token);
    //res.locals.csrfToken = token;
    //console.log(res.locals.csrfToken);
    next();
});

//csurf not working with image uploading add <input type="hidden" id="_csrf" name="_csrf" value="<%=csrfToken%>"> for each form if you want to try to solve the problem
//you should add an input with name and value correct settled as csurf requires for each FORM/POST request so then csurf can get the right token from it
/****************************************************************************/

// app.use('/admin',adminRoutes);
app.use(userRoutes);
app.use(authRoutes);

app.listen(process.env.PORT || 3000);
