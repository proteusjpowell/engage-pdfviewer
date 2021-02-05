import fullScreenApi from "./fullscreen";
// Rendering issue references: https://www.pdftron.com/blog/pdf-js/guide-to-pdf-js-rendering/
if (!window.pdfjsLib || !window.pdfjsViewer ||
		!pdfjsLib.getDocument || !pdfjsViewer.PDFViewer) {
	console.log("Please include the pdfjs-dist library.");
}
let animationStartedPromise;
(function animationStartedClosure() {
	// The offsetParent is not set until the PDF.js iframe or object is visible.
	// Waiting for first animation.
	animationStartedPromise = new Promise(function (resolve) {
		window.requestAnimationFrame(resolve);
	});
})();

let id = 0;

function generateId() {
	id++;
	return `epdf_${id}`;
}

const userAgent =
		(typeof navigator !== "undefined" && navigator.userAgent) || "";
const platform =
		(typeof navigator !== "undefined" && navigator.platform) || "";
const maxTouchPoints =
		(typeof navigator !== "undefined" && navigator.maxTouchPoints) || 1;

const isAndroid = /Android/.test(userAgent);
const isIOS =
		/\b(iPad|iPhone|iPod)(?=;)/.test(userAgent) ||
		(platform === "MacIntel" && maxTouchPoints > 1);

// Best explanation I can found for some settings is in the chrome extension
//   see extensions/chromium/preferences_schema.json in the pdfjs project

const USE_ONLY_CSS_ZOOM = false;
// textLayerMode: Controls if the text layer is enabled, and the selection mode that is used.
//  0 = Disabled.
//  1 = Enabled.
//  2 = (Experimental) Enabled, with enhanced text selection.
const TEXT_LAYER_MODE = 2;
// externalLinkTarget:
// Controls how external links will be opened.
//  0 = default.
//  1 = replaces current window.
//  2 = new window/tab.
//  3 = parent.
//  4 = in top window.
const EXTERNAL_LINK_TARGET = 2;
// Limit canvas size to 5 mega-pixels on mobile.
// Support: Android, iOS
const MAX_MOBILE_IMAGE_SIZE = 5242880;
const CMAP_PACKED = true;
const DEFAULT_SCALE = 1.0;
const CSS_UNITS = 96 / 72;
const DEFAULT_SCALE_DELTA = 1.1;
const MIN_SCALE = 0.25;
const MAX_SCALE = 10.0;
// Default zoom level of the viewer. Accepted values: 'auto', 'page-actual', 'page-width', 'page-height', 'page-fit', or a zoom level in percents.
const DEFAULT_SCALE_VALUE = "auto";


class EngagePDFViewer {

	/**
	 * Construct a PDF viewer for the specified container.
	 * @param viewerContainer the view container.
	 */
	constructor(viewerContainer) {
		this.viewerContainer = viewerContainer;
		if (typeof viewerContainer === "string")
			this.viewerContainer = document.getElementById(viewerContainer);
		else
			this.viewerContainer = viewerContainer;
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
		this.eventBus = new pdfjsViewer.EventBus({dispatchToDOM: false});
		//this.scrollToPage = 0;
		this._createUI();

		if (typeof ResizeObserver != "undefined") {
			this.lastContainerSize = null;
			this.resizeObserver = new ResizeObserver(entries => {
				for (let entry of entries) {
					let newWidth = entry.contentRect.width;
					if (this.lastContainerSize != null && this.lastContainerSize !== newWidth) {
						//console.log("ResizeObserver calling rescaleIfNecessary(). "+newWidth + " from " + this.lastContainerSize);
						this._rescaleIfNecessary();
					}
				}
			});
		}

		// Touch support for activating and deactivating scrollbars (if setup in CSS)
		this.viewerContainer.addEventListener('touchstart', (evt) => {
			this.viewerContainer.classList.add("active");
			this.pdfContainer.classList.add("active");
		});
		document.documentElement.addEventListener("touchstart", (evt) => {
			const path = evt.path || (evt.composedPath && evt.composedPath());
			if (!path) return;
			const found = path.find((el) => el.classList && el.classList.contains("engage-pdfviewer"));
			if (!found) {
				// console.log("Touched outside pdf viewer. Deactivating.");
				this.viewerContainer.classList.remove("active");
				this.pdfContainer.classList.remove("active");
			}
		});

		const zoomer = (evt) => {
			// console.log("zoom zoom", evt);
			const deltaY = evt.deltaY;
			if (deltaY < 0) {
				this.zoomIn(Math.log(Math.abs(deltaY)) | 0);
			} else {
				this.zoomOut(Math.log(Math.abs(deltaY)) | 0);
			}
		};
		this.pdfContainer.addEventListener('wheel', (evt) => {
			if (evt.ctrlKey && !fullScreenApi.isFullscreen()) {
				evt.preventDefault();
				zoomer(evt);
			}
		});
		document.addEventListener('wheel', (evt) => {
			if (evt.ctrlKey && fullScreenApi.isFullscreen()) {
				zoomer(evt);
			}
		});
		// this.eventBus.on("scalechanging", (evt) => {
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
	open(options) {
		animationStartedPromise.then(() => this._open(options));
	}

	get title() {
		let pdfTitle, md = this.metadata, info = this.documentInfo;
		if (md && md.has("dc:title")) {
			var title = md.get("dc:title");
			// Ghostscript sometimes returns 'Untitled', so prevent setting the title to 'Untitled.
			if (title !== "Untitled") {
				pdfTitle = title;
			}
		}
		if (!pdfTitle && info && info["Title"]) {
			pdfTitle = info["Title"];
		}
		return pdfTitle;
	}

	get pagesCount() {
		let doc = this.pdfDocument;
		if (doc) return doc.numPages;
		else return 0;
	}

	set page(val) {
		this.pdfViewer.currentPageNumber = val;
		// Builtin scrolling does not work with our usage
		this.scrollPageIntoView(val)
	}

	get page() {
		return this.pdfViewer.currentPageNumber;
	}

	scrollPageIntoView(pageNumber) {
		const page = this.pdfContainer.querySelector(`[data-page-number="${pageNumber}"]`);
		if (page) {
			page.scrollIntoView();
		}
	}

	/**
	 * Closes opened PDF document.
	 * @returns {Promise} - Returns the promise, which is resolved when all
	 * destruction is completed.
	 */
	close() {
		this.error.setAttribute("hidden", "");

		if (!this.pdfLoadingTask) {
			return Promise.resolve();
		}

		const promise = this.pdfLoadingTask.destroy();
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

	showLoadingBar() {
		this.loadingBar.value = 0;
		this.loadingBar.removeAttribute("hidden");
	}

	hideLoadingBar() {
		this.loadingBar.setAttribute("hidden", "");
	}

	zoomIn(ticks, scaleFactor = DEFAULT_SCALE_DELTA) {
		let newScale = this.pdfViewer.currentScale;
		do {
			newScale = (newScale * scaleFactor).toFixed(4);
		} while (--ticks && newScale < MAX_SCALE);
		newScale = Math.ceil(newScale * 100) / 100;
		newScale = Math.min(MAX_SCALE, newScale);
		this.pdfViewer.currentScaleValue = newScale;
	}

	zoomOut(ticks, scaleFactor = DEFAULT_SCALE_DELTA) {
		let newScale = this.pdfViewer.currentScale;
		const page = this.page;
		do {
			newScale = (newScale / scaleFactor).toFixed(4);
		} while (--ticks && newScale > MIN_SCALE);
		newScale = Math.floor(newScale * 100) / 100;
		newScale = Math.max(MIN_SCALE, newScale);
		this.pdfViewer.currentScaleValue = newScale;
	}

	_open(options) {
		if (this.pdfLoadingTask) {
			return this.close().then(
					function () {
						// ... and repeat the open() call.
						return this._open(params);
					}.bind(this)
			);
		}
		if (options.worker_url && pdfjsLib.GlobalWorkerOptions.workerSrc !== options.worker_url) {
			pdfjsLib.GlobalWorkerOptions.workerSrc = options.worker_url;
		}
		this.url = options.url;
		// Loading document.
		let docOptions = {
			url: options.url,
		};
		if (isIOS || isAndroid)
			docOptions.maxImageSize = options.max_mobile_image_size || MAX_MOBILE_IMAGE_SIZE;
		const loadingTask = pdfjsLib.getDocument(docOptions);
		this.pdfLoadingTask = loadingTask;
		this.showLoadingBar();
		this._clearData();
		loadingTask.onProgress = (progressData) => {
			this.loadingBar.max = progressData.total | 0;
			this.loadingBar.value = progressData.loaded | 0;
		};
		return loadingTask.promise.then(
				(pdfDocument) => {
					// Document loaded, specifying document for the viewer.
					this.pdfDocument = pdfDocument;
					this.pdfViewer.setDocument(pdfDocument);
					this.pdfLinkService.setDocument(pdfDocument);
					this.pdfHistory.initialize({fingerprint: pdfDocument.fingerprint});
					this.hideLoadingBar();
					this.toolbar.removeAttribute("hidden");
					this._loadMetaData();
					setTimeout(() => {
						if (this.pagesCount === 1) {
							this.pagerTotal.parentNode.remove();
							this.previousPageButton.parentNode.remove();
						}
					}, 50);
				},
				(exception) => {
					let message = exception && exception.message;
					let l10n = this.l10n;
					let loadingErrorMessage;

					if (exception instanceof pdfjsLib.InvalidPDFException) {
						// change error message also for other builds
						loadingErrorMessage = l10n.get(
								"invalid_file_error",
								null,
								"Invalid or corrupted PDF file."
						);
					} else if (exception instanceof pdfjsLib.MissingPDFException) {
						// special message for missing PDFs
						loadingErrorMessage = l10n.get(
								"missing_file_error",
								null,
								"Missing PDF file."
						);
					} else if (exception instanceof pdfjsLib.UnexpectedResponseException) {
						loadingErrorMessage = l10n.get(
								"unexpected_response_error",
								null,
								"Unexpected server response."
						);
					} else {
						loadingErrorMessage = l10n.get(
								"loading_error",
								null,
								"An error occurred while loading the PDF."
						);
					}

					loadingErrorMessage.then((msg) => {
						this._showError(msg + "\n" + message);
					});
					this.hideLoadingBar();
					this.toolbar.setAttribute("hidden", "");
				}
		);
	}

	_clearData() {
		this.metadata = null;
		this.documentInfo = null;
	}

	_showError(msg) {
		this.error.removeAttribute("hidden");
		this.error.value = msg;
	}

	_createUI() {
		this.pdfContainer.appendChild(this._createPDFViewer());
		this.viewerContainer.appendChild(this._createLoadingBar());
		this.viewerContainer.appendChild(this._createErrorViewer());
		this.viewerContainer.appendChild(this._createToolBar());
		this._initUI();
	}

	_createPDFViewer() {
		let div = document.createElement("div");
		div.classList.add("pdfViewer");
		this.viewer = div;
		return div;
	}

	_createLoadingBar() {
		let element = document.createElement("progress");
		element.setAttribute("hidden", "");
		element.classList.add("loadingBar");
		this.loadingBar = element;
		return element;
	}

	_createErrorViewer() {
		let element = document.createElement("textarea");
		element.setAttribute("hidden", "");
		element.setAttribute("readonly", "readonly");
		element.classList.add("error");
		this.error = element;
		return element;
	}

	_createToolBar() {
		let bar = document.createElement("div");
		bar.classList.add("toolbar");
		bar.appendChild(this._createNavButtons());
		bar.appendChild(this._createPager());
		bar.appendChild(this._createZoomButtons());
		bar.appendChild(this._createDownloadButton());
		bar.appendChild(this._createFullscreenButton());
		this.toolbar = bar;
		return bar;
	}

	_createNavButtons() {
		let container = document.createElement("div");
		container.classList.add("nav-con");
		let previous = document.createElement("button");
		previous.classList.add("btn");
		previous.classList.add("nav-btn");
		previous.classList.add("previous-btn");
		previous.setAttribute("title", "Previous Page");
		previous.setAttribute("type", "button");
		previous.innerText = "Previous";
		container.appendChild(previous);
		let next = document.createElement("button");
		next.classList.add("btn");
		next.classList.add("nav-btn");
		next.classList.add("next-btn");
		next.innerText = "Next";
		next.setAttribute("title", "Next Page");
		next.setAttribute("type", "button");
		container.appendChild(next);
		previous.addEventListener("click", () => {
			this.page--;
		});
		next.addEventListener("click", () => {
			this.page++;
		});
		this.previousPageButton = previous;
		this.nextPageButton = next;
		return container;
	}

	_createPager() {
		let container = document.createElement("div");
		container.classList.add("pager-con");
		let pagerLabel = document.createElement("label");
		let inputId = generateId();
		pagerLabel.setAttribute("for", inputId);
		pagerLabel.innerText = "Page";
		pagerLabel.classList.add("pager-label");
		container.appendChild(pagerLabel);
		let pageNumber = document.createElement("input");
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
		pageNumber.addEventListener("change", () => {
			let newPage = pageNumber.value;
			if (newPage === '') return;
			this.page = parseInt(newPage, 10);
			pageNumber.value = this.page;
		});
		container.appendChild(pageNumber);
		let pageTotal = document.createElement("span");
		pageTotal.classList.add("pager-total");
		container.appendChild(pageTotal);
		this.pagerNumber = pageNumber;
		this.pagerTotal = pageTotal;
		return container;
	}

	_createZoomButtons() {
		let container = document.createElement("div");
		container.classList.add("zoom-con");
		let zoomOut = document.createElement("button");
		zoomOut.classList.add("btn");
		zoomOut.classList.add("zoom-btn");
		zoomOut.classList.add("zoom-out-btn");
		zoomOut.setAttribute("title", "Zoom Out");
		zoomOut.setAttribute("type", "button");
		zoomOut.textContent = "-";
		container.appendChild(zoomOut);
		let zoomIn = document.createElement("button");
		zoomIn.classList.add("btn");
		zoomIn.classList.add("zoom-btn");
		zoomIn.classList.add("zoom-in-btn");
		zoomIn.setAttribute("title", "Zoom In");
		zoomIn.setAttribute("type", "button");
		zoomIn.textContent = "+";
		container.appendChild(zoomIn);
		zoomIn.addEventListener("click", (evt) => {
			evt.preventDefault();
			evt.stopPropagation();
			this.zoomIn();
		});
		zoomOut.addEventListener("click", (evt) => {
			evt.preventDefault();
			evt.stopPropagation();
			this.zoomOut();
		});
		return container;
	}

	_getParentAttribute(el, attributeName) {
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

	_createDownloadButton() {
		let download = document.createElement("button");
		download.classList.add("btn");
		download.classList.add("download-btn");
		download.setAttribute("title", "Download");
		download.setAttribute("type", "button");

		let fileName = this._getParentAttribute(this.viewerContainer, 'data-file-label');
		let fileId = this._getParentAttribute(this.viewerContainer, 'data-file-id');

		if (fileName != null && fileId != null) {
			download.setAttribute("data-ga-on", "click");
			download.setAttribute("data-ga-event-category", "Asset - Document");
			download.setAttribute("data-ga-event-action", "Download");
			download.setAttribute("data-ga-event-label", fileName);
			download.setAttribute("data-ga-event-value", fileId);
		}

		download.textContent = "Download";
		download.addEventListener("click", (evt) => {
			evt.preventDefault();
			evt.stopPropagation();
			window.location = this.url;
		});
		return download;
	}

	_createFullscreenButton() {
		let fullscreenButton = document.createElement("button");
		fullscreenButton.classList.add("btn");
		fullscreenButton.classList.add("fullscreen-btn");
		fullscreenButton.setAttribute("title", "Switch To Presentation Mode");
		fullscreenButton.setAttribute("type", "button");
		fullscreenButton.innerText = "Full Screen";
		this.fullscreenButton = fullscreenButton;
		return fullscreenButton;
	}

	_initUI() {
		this.pdfLinkService = new pdfjsViewer.PDFLinkService({
			eventBus: this.eventBus,
			externalLinkTarget: EXTERNAL_LINK_TARGET,
		});
		this.l10n = pdfjsViewer.NullL10n;
		let pdfViewerOptions = {
			container: this.pdfContainer,
			linkService: this.pdfLinkService,
			l10n: this.l10n,
			useOnlyCssZoom: USE_ONLY_CSS_ZOOM,
			textLayerMode: TEXT_LAYER_MODE,
			eventBus: this.eventBus,
			cMapPacked: CMAP_PACKED,
		};
		if (isAndroid) {
			// Workaround poor pinch-zoom behavior by disabling text layer.
			pdfViewerOptions.textLayerMode = 0;
		}
		let pdfViewer = new pdfjsViewer.PDFViewer(pdfViewerOptions);
		this.pdfViewer = pdfViewer;
		this.pdfLinkService.setViewer(pdfViewer);

		this.pdfHistory = new pdfjsViewer.PDFHistory({
			linkService: this.pdfLinkService,
			eventBus: this.eventBus,
		});
		this.pdfLinkService.setHistory(this.pdfHistory);
		if (fullScreenApi.supportsFullscreen) {
			this.fullscreenButton.addEventListener('click', () => {
				if (fullScreenApi.isFullscreen()) {
					fullScreenApi.exitFullscreen();
				} else {
					fullScreenApi.requestFullscreen(this.viewerContainer);
				}
			});
			document.addEventListener(fullScreenApi.fullscreenEventName, (evt) => {
				if (evt.target.id !== this.viewerContainer.id) {
					// console.log("evt not for me", evt);
					return;
				}
				if (fullScreenApi.isFullscreen()) {
					this.viewerContainer.classList.add("fullscreen");
					this.fullscreenButton.innerText = "Exit Full Screen";
					this.pdfViewer.currentScaleValue = "page-actual";
					this.scrollPageIntoView(this.page);
				} else {
					this.viewerContainer.classList.remove("fullscreen");
					this.fullscreenButton.innerText = "Full Screen";
					this.pdfViewer.currentScaleValue = DEFAULT_SCALE_VALUE;
					this.scrollPageIntoView(this.page);
					this._rescaleIfNecessary();
				}
			});
		} else {
			this.fullscreenButton.remove();
		}

		this.eventBus.on("pagesinit", () => {
			// We can use pdfViewer now, e.g. let's change default scale.
			this.pdfViewer.currentScaleValue = DEFAULT_SCALE_VALUE;
			setTimeout(() => {
				this._handleNavigationEnabling();
				this._rescaleIfNecessary();
			}, 10);

			if (this.resizeObserver) {
				this.lastContainerSize = this.viewerContainer.clientWidth;
				this.resizeObserver.observe(this.viewerContainer);
			}
		});

		this.eventBus.on("pagechanging", () => {
					this._handleNavigationEnabling();
				},
				true
		);
	}

	_rescaleIfNecessary(tryCount) {
		let newTryCount = (tryCount || 0) + 1;
		if (newTryCount > 10) {
			console.log(`Giving up trying to rescale for div#${this.viewerContainer.id}.`);
			return;
		}/* else {
			console.log(`Rescale try#${newTryCount} for div#${this.viewerContainer.id}`);
		}*/
		setTimeout(() => {
			let hasScrollBar = this.pdfContainer.scrollWidth > this.pdfContainer.clientWidth;
			// console.log(`div#${this.viewerContainer.id} hasScrollBar=${hasScrollBar}`);
			if (hasScrollBar) {
				this.pdfViewer.currentScaleValue = DEFAULT_SCALE_VALUE;
				this._rescaleIfNecessary(newTryCount);
			}
		}, 50);
	}

	_handleNavigationEnabling() {
		let page = this.page;
		let numPages = this.pagesCount;
		this.pagerNumber.value = page;
		this.pagerTotal.innerText = `of ${numPages}`;
		this.previousPageButton.disabled = page <= 1;
		this.nextPageButton.disabled = page >= numPages;
	}

	_loadMetaData() {
		this.pdfDocument.getMetadata().then((data) => {
			this.documentInfo = data.info;
			this.metadata = data.metadata;

			// Provides some basic debug information
			console.log(
					"PDF " +
					this.pdfDocument.fingerprint +
					", " + (data.info.Title || data.info.Subject || this.title || "-") +
					" [" +
					data.info.PDFFormatVersion +
					" " +
					(data.info.Producer || "-").trim() +
					" / " +
					(data.info.Creator || "-").trim() +
					"]" +
					(data.info.IsAcroFormPresent ? " AcroForm " : "") +
					" (PDF.js: " +
					(pdfjsLib.version || "-") +
					")"
			);
		});
	}
}

export default EngagePDFViewer;
