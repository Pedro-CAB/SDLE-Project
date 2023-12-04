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

// Example array of objects
var objectArray = [
    { listId: 1, name: 'Lista do Supermercado', items:[{idItem: 1, itemName: "Arroz", amountNeeded: 1}] },
    { listId: 2, name: 'Materiais Artísticos', items: [] },
    { listId: 3, name: 'Compras para o Natal', items: [] },
    // ... add more objects as needed
];

document.addEventListener('DOMContentLoaded', function() {
    // Get the listId from the URL parameter
    var urlParams = new URLSearchParams(window.location.search);
    var listId = urlParams.get('id');

    // Find the object in the array with the matching listId
    var selectedObject = objectArray.find(function(object) {
        return object.listId == listId;
    });

    if (selectedObject) {
        // Update the title of the page with the object's name
        document.getElementById('listTitle').textContent = selectedObject.name;

        // Update the list of items on the page
        var itemListElement = document.getElementById('itemList');
        selectedObject.items.forEach(function(item) {
            var listItem = document.createElement('li');
            listItem.textContent = item.itemName;
            itemListElement.appendChild(listItem);
        });
    } else {
        // Display an error message if the listId is not found
        document.getElementById('listTitle').textContent = 'List Not Found';
    }
});


document.addEventListener('DOMContentLoaded', function() {
    const listsElement = document.getElementById('lists');
  
    // Fetch shopping lists from the server
    fetch('/api/lists')
      .then(response => response.json())
      .then(data => {
        data.forEach(list => {
          const listItem = document.createElement('li');
          listItem.textContent = list.listName;
          listItem.addEventListener('click', () => {
            // Implement logic to navigate to the list details page
          });
          listsElement.appendChild(listItem);
        });
      })
      .catch(error => console.error('Error fetching lists:', error));
  });
  