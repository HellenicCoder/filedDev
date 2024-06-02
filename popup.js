document.addEventListener('DOMContentLoaded', function () {
  const categorySelect = document.getElementById('category');
  const saveButton = document.getElementById('saveButton');
  const itemList = document.getElementById('itemList');
  const itemPreview = document.getElementById('itemPreview');
  
// Display the item preview based on the current tab's title
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    const tabTitle = tabs[0].title;
    const truncatedTitle = tabTitle.length > 50 ? tabTitle.substring(0, 50) + '...' : tabTitle;
    itemPreview.textContent = truncatedTitle;
  });

  // Save the selected item to the shopping list
  saveButton.addEventListener('click', function () {
    const selectedCategory = categorySelect.value;
    itemPreview.textContent = "";
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      const url = tabs[0].url;
      const tabTitle = tabs[0].title;
      const truncatedTitle = tabTitle.length > 50 ? tabTitle.substring(0, 50) + '...' : tabTitle;

      // Save the item to storage
      chrome.storage.sync.get('savedItems', function (data) {
        const savedItems = data.savedItems || [];
        savedItems.push({ category: selectedCategory, url, title: truncatedTitle });
        chrome.storage.sync.set({ savedItems });

        // Update the shopping list
        updateShoppingList(savedItems);
      });
    });
  });

  // Load and display saved items from storage
  chrome.storage.sync.get('savedItems', function (data) {
    const savedItems = data.savedItems || [];
    updateShoppingList(savedItems);
  });

  // Function to update the shopping list UI
  function updateShoppingList(savedItems) {
    const itemsByCategory = {};

    savedItems.forEach(item => {
      if (!itemsByCategory[item.category]) {
        itemsByCategory[item.category] = [];
      }
      itemsByCategory[item.category].push(item);
    });

    itemList.innerHTML = ''; // Clear existing content

    // Create separate lists for each category
    for (const category in itemsByCategory) {
      const categoryHeader = document.createElement('h2');
      categoryHeader.textContent = category;
      itemList.appendChild(categoryHeader);

      const categoryList = document.createElement('ul');
      categoryList.className = 'category-list';

      itemsByCategory[category].forEach(item => {
        const listItem = document.createElement('li');
        listItem.innerHTML = `
          <div class="item-container">
            <div class="item-info">
              <a href="${item.url}" target="_blank">${item.title}</a>
            </div>
            <button class="deleteButton" data-url="${item.url}">
              <i class="fas fa-trash-alt"></i>
            </button>
          </div>`;
        categoryList.appendChild(listItem);
      });

      itemList.appendChild(categoryList);
    }

    // Attach event listeners to delete buttons
    const deleteButtons = document.querySelectorAll('.deleteButton');
    deleteButtons.forEach(button => {
      button.addEventListener('click', function () {
        const urlToDelete = button.getAttribute('data-url');
        deleteItem(urlToDelete);
        button.parentElement.parentElement.remove(); // Remove the item from the UI
      });
    });
  }

  // Function to delete an item from the savedItems array in storage
  function deleteItem(urlToDelete) {
    chrome.storage.sync.get('savedItems', function (data) {
      const savedItems = data.savedItems || [];
      const updatedItems = savedItems.filter(item => item.url !== urlToDelete);
      chrome.storage.sync.set({ savedItems: updatedItems });
    });
  }
});
