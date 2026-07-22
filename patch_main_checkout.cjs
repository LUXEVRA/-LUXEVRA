const fs = require('fs');
let content = fs.readFileSync('assets/js/main.js', 'utf8');

content = content.replace(
  'function openCheckout() {',
  `function openCheckout() {
  const userStr = localStorage.getItem('luxevra_current_user');
  if (userStr) {
    const user = JSON.parse(userStr);
    const nameInput = document.getElementById("checkName");
    const emailInput = document.getElementById("checkEmail");
    if (nameInput) nameInput.value = user.name;
    if (emailInput) emailInput.value = user.email;
  }`
);

fs.writeFileSync('assets/js/main.js', content);
