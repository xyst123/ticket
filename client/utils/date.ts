import { getStorage } from "@/utils";

export const getDate = ():Date => {
	const currentDate = Date.now();
	const storageDate = parseInt(getStorage('config', 'date', 0), 10);
	return new Date(storageDate > currentDate ? storageDate : currentDate)
} 