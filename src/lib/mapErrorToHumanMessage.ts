export function mediaErrorToMessage(err: MediaError): string {
    console.error("Media Error:",err.message)
    switch (err.message) {
        case "Cannot access video stream (NotAllowedError).":
            return "Permission denied"
        case "Cannot access video stream (NotReadableError).":
            return "Selected camera busy, try choosing another."
        case "Cannot access video stream (NotFoundError).":
            return "No Cameras Found."
        default:
            return "Unknown Error"
    }
}