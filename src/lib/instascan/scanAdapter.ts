// Possible Workers
import zxing_qrScannerWebWorker from '../zxingWebWorker/qrScannerWebWorker?worker';
import native_qrScannerWebWorker from '../nativeWebWorker/qrScannerWebWorker?worker';

import type { DataInput } from "$lib/zxingWebWorker/qrScannerWebWorker";
import { testNativeBarcodeReader } from '$lib/capabilty';
import type { Writable } from 'svelte/store';
import { writable } from 'svelte/store';

import { BROWSER } from 'esm-env';
let worker: Worker | null = null;

export let barcodeEngine: Writable<"zxing" | "native" | null> = writable(null);

testNativeBarcodeReader().then((nativeBarcodeReaderSupported)=>{
    if (!BROWSER) {
        return;
    }

    if (nativeBarcodeReaderSupported) {
        worker = new native_qrScannerWebWorker();
        console.log("Scanning with native barcode reader");
        barcodeEngine.set("native");
    } else {
        // why must the web be like this?
        worker = new zxing_qrScannerWebWorker();
        console.log("Scanning with ZXING Barcode Reader");
        barcodeEngine.set("zxing");
    }
})

export async function scanData(data: Uint8ClampedArray, width: number, height: number): Promise<ScanResult> {
    let promise = new Promise<ScanResult>((resolve, reject) => {
        if (worker) {
            worker.onmessage = (e) => {
                resolve({ result: e.data, error: null});
            }
            worker.postMessage({data, width, height} as DataInput);
        } else {
            // Worker Not Ready Yet
            setTimeout(()=>{resolve({ result: null, error: null});}, 50)
        }

    })

    return await promise
}

export interface ScanResult {
    result: string | null,
    error: string | null
}