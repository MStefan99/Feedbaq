'use strict';

const MongoClient = require('mongodb').MongoClient;

const url = 'mongodb://127.0.0.1:27017';
const client = new MongoClient(url, {useUnifiedTopology: true});
const conn = client.connect();


async function openDB(name) {
	return conn.then(conn => conn.db(name));
}

module.exports = openDB;
