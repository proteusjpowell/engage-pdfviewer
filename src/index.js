
function example() {

	try {
		document.querySelectorAll(".engage-pdfviewer").forEach((el) =>{
			let foo = new EngagePDFViewer(el);
			foo.open({url: el.dataset.url});
		});
	}catch (e) {
		console.error(e);
	}
}
example();
