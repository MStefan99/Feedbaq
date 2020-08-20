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

	sendQuestion: (question) => {
		if (!wss) {
			throw new Error('Please start the server first');
		}

		const message = JSON.stringify({
			header: {
				type: 'broadcast',
				event: 'newQuestion'
			},
			data: question
		});

		wss.clients.forEach(ws => {
			ws.send(message);
		});
	},

	sendFeedback: (feedback) => {
		if (!wss) {
			throw new Error('Please start the server first');
		}

		const message = JSON.stringify({
			header: {
				type: 'broadcast',
				event: 'newFeedback'
			},
			data: feedback
		});

		wss.clients.forEach(ws => {
			ws.send(message);
		});
	}
}
