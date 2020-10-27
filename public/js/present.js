'use strict';


import Jui from '/js/jui.js';


const questionContainer = new Jui('#question-container');
const feedbackContainer = new Jui('#feedback-container');

const host = window.location.host;
const socket = new WebSocket(`ws://${host}/socket/`);

const presentationID = window.location.href
	.match(/\/p(resentations)?\/(.*?)\//)[2];


'click'.split(' ').forEach(event => {
	addEventListener(event, e => {
		if (!e.defaultPrevented) {
			new Jui('.menu').remove()
		}
	});
});


function answerQuestion(question) {
	new Jui(`.question[data-id='${question._id}']`)
		.addClass('answered');
	new Jui(`.question[data-id='${question._id}'] .answered-label`)
		.text('Answered');
}


function addQuestion(question) {
	new Jui(`
				<div class="question ${question.answered? 'answered' : ''}">
					<p>${question.text}</p>
					<span class="answered-label">
						${question.answered? 'Answered' : 'Not answered'}
					</span>
				</div>`)
		.prop('data-id', question._id)
		.appendTo(questionContainer)
		.on('click contextmenu', questionEvent => {
			questionEvent.preventDefault();
			new Jui('.menu').remove();

			if (!questionEvent.target.closest('.question').classList.contains('answered')) {
				new Jui(`<div class="menu"></div>`)
					.css('left', questionEvent.clientX + 'px')
					.css('top', questionEvent.clientY + 'px')
					.append(new Jui(`<div class="menu-element">Mark as answered</div>`)
						.on('click', async () => {
							answerQuestion(question);

							const res = await fetch('/presentations/'
								+ presentationID + '/questions/' + question._id + '/', {
								method: 'PATCH'
							});

							if (!res.ok) {
								alert('Could not mark question as answered. ' +
									'Please check your connection.');
							}
						}))
					.appendTo(questionContainer);
			}
		});
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
		case 'addQuestion':
			addQuestion(message.data)
			break;

		case 'addFeedback':
			addFeedback(message.data);
			break;

		case 'updateQuestion':
			answerQuestion(message.data);
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
