// background.js
chrome.runtime.onInstalled.addListener(function () {
    // Initialize storage with an empty array if it's not already initialized
    chrome.storage.sync.get('savedItems', function (data) {
      if (!data.savedItems) {
        chrome.storage.sync.set({ savedItems: [] });
      }
    });
  });
  