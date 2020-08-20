'use strict';


import Jui from '/js/jui.js';


const questionContainer = new Jui('#question-container');
const feedbackContainer = new Jui('#feedback-container');

const host = window.location.host;
const socket = new WebSocket(`ws://${host}/socket/`);

const presentationID = window.location.href
.match(/\/p(resentations)?\/(.*?)\//)[2];


function addQuestion(question) {
	new Jui(`
				<div class="question">
					<p>${question.text}</p>
					<span>Answered: ${question.answered}</span>
				</div>`)
	.prop('data-id', question._id)
	.appendTo(questionContainer);
}


function addFeedback(feedback) {
	new Jui(`
				<div class="feedback">
					<p>${feedback.text}</p>
				</div>`)
	.prop('data-id', feedback._id)
	.appendTo(feedbackContainer);
}


socket.onmessage = e => {
	const message = JSON.parse(e.data);

	switch (message.header.event) {
		case "newQuestion":
			addQuestion(message.data)
			break;

		case 'newFeedback':
			addFeedback(message.data);
			break;

		case "connection":
			console.log('WebSocket connected');
			break;
	}
}


addEventListener('load', async e => {
	{
		const res = await fetch('/presentations/' + presentationID
		+ '/questions/');

		if (!res.ok) {
			console.error('Could not download questions. Please check connection to server')
		} else {
			for (const question of await res.json()) {
				addQuestion(question);
			}
		}
	}

	{
		const res = await fetch('/presentations/' + presentationID
			+ '/feedback/');

		if (!res.ok) {
			console.error('Could not download questions. Please check connection to server')
		} else {
			for (const feedback of await res.json()) {
				addFeedback(feedback);
			}
		}
	}
});
