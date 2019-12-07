export const getDB = (dbName = 'main') => {
	return new Promise((resolve, reject) => {
		const dbRequest = indexedDB.open(dbName, 1);
		dbRequest.addEventListener('success', event => {
			const db = dbRequest.result;
			resolve(db)
		});
		dbRequest.addEventListener('error', event => {
			reject(event)
		});
		dbRequest.addEventListener('upgradeneeded', event => {
			const db = event.target.result;
			resolve(db)
		});
	})
}

export const getObjectStore = (db, objectStoreName, options) => {
	if (!db.objectStoreNames.contains(objectStoreName)) {
		db.createObjectStore(objectStoreName, options);
	}
	return db.transaction(objectStoreName, 'readwrite').objectStore(objectStoreName);
}

export const getData = (objectStore, index) => {
	return new Promise((resolve, reject) => {
		const getRequest = objectStore.get(index);
		getRequest.addEventListener('success', event => {
			resolve(event)
		});
		getRequest.addEventListener('error', event => {
			reject(event)
		})
	})
}

export const setData = (objectStore, index, data) => {
	return getData(objectStore, index).then(currentData => new Promise((resolve, reject) => {
		const request = currentData ? objectStore.put(data) : objectStore.add(data);
		request.addEventListener('success', event => {
			resolve(event)
		});
		request.addEventListener('error', event => {
			reject(event)
		})
	}))
}

export const deleteData = (objectStore, index) => {
	return new Promise((resolve, reject) => {
		const deleteRequest = objectStore.delete(index);
		deleteRequest.addEventListener('success', event => {
			resolve(event)
		});
		deleteRequest.addEventListener('error', event => {
			reject(event)
		})
	})
}

const operate = {
	get: getData,
	set: setData,
	delete: deleteData
}
export const execute = ({ type, objectStoreName, keyPath, index, data }) => {
	return getDB().then(db => getObjectStore(
		db, objectStoreName, { keyPath }
	)).then(objectStore => operate[type](objectStore, index, data))
}