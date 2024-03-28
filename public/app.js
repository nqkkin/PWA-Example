// Initialize IndexedDB
let db;

window.onload = function() {
    let request = window.indexedDB.open('todos_db', 1);

    request.onerror = function() {
        console.error('Database failed to open');
    };

    request.onsuccess = function() {
        console.log('Database opened successfully');
        db = request.result;
        displayData();
    };

    request.onupgradeneeded = function(e) {
        let db = e.target.result;
        let objectStore = db.createObjectStore('todos_os', { keyPath: 'id', autoIncrement:true });
        objectStore.createIndex('task', 'task', { unique: false });

        console.log('Database setup complete');
    };

    document.getElementById('todo-form').onsubmit = addTodo;
};

// Function to register the service worker
const registerServiceWorker = async () => {
    if ("serviceWorker" in navigator) {
        try {
            const registration = await navigator.serviceWorker.register("/service-worker.js", {
                scope: "/"
            });
            if (registration.installing) {
                console.log("Service worker installing");
            } else if (registration.waiting) {
                console.log("Service worker installed");
            } else if (registration.active) {
                console.log("Service worker active");
            }
        } catch (error) {
            console.error(`Registration failed with ${error}`);
        }
    }
};

function addTodo(e) {
    e.preventDefault();

    let taskInput = document.getElementById('todo-input');
    let task = taskInput.value.trim(); // Remove leading and trailing whitespace

    if (task === '') {
        alert('Please enter a task.'); // Alert the user if the task is empty
        return;
    }

    let newItem = { task: task };

    let transaction = db.transaction(['todos_os'], 'readwrite');
    let objectStore = transaction.objectStore('todos_os');

    let request = objectStore.add(newItem);
    request.onsuccess = function() {
        taskInput.value = '';
        displayData();
    };

    transaction.oncomplete = function() {
        console.log('Transaction completed: database modification finished.');
    };

    transaction.onerror = function() {
        console.error('Transaction not opened due to error');
    };
}

function deleteTodo(id) {
    let confirmation = confirm("Are you sure you want to delete this task?");
    if (confirmation) {
        let transaction = db.transaction(['todos_os'], 'readwrite');
        let objectStore = transaction.objectStore('todos_os');

        let request = objectStore.delete(id);
        request.onsuccess = function() {
            console.log('Task deleted successfully');
            displayData();
        };
    }
}

function displayData() {
    let objectStore = db.transaction('todos_os').objectStore('todos_os');
    let todoList = document.getElementById('todo-list');

    todoList.innerHTML = '';

    objectStore.openCursor().onsuccess = function(e) {
        let cursor = e.target.result;

        if (cursor) {
            let listItem = document.createElement('li');
            listItem.classList.add('list-group-item');
            listItem.textContent = cursor.value.task;

            let deleteButton = document.createElement('button');
            deleteButton.classList.add('btn', 'btn-danger', 'btn-sm', 'float-right');
            deleteButton.textContent = 'Delete';
            deleteButton.onclick = function() {
                deleteTodo(cursor.value.id);
            };

            listItem.appendChild(deleteButton);
            todoList.appendChild(listItem);

            cursor.continue();
        }
    };
}

// Call the registerServiceWorker function to register the service worker
registerServiceWorker();
