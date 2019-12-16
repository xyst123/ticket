import { getStorage } from "@/utils";

export const getTime = () => {
	const currentTime = Date.now();
	const storageTime = parseInt(getStorage('config', 'time', 0), 10);
	return new Date(storageTime > currentTime ? storageTime : currentTime)
} 