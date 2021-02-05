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

 // Rendering issue references: https://www.pdftron.com/blog/pdf-js/guide-to-pdf-js-rendering/

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
}

var userAgent = typeof navigator !== "undefined" && navigator.userAgent || "";
var platform = typeof navigator !== "undefined" && navigator.platform || "";
var maxTouchPoints = typeof navigator !== "undefined" && navigator.maxTouchPoints || 1;
var isAndroid = /Android/.test(userAgent);
var isIOS = /\b(iPad|iPhone|iPod)(?=;)/.test(userAgent) || platform === "MacIntel" && maxTouchPoints > 1; // Best explanation I can found for some settings is in the chrome extension
//   see extensions/chromium/preferences_schema.json in the pdfjs project

var USE_ONLY_CSS_ZOOM = false; // textLayerMode: Controls if the text layer is enabled, and the selection mode that is used.
//  0 = Disabled.
//  1 = Enabled.
//  2 = (Experimental) Enabled, with enhanced text selection.

var TEXT_LAYER_MODE = 2; // externalLinkTarget:
// Controls how external links will be opened.
//  0 = default.
//  1 = replaces current window.
//  2 = new window/tab.
//  3 = parent.
//  4 = in top window.

var EXTERNAL_LINK_TARGET = 2; // Limit canvas size to 5 mega-pixels on mobile.
// Support: Android, iOS

var MAX_MOBILE_IMAGE_SIZE = 5242880;
var CMAP_PACKED = true;
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

    this.pdfLoadingTask = null;
    this.pdfDocument = null;
    this.pdfViewer = null;
    this.pdfHistory = null;
    this.pdfLinkService = null;
    this.l10n = null;
    this.metadata = null;
    this.documentInfo = null;
    this.eventBus = new pdfjsViewer.EventBus({
      dispatchToDOM: false
    }); //this.scrollToPage = 0;

    this._createUI();

    if (typeof ResizeObserver != "undefined") {
      this.lastContainerSize = null;
      this.resizeObserver = new ResizeObserver(function (entries) {
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = entries[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var entry = _step.value;
            var newWidth = entry.contentRect.width;

            if (_this.lastContainerSize != null && _this.lastContainerSize !== newWidth) {
              //console.log("ResizeObserver calling rescaleIfNecessary(). "+newWidth + " from " + this.lastContainerSize);
              _this._rescaleIfNecessary();
            }
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator["return"] != null) {
              _iterator["return"]();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }
      });
    } // Touch support for activating and deactivating scrollbars (if setup in CSS)


    this.viewerContainer.addEventListener('touchstart', function (evt) {
      _this.viewerContainer.classList.add("active");

      _this.pdfContainer.classList.add("active");
    });
    document.documentElement.addEventListener("touchstart", function (evt) {
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

    var zoomer = function zoomer(evt) {
      // console.log("zoom zoom", evt);
      var deltaY = evt.deltaY;

      if (deltaY < 0) {
        _this.zoomIn(Math.log(Math.abs(deltaY)) | 0);
      } else {
        _this.zoomOut(Math.log(Math.abs(deltaY)) | 0);
      }
    };

    this.pdfContainer.addEventListener('wheel', function (evt) {
      if (evt.ctrlKey && !_fullscreen__WEBPACK_IMPORTED_MODULE_0__["default"].isFullscreen()) {
        evt.preventDefault();
        zoomer(evt);
      }
    });
    document.addEventListener('wheel', function (evt) {
      if (evt.ctrlKey && _fullscreen__WEBPACK_IMPORTED_MODULE_0__["default"].isFullscreen()) {
        zoomer(evt);
      }
    }); // this.eventBus.on("scalechanging", (evt) => {
    // 	if (this.scrollToPage === 0 && evt.source === this.pdfViewer) {
    // 		this.scrollToPage = this.pdfViewer.currentPageNumber;
    // 		// console.log("scalechanging, page = " + this.pdfViewer.currentPageNumber, evt);
    // 	}
    // });
    // this.eventBus.on("updateviewarea", (evt) => {
    // 	if (this.scrollToPage > 0  && evt.source === this.pdfViewer) {
    // 		// console.log("updateviewarea, scroll to page = " + this.scrollToPage, evt);
    // 		const newPageNumber = this.scrollToPage;
    // 		this.scrollToPage = 0;
    // 		setTimeout(() => {
    // 			this.scrollPageIntoView(newPageNumber);
    // 		}, 10);
    // 	}
    // });
  }
  /**
   * Open a PDF.
   * @param options are: url, worker_url, and cmap_url, max_mobile_image_size. "url" is required.
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
      var scaleFactor = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : DEFAULT_SCALE_DELTA;
      var newScale = this.pdfViewer.currentScale;

      do {
        newScale = (newScale * scaleFactor).toFixed(4);
      } while (--ticks && newScale < MAX_SCALE);

      newScale = Math.ceil(newScale * 100) / 100;
      newScale = Math.min(MAX_SCALE, newScale);
      this.pdfViewer.currentScaleValue = newScale;
    }
  }, {
    key: "zoomOut",
    value: function zoomOut(ticks) {
      var scaleFactor = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : DEFAULT_SCALE_DELTA;
      var newScale = this.pdfViewer.currentScale;
      var page = this.page;

      do {
        newScale = (newScale / scaleFactor).toFixed(4);
      } while (--ticks && newScale > MIN_SCALE);

      newScale = Math.floor(newScale * 100) / 100;
      newScale = Math.max(MIN_SCALE, newScale);
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

      var docOptions = {
        url: options.url
      };
      if (isIOS || isAndroid) docOptions.maxImageSize = options.max_mobile_image_size || MAX_MOBILE_IMAGE_SIZE;
      var loadingTask = pdfjsLib.getDocument(docOptions);
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
      previous.setAttribute("type", "button");
      previous.innerText = "Previous";
      container.appendChild(previous);
      var next = document.createElement("button");
      next.classList.add("btn");
      next.classList.add("nav-btn");
      next.classList.add("next-btn");
      next.innerText = "Next";
      next.setAttribute("title", "Next Page");
      next.setAttribute("type", "button");
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
      pageNumber.addEventListener("click", function (evt) {
        evt.preventDefault();
        evt.stopPropagation();
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
      zoomOut.setAttribute("type", "button");
      zoomOut.textContent = "-";
      container.appendChild(zoomOut);
      var zoomIn = document.createElement("button");
      zoomIn.classList.add("btn");
      zoomIn.classList.add("zoom-btn");
      zoomIn.classList.add("zoom-in-btn");
      zoomIn.setAttribute("title", "Zoom In");
      zoomIn.setAttribute("type", "button");
      zoomIn.textContent = "+";
      container.appendChild(zoomIn);
      zoomIn.addEventListener("click", function (evt) {
        evt.preventDefault();
        evt.stopPropagation();

        _this6.zoomIn();
      });
      zoomOut.addEventListener("click", function (evt) {
        evt.preventDefault();
        evt.stopPropagation();

        _this6.zoomOut();
      });
      return container;
    }
  }, {
    key: "_getParentAttribute",
    value: function _getParentAttribute(el, attributeName) {
      if (el === document || el === undefined || el == null) return null;
      var parent = el;

      while (parent != document.body && parent != null) {
        if (parent.getAttribute(attributeName)) {
          return parent.getAttribute(attributeName);
        }

        parent = parent.parentNode;
      }

      return null;
    }
  }, {
    key: "_createDownloadButton",
    value: function _createDownloadButton() {
      var _this7 = this;

      var download = document.createElement("button");
      download.classList.add("btn");
      download.classList.add("download-btn");
      download.setAttribute("title", "Download");
      download.setAttribute("type", "button");

      var fileName = this._getParentAttribute(this.viewerContainer, 'data-file-label');

      var fileId = this._getParentAttribute(this.viewerContainer, 'data-file-id');

      if (fileName != null && fileId != null) {
        download.setAttribute("data-ga-on", "click");
        download.setAttribute("data-ga-event-category", "Asset - Document");
        download.setAttribute("data-ga-event-action", "Download");
        download.setAttribute("data-ga-event-label", fileName);
        download.setAttribute("data-ga-event-value", fileId);
      }

      download.textContent = "Download";
      download.addEventListener("click", function (evt) {
        evt.preventDefault();
        evt.stopPropagation();
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
      fullscreenButton.setAttribute("type", "button");
      fullscreenButton.innerText = "Full Screen";
      this.fullscreenButton = fullscreenButton;
      return fullscreenButton;
    }
  }, {
    key: "_initUI",
    value: function _initUI() {
      var _this8 = this;

      this.pdfLinkService = new pdfjsViewer.PDFLinkService({
        eventBus: this.eventBus,
        externalLinkTarget: EXTERNAL_LINK_TARGET
      });
      this.l10n = pdfjsViewer.NullL10n;
      var pdfViewerOptions = {
        container: this.pdfContainer,
        linkService: this.pdfLinkService,
        l10n: this.l10n,
        useOnlyCssZoom: USE_ONLY_CSS_ZOOM,
        textLayerMode: TEXT_LAYER_MODE,
        eventBus: this.eventBus,
        cMapPacked: CMAP_PACKED
      };

      if (isAndroid) {
        // Workaround poor pinch-zoom behavior by disabling text layer.
        pdfViewerOptions.textLayerMode = 0;
      }

      var pdfViewer = new pdfjsViewer.PDFViewer(pdfViewerOptions);
      this.pdfViewer = pdfViewer;
      this.pdfLinkService.setViewer(pdfViewer);
      this.pdfHistory = new pdfjsViewer.PDFHistory({
        linkService: this.pdfLinkService,
        eventBus: this.eventBus
      });
      this.pdfLinkService.setHistory(this.pdfHistory);

      if (_fullscreen__WEBPACK_IMPORTED_MODULE_0__["default"].supportsFullscreen) {
        this.fullscreenButton.addEventListener('click', function () {
          if (_fullscreen__WEBPACK_IMPORTED_MODULE_0__["default"].isFullscreen()) {
            _fullscreen__WEBPACK_IMPORTED_MODULE_0__["default"].exitFullscreen();
          } else {
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

      this.eventBus.on("pagesinit", function () {
        // We can use pdfViewer now, e.g. let's change default scale.
        _this8.pdfViewer.currentScaleValue = DEFAULT_SCALE_VALUE;
        setTimeout(function () {
          _this8._handleNavigationEnabling();

          _this8._rescaleIfNecessary();
        }, 10);

        if (_this8.resizeObserver) {
          _this8.lastContainerSize = _this8.viewerContainer.clientWidth;

          _this8.resizeObserver.observe(_this8.viewerContainer);
        }
      });
      this.eventBus.on("pagechanging", function () {
        _this8._handleNavigationEnabling();
      }, true);
    }
  }, {
    key: "_rescaleIfNecessary",
    value: function _rescaleIfNecessary(tryCount) {
      var _this9 = this;

      var newTryCount = (tryCount || 0) + 1;

      if (newTryCount > 10) {
        console.log("Giving up trying to rescale for div#".concat(this.viewerContainer.id, "."));
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

        console.log("PDF " + _this10.pdfDocument.fingerprint + ", " + (data.info.Title || data.info.Subject || _this10.title || "-") + " [" + data.info.PDFFormatVersion + " " + (data.info.Producer || "-").trim() + " / " + (data.info.Creator || "-").trim() + "]" + (data.info.IsAcroFormPresent ? " AcroForm " : "") + " (PDF.js: " + (pdfjsLib.version || "-") + ")");
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