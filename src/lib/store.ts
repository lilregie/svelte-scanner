
const NAMESPACE = "MSQrScanner__";

export function saveValue(key: string, value: any) {
	if (typeof localStorage !== "undefined") {
		localStorage.setItem(NAMESPACE + key, JSON.stringify(value))
	}
}

export function getValue(key: string): any {
	if (typeof localStorage !== "undefined") {
		try {
			return JSON.parse(localStorage.getItem(NAMESPACE + key));
		} catch {
			return undefined
		}
	}
}