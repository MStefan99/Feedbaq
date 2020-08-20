'use strict';

const express = require('express');

const flash = require('./lib/flash');
const openDB = require('./lib/db');
const setup = require('./lib/setup');
const ObjectID = require('mongodb').ObjectID;

const router = express.Router();
router.use(flash());


setup();


router.get('/', (req, res) => {
	res.render('index');
});


router.get('/presentations/new', (req, res) => {
	res.render('new');
});


router.get('/p/:id', (req, res) => {
	res.redirect(303, '/presentations/' + req.params.id);
});


router.get('/presentations/:id', async (req, res) => {
	const db = await openDB('feedbaq');

	const presentation = await db.collection('presentations').findOne({
		_id: ObjectID(req.params.id)
	});

	res.render('presentation', {
		name: presentation.name,
		id: presentation._id
	});
});


router.get('/presentations/:id/manage', (req, res) => {
	res.render('manage');
});


router.post('/presentations', async (req, res) => {
	if (!req.body.name) {
		res.flash({
			title: 'No name specified!',
			type: 'error'
		}).redirect(303, '/presentations/new');
	} else {
		const db = await openDB('feedbaq');

		const presentations = db.collection('presentations');
		const presentation = {
			name: req.body.name
		}

		await presentations.insertOne(presentation);

		res.render('created', {
			id: presentation._id,
			host: req.get('host')
		});
	}
});

module.exports = router;
