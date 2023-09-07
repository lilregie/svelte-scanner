import ZXingModule from './zxing';

let ZXing = ZXingModule({}).then(function (instance) {
	ZXing = instance;
});

self.addEventListener("message", e => {
	const { data, width, height } = e.data as DataInput;

	if (ZXing != null) {
		var buffer = ZXing._malloc(data.byteLength);
		ZXing.HEAPU8.set(data, buffer);
		var result = ZXing.readBarcodeFromPixmap(buffer, width, height, true, "");
		ZXing._free(buffer);

		self.postMessage(result.text || null);
	} else {
		console.log("ZXing is not loaded")
		self.postMessage(null);
	}
});

export interface DataInput {
	data: Uint8ClampedArray;
	width: number;
	height: number;
}
