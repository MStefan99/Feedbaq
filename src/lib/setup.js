'use strict';

const openDB = require('./db');


module.exports = async () => {
	const db = await openDB('feedbaq');

	db.collection('presentations');
}
