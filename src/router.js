'use strict';

const express = require('express');
const ObjectID = require('mongodb').ObjectID;

const flash = require('./lib/flash');
const openDB = require('./lib/db');
const setup = require('./lib/setup');
const socket = require('./lib/socket');
const QRCode = require('qrcode');

const router = express.Router();
router.use(flash());


setup();


router.get('/', (req, res) => {
	res.render('index');
});


router.get('/presentations', (req, res) => {
	res.redirect(303, '/presentations/new/');
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

	if (!presentation) {
		res.status(404).render('404');
		return;
	}

	res.render('presentation', {
		name: presentation.name,
		id: presentation._id
	});
});


router.get('/presentations/:id/splash', async (req, res) => {
	const db = await openDB('feedbaq');

	const presentation = await db.collection('presentations').findOne({
		_id: ObjectID(req.params.id)
	});

	if (!presentation) {
		res.status(404).render('404');
		return;
	}

	const protocol = process.env.NO_HTTPS? 'http://': "https://";
	const url = protocol + req.headers.host
		+ '/presentations/' + req.params.id + '/'

	res.render('splash', {
		name: presentation.name,
		host: req.get('host'),
		id: presentation._id,
		qrData: await QRCode.toDataURL(url, {
			scale: 8
		})
	});
});


router.get('/presentations/:id/present', async (req, res) => {
	const db = await openDB('feedbaq');

	const presentation = await db.collection('presentations').findOne({
		_id: ObjectID(req.params.id)
	});

	if (!presentation) {
		res.status(404).render('404');
		return;
	}

	res.render('present', {
		name: presentation.name,
		id: presentation._id
	});
});


router.post('/presentations', async (req, res) => {
	if (!req.body.name) {
		res.flash({
			title: 'No name specified!',
			info: 'Please choose a name for your presentation',
			type: 'error'
		}).redirect(303, '/presentations/new/');
	} else {
		const db = await openDB('feedbaq');

		const presentations = db.collection('presentations');
		const presentation = {
			name: req.body.name,
			questions: [],
			feedback: []
		}

		await presentations.insertOne(presentation);
		res.render('created', {
			id: presentation._id,
			name: req.body.name,
			host: req.get('host')
		});
	}
});


router.post('/presentations/:id/feedback', async (req, res) => {
	if (!req.body.text) {
		res
		.flash({
			title: 'Empty feedback',
			info: 'Please type your message in the provided field',
			type: 'error'
		})
		.redirect(303, '/presentations/' + req.params.id + '/');
		return;
	}

	const feedback = {
		_id: ObjectID(),
		text: req.body.text
	}

	const db = await openDB('feedbaq');
	await db.collection('presentations').updateOne({
		_id: ObjectID(req.params.id)
	}, {
		$push: {feedback: feedback}
	});

	socket.event({
		event: 'addFeedback'
	}, feedback);
	res.flash({
		title: 'Feedback sent',
		info: 'Your feedback was sent to the presenter'
	})
	.redirect(303, '/presentations/' + req.params.id + '/');
});



router.post('/presentations/:id/questions', async (req, res) => {
	if (!req.body.text) {
		res.flash({
			title: 'Empty question',
			info: 'Please type your question in the provided field',
			type: 'error'
		})
		.redirect(303, '/presentations/' + req.params.id + '/');
		return;
	}

	const question = {
		_id: ObjectID(),
		text: req.body.text,
		answered: false
	}

	const db = await openDB('feedbaq');
	await db.collection('presentations').updateOne({
		_id: ObjectID(req.params.id)
	}, {
		$push: {questions: question}
	});

	socket.event({
		event: 'addQuestion'
	}, question);
	res.flash({
		title: 'Question sent',
		info: 'Your question was sent to the presenter'
	})
	.redirect(303, '/presentations/' + req.params.id + '/');
});


router.patch('/presentations/:pid/questions/:qid',
	async (req, res) => {
		const db = await openDB('feedbaq');
		const r = await db.collection('presentations').findOneAndUpdate({
			_id: ObjectID(req.params.pid),
			'questions._id': ObjectID(req.params.qid)
		}, {
			$set: {'questions.$.answered': true}
		}, {
			projection: {'questions.$': 1}
		});
		const chat = r.value;

		if (!chat.questions) {
			res.status(400).send('NOT_FOUND');
		} else {
			const question = chat.questions[0];
			question.answered = true;

			socket.event({
				event: 'updateQuestion'
			}, question);
			res.sendStatus(200);
		}
});


router.get('/presentations/:id/feedback', async (req, res) => {
	const db = await openDB('feedbaq');

	const presentation = await db.collection('presentations').findOne({
		_id: ObjectID(req.params.id)
	});

	if (!presentation) {
		res.status(404).render('404');
		return;
	}

	res.json(presentation.feedback);
});


router.get('/presentations/:id/questions', async (req, res) => {
	const db = await openDB('feedbaq');

	const presentation = await db.collection('presentations').findOne({
		_id: ObjectID(req.params.id)
	});

	if (!presentation) {
		res.status(404).render('404');
		return;
	}

	res.json(presentation.questions);
});



module.exports = router;
