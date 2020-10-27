'use strict';

const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const http = require('http');

const indexRouter = require('./src/router');
const socket = require('./src/lib/socket');
let server;

const app = express();

server = http
	.createServer(app)
	.listen(process.env.PORT, () => {
		console.log('Listening on HTTP, port ' + server.address().port);
});

socket.startServer({
	server: server,
	path: '/socket/',
	clientTracking: true
});


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.set('x-powered-by', false);

app.use((req, res, next) => {
	res.set('Referrer-Policy', 'same-origin');
	res.set('X-Content-Type-Options', 'nosniff');
	res.set('X-Frame-Options', 'SAMEORIGIN');
	if (!process.env.NO_HTTPS) {
		res.set('Strict-Transport-Security', 'max-age=31536000'); // 1 year in seconds
	}
	next();
});

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public')));
app.use('/favicon.ico', express.static(path.join(__dirname, 'public', 'img', 'logo.svg')));
app.use('/', indexRouter);


app.use((err, req, res, next) => {
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};

	res.status(err.status || 500);
	res.render('error');
});
