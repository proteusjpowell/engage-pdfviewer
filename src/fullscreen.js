const fullScreenApi = {
	supportsFullscreen: false,
	isFullscreen: function () {
		return false;
	},
	requestFullscreen: function () {
	},
	exitFullscreen: function () {
	},
	fullscreenEventName: '',
	prefix: ''
};
const browserPrefixes = 'webkit moz o ms khtml'.split(' ');

// check for native support
if (typeof document.cancelFullScreen !== 'undefined') {
	fullScreenApi.supportsFullscreen = true;
} else if(typeof document.exitFullscreen !== 'undefined') {
	fullScreenApi.supportsFullscreen = true;
} else {
	// check for fullscreen support by vendor prefix
	for (let i = 0, il = browserPrefixes.length; i < il; i++ ) {
		fullScreenApi.prefix = browserPrefixes[i];
		if (typeof document[fullScreenApi.prefix + 'CancelFullScreen' ] != 'undefined' ) {
			fullScreenApi.supportsFullscreen = true;
			break;
		}
	}
}

// update methods to do something useful
if (fullScreenApi.supportsFullscreen) {
	fullScreenApi.fullscreenEventName = fullScreenApi.prefix + 'fullscreenchange';

	fullScreenApi.isFullscreen = function() {
		switch (this.prefix) {
			case '':
				return document.fullScreen ||
						(typeof document.fullscreenElement !== 'undefined' && document.fullscreenElement !== null);
			case 'webkit':
				return document.webkitIsFullScreen;
			default:
				return document[this.prefix + 'FullScreen'];
		}
	};
	fullScreenApi.requestFullscreen = function requestFullScreen(el) {
		return (this.prefix === '') ? el.requestFullscreen() : el[this.prefix + 'RequestFullScreen']();
	};
	fullScreenApi.exitFullscreen = function exitFullScreen() {
		return (this.prefix === '') ? document.exitFullscreen() : document[this.prefix + 'CancelFullScreen']();
	}
}

export default fullScreenApi;