if (!window.pdfjsLib || !window.pdfjsViewer ||
		!pdfjsLib.getDocument || !pdfjsViewer.PDFViewer) {
	console.log("Please include the pdfjs-dist library.");
}
let animationStartedPromise;
(function animationStartedClosure() {
	// The offsetParent is not set until the PDF.js iframe or object is visible.
	// Waiting for first animation.
	animationStartedPromise = new Promise(function(resolve) {
		window.requestAnimationFrame(resolve);
	});
})();

// Best explanation I can found for some settings is in the chrome extension
//   see extensions/chromium/preferences_schema.json in the pdfjs project

const USE_ONLY_CSS_ZOOM = false;
// textLayerMode: Controls if the text layer is enabled, and the selection mode that is used.
//  0 = Disabled.
//  1 = Enabled.
//  2 = (Experimental) Enabled, with enhanced text selection.
const TEXT_LAYER_MODE = 1;
// externalLinkTarget:
// Controls how external links will be opened.
//  0 = default.
//  1 = replaces current window.
//  2 = new window/tab.
//  3 = parent.
//  4 = in top window.
const EXTERNAL_LINK_TARGET = 0;
const MAX_IMAGE_SIZE = 1024 * 1024;
const CMAP_URL = "https://unpkg.com/pdfjs-dist@2.2.228/cmaps/";
const CMAP_PACKED = true;
pdfjsLib.GlobalWorkerOptions.workerSrc = "https://unpkg.com/pdfjs-dist@2.2.228/build/pdf.worker.js";

const DEFAULT_SCALE = 1.0;
const CSS_UNITS = 96/72;
const DEFAULT_SCALE_DELTA = 1.1;
const MIN_SCALE = 0.25;
const MAX_SCALE = 10.0;
// Default zoom level of the viewer. Accepted values: 'auto', 'page-actual', 'page-width', 'page-height', 'page-fit', or a zoom level in percents.
const DEFAULT_SCALE_VALUE = "auto";

class EngagePDFViewer {

	/**
	 * Construct a PDF viewer for the specified container.
	 * @param viewContainer.
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

		this.pdfLoadingTask = null;
		this.pdfDocument = null;
		this.pdfViewer = null;
		this.pdfHistory = null;
		this.pdfLinkService = null;
		this.l10n = null;
		this.metadata = null;
		this.documentInfo = null;

		this._createUI();
	}

	/**
	 * Open a PDF.
	 * @param options options are: url, worker_url. "url" is required.
	 */
	open(options) {
		animationStartedPromise.then(() => this._open(options));
	}

	get supportsFullscreen() {
		let support;
		const doc = document.documentElement;
		support = !!(doc.requestFullscreen || doc.mozRequestFullScreen || doc.webkitRequestFullScreen || doc.msRequestFullscreen);

		if (document.fullscreenEnabled === false || document.mozFullScreenEnabled === false || document.webkitFullscreenEnabled === false || document.msFullscreenEnabled === false) {
			support = false;
		}

		return support;
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
		return this.pdfDocument.numPages;
	}

	set page(val) {
		this.pdfViewer.currentPageNumber = val;
		// Builtin scrolling does not work with our usage
		this.scrollPageIntoView(val)
	}

	get page() {
		return this.pdfViewer.currentPageNumber;
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
		const loadingTask = pdfjsLib.getDocument({
			url: options.url,
			maxImageSize: MAX_IMAGE_SIZE,
		});
		this.pdfLoadingTask = loadingTask;
		this.showLoadingBar();
		this._clearData();
		loadingTask.onProgress = (progressData) => {
			this.loadingBar.max = progressData.total;
			this.loadingBar.value = progressData.loaded;
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

	zoomIn(ticks) {
		let newScale = this.pdfViewer.currentScale;
		do {
			newScale = (newScale * DEFAULT_SCALE_DELTA).toFixed(2);
			newScale = Math.ceil(newScale * 10) / 10;
			newScale = Math.min(MAX_SCALE, newScale);
		} while (--ticks && newScale < MAX_SCALE);
		this.pdfViewer.currentScaleValue = newScale;
	}

	zoomOut(ticks) {
		let newScale = this.pdfViewer.currentScale;
		do {
			newScale = (newScale / DEFAULT_SCALE_DELTA).toFixed(2);
			newScale = Math.floor(newScale * 10) / 10;
			newScale = Math.max(MIN_SCALE, newScale);
		} while (--ticks && newScale > MIN_SCALE);
		this.pdfViewer.currentScaleValue = newScale;
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
		previous.classList.add("nav-btn");
		previous.classList.add("nav-previous");
		previous.setAttribute("title", "Previous Page");
		previous.innerText = "Previous";
		container.appendChild(previous);
		let next = document.createElement("button");
		next.classList.add("nav-btn");
		next.classList.add("nav-next");
		next.innerText = "Next";
		next.setAttribute("title", "Next Page");
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

	_createZoomButtons() {
		let container = document.createElement("div");
		container.classList.add("zoom-con");
		let zoomOut = document.createElement("button");
		zoomOut.classList.add("zoom-btn");
		zoomOut.classList.add("zoom-out");
		zoomOut.setAttribute("title", "Zoom Out");
		zoomOut.textContent = "-";
		container.appendChild(zoomOut);
		let zoomIn = document.createElement("button");
		zoomIn.classList.add("zoom-btn");
		zoomIn.classList.add("zoom-in");
		zoomIn.setAttribute("title", "Zoom In");
		zoomIn.textContent = "+";
		container.appendChild(zoomIn);
		zoomIn.addEventListener("click", () => {
			this.zoomIn();
		});
		zoomOut.addEventListener("click", () => {
			this.zoomOut();
		});
		return container;
	}

	_createDownloadButton() {
		let download = document.createElement("button");
		download.classList.add("download-btn");
		download.setAttribute("title", "Download");
		download.textContent = "Download";
		download.addEventListener("click", () => {
			window.location = this.url;
		});
		return download;
	}

	_createFullscreenButton() {
		let fullscreenButton = document.createElement("button");
		fullscreenButton.classList.add("fullscreen-btn");
		fullscreenButton.setAttribute("title", "Switch To Presentation Mode");
		fullscreenButton.innerText = "Full Screen";
		this.fullscreenButton = fullscreenButton;
		return fullscreenButton;
	}

	_initUI() {
		this.pdfLinkService = new pdfjsViewer.PDFLinkService();
		this.l10n = pdfjsViewer.NullL10n;
		// const eventBus = pdfjsViewer.getGlobalEventBus;
		let pdfViewer = new pdfjsViewer.PDFViewer({
			container: this.pdfContainer,
			linkService: this.pdfLinkService,
			l10n: this.l10n,
			useOnlyCssZoom: USE_ONLY_CSS_ZOOM,
			textLayerMode: TEXT_LAYER_MODE,
		});
		this.pdfViewer = pdfViewer;
		this.pdfLinkService.setViewer(pdfViewer);

		this.pdfHistory = new pdfjsViewer.PDFHistory({
			linkService: this.pdfLinkService,
		});
		this.pdfLinkService.setHistory(this.pdfHistory);
		if (this.supportsFullscreen) {
			this.fullscreenButton.addEventListener('click', () => {
				if (document.fullscreen || document.fullscreenElement !== null) {
					if (document.exitFullscreen) document.exitFullscreen();
				} else {
					this.viewerContainer.requestFullscreen();
				}
			});
			document.addEventListener("fullscreenchange", () => {
				if (document.fullscreen || document.fullscreenElement !== null) {
					this.fullscreenButton.innerText = "Exit Full Screen";
					this.pdfViewer.currentScaleValue = "page-actual";
					this.scrollPageIntoView(this.page);
				} else {
					this.fullscreenButton.innerText = "Full Screen";
					this.pdfViewer.currentScaleValue = DEFAULT_SCALE_VALUE;
					scrollPageIntoView(this.page);
				}
			});
		} else {
			this.fullscreenButton.remove();
		}

		document.addEventListener("pagesinit", () => {
			// We can use pdfViewer now, e.g. let's change default scale.
			this.pdfViewer.currentScaleValue = DEFAULT_SCALE_VALUE;
			this.handleNavigationEnabling();
		});

		document.addEventListener(
				"pagechanging",
				(evt) => {
					this.handleNavigationEnabling(evt.detail.pageNumber);
				},
				true
		);
	}

	handleNavigationEnabling(pageNumber) {
		let page = pageNumber || this.page;
		let numPages = this.pagesCount;
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
					" [" +
					data.info.PDFFormatVersion +
					" " +
					(data.info.Producer || "-").trim() +
					" / " +
					(data.info.Creator || "-").trim() +
					"]" +
					" (PDF.js: " +
					(pdfjsLib.version || "-") +
					")"
			);
		});
	}
}

export default EngagePDFViewer;