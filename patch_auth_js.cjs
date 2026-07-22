const fs = require('fs');
let content = fs.readFileSync('assets/js/local-auth.js', 'utf8');

const targetStr = `      document.getElementById("accountRole").classList.add("text-white");
    } else {
      document.getElementById("accountRole").classList.remove("text-white");
    }
  } else {`;

const newStr = `      document.getElementById("accountRole").classList.add("text-white");
      if(document.getElementById("adminDashboardBtn")) document.getElementById("adminDashboardBtn").classList.remove("hidden");
      if(document.getElementById("userDashboardBtn")) document.getElementById("userDashboardBtn").classList.add("hidden");
    } else {
      document.getElementById("accountRole").classList.remove("text-white");
      if(document.getElementById("userDashboardBtn")) document.getElementById("userDashboardBtn").classList.remove("hidden");
      if(document.getElementById("adminDashboardBtn")) document.getElementById("adminDashboardBtn").classList.add("hidden");
    }
  } else {`;

content = content.replace(targetStr, newStr);
fs.writeFileSync('assets/js/local-auth.js', content);
