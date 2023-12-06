document.addEventListener('DOMContentLoaded', function () {
    const listNameElement = document.getElementById('listName');
    const itemListElement = document.getElementById('itemList');
    const addItemButton = document.getElementById('addItemButton');
    const createItemButton = document.getElementById('createItemButton');

    // Get the list ID from the query parameters
    const urlParams = new URLSearchParams(window.location.search);
    const listId = urlParams.get('listId');

    // Add button to redirect to Add Item page
    if (addItemButton) {
        addItemButton.addEventListener('click', () => {
            window.location.href = `/pages/addItem.html?listId=${listId}`;
        });
    }

    // Add button to create a new item
    if (createItemButton) {
        createItemButton.addEventListener('click', () => {
            // Prompt the user for item details
            const itemName = prompt('Enter item name:');
            const itemAmount = prompt('Enter item amount:');

            // Ensure the user provided input before proceeding
            if (itemName !== null && itemAmount !== null) {
                const newItem = {
                    itemName: itemName,
                    itemAmount: parseInt(itemAmount),
                    listId: parseInt(listId),
                };

                // Send the new item data to the server
                fetch('/api/createItem', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(newItem),
                })
                .then(response => response.json())
                .then(result => {
                    // Log the result for debugging
                    console.log('Item creation result:', result);

                    // Fetch the updated list from the server
                    return fetch(`/api/items?listId=${listId}`);
                })
                .then(response => response.json())
                .then(data => {
                    // Log the data received from the server
                    console.log('Updated item list:', data);

                    // Render the updated list on the page
                    renderItems(data);
                })
                .catch(error => {
                    console.error('Error creating or fetching items:', error);
                    alert('Error creating or fetching items. Check console for details.');
                });
            }
        });
    }

    // Fetch items for the specific shopping list after the DOM has loaded
    fetch(`/api/items?listId=${listId}`)
        .then(response => response.json())
        .then(data => {
            // Log the initial data received from the server
            console.log('Initial item list:', data);

            // Render items on the page
            renderItems(data);
        })
        .catch(error => {
            console.error('Error fetching initial items:', error);
            alert('Error fetching initial items. Check console for details.');
        });

    // Fetch the list name
    if (listNameElement) {
        fetchListName(listNameElement);
    }
});

function renderItems(items) {
    const itemListElement = document.getElementById('itemList');
    itemListElement.innerHTML = ''; // Clear existing items

    items.forEach(item => {
        const listItem = document.createElement('li');
        listItem.textContent = `${item.itemName} - Amount: ${item.amountNeeded}`;
        itemListElement.appendChild(listItem);
    });
}

function fetchListName(listNameElement) {
    // Fetch the list name from the server
    const urlParams = new URLSearchParams(window.location.search);
    const listId = urlParams.get('listId');

    fetch(`/api/listName?listId=${listId}`)
        .then(response => response.json())
        .then(data => {
            // Log the list name data received from the server
            console.log('List name data:', data);

            // Update the HTML content with the retrieved list name
            if (listNameElement) {
                listNameElement.textContent = data.listName;
            }
        })
        .catch(error => {
            console.error('Error fetching list name:', error);
            alert('Error fetching list name. Check console for details.');
        });
}
