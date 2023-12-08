document.addEventListener('DOMContentLoaded', function () {
    const listNameElement = document.getElementById('listName');
    const itemListElement = document.getElementById('itemList');
    const addItemButton = document.getElementById('addItemButton');
    const createItemButton = document.getElementById('createItemButton');

    // Global variable for timestamp generation
    let currentTimestamp = 1;

    // Function to generate a new timestamp
    function generateTimestamp() {
        return currentTimestamp++;
    }

    // Function to update the amount needed using LWW Register
    async function updateAmountNeeded(itemId, newAmountNeeded) {
        const timestamp = generateTimestamp();

        try {
            // Send the edited amount data to the server
            const response = await fetch('/api/editItem', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    itemId: parseInt(itemId),
                    newAmountNeeded: parseInt(newAmountNeeded),
                    timestamp: timestamp,
                }),
            });

            const result = await response.json();
            if (result.success) {
                // Update the displayed amount if the server operation is successful
                const amountNeededElement = document.getElementById(`amountNeeded-${itemId}`);
                amountNeededElement.innerText = newAmountNeeded;
            } else {
                alert(result.message);
            }
        } catch (error) {
            console.error('Error updating amount needed:', error);
            alert('Error updating amount needed. Check console for details.');
        }
    }

    // Add button to redirect to Add Item page
    if (addItemButton) {
        addItemButton.addEventListener('click', () => {
            window.location.href = `/pages/addItem.html?listId=${listId}`;
        });
    }

    // Add button to create a new item
    if (createItemButton) {
        createItemButton.addEventListener('click', async () => {
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

                try {
                    // Send the new item data to the server
                    const response = await fetch('/api/createItem', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(newItem),
                    });

                    const result = await response.json();
                    console.log('Item creation result:', result);

                    // Fetch the updated list from the server after creating the item
                    const updatedListResponse = await fetch(`/api/items?listId=${listId}`);
                    const updatedListData = await updatedListResponse.json();

                    // Log the data received from the server
                    console.log('Updated item list:', updatedListData);

                    // Render the updated list on the page
                    renderItems(updatedListData);
                } catch (error) {
                    console.error('Error creating or fetching items:', error);
                    alert('Error creating or fetching items. Check console for details.');
                }
            }
        });
    }

    // Add event listener for delete buttons
    if (itemListElement) {
        itemListElement.addEventListener('click', (event) => {
            const deleteButton = event.target.closest('.delete-button');
            if (deleteButton) {
                const itemId = deleteButton.dataset.itemId;

                // Send a request to delete the item
                fetch(`/api/deleteItem/${itemId}`, {
                    method: 'DELETE',
                })
                .then(response => response.json())
                .then(result => {
                    // Log the result for debugging
                    console.log('Item deletion result:', result);

                    // Fetch the updated list from the server after deleting the item
                    return fetch(`/api/items?listId=${listId}`);
                })
                .then(response => response.json())
                .then(data => {
                    // Log the data received from the server
                    console.log('Updated item list after deletion:', data);

                    // Render the updated list on the page
                    renderItems(data);
                })
                .catch(error => {
                    console.error('Error deleting or fetching items:', error);
                    alert('Error deleting or fetching items. Check console for details.');
                });
            }
        });
    }

    // Fetch items for the specific shopping list after the DOM has loaded
    const urlParams = new URLSearchParams(window.location.search);
    const listId = urlParams.get('listId');
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
        listItem.id = `item-${item.idItem}`;

        // Render item details including amount needed
        listItem.innerHTML = `
            <span>${item.itemName} - Amount: <span id="amountNeeded-${item.idItem}">${item.amountNeeded}</span></span>
            <button onclick="editAmountNeeded(${item.idItem})">Edit Amount</button>
            <button onclick="deleteItem(${item.idItem})">Delete</button>
        `;

        // Append the list item to the itemListElement
        itemListElement.appendChild(listItem);
    });
}

// Edit an item's amount needed
async function editAmountNeeded(itemId) {
    const newAmountNeeded = prompt('Enter the new amount needed:');
    if (newAmountNeeded !== null) {
        // Update the amount needed using LWW Register
        await updateAmountNeeded(itemId, newAmountNeeded);
    }
}

// Delete an item
function deleteItem(itemId) {
    if (confirm('Are you sure you want to delete this item?')) {
        // Send a request to the server to delete the item
        fetch(`/api/deleteItem/${itemId}`, {
            method: 'DELETE',
        })
        .then(response => response.json())
        .then(result => {
            // Log the result for debugging
            console.log('Item deletion result:', result);

            // Fetch the updated list from the server after deleting
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
            console.error('Error deleting or fetching items:', error);
            alert('Error deleting or fetching items. Check console for details.');
        });
    }
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
