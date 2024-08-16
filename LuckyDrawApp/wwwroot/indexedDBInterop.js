let db;

window.indexedDBInterop = {
    createEntryDb: function (dbName, storeName) {
        return new Promise((resolve, reject) => {
            let request = indexedDB.open(dbName, 1);

            request.onupgradeneeded = function (event) {
                let db = event.target.result;
                /*db.createObjectStore(storeName, { keyPath: "id", autoIncrement: true });*/
                if (!db.objectStoreNames.contains("RaffleEntry")) {
                    db.createObjectStore("RaffleEntry", { keyPath: 'id', autoIncrement: true });
                }
            };

            request.onsuccess = function () {
                resolve(true);
            };

            request.onerror = function (event) {
                reject(event.target.error);
            };
        });
    },

    createPrizeDb: function (dbName, storeName) {
        return new Promise((resolve, reject) => {
            let request = indexedDB.open(dbName, 1);

            request.onupgradeneeded = function (event) {
                let db = event.target.result;
                /*db.createObjectStore(storeName, { keyPath: "id", autoIncrement: true });*/

                if (!db.objectStoreNames.contains("Prize")) {
                    db.createObjectStore("Prize", { keyPath: 'id', autoIncrement: true });
                }
            };

            request.onsuccess = function () {
                resolve(true);
            };

            request.onerror = function (event) {
                reject(event.target.error);
            };
        });
    },

    addItem: function (dbName, storeName, item) {
        return new Promise((resolve, reject) => {
            let request = indexedDB.open(dbName);

            request.onsuccess = function (event) {
                let db = event.target.result;
                let transaction = db.transaction(storeName, "readwrite");
                let store = transaction.objectStore(storeName);
                store.add(item);

                transaction.oncomplete = function () {
                    resolve(true);
                };

                transaction.onerror = function (event) {
                    reject(event.target.error);
                };
            };

            request.onerror = function (event) {
                reject(event.target.error);
            };
        });
    },

    //non-promise.all
    //addItemsInBatch: function (dbName, storeName, items) {
    //    return new Promise((resolve, reject) => {
    //        let request = indexedDB.open(dbName);
    //        request.onsuccess = function (event) {
    //            let db = event.target.result;
    //            let transaction = db.transaction(storeName, "readwrite");
    //            let store = transaction.objectStore(storeName);
    //            for (const item of items) {
    //                store.add(item);
    //            }
    //            transaction.oncomplete = function () {
    //                resolve(true);
    //            };
    //            transaction.onerror = function (event) {
    //                reject(event.target.error);
    //            };
    //        };
    //        request.onerror = function (event) {
    //            reject(event.target.error);
    //        };
    //    });
    //},

    //promise.all (working well)
    //addItemsInBatch: function (dbName, storeName, items) {
    //    return new Promise((resolve, reject) => {
    //        let request = indexedDB.open(dbName);
    //        request.onsuccess = async function (event) {
    //            let db = event.target.result;
    //            let transaction = db.transaction(storeName, "readwrite");
    //            let store = transaction.objectStore(storeName);
    //            let promises = items.map(item => {
    //                return new Promise((resolve, reject) => {
    //                    let request = store.add(item);
    //                    request.onsuccess = resolve;
    //                    request.onerror = reject;
    //                });
    //            });
    //            try {
    //                await Promise.all(promises);
    //                resolve(true);
    //            } catch (error) {
    //                reject(error);
    //            }
    //        };
    //        request.onerror = function (event) {
    //            reject(event.target.error);
    //        };
    //    });
    //},

    //promise.all + batch
    addItemsInBatch: function (dbName, storeName, items, batchSize = 1000) {
        return new Promise(async (resolve, reject) => {
            let request = indexedDB.open(dbName);
            request.onerror = function (event) {
                reject(event.target.error);
            };
            request.onsuccess = async function (event) {
                let db = event.target.result;
                let batchPromises = [];

                // Create batches
                for (let i = 0; i < items.length; i += batchSize) {
                    let batch = items.slice(i, i + batchSize);

                    // Handle each batch in a separate transaction
                    batchPromises.push(new Promise((resolveBatch, rejectBatch) => {
                        let transaction = db.transaction(storeName, "readwrite");
                        let store = transaction.objectStore(storeName);
                        let batchOperations = batch.map(item => new Promise((resolveOp, rejectOp) => {
                            let request = store.add(item);
                            request.onsuccess = resolveOp;
                            request.onerror = rejectOp;
                        }));
                        Promise.all(batchOperations).then(() => resolveBatch()).catch(rejectBatch);
                    }));
                }
                // Resolve all batches
                Promise.all(batchPromises).then(() => resolve(true)).catch(error => {
                    console.error("Error in processing batches", error);
                    reject(error);
                });
            };
        });
    },


    getItem: function (dbName, storeName, id) {
        return new Promise((resolve, reject) => {
            let request = indexedDB.open(dbName);
            request.onsuccess = function (event) {
                let db = event.target.result;
                let transaction = db.transaction(storeName, "readonly");
                let store = transaction.objectStore(storeName);
                let getRequest = store.get(id);
                getRequest.onsuccess = function (event) {
                    resolve(event.target.result);
                };
                getRequest.onerror = function (event) {
                    reject(event.target.error);
                };
            };
            request.onerror = function (event) {
                reject(event.target.error);
            };
        });
    },

    getAllItems: function (dbName, storeName) {
        return new Promise((resolve, reject) => {
            let request = indexedDB.open(dbName);

            request.onsuccess = function (event) {
                let db = event.target.result;
                let transaction = db.transaction(storeName, "readonly");
                let store = transaction.objectStore(storeName);
                let items = [];

                store.openCursor().onsuccess = function (event) {
                    let cursor = event.target.result;
                    if (cursor) {
                        items.push(cursor.value);
                        cursor.continue();
                    } else {
                        resolve(items);
                    }
                };

                transaction.onerror = function (event) {
                    reject(event.target.error);
                };
            };

            request.onerror = function (event) {
                reject(event.target.error);
            };
        });
    },

    // Get a random item from the store, excluding those with `isUsed` true
    getRandomItem: function (dbName, storeName) {
        return new Promise((resolve, reject) => {
            const openRequest = indexedDB.open(dbName);

            openRequest.onsuccess = function (event) {
                const db = event.target.result;
                const transaction = db.transaction(storeName, "readonly");
                const store = transaction.objectStore(storeName);
                const countRequest = store.count();

                countRequest.onsuccess = function () {
                    const count = countRequest.result;
                    const randomIndex = Math.floor(Math.random() * count);
                    console.log("Random index:", randomIndex);

                    const cursorRequest = store.openCursor();

                    cursorRequest.onsuccess = function (event) {
                        let cursor = event.target.result;
                        if (!cursor) {
                            resolve(null);  // No entries in the store
                            return;
                        }

                        if (randomIndex > 0) {  // Only call advance if randomIndex is greater than 0
                            cursor.advance(randomIndex);
                        } else {
                            // Handle the first item (randomIndex == 0) immediately
                            processCursor(cursor);
                        }
                    };

                    // Function to process cursor based on its "isUsed" property
                    function processCursor(cursor) {
                        if (!cursor.value.isUsed) {
                            console.log("Selected value:", cursor.value);
                            resolve(cursor.value);
                        } else {
                            cursor.continue();  // Skip used entries and find the next unused entry
                        }
                    }

                    cursorRequest.onerror = function () {
                        resolve(null);  // Handle cursor errors or no valid cursor found
                    };
                };

                transaction.onerror = function (event) {
                    reject('Error traversing the store: ' + event.target.error);
                };
            };

            openRequest.onerror = function (event) {
                reject('Database error: ' + event.target.error);
            };
        });
    },



    updateItem: function (dbName, storeName, item) {
        return new Promise((resolve, reject) => {
            let request = indexedDB.open(dbName);
            request.onsuccess = function (event) {
                let db = event.target.result;
                let transaction = db.transaction(storeName, "readwrite");
                let store = transaction.objectStore(storeName);
                let updateRequest = store.put(item);
                updateRequest.onsuccess = function () {
                    resolve(true);
                };
                updateRequest.onerror = function (event) {
                    reject(event.target.error);
                };
            };
            request.onerror = function (event) {
                reject(event.target.error);
            };
        });
    },

    updateAllItems: function (dbName, storeName, items) {
        return new Promise((resolve, reject) => {
            let request = indexedDB.open(dbName);
            request.onsuccess = function (event) {
                let db = event.target.result;
                let transaction = db.transaction(storeName, "readwrite");
                let store = transaction.objectStore(storeName);

                let updatePromises = items.map(item => {
                    return new Promise((innerResolve, innerReject) => {
                        let updateRequest = store.put(item);
                        updateRequest.onsuccess = innerResolve;
                        updateRequest.onerror = innerReject;
                    });
                });

                Promise.all(updatePromises)
                    .then(() => resolve(true))
                    .catch(error => reject(error));

                transaction.onerror = function (event) {
                    reject(event.target.error);
                };
            };
            request.onerror = function (event) {
                reject(event.target.error);
            };
        });
    },

    deleteItem: function (dbName, storeName, key) {
        return new Promise((resolve, reject) => {
            let request = indexedDB.open(dbName);

            request.onsuccess = function (event) {
                let db = event.target.result;
                let transaction = db.transaction(storeName, "readwrite");
                let store = transaction.objectStore(storeName);
                store.delete(key);

                transaction.oncomplete = function () {
                    resolve(true);
                };

                transaction.onerror = function (event) {
                    reject(event.target.error);
                };
            };

            request.onerror = function (event) {
                reject(event.target.error);
            };
        });
    },

    getItemByInternalKey: function (dbName, storeName, internalKey) {
        return new Promise((resolve, reject) => {
            let request = indexedDB.open(dbName);
            request.onsuccess = function (event) {
                let db = event.target.result;
                let transaction = db.transaction(storeName, "readonly");
                let store = transaction.objectStore(storeName);
                let cursorRequest = store.openCursor();
                let currentIndex = 0;

                cursorRequest.onsuccess = function (event) {
                    let cursor = event.target.result;
                    if (cursor) {
                        if (currentIndex === internalKey) {
                            resolve(cursor.value);
                            return;
                        }
                        currentIndex++;
                        cursor.continue();
                    } else {
                        resolve(null); // If the cursor runs out of items
                    }
                };

                cursorRequest.onerror = function (event) {
                    reject(event.target.error);
                };
            };

            request.onerror = function (event) {
                reject(event.target.error);
            };
        });
    },

    getAllItemsWithInternalKeys: function (dbName, storeName) {
        return new Promise((resolve, reject) => {
            let request = indexedDB.open(dbName);

            request.onsuccess = function (event) {
                let db = event.target.result;
                let transaction = db.transaction(storeName, "readonly");
                let store = transaction.objectStore(storeName);
                let items = [];

                store.openCursor().onsuccess = function (event) {
                    let cursor = event.target.result;
                    if (cursor) {
                        items.push({
                            internalKey: cursor.key,
                            value: cursor.value
                        });
                        cursor.continue();
                    } else {
                        resolve(items);
                    }
                };

                transaction.onerror = function (event) {
                    reject(event.target.error);
                };
            };

            request.onerror = function (event) {
                reject(event.target.error);
            };
        });
    },

    clearStore: function (dbName, storeName) {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(dbName);
            request.onsuccess = function (event) {
                const db = event.target.result;
                const transaction = db.transaction(storeName, 'readwrite');
                const store = transaction.objectStore(storeName);
                const clearRequest = store.clear();

                clearRequest.onsuccess = function () {
                    resolve('All entries deleted successfully.');
                };
                clearRequest.onerror = function (event) {
                    reject('Error deleting entries: ' + event.target.error);
                };
            };
            request.onerror = function (event) {
                reject('Database error: ' + event.target.error);
            };
        });
    },

    deleteDatabase: function (dbName) {
        return new Promise((resolve, reject) => {
            // Close any open connections to the database
            const closeAllConnections = () => {
                const dbOpenRequest = indexedDB.open(dbName);
                dbOpenRequest.onsuccess = function (event) {
                    const db = event.target.result;
                    db.close(); // Close the database connection
                };
            };

            // First, close all connections
            closeAllConnections();

            // Then, attempt to delete the database
            const request = indexedDB.deleteDatabase(dbName);

            request.onsuccess = function () {
                resolve('Database deleted successfully.');
            };

            request.onerror = function (event) {
                reject('Error deleting database: ' + event.target.error);
            };

            request.onblocked = function () {
                reject('Database deletion blocked. Make sure all connections are closed.');
            };
        });
    }


    //deleteDatabase: function (dbName) {
    //    return new Promise((resolve, reject) => {
    //        const request = indexedDB.deleteDatabase(dbName);
    //        request.onsuccess = function () {
    //            resolve('Database deleted successfully.');
    //        };
    //        request.onerror = function (event) {
    //            reject('Error deleting database: ' + event.target.error);
    //        };
    //        request.onblocked = function () {
    //            reject('Database deletion blocked.');
    //        };
    //    });
    //}

};
