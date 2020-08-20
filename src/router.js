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


router.get('/presentations/:id/manage', async (req, res) => {
	const db = await openDB('feedbaq');

	const presentation = await db.collection('presentations').findOne({
		_id: ObjectID(req.params.id)
	});

	res.render('manage', {
		name: presentation.name,
		id: presentation._id
	});
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


router.post('/presentations/:id/feedback', async (req, res) => {
	if (!req.body.text) {
		res.status(400).send('NO_DATA');
		return;
	}

	const feedback = {
		text: req.body.text
	}

	const db = await openDB('feedbaq');
	await db.collection('presentations').updateOne({
		_id: req.params.id
	}, {
		$push: {
			feedback: req.body.text
		}
	});

	res.sendStatus(201).json(feedback);
});



router.post('/presentations/:id/questions', async (req, res) => {
	if (!req.body.text) {
		res.status(400).send('NO_DATA');
		return;
	}

	const question = {
		text: req.body.text,
		answered: false
	}

	const db = await openDB('feedbaq');
	await db.collection('presentations').updateOne({
		_id: req.params.id
	}, {
		$push: {
			questions: {
				text: req.body.text,
				answered: false
			}
		}
	});

	res.sendStatus(201).json(question);
});


router.get('/presentations/:id/feedback', async (req, res) => {
	const db = await openDB('feedbaq');

	const presentation = db.collection('presentations').findOne({
		_id: ObjectID(req.params.id)
	});

	res.json(presentation.feedback);
});


router.get('/presentations/:id/questions', async (req, res) => {
	const db = await openDB('feedbaq');

	const presentation = db.collection('presentations').findOne({
		_id: ObjectID(req.params.id)
	});

	res.json(presentation.questions);
});



module.exports = router;
