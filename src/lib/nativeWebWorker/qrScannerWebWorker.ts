let barcodeDetector: BarcodeDetector;
BarcodeDetector.getSupportedFormats().then((formats) => {
	barcodeDetector = new BarcodeDetector({formats});
});

self.addEventListener("message", e => {
	const { data, width, height } = e.data as DataInput;

	if (barcodeDetector) {
		barcodeDetector.detect(new ImageData(data, width, height)).then(result => {
			if (result.length > 0) {
				self.postMessage(result[0].rawValue);
			} else {
				self.postMessage(null);
			}
		});
	} else {
		// Barcode API hasn't loaded yet
		setTimeout(() => { self.postMessage(null) }, 50);
	}
});

export interface DataInput {
	data: Uint8ClampedArray;
	width: number;
	height: number;
}
