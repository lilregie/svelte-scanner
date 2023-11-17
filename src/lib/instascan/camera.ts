export let mediaErrorCallback: CallableFunction | null = null;

function cameraName(label: string) {
	let clean = label.replace(/\s*\([0-9a-f]+(:[0-9a-f]+)?\)\s*$/, '');

	return clean || label;
}

export async function wait(seconds: number): Promise<void> {
	await new Promise((resolve) => setTimeout(() => resolve(true), seconds * 1000))
}

export class MediaError extends Error {
	type: any;

	constructor(type: any) {
		super(`Cannot access video stream (${type}).`);
		this.type = type;
	}
}

export class Camera {
	id: string;
	name: string;
	aspectRatio: number;
	_stream: MediaStream | null;

	constructor(id: string, name: string) {
		this.id = id;
		this.name = name;
		this.aspectRatio = 1;
		this._stream = null;
	}

	async start() {
		let constraints = {
			audio: false,
			video: {
				deviceId: { exact: this.id },
			}
		};

		this._stream = await Camera._wrapErrors(async () => {
			return await navigator.mediaDevices.getUserMedia(constraints);
		});

		return this._stream;
	}

	stop() {
		if (!this._stream) {
			return;
		}

		this._stream.getVideoTracks().forEach(stream => stream.stop())
		this._stream = null;
	}

	static async getCameras() {
		return await this._ensureAccess(async () => {
			const devices = await navigator.mediaDevices.enumerateDevices()
			const videoDevices = devices.filter(d => d.kind === 'videoinput')

			return videoDevices.map(d => new Camera(d.deviceId, cameraName(d.label)));
		});
	}

	static async _ensureAccess(fn: () => Promise<Camera[]>) {
		const constraints = { video: true }

		return await this._wrapErrors(async () => {
			// https://stackoverflow.com/a/69468263
			// Firefox requires getting media devices after stopping all streams

			const access = await navigator.mediaDevices.getUserMedia(constraints);
			const result = await fn()
			access.getVideoTracks().forEach(stream => stream.stop())

			return result
		});
	}

	static setMediaErrorCallback(callback: CallableFunction) {
		mediaErrorCallback = callback
	}

	static async _wrapErrors(fn: () => any) {
		try {
			return await fn();
		} catch (e) {
			if (e instanceof Error) {
				if (mediaErrorCallback !== null) {
					mediaErrorCallback(new MediaError(e.name))
				} else {
					console.log("Media Error Callback not found");
					throw new MediaError(e.name);
				}
			} else {
				throw e;
			}
		}
	}
}
