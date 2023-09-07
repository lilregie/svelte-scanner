declare module 'barcode' {
	global {
		class BarcodeDetector {
			constructor(barcodeDetectorOptions: {});

			static getSupportedFormats(): Promise<BarcodeFormat[]>;

			detect(image: ImageBitmapSource): Promise<DetectedBarcode[]>;
		}
	}

	type BarcodeFormat = "aztec" | "code_128" | "code_39" | "code_93" | "codabar" | "data_matrix" | "ean_13" | "ean_8" | "itf" | "pdf417" | "qr_code" | "unknown" | "upc_a" | "upc_e";

	interface DetectedBarcode {
		boundingBox: BarcodeRect;
		rawValue: string;
		format: BarcodeFormat;
		cornerPoints: [Point2D, Point2D, Point2D, Point2D];
	}

	interface Point2D {
		x: number;
		y: number;
	}

	interface BarcodeRect {
		x: number;
		y: number;
		width: number;
		height: number;
		top: number;
		right: number;
		bottom: number;
		left: number;
	}
}
