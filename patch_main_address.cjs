const fs = require('fs');
let content = fs.readFileSync('assets/js/main.js', 'utf8');

const target = `  appState.orders.unshift(newOrder);`;
const replacement = `
  const addressField = document.querySelector("#checkoutModal textarea");
  if (addressField && addressField.value) {
    let addresses = getSaved("addresses", []);
    if (!addresses.includes(addressField.value)) {
      addresses.push(addressField.value);
      saveState("addresses", addresses);
    }
  }

  appState.orders.unshift(newOrder);`;

content = content.replace(target, replacement);

fs.writeFileSync('assets/js/main.js', content);
