import { Scanner } from "./scanner";
import { Camera,MediaError } from "./camera";


// Bug in Vite as of 2022-02-05
// URL Imports within a webworker don't actually include
// the resource in the production build.
// So we can force the inclusion like so:
import wasmBinaryURL from '../zxingWebWorker/xzingBinary.wasm?url';

export const Instascan = { Scanner, Camera, MediaError };