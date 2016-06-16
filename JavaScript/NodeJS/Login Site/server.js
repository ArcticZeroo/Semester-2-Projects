// Require Dependencies //
var express      = require('express');
var app          = express();
var port         = process.env.PORT || 8080;
var mongoose     = require('mongoose');
var passport     = require('passport');
var flash        = require('connect-flash');

var morgan       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var session      = require('express-session');

var configDB     = require('./config/database.js');

// Configuration //
mongoose.connect(configDB.url);

require('./config/passport')(passport);

// Express App //
app.use(morgan('dev'));
app.use(cookieParser());

app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: true}));

app.set('view-engine', 'ejs');

app.use(session({
    secret: 'hellosiryesiamadog',
    resave: false,
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use("/styles",express.static(__dirname + "/styles"));
app.use("/resources",express.static(__dirname + "/resources"));
app.use("/scripts",express.static(__dirname + "/scripts"));

// Routes //
require('./app/routes.js')(app, passport);

// Launch //
app.listen(port);
console.log("Listening on port " + port);