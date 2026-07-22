const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

const target = `        <!-- Currency Switcher -->`;
const authBtnHtml = `        <!-- Account / Login -->
        <div class="relative group">
          <button id="authBtn" onclick="window.toggleAuthModal()" class="p-2.5 bg-[#0a0a0a] hover:bg-brand-gold hover:text-zinc-950 border border-[#1a1a1a] text-brand-gold rounded-sm transition-all shadow-md flex items-center justify-center">
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </button>
          
          <div id="accountDropdown" class="absolute right-0 top-full mt-1 hidden bg-[#0a0a0a] border border-[#1a1a1a] rounded-sm shadow-xl p-1 z-50 text-xs font-normal w-40">
            <div class="px-3 py-2 border-b border-[#1a1a1a] mb-1">
              <p id="accountEmail" class="text-white truncate font-medium">user@email.com</p>
              <p id="accountRole" class="text-brand-gold text-[10px] uppercase tracking-widest mt-0.5">MEMBER</p>
            </div>
            <button onclick="window.signOutUser()" class="w-full text-left px-3 py-1.5 text-[#cccccc] hover:text-brand-gold hover:bg-[#111111] rounded-none uppercase tracking-widest text-[10px]">SIGN OUT</button>
          </div>
        </div>

        <!-- Currency Switcher -->`;

content = content.replace(target, authBtnHtml);

// Add auth modal
const endBodyTarget = `  <!-- Master JavaScript Execution -->`;
const authModalHtml = `  <!-- Auth Modal -->
  <div id="authModal" class="fixed inset-0 z-50 modal-overlay hidden items-center justify-center p-4">
    <div class="bg-black border border-brand-gold/20 rounded-sm max-w-sm w-full p-8 relative shadow-2xl animate-fade-in text-center">
      <button onclick="window.toggleAuthModal()" class="absolute top-4 right-4 text-[#888888] hover:text-white transition-colors">✕</button>
      
      <div class="flex justify-center mb-6">
        <svg class="w-10 h-10 text-brand-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
      </div>

      <h3 class="font-cinzel text-xl font-light tracking-widest text-white mb-2 uppercase">Client Portal</h3>
      <p class="text-[11px] tracking-[0.1em] text-[#888888] mb-8 uppercase">Access your exclusive collection.</p>

      <button id="googleSignInBtn" class="w-full flex items-center justify-center gap-3 bg-white hover:bg-[#f4f4f4] text-black px-4 py-3.5 rounded-sm transition-all shadow-lg font-medium tracking-wider text-xs">
        <svg class="w-4 h-4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
        SIGN IN WITH GOOGLE
      </button>
      
      <p class="text-[9px] tracking-[0.2em] text-[#444444] mt-6 uppercase">Secure access authenticated by Google</p>
    </div>
  </div>

  <!-- Master JavaScript Execution -->`;

content = content.replace(endBodyTarget, authModalHtml);

// add type="module" to main.js if not there (Wait, let's keep main.js plain, and load firebase-init.js as module instead)
const scriptTarget = `<script src="./assets/js/main.js"></script>`;
const scriptReplacement = `<script type="module" src="./assets/js/firebase-init.js"></script>
  <script src="./assets/js/main.js"></script>`;
content = content.replace(scriptTarget, scriptReplacement);

fs.writeFileSync('index.html', content);
