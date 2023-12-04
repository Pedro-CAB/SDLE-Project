document.addEventListener('DOMContentLoaded', function() {
    console.log('itemList.js loaded');

    const itemListElement = document.getElementById('itemList');
    
    // Get the list ID from the query parameters
    const urlParams = new URLSearchParams(window.location.search);
    const listId = urlParams.get('listId');

    console.log('List ID:', listId);

    // Fetch items for the selected shopping list from the server
    fetch(`/api/items?listId=${listId}`)
        .then(response => response.json())
        .then(data => {
            console.log('API Response:', data); // Add this line for debugging

            data.forEach(item => {
                const listItem = document.createElement('li');
                listItem.textContent = `${item.itemName} - Needed: ${item.amountNeeded}`;
                itemListElement.appendChild(listItem);
            });

            console.log('Rendering complete');
        })
        .catch(error => console.error('Error fetching items:', error));
});
