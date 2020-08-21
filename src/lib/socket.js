'use strict';

const WebSocket = require('ws');

let wss;


module.exports = {
	startServer: (options) => {
		if (wss) {
			wss.close();
		}
		wss = new WebSocket.Server(options);

		wss.on('connection', ws => {
			ws.isAlive = true;

			ws.on('pong', () => {
				ws.isAlive = true
			});
		});

		setInterval(() => {
			wss.clients.forEach(ws => {
				if (!ws.isAlive) {
					ws.terminate();
				}

				ws.isAlive = false;
				ws.ping();
			});
		}, 5000);

		return wss;
	},

	event: (headers, body) => {
		if (!wss) {
			throw new Error('Please start the server first');
		}

		const message = JSON.stringify({
			header: headers,
			data: body
		});

		wss.clients.forEach(ws => {
			ws.send(message);
		});
	}
}
