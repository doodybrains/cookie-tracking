// nedb is NPM database tool, in json format
// Database to store data, don't forget autoload: true
var Datastore = require('nedb');
var db = new Datastore({filename: "data.db", autoload: true});

// module for building web servers
var express = require('express')
// instatiate server
var app = express()
// any files inside will be directly available off server 
app.use(express.static('public'));

// set the view engine to ejs, embedded js
app.set('view engine', 'ejs');

// express package for dealing with cookies
var cookieParser = require('cookie-parser');
app.use(cookieParser());

// take cookies a step further and do server side session data
var session = require('express-session');
// use nedb to store session data
var nedbstore = require('nedb-session-store')(session);
// generate unique user ids
const uuidv1 = require('uuid/v1');

// setting up sessions 
app.use(
	session(
		{
			secret: 'secret',
			cookie: {
				 maxAge: 365 * 24 * 60 * 60 * 1000   // e.g. 1 year
				},
			store: new nedbstore({
			 filename: 'sessions.db'
			}),
			resave: true,
		    saveUninitialized: true
		}
	)
);

// anytime there is a request, this will get called
// Express Middleware
app.use(function(req, res, next) {

	// Have we seen them before?
	if (!req.session.uuid) {
		// create uuid
		req.session.uuid = uuidv1();
		console.log("New User: " + req.session.uuid);
	} else {
		console.log("Returning User: " + req.session.uuid);
	}

	// Count visits
	var visits = 0;
	if (req.session.visits) {
		visits = req.session.visits;
	}
	visits++;
	req.session.visits = visits;
	console.log("Visited " + visits + " times");	
		
	// Track last visit
	if (req.session.lastvisit) {
		console.log("Last Visit: " + req.session.lastvisit);
	}
	//update last visit to now
	req.session.lastvisit = Date.now();

	// What did they request?
	console.log("Requested: " + req.originalUrl);

	//console.log(req.headers)

	next();

});
// if go to server / 
app.get('/', function (req, res) {
	// use ejs to render page
	res.render('main.ejs', req);	
});

app.get('/image', function (req, res) {
	console.log(req.headers);
	console.log(req.query);
	if (req.query.source) {
		var history = []
		if (req.session.history) {
			history = req.session.history;
		}

		history.push({source: req.query.source, date: Date.now()});

		req.session.history = history;
		
	}
	console.log(history);
	res.sendFile(__dirname + "/public/cookie.gif");
});

app.listen(80)
console.log("Server is running on port 80");
