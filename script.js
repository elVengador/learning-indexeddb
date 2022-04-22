const manageError = (err) => console.log('Error:', err);


// ==============================
// IndexDB functions
// ==============================
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
    console.log('on upgradeneeded');
    const db = event.target.result;
    const store = db.createObjectStore('thingies', { keyPath: 'myKey' })

    store.createIndex("name", "name", { unique: false })

    store.transaction.oncomplete = event => {
        console.log('transaction onComplete');
        // we can set readonly, readwrite and versionchange
        const thingStore = db.transaction("thingies", "readwrite")
            .objectStore("thingies")

        console.log('thing store', thingStore);

        [
            { myKey: '123', name: 'jejeje' },
            { myKey: '432', name: 'jojojo' },
            { myKey: '543', name: 'jjujuu' },
        ].forEach(customer => thingStore.add(customer))
    }

}

const addThing = (myKey, name) => {
    const transaction = db.transaction("thingies", "readwrite");

    // Do something when all the data is added to the database.
    transaction.oncomplete = event => { console.log("All done!"); };

    transaction.onerror = event => {
        const messageError = event.target.error.message
        if (messageError === 'Key already exists in the object store.') {
            return alert('Key already exists')
        }
        console.log('Error in AddThing', event);
    };

    const thingiesStore = transaction.objectStore("thingies");
    const request = thingiesStore.add({ myKey, name });
    request.onsuccess = event => {/*event.target.result === customer.ssn;*/ };
}

const updateThing = (myKey, name) => {
    const transaction = db.transaction("thingies", "readwrite");
    const thingiesStore = transaction.objectStore("thingies");
    var request = thingiesStore.get(myKey);
    request.onerror = event => {/* Handle errors!*/ };
    request.onsuccess = event => {
        const data = { ...event.target.result, name }

        const requestUpdate = thingiesStore.put(data);
        requestUpdate.onerror = event => {
            // Do something with the error
            console.log('update error', event);
        };
        requestUpdate.onsuccess = event => {
            // Success - the data is updated!
            console.log('update ok', event);
        };
    };
}

const getOneThing = (key) => {
    const transaction = db.transaction("thingies", "readwrite");
    const thingiesStore = transaction.objectStore("thingies");
    const request = thingiesStore.get(key)

    request.onerror = event => {
        console.log('@Thing: error when get one', event);
        alert('invalid key')
    }

    request.onsuccess = event => {
        const value = request.result?.name || '??'
        console.log('@Thing: success', event, value);
        const thingFoundElement = document.querySelector('#thing-found')
        thingFoundElement.innerHTML = value
    }
}

const buildListItem = (text) => {
    const listItem = document.createElement('li');
    listItem.textContent = text;
    return listItem
}

const getAllThings = () => {

    const listElement = document.querySelector('#list')
    listElement.textContent = ''

    const transaction = db.transaction("thingies", "readwrite");
    const thingiesStore = transaction.objectStore("thingies");

    thingiesStore.openCursor().onsuccess = event => {
        const cursor = event.target.result

        if (cursor) {
            const text = cursor.key + ': ' + cursor.value.name
            const listItem = buildListItem(text)
            listElement.appendChild(listItem)

            cursor.continue()
        } else {
            console.log('no more entries');
        }
    }
}

const removeThing = (key) => {
    const transaction = db.transaction("thingies", "readwrite");
    const thingiesStore = transaction.objectStore("thingies");
    thingiesStore.delete(key)

    request.onsuccess = event => {
        console.log('delete thing is done!');
    };
}

// ======================================================================
// EVENTS
// ======================================================================

const onAddThing = () => {
    try {
        const keyElement = document.querySelector('#key')
        const nameElement = document.querySelector('#name')

        if (!keyElement || !nameElement) { return alert('invalid elements') }

        const keyValue = keyElement.value
        const nameValue = nameElement.value

        console.log(keyValue, nameValue);

        addThing(keyValue, nameValue)
    } catch (err) {
        manageError(err)
    }
}

const onGetThing = () => {
    try {
        const findElement = document.querySelector('#find')

        if (!findElement) { return alert('invalid elements') }

        const findValue = findElement.value

        console.log('findValue:', findValue);

        getOneThing(findValue)
    } catch (err) {
        manageError(err)
    }
}

const onGetThings = () => {
    try {
        getAllThings()
    } catch (err) {
        manageError(err)
    }
}

const onUpdateThings = () => {
    try {
        const keyElement = document.querySelector('#key')
        const nameElement = document.querySelector('#name')

        if (!keyElement || !nameElement) { return alert('invalid elements') }

        const keyValue = keyElement.value
        const nameValue = nameElement.value

        console.log(keyValue, nameValue);

        updateThing(keyValue, nameValue)

    } catch (err) {
        manageError(err)
    }
}

const onRemoveThing = () => {
    try {
        const keyElement = document.querySelector('#remove-thing-key')

        if (!keyElement) { return alert('invalid elements') }

        const keyValue = keyElement.value

        removeThing(keyValue)
    } catch (err) {
        manageError(err)
    }
}