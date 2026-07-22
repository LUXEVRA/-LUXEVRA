const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

const targetDropdown = `<div id="accountDropdown" class="absolute right-0 top-full mt-1 hidden bg-[#0a0a0a] border border-[#1a1a1a] rounded-sm shadow-xl p-1 z-50 text-xs font-normal w-40">
            <div class="px-3 py-2 border-b border-[#1a1a1a] mb-1">
              <p id="accountEmail" class="text-white truncate font-medium">user@email.com</p>
              <p id="accountRole" class="text-brand-gold text-[10px] uppercase tracking-widest mt-0.5">MEMBER</p>
            </div>
            <button onclick="window.signOutUser()" class="w-full text-left px-3 py-1.5 text-[#cccccc] hover:text-brand-gold hover:bg-[#111111] rounded-none uppercase tracking-widest text-[10px]">SIGN OUT</button>
          </div>`;

const newDropdown = `<div id="accountDropdown" class="absolute right-0 top-full mt-1 hidden bg-[#0a0a0a] border border-[#1a1a1a] rounded-sm shadow-xl p-1 z-50 text-xs font-normal w-40">
            <div class="px-3 py-2 border-b border-[#1a1a1a] mb-1">
              <p id="accountEmail" class="text-white truncate font-medium">user@email.com</p>
              <p id="accountRole" class="text-brand-gold text-[10px] uppercase tracking-widest mt-0.5">MEMBER</p>
            </div>
            <button id="userDashboardBtn" onclick="window.openUserDashboard()" class="w-full text-left px-3 py-1.5 text-[#cccccc] hover:text-brand-gold hover:bg-[#111111] rounded-none uppercase tracking-widest text-[10px] hidden">MY DASHBOARD</button>
            <button id="adminDashboardBtn" onclick="window.openAdminDashboard()" class="w-full text-left px-3 py-1.5 text-[#cccccc] hover:text-brand-gold hover:bg-[#111111] rounded-none uppercase tracking-widest text-[10px] hidden">ADMIN DASHBOARD</button>
            <button onclick="window.signOutUser()" class="w-full text-left px-3 py-1.5 text-[#cccccc] hover:text-brand-gold hover:bg-[#111111] rounded-none uppercase tracking-widest text-[10px]">SIGN OUT</button>
          </div>`;

content = content.replace(targetDropdown, newDropdown);
fs.writeFileSync('index.html', content);
