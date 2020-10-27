'use strict';

const header = document.querySelector('header');


addEventListener('scroll', e => {
	if (window.scrollY) {
		header.classList.add('dark');
	} else {
		header.classList.remove('dark');
	}
});



//# sourceMappingURL=main.js.map
