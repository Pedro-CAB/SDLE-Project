document.addEventListener('DOMContentLoaded', function () {
    // Check for existing user session on page load
    checkUserSession();
});

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
        // Add logic to customize the UI for a logged-in user

        // Update the object list on the page if listsElement is found
        const listsElement = document.getElementById('lists');
        if (listsElement) {
            updateObjectList();
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
var objectArray = [
    { listId: 1, name: 'Lista do Supermercado', items:[{idItem: 1, itemName: "Arroz", amountNeeded: 1}] },
    { listId: 2, name: 'Materiais Artísticos', items: [] },
    { listId: 3, name: 'Compras para o Natal', items: [] },
    // ... add more objects as needed
];

// Function to update the object list on the page
function updateObjectList() {
    // Get the listsElement again as it might not be present on every page
    var listsElement = document.getElementById('lists');

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

                listsElement.appendChild(listItem);
            });
        })
        .catch(error => console.error('Error fetching lists:', error));
});
