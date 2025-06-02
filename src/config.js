const isLocal = window.location.hostname === 'localhost';

export default {
  apiUrl: isLocal ? "http://localhost:8080" : "https://ddechat-api.onrender.com"
};