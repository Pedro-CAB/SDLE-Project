// addItem.js

function saveNewItem() {
    const itemName = document.getElementById('itemName').value;
    const itemAmount = document.getElementById('itemAmount').value;

    // Get the listId from the query parameters in the URL
    const urlParams = new URLSearchParams(window.location.search);
    const listId = urlParams.get('listId');

    // Send item creation data to the server
    fetch('/api/createItem', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ itemName, itemAmount, listId }),
    })
    .then(response => response.json())
    .then(data => {
        // Handle the response as needed
        console.log(data);
        // Redirect to itemList.html after successful item creation
        window.location.href = `/pages/itemList.html?listId=${listId}`;
    })
    .catch(error => console.error('Create Item error:', error));
}
