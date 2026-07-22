const fs = require('fs');

let content = fs.readFileSync('index.html', 'utf8');

const oldAuthModalStr = `  <!-- Auth Modal -->
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
  </div>`;

const newAuthModalStr = `  <!-- Auth Modal -->
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
      <p id="authSubtitle" class="text-[11px] tracking-[0.1em] text-[#888888] mb-6 uppercase">Access your exclusive collection.</p>

      <form id="authForm" onsubmit="window.handleAuthSubmit(event)" class="space-y-4 text-left">
        <div id="nameFieldGroup" class="hidden">
          <label class="text-[10px] text-white uppercase font-medium tracking-widest block mb-1">Full Name</label>
          <input id="authName" type="text" placeholder="ALEXANDER VANCE" class="w-full bg-[#0a0a0a] border border-[#1a1a1a] text-xs px-3 py-2.5 rounded-sm text-white focus:border-brand-gold outline-none transition-colors">
        </div>
        <div>
          <label class="text-[10px] text-white uppercase font-medium tracking-widest block mb-1">Email Address</label>
          <input id="authEmail" required type="email" placeholder="client@luxevra.com" class="w-full bg-[#0a0a0a] border border-[#1a1a1a] text-xs px-3 py-2.5 rounded-sm text-white focus:border-brand-gold outline-none transition-colors">
        </div>
        <div>
          <label class="text-[10px] text-white uppercase font-medium tracking-widest block mb-1">Password</label>
          <input id="authPassword" required type="password" placeholder="••••••••" class="w-full bg-[#0a0a0a] border border-[#1a1a1a] text-xs px-3 py-2.5 rounded-sm text-white focus:border-brand-gold outline-none transition-colors">
        </div>

        <button type="submit" id="authSubmitBtn" class="w-full btn-gold py-3.5 rounded-sm font-medium tracking-widest text-[11px] uppercase mt-4">
          SIGN IN
        </button>
      </form>
      
      <p class="text-[10px] text-[#888888] mt-6">
        <span id="authToggleText">New to LUXEVRA?</span>
        <button onclick="window.toggleAuthMode()" id="authToggleBtn" class="text-brand-gold hover:text-white uppercase tracking-wider ml-1 underline decoration-brand-gold/30 underline-offset-4">Create Account</button>
      </p>
    </div>
  </div>`;

content = content.replace(oldAuthModalStr, newAuthModalStr);

// Also remove firebase-init script
const firebaseScript = `  <script type="module" src="./assets/js/firebase-init.js"></script>\n`;
content = content.replace(firebaseScript, '');
const localAuthScript = `  <script src="./assets/js/local-auth.js"></script>\n  <script src="./assets/js/main.js"></script>`;
content = content.replace(`  <script src="./assets/js/main.js"></script>`, localAuthScript);

fs.writeFileSync('index.html', content);

