function login() {
    var username = document.getElementById('username').value;
    var password = document.getElementById('password').value;
    var messageElement = document.getElementById('message');

    // Replace this with your actual user authentication logic
    if (username === 'example' && password === 'password') {
        messageElement.innerHTML = 'Login successful!';
        // Redirect to another page or perform other actions after successful login
    } else {
        messageElement.innerHTML = 'Invalid username or password';
    }
}

// Example array of objects
var objectArray = [
    { name: 'Lista do Supermercado' },
    { name: 'Materiais Artísticos' },
    { name: 'Compras para o Natal' },
    // ... add more objects as needed
];

// Function to update the object list on the page
function updateObjectList() {
    var objectListElement = document.getElementById('objectList');
    objectListElement.innerHTML = ''; // Clear existing list

    // Iterate through the array and create list items
    objectArray.forEach(function(object) {
        var listItem = document.createElement('li');
        listItem.textContent = object.name;
        objectListElement.appendChild(listItem);
    });
}

// Initial update when the page loads
updateObjectList();

// Example: Add a new object to the array
function addObject() {
    var newObjectName = prompt('Enter the name of the new object:');
    if (newObjectName) {
        objectArray.push({ name: newObjectName });
        updateObjectList(); // Update the list after adding a new object
    }
}

