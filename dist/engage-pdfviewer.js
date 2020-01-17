(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define("EngagePDFViewer", [], factory);
	else if(typeof exports === 'object')
		exports["EngagePDFViewer"] = factory();
	else
		root["EngagePDFViewer"] = factory();
})(window, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/engage-pdfviewer.js":
/*!*********************************!*\
  !*** ./src/engage-pdfviewer.js ***!
  \*********************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _fullscreen__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./fullscreen */ "./src/fullscreen.js");
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }



if (!window.pdfjsLib || !window.pdfjsViewer || !pdfjsLib.getDocument || !pdfjsViewer.PDFViewer) {
  console.log("Please include the pdfjs-dist library.");
}

var animationStartedPromise;

(function animationStartedClosure() {
  // The offsetParent is not set until the PDF.js iframe or object is visible.
  // Waiting for first animation.
  animationStartedPromise = new Promise(function (resolve) {
    window.requestAnimationFrame(resolve);
  });
})();

var id = 0;

function generateId() {
  id++;
  return "epdf_".concat(id);
} // Best explanation I can found for some settings is in the chrome extension
//   see extensions/chromium/preferences_schema.json in the pdfjs project


var USE_ONLY_CSS_ZOOM = false; // textLayerMode: Controls if the text layer is enabled, and the selection mode that is used.
//  0 = Disabled.
//  1 = Enabled.
//  2 = (Experimental) Enabled, with enhanced text selection.

var TEXT_LAYER_MODE = 1; // externalLinkTarget:
// Controls how external links will be opened.
//  0 = default.
//  1 = replaces current window.
//  2 = new window/tab.
//  3 = parent.
//  4 = in top window.

var EXTERNAL_LINK_TARGET = 0;
var MAX_IMAGE_SIZE = 1024 * 1024;
var DEFAULT_SCALE = 1.0;
var CSS_UNITS = 96 / 72;
var DEFAULT_SCALE_DELTA = 1.1;
var MIN_SCALE = 0.25;
var MAX_SCALE = 10.0; // Default zoom level of the viewer. Accepted values: 'auto', 'page-actual', 'page-width', 'page-height', 'page-fit', or a zoom level in percents.

var DEFAULT_SCALE_VALUE = "auto";

var EngagePDFViewer =
/*#__PURE__*/
function () {
  /**
   * Construct a PDF viewer for the specified container.
   * @param viewerContainer the view container.
   */
  function EngagePDFViewer(viewerContainer) {
    var _this = this;

    _classCallCheck(this, EngagePDFViewer);

    this.viewerContainer = viewerContainer;
    if (typeof viewerContainer === "string") this.viewerContainer = document.getElementById(viewerContainer);else this.viewerContainer = viewerContainer;
    this.pdfContainer = document.createElement("div");
    this.pdfContainer.classList.add("pdfViewerContainer");
    this.viewerContainer.appendChild(this.pdfContainer);

    if (!this.viewerContainer.hasAttribute("id")) {
      this.viewerContainer.setAttribute("id", generateId());
    }

    this.viewerContainer.addEventListener('touchstart', function (evt) {
      _this.viewerContainer.classList.add("active");

      _this.pdfContainer.classList.add("active");
    });
    document.documentElement.addEventListener("touchend", function (evt) {
      var path = evt.path || evt.composedPath && evt.composedPath();
      if (!path) return;
      var found = path.find(function (el) {
        return el.classList && el.classList.contains("engage-pdfviewer");
      });

      if (!found) {
        // console.log("Touched outside pdf viewer. Deactivating.");
        _this.viewerContainer.classList.remove("active");

        _this.pdfContainer.classList.remove("active");
      }
    });
    this.pdfLoadingTask = null;
    this.pdfDocument = null;
    this.pdfViewer = null;
    this.pdfHistory = null;
    this.pdfLinkService = null;
    this.l10n = null;
    this.metadata = null;
    this.documentInfo = null;
    this.pagesinited = false;

    this._createUI();
  }
  /**
   * Open a PDF.
   * @param options options are: url. "url" is required.
   */


  _createClass(EngagePDFViewer, [{
    key: "open",
    value: function open(options) {
      var _this2 = this;

      animationStartedPromise.then(function () {
        return _this2._open(options);
      });
    }
  }, {
    key: "scrollPageIntoView",
    value: function scrollPageIntoView(pageNumber) {
      var page = this.pdfContainer.querySelector("[data-page-number=\"".concat(pageNumber, "\"]"));

      if (page) {
        page.scrollIntoView();
      }
    }
    /**
     * Closes opened PDF document.
     * @returns {Promise} - Returns the promise, which is resolved when all
     * destruction is completed.
     */

  }, {
    key: "close",
    value: function close() {
      this.error.setAttribute("hidden", "");

      if (!this.pdfLoadingTask) {
        return Promise.resolve();
      }

      var promise = this.pdfLoadingTask.destroy();
      this.pdfLoadingTask = null;

      if (this.pdfDocument) {
        this.pdfDocument = null;
        this.pdfViewer.setDocument(null);
        this.pdfLinkService.setDocument(null, null);

        if (this.pdfHistory) {
          this.pdfHistory.reset();
        }
      }

      return promise;
    }
  }, {
    key: "showLoadingBar",
    value: function showLoadingBar() {
      this.loadingBar.value = 0;
      this.loadingBar.removeAttribute("hidden");
    }
  }, {
    key: "hideLoadingBar",
    value: function hideLoadingBar() {
      this.loadingBar.setAttribute("hidden", "");
    }
  }, {
    key: "zoomIn",
    value: function zoomIn(ticks) {
      var newScale = this.pdfViewer.currentScale;

      do {
        newScale = (newScale * DEFAULT_SCALE_DELTA).toFixed(2);
        newScale = Math.ceil(newScale * 10) / 10;
        newScale = Math.min(MAX_SCALE, newScale);
      } while (--ticks && newScale < MAX_SCALE);

      this.pdfViewer.currentScaleValue = newScale;
    }
  }, {
    key: "zoomOut",
    value: function zoomOut(ticks) {
      var newScale = this.pdfViewer.currentScale;

      do {
        newScale = (newScale / DEFAULT_SCALE_DELTA).toFixed(2);
        newScale = Math.floor(newScale * 10) / 10;
        newScale = Math.max(MIN_SCALE, newScale);
      } while (--ticks && newScale > MIN_SCALE);

      this.pdfViewer.currentScaleValue = newScale;
    }
  }, {
    key: "_open",
    value: function _open(options) {
      var _this3 = this;

      if (this.pdfLoadingTask) {
        return this.close().then(function () {
          // ... and repeat the open() call.
          return this._open(params);
        }.bind(this));
      }

      if (options.worker_url && pdfjsLib.GlobalWorkerOptions.workerSrc !== options.worker_url) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = options.worker_url;
      }

      this.url = options.url; // Loading document.

      var loadingTask = pdfjsLib.getDocument({
        url: options.url,
        maxImageSize: MAX_IMAGE_SIZE
      });
      this.pdfLoadingTask = loadingTask;
      this.showLoadingBar();

      this._clearData();

      loadingTask.onProgress = function (progressData) {
        _this3.loadingBar.max = progressData.total | 0;
        _this3.loadingBar.value = progressData.loaded | 0;
      };

      return loadingTask.promise.then(function (pdfDocument) {
        // Document loaded, specifying document for the viewer.
        _this3.pdfDocument = pdfDocument;

        _this3.pdfViewer.setDocument(pdfDocument);

        _this3.pdfLinkService.setDocument(pdfDocument);

        _this3.pdfHistory.initialize({
          fingerprint: pdfDocument.fingerprint
        });

        _this3.hideLoadingBar();

        _this3.toolbar.removeAttribute("hidden");

        _this3._loadMetaData();

        setTimeout(function () {
          if (_this3.pagesCount === 1) {
            _this3.pagerTotal.parentNode.remove();

            _this3.previousPageButton.parentNode.remove();
          }

          _this3._rescaleIfNecessary();
        }, 50);
      }, function (exception) {
        var message = exception && exception.message;
        var l10n = _this3.l10n;
        var loadingErrorMessage;

        if (exception instanceof pdfjsLib.InvalidPDFException) {
          // change error message also for other builds
          loadingErrorMessage = l10n.get("invalid_file_error", null, "Invalid or corrupted PDF file.");
        } else if (exception instanceof pdfjsLib.MissingPDFException) {
          // special message for missing PDFs
          loadingErrorMessage = l10n.get("missing_file_error", null, "Missing PDF file.");
        } else if (exception instanceof pdfjsLib.UnexpectedResponseException) {
          loadingErrorMessage = l10n.get("unexpected_response_error", null, "Unexpected server response.");
        } else {
          loadingErrorMessage = l10n.get("loading_error", null, "An error occurred while loading the PDF.");
        }

        loadingErrorMessage.then(function (msg) {
          _this3._showError(msg + "\n" + message);
        });

        _this3.hideLoadingBar();

        _this3.toolbar.setAttribute("hidden", "");
      });
    }
  }, {
    key: "_clearData",
    value: function _clearData() {
      this.metadata = null;
      this.documentInfo = null;
    }
  }, {
    key: "_showError",
    value: function _showError(msg) {
      this.error.removeAttribute("hidden");
      this.error.value = msg;
    }
  }, {
    key: "_createUI",
    value: function _createUI() {
      this.pdfContainer.appendChild(this._createPDFViewer());
      this.viewerContainer.appendChild(this._createLoadingBar());
      this.viewerContainer.appendChild(this._createErrorViewer());
      this.viewerContainer.appendChild(this._createToolBar());

      this._initUI();
    }
  }, {
    key: "_createPDFViewer",
    value: function _createPDFViewer() {
      var div = document.createElement("div");
      div.classList.add("pdfViewer");
      this.viewer = div;
      return div;
    }
  }, {
    key: "_createLoadingBar",
    value: function _createLoadingBar() {
      var element = document.createElement("progress");
      element.setAttribute("hidden", "");
      element.classList.add("loadingBar");
      this.loadingBar = element;
      return element;
    }
  }, {
    key: "_createErrorViewer",
    value: function _createErrorViewer() {
      var element = document.createElement("textarea");
      element.setAttribute("hidden", "");
      element.setAttribute("readonly", "readonly");
      element.classList.add("error");
      this.error = element;
      return element;
    }
  }, {
    key: "_createToolBar",
    value: function _createToolBar() {
      var bar = document.createElement("div");
      bar.classList.add("toolbar");
      bar.appendChild(this._createNavButtons());
      bar.appendChild(this._createPager());
      bar.appendChild(this._createZoomButtons());
      bar.appendChild(this._createDownloadButton());
      bar.appendChild(this._createFullscreenButton());
      this.toolbar = bar;
      return bar;
    }
  }, {
    key: "_createNavButtons",
    value: function _createNavButtons() {
      var _this4 = this;

      var container = document.createElement("div");
      container.classList.add("nav-con");
      var previous = document.createElement("button");
      previous.classList.add("btn");
      previous.classList.add("nav-btn");
      previous.classList.add("previous-btn");
      previous.setAttribute("title", "Previous Page");
      previous.innerText = "Previous";
      container.appendChild(previous);
      var next = document.createElement("button");
      next.classList.add("btn");
      next.classList.add("nav-btn");
      next.classList.add("next-btn");
      next.innerText = "Next";
      next.setAttribute("title", "Next Page");
      container.appendChild(next);
      previous.addEventListener("click", function () {
        _this4.page--;
      });
      next.addEventListener("click", function () {
        _this4.page++;
      });
      this.previousPageButton = previous;
      this.nextPageButton = next;
      return container;
    }
  }, {
    key: "_createPager",
    value: function _createPager() {
      var _this5 = this;

      var container = document.createElement("div");
      container.classList.add("pager-con");
      var pagerLabel = document.createElement("label");
      var inputId = generateId();
      pagerLabel.setAttribute("for", inputId);
      pagerLabel.innerText = "Page";
      pagerLabel.classList.add("pager-label");
      container.appendChild(pagerLabel);
      var pageNumber = document.createElement("input");
      pageNumber.setAttribute("id", inputId);
      pageNumber.setAttribute("type", "number");
      pageNumber.setAttribute("size", "3");
      pageNumber.setAttribute("value", "1");
      pageNumber.classList.add("pager-number");
      pageNumber.addEventListener("click", function () {
        this.select();
      });
      pageNumber.addEventListener("change", function () {
        var newPage = pageNumber.value;
        if (newPage === '') return;
        _this5.page = parseInt(newPage, 10);
        pageNumber.value = _this5.page;
      });
      container.appendChild(pageNumber);
      var pageTotal = document.createElement("span");
      pageTotal.classList.add("pager-total");
      container.appendChild(pageTotal);
      this.pagerNumber = pageNumber;
      this.pagerTotal = pageTotal;
      return container;
    }
  }, {
    key: "_createZoomButtons",
    value: function _createZoomButtons() {
      var _this6 = this;

      var container = document.createElement("div");
      container.classList.add("zoom-con");
      var zoomOut = document.createElement("button");
      zoomOut.classList.add("btn");
      zoomOut.classList.add("zoom-btn");
      zoomOut.classList.add("zoom-out-btn");
      zoomOut.setAttribute("title", "Zoom Out");
      zoomOut.textContent = "-";
      container.appendChild(zoomOut);
      var zoomIn = document.createElement("button");
      zoomIn.classList.add("btn");
      zoomIn.classList.add("zoom-btn");
      zoomIn.classList.add("zoom-in-btn");
      zoomIn.setAttribute("title", "Zoom In");
      zoomIn.textContent = "+";
      container.appendChild(zoomIn);
      zoomIn.addEventListener("click", function () {
        _this6.zoomIn();
      });
      zoomOut.addEventListener("click", function () {
        _this6.zoomOut();
      });
      return container;
    }
  }, {
    key: "_createDownloadButton",
    value: function _createDownloadButton() {
      var _this7 = this;

      var download = document.createElement("button");
      download.classList.add("btn");
      download.classList.add("download-btn");
      download.setAttribute("title", "Download");
      download.textContent = "Download";
      download.addEventListener("click", function () {
        window.location = _this7.url;
      });
      return download;
    }
  }, {
    key: "_createFullscreenButton",
    value: function _createFullscreenButton() {
      var fullscreenButton = document.createElement("button");
      fullscreenButton.classList.add("btn");
      fullscreenButton.classList.add("fullscreen-btn");
      fullscreenButton.setAttribute("title", "Switch To Presentation Mode");
      fullscreenButton.innerText = "Full Screen";
      this.fullscreenButton = fullscreenButton;
      return fullscreenButton;
    }
  }, {
    key: "_initUI",
    value: function _initUI() {
      var _this8 = this;

      this.pdfLinkService = new pdfjsViewer.PDFLinkService();
      this.l10n = pdfjsViewer.NullL10n;
      var pdfViewer = new pdfjsViewer.PDFViewer({
        container: this.pdfContainer,
        linkService: this.pdfLinkService,
        l10n: this.l10n,
        useOnlyCssZoom: USE_ONLY_CSS_ZOOM,
        textLayerMode: TEXT_LAYER_MODE
      });
      this.pdfViewer = pdfViewer;
      this.pdfLinkService.setViewer(pdfViewer);
      this.pdfHistory = new pdfjsViewer.PDFHistory({
        linkService: this.pdfLinkService
      });
      this.pdfLinkService.setHistory(this.pdfHistory);

      if (_fullscreen__WEBPACK_IMPORTED_MODULE_0__["default"].supportsFullscreen) {
        var lastPosition = 0;
        this.fullscreenButton.addEventListener('click', function () {
          if (_fullscreen__WEBPACK_IMPORTED_MODULE_0__["default"].isFullscreen()) {
            _fullscreen__WEBPACK_IMPORTED_MODULE_0__["default"].exitFullscreen();
          } else {
            lastPosition = document.documentElement.scrollTop;
            _fullscreen__WEBPACK_IMPORTED_MODULE_0__["default"].requestFullscreen(_this8.viewerContainer);
          }
        });
        document.addEventListener(_fullscreen__WEBPACK_IMPORTED_MODULE_0__["default"].fullscreenEventName, function (evt) {
          if (evt.target.id !== _this8.viewerContainer.id) {
            // console.log("evt not for me", evt);
            return;
          }

          if (_fullscreen__WEBPACK_IMPORTED_MODULE_0__["default"].isFullscreen()) {
            _this8.viewerContainer.classList.add("fullscreen");

            _this8.fullscreenButton.innerText = "Exit Full Screen";
            _this8.pdfViewer.currentScaleValue = "page-actual";

            _this8.scrollPageIntoView(_this8.page);
          } else {
            _this8.viewerContainer.classList.remove("fullscreen");

            _this8.fullscreenButton.innerText = "Full Screen";
            _this8.pdfViewer.currentScaleValue = DEFAULT_SCALE_VALUE;

            _this8.scrollPageIntoView(_this8.page);

            _this8._rescaleIfNecessary();
          }
        });
      } else {
        this.fullscreenButton.remove();
      }

      document.addEventListener("pagesinit", function (evt) {
        if (_this8.pagesinited) {
          // If there is more than one viewer on a page, this will get called multiple times
          return;
        }

        _this8.pagesinited = true; // We can use pdfViewer now, e.g. let's change default scale.

        setTimeout(function () {
          _this8._handleNavigationEnabling();

          _this8._rescaleIfNecessary();
        }, 100);
      });
      document.addEventListener("pagechanging", function (evt) {
        // We cannot determine which pdf viewer on the page triggered this event, so be careful
        _this8._handleNavigationEnabling();
      }, true);
    }
  }, {
    key: "_rescaleIfNecessary",
    value: function _rescaleIfNecessary(tryCount) {
      var _this9 = this;

      var newTryCount = (tryCount || 0) + 1;

      if (newTryCount > 10) {
        console.log("Giving up trying to rescale.");
        return;
      }
      /* else {
      console.log(`Rescale try#${newTryCount} for div#${this.viewerContainer.id}`);
      }*/


      setTimeout(function () {
        var hasScrollBar = _this9.pdfContainer.scrollWidth > _this9.pdfContainer.clientWidth; // console.log(`div#${this.viewerContainer.id} hasScrollBar=${hasScrollBar}`);

        if (hasScrollBar) {
          _this9.pdfViewer.currentScaleValue = DEFAULT_SCALE_VALUE;

          _this9._rescaleIfNecessary(newTryCount);
        }
      }, 50);
    }
  }, {
    key: "_handleNavigationEnabling",
    value: function _handleNavigationEnabling() {
      var page = this.page;
      var numPages = this.pagesCount;
      this.pagerNumber.value = page;
      this.pagerTotal.innerText = "of ".concat(numPages);
      this.previousPageButton.disabled = page <= 1;
      this.nextPageButton.disabled = page >= numPages;
    }
  }, {
    key: "_loadMetaData",
    value: function _loadMetaData() {
      var _this10 = this;

      this.pdfDocument.getMetadata().then(function (data) {
        _this10.documentInfo = data.info;
        _this10.metadata = data.metadata; // Provides some basic debug information

        console.log("PDF " + _this10.pdfDocument.fingerprint + ", " + (data.info.Title || data.info.Subject || "-") + " [" + data.info.PDFFormatVersion + " " + (data.info.Producer || "-").trim() + " / " + (data.info.Creator || "-").trim() + "]" + (data.info.IsAcroFormPresent ? " AcroForm " : "") + " (PDF.js: " + (pdfjsLib.version || "-") + ")");
      });
    }
  }, {
    key: "title",
    get: function get() {
      var pdfTitle,
          md = this.metadata,
          info = this.documentInfo;

      if (md && md.has("dc:title")) {
        var title = md.get("dc:title"); // Ghostscript sometimes returns 'Untitled', so prevent setting the title to 'Untitled.

        if (title !== "Untitled") {
          pdfTitle = title;
        }
      }

      if (!pdfTitle && info && info["Title"]) {
        pdfTitle = info["Title"];
      }

      return pdfTitle;
    }
  }, {
    key: "pagesCount",
    get: function get() {
      var doc = this.pdfDocument;
      if (doc) return doc.numPages;else return 0;
    }
  }, {
    key: "page",
    set: function set(val) {
      this.pdfViewer.currentPageNumber = val; // Builtin scrolling does not work with our usage

      this.scrollPageIntoView(val);
    },
    get: function get() {
      return this.pdfViewer.currentPageNumber;
    }
  }]);

  return EngagePDFViewer;
}();

/* harmony default export */ __webpack_exports__["default"] = (EngagePDFViewer);

/***/ }),

/***/ "./src/fullscreen.js":
/*!***************************!*\
  !*** ./src/fullscreen.js ***!
  \***************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
var fullScreenApi = {
  supportsFullscreen: false,
  isFullscreen: function isFullscreen() {
    return false;
  },
  requestFullscreen: function requestFullscreen() {},
  exitFullscreen: function exitFullscreen() {},
  fullscreenEventName: '',
  prefix: ''
};
var browserPrefixes = 'webkit moz o ms khtml'.split(' '); // check for native support

if (typeof document.cancelFullScreen !== 'undefined') {
  fullScreenApi.supportsFullscreen = true;
} else if (typeof document.exitFullscreen !== 'undefined') {
  fullScreenApi.supportsFullscreen = true;
} else {
  // check for fullscreen support by vendor prefix
  for (var i = 0, il = browserPrefixes.length; i < il; i++) {
    fullScreenApi.prefix = browserPrefixes[i];

    if (typeof document[fullScreenApi.prefix + 'CancelFullScreen'] != 'undefined') {
      fullScreenApi.supportsFullscreen = true;
      break;
    }
  }
} // update methods to do something useful


if (fullScreenApi.supportsFullscreen) {
  fullScreenApi.fullscreenEventName = fullScreenApi.prefix + 'fullscreenchange';

  fullScreenApi.isFullscreen = function () {
    switch (this.prefix) {
      case '':
        return document.fullScreen || typeof document.fullscreenElement !== 'undefined' && document.fullscreenElement !== null;

      case 'webkit':
        return document.webkitIsFullScreen;

      default:
        return document[this.prefix + 'FullScreen'];
    }
  };

  fullScreenApi.requestFullscreen = function requestFullScreen(el) {
    return this.prefix === '' ? el.requestFullscreen() : el[this.prefix + 'RequestFullScreen']();
  };

  fullScreenApi.exitFullscreen = function exitFullScreen() {
    return this.prefix === '' ? document.exitFullscreen() : document[this.prefix + 'CancelFullScreen']();
  };
}

/* harmony default export */ __webpack_exports__["default"] = (fullScreenApi);

/***/ }),

/***/ 0:
/*!***************************************!*\
  !*** multi ./src/engage-pdfviewer.js ***!
  \***************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(/*! ./src/engage-pdfviewer.js */"./src/engage-pdfviewer.js");


/***/ })

/******/ })["default"];
});
//# sourceMappingURL=engage-pdfviewer.js.map