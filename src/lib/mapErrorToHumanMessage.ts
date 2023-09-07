const errorMap: { [index: string]: string } = {
	"Cannot access video stream (NotAllowedError).": "Looks like we don’t have permission to access your camera. Please allow camera access.",
	"Cannot access video stream (NotReadableError).": "Looks like we can’t get access to the camera. Try choosing another or quit apps that have exclusive access on the camera.",
	"Cannot access video stream (NotFoundError).": "Looks like your device does not have a camera or your browser can’t find it.",
	"Camera Permission denied": "Looks like we don’t have permission to access your camera. Please allow camera access.",
	"WebAssembly Not Supported": "Your browser does not support WebAssembly. Please use the latest version of Chrome, Firefox or Safari.",
}

export function mediaErrorToMessage(err: Error): string {
	console.error("Media Error:", err.message)

	return errorMap[err.message] ?? `Unknown Error (${err.message})`
}
