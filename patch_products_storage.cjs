const fs = require('fs');
let content = fs.readFileSync('assets/js/main.js', 'utf8');

const targetInit = `appState.cart = getSaved("cart", []);`;
const replacementInit = `
  appState.products = getSaved("custom_products", appState.products);
  appState.cart = getSaved("cart", []);`;

content = content.replace(targetInit, replacementInit);
fs.writeFileSync('assets/js/main.js', content);
