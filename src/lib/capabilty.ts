import { BROWSER } from "esm-env";

export async function testCapabilities(): Promise<Error> {
	if (!BROWSER) {
		return null;
	}

	try {
		// Only chrome and old firefox support this
		//@ts-ignore
		let cameraPermState: string = (await navigator?.permissions?.query({ name: "camera" }))?.state
		if (cameraPermState === "denied") {
			console.log("Camera Permission denied")
			return new Error("Camera Permission denied")
		}
	} catch(e) {}

	// From https://stackoverflow.com/a/47880734
	const WasmSupported = (() => {
		try {
			if (typeof WebAssembly === "object"
				&& typeof WebAssembly.instantiate === "function") {
				const module = new WebAssembly.Module(Uint8Array.of(0x0, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00));
				if (module instanceof WebAssembly.Module)
					return new WebAssembly.Instance(module) instanceof WebAssembly.Instance;
			}
		} catch (e) {}

		return false;
	})();

	if (!WasmSupported) {
		return new Error("WebAssembly Not Supported")
	}

	return null
}

export async function testNativeBarcodeReader() {
	if (!BROWSER) {
		return null;
	}

	if ("BarcodeDetector" in window) {
		const supportedFormats = await BarcodeDetector.getSupportedFormats();
		return supportedFormats.includes("qr_code")
	}

	return false
}
