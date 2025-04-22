// This file makes environment variables available in the browser
// Include this in your index.html before your application bundle

(function(window) {
  window.ENV = window.ENV || {};
  // API URL - replace with your actual API endpoint
  window.ENV.VITE_API_URL = 'http://localhost:5000/api';
  
  // Add other environment variables as needed
  window.ENV.VITE_DEBUG = 'false';
})(this);
