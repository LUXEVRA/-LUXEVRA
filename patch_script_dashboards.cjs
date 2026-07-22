const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

const targetStr = `  <script src="./assets/js/local-auth.js"></script>
  <script src="./assets/js/main.js"></script>`;

const newStr = `  <script src="./assets/js/local-auth.js"></script>
  <script src="./assets/js/main.js"></script>
  <script src="./assets/js/dashboards.js"></script>`;

content = content.replace(targetStr, newStr);
fs.writeFileSync('index.html', content);
