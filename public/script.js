// Wrap the event listener in a self-invoking function to execute only once
(function () {
    let executed = false;

    document.addEventListener('DOMContentLoaded', function () {
        if (!executed) {
            executed = true;

            // Check for existing user session on page load
            checkUserSession();
        }
    });
})();

function login() {
    var username = document.getElementById('username').value;
    var password = document.getElementById('password').value;
    var messageElement = document.getElementById('message');

    // Send login credentials to the server for validation
    fetch('/api/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Save user session data locally
            sessionStorage.setItem('userId', data.userId);
            sessionStorage.setItem('username', data.username);

            // Redirect to another page or perform other actions after successful login
            window.location.href = '/pages/myLists.html';
        } else {
            messageElement.innerHTML = 'Invalid username or password';
        }
    })
    .catch(error => console.error('Login error:', error));
}

function checkUserSession() {
    // Check if user session exists
    const userId = sessionStorage.getItem('userId');
    const username = sessionStorage.getItem('username');

    if (userId && username) {
        // User session exists, perform actions accordingly
        console.log('User is logged in:', username);

        // Update the object list on the page if listsElement is found
        const listsElement = document.getElementById('lists');
        if (listsElement && !listsElement.dataset.listsLoaded) {
            // Fetch shopping lists for the authenticated user
            fetch('/api/lists')
                .then(response => response.json())
                .then(data => {
                    // Clear existing list and its event listeners
                    listsElement.innerHTML = '';
                    const newListsElement = listsElement.cloneNode(true);
                    listsElement.parentNode.replaceChild(newListsElement, listsElement);

                    // Use a Set to keep track of unique list names
                    const uniqueListNames = new Set();

                    // Function to add click event listener to list item
                    const addClickListener = (list, listItem) => {
                        listItem.addEventListener('click', () => {
                            // Navigate to the itemList.html page with the selected list ID
                            window.location.href = `/pages/itemList.html?listId=${list.idList}`;
                        });
                    };

                    // Iterate through the array and create list items
                    data.forEach(list => {
                        // Ensure unique list names
                        if (!uniqueListNames.has(list.listName)) {
                            uniqueListNames.add(list.listName);

                            var listItem = document.createElement('li');
                            listItem.textContent = list.listName;

                            addClickListener(list, listItem);

                            newListsElement.appendChild(listItem);
                        }
                    });

                    // Mark that the lists have been loaded to avoid duplication
                    newListsElement.dataset.listsLoaded = true;
                })
                .catch(error => console.error('Error fetching lists:', error));
        }
    }
}

function logout() {
    // Clear user session data
    sessionStorage.removeItem('userId');
    sessionStorage.removeItem('username');

    // Redirect to the login page
    window.location.href = '/pages/login.html';
}

// Example array of objects
var objectArray = [];

// Function to update the object list on the page
function updateObjectList(listsElement) {
    // Get the listsElement again as it might not be present on every page

    if (listsElement) {
        // Clear existing list
        listsElement.innerHTML = '';

        // Iterate through the array and create list items
        objectArray.forEach(function (object) {
            var listItem = document.createElement('li');
            listItem.textContent = object.name;
            listsElement.appendChild(listItem);
        });
    }
}

// Initial update when the page loads
updateObjectList();

document.addEventListener('DOMContentLoaded', function () {
    const listsElement = document.getElementById('lists');

    // Fetch shopping lists from the server
    fetch('/api/lists')
        .then(response => response.json())
        .then(data => {
            data.forEach(list => {
                const listItem = document.createElement('li');
                listItem.textContent = list.listName;

                // Add the event listener to the listItem itself
                listItem.addEventListener('click', () => {
                    // Navigate to the itemList.html page with the selected list ID
                    window.location.href = `/pages/itemList.html?listId=${list.idList}`;
                });
                if(listsElement){
                    listsElement.appendChild(listItem);
                }
            });
        })
        .catch(error => console.error('Error fetching lists:', error));
});
