const isLocal = window.location.hostname === 'localhost';

const settings = {
  apiUrl: isLocal
    ? "http://localhost:8080"
    : "https://ddechat-api.onrender.com",
};

export default settings;