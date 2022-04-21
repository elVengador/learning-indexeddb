
window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
// DON'T use "var indexedDB = ..." if you're not in a function.
// Moreover, you may need references to some window.IDB* objects:
window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction || { READ_WRITE: "readwrite" }; // This line should only be needed if it is needed to support the object's constants for older browsers
window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;
// (Mozilla has never prefixed these objects, so we don't need window.mozIDB*)

let db
if (!window.indexedDB) {
    console.log("Your browser doesn't support a stable version of IndexedDB. Such and such feature will not be available.");
} else {
    console.log('indexDB is ready!!');
}

// let open a database and return a object IDBOpenDBRequest
const request = window.indexedDB.open('vengador', 1)

request.onsuccess = (event) => {
    console.log('open DB is success', event);
    db = event.target.result;
    console.log('result', db);
}

request.onerror = (event) => { console.log('open DB is error', event.target.errorCode); }


// will trigger when create a new database or the version is greater than local version
request.onupgradeneeded = (event) => {
    const db = event.target.result;
    const store = db.createObjectStore('thingies', { keyPath: 'myKey' })
}