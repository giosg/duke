// Manifest V3 Service Worker for Duke Extension
// This replaces the background page functionality

// Basic service worker setup
chrome.runtime.onInstalled.addListener(() => {
  // Duke extension installed
});

// Handle extension startup
chrome.runtime.onStartup.addListener(() => {
  // Duke extension started
});

// Keep service worker alive if needed (optional, only if you have long-running tasks)
// Note: Service workers have a limited lifetime, so avoid this unless necessary
// chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
//   // Handle messages from content scripts or popup
//   return true; // Keep message channel open for async response
// });
