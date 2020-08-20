'use strict';

const header = document.querySelector('header');


addEventListener('scroll', function() {
	if (window.scrollY) {
		header.style.background = 'var(--panel-color)';
	} else {
		header.style.background = 'none';
	}
});



//# sourceMappingURL=main.js.map
