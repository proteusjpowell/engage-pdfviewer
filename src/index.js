
function init() {
	// const DEFAULT_URL = "/pdfs/Engage_One_Pager.pdf";
	const DEFAULT_URL = "/pdfs/compressed.tracemonkey-pldi-09.pdf";

	try {
		document.querySelectorAll(".engage-pdfviewer").forEach((el) =>{
			let foo = new EngagePDFViewer(el);
			foo.open({url: DEFAULT_URL});
		});
	}catch (e) {
		console.error(e);
	}
}
init();