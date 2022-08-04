const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mysql = require('mysql');
const fs = require('fs');

const port = 80

//setup express session
const session = require('express-session');
const { finished } = require('stream');
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

const dbinfo = require('./dbinfo.json');

//setup mysql
const db = mysql.createConnection({
    host: dbinfo.host,
    user: dbinfo.user,
    password: dbinfo.password,
    database: dbinfo.database,
    port: dbinfo.port
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));

session.firstTime = true;

app.get('/', (req, res) => {
    if (session.firstTime) {
    res.redirect('/setup');
    }
    else {
        res.render('index');
    }
}
);

app.get('/setup', (req, res) => {
    res.render('setup');
});

app.post('/setup/database', (req, res) => {
    let dbinfo = {
        host: req.body.host,
        user: req.body.user,
        password: req.body.password,
        database: req.body.database,
        port: req.body.port
    }
let data = JSON.stringify(dbinfo);
fs.writeFileSync('dbinfo.json', data, {encoding: 'utf8', flag: 'w'});

db.connect((err) => {
    if (err) {
        res.redirect('/setup?error=db404');
    }
    else {
        console.log('Connected to database');
    }
});
//create a table called people
db.query(`CREATE TABLE IF NOT EXISTS people (firstname VARCHAR(255), lastname VARCHAR(255), email VARCHAR(255), phone INT(11), birthday DATE, service VARCHAR(255), id INT(16), recent_service VARCHAR(255), date_joined DATE, notes VARCHAR(255))`, (err, result) => {
        if (err) {
            console.log(err);
        }
        else {
            console.log('Table created');
        }
    });


});


app.listen(port, () => {
    console.log(`localhost:${port}`);
});