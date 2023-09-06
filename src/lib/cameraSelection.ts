import type { Camera } from "./instascan/camera";

export enum CameraDirection {
	Front,
	Back
}

export function chooseCamera(cameras: Camera[], selectedCameraID: string): [Camera,boolean] {
	let chosenCamera: Camera | undefined;

	if (typeof selectedCameraID === "undefined") {
		chosenCamera = selectDefault(cameras);
		console.log("Camera not selected, choosing default");
	} else {
		chosenCamera = cameras.find(camera => camera.id === selectedCameraID)

		if (typeof chosenCamera === "undefined") {
			chosenCamera = selectDefault(cameras);
			console.log("failed to find camera");
		}
	}
	selectedCameraID = chosenCamera.id;

	return [chosenCamera, cameraDirectionGuess(chosenCamera) === CameraDirection.Back];
}

function selectDefault(cameras: Camera[]): Camera {
	if (detectMobileCameras(cameras)) {
		// Mobile, so we should choose the back camera
		return mapCameraDirections(cameras)[CameraDirection.Back]
	} else {
		// Desktop, so we just choose any
		return cameras[0]
	}
}

export function detectMobileCameras(cameras: Camera[]): boolean {
	if (cameras.length === 2) {
		if (cameraDirectionGuess(cameras[0]) === CameraDirection.Front) {
			return cameraDirectionGuess(cameras[1]) === CameraDirection.Back
		} else if (cameraDirectionGuess(cameras[0]) === CameraDirection.Back) {
			return cameraDirectionGuess(cameras[1]) === CameraDirection.Front
		}
	}

	return false
}

function mapCameraDirections(cameras: Camera[]) {
	let cameraMap = {};
	cameraMap[cameraDirectionGuess(cameras[0])] = cameras[0]
	cameraMap[cameraDirectionGuess(cameras[1])] = cameras[1]

	return cameraMap
}

export function cameraDirectionGuess(camera: Camera): CameraDirection | null {
	let normalizedCameraName = camera.name.toLowerCase();

	if (normalizedCameraName.includes("front")) {
		return CameraDirection.Front
	} else if (normalizedCameraName.includes("back")) {
		return CameraDirection.Back
	}

	return null
}