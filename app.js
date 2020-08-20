'use strict';

const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const http = require('http');

const indexRouter = require('./src/router');
const socket = require('./src/lib/socket');

const app = express();


const server = http.createServer(app);
socket.startServer({
	server: server,
	path: '/socket/',
	clientTracking: true
});


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.set('x-powered-by', false);

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/', indexRouter);


app.use((err, req, res, next) => {
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};

	res.status(err.status || 500);
	res.render('error');
});


server.listen(3001, () => {
	console.log('Listening on port 3001');
});

