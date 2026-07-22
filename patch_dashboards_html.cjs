const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

const dashboardModals = `
  <!-- User Dashboard Modal -->
  <div id="userDashboardModal" class="fixed inset-0 z-50 modal-overlay hidden p-0">
    <div class="bg-black w-full h-full overflow-y-auto animate-fade-in text-white relative flex flex-col">
      <header class="sticky top-0 z-40 bg-black/90 backdrop-blur-md border-b border-[#1a1a1a] p-4 sm:px-8 flex items-center justify-between">
        <h2 class="font-cinzel text-xl text-brand-gold tracking-widest uppercase">My Portal</h2>
        <button onclick="window.closeUserDashboard()" class="text-[#888888] hover:text-white">✕</button>
      </header>
      <div class="max-w-7xl mx-auto w-full flex-1 grid grid-cols-1 md:grid-cols-4 gap-8 p-4 sm:p-8">
        <aside class="md:col-span-1 space-y-2 border-r border-[#1a1a1a] pr-4 flex flex-col">
          <button onclick="switchUserTab('profile')" class="user-tab-btn text-left px-4 py-3 text-xs tracking-widest uppercase border border-transparent hover:border-brand-gold/30 bg-[#111111] text-brand-gold w-full transition-colors">Profile</button>
          <button onclick="switchUserTab('orders')" class="user-tab-btn text-left px-4 py-3 text-xs tracking-widest uppercase border border-transparent hover:border-brand-gold/30 text-[#888888] w-full transition-colors">Orders</button>
          <button onclick="switchUserTab('addresses')" class="user-tab-btn text-left px-4 py-3 text-xs tracking-widest uppercase border border-transparent hover:border-brand-gold/30 text-[#888888] w-full transition-colors">Addresses</button>
          <button onclick="switchUserTab('wishlist')" class="user-tab-btn text-left px-4 py-3 text-xs tracking-widest uppercase border border-transparent hover:border-brand-gold/30 text-[#888888] w-full transition-colors">Wishlist</button>
        </aside>
        <main class="md:col-span-3 pb-20">
          
          <!-- Profile Tab -->
          <div id="userTab-profile" class="user-tab-content space-y-6">
            <h3 class="font-cinzel text-lg tracking-widest uppercase text-white border-b border-[#1a1a1a] pb-2">Profile Details</h3>
            <div class="space-y-4 max-w-sm">
              <div>
                <label class="block text-[10px] text-[#666666] tracking-widest uppercase mb-1">Full Name</label>
                <input type="text" id="udName" class="w-full bg-[#0a0a0a] border border-[#1a1a1a] text-xs text-white p-3 rounded-none focus:outline-none focus:border-brand-gold/40 transition-all" readonly>
              </div>
              <div>
                <label class="block text-[10px] text-[#666666] tracking-widest uppercase mb-1">Email Address</label>
                <input type="email" id="udEmail" class="w-full bg-[#0a0a0a] border border-[#1a1a1a] text-xs text-white p-3 rounded-none focus:outline-none focus:border-brand-gold/40 transition-all" readonly>
              </div>
              <div>
                <label class="block text-[10px] text-[#666666] tracking-widest uppercase mb-1">Role</label>
                <input type="text" id="udRole" class="w-full bg-[#0a0a0a] border border-[#1a1a1a] text-xs text-brand-gold p-3 rounded-none focus:outline-none" readonly>
              </div>
            </div>
          </div>
          
          <!-- Orders Tab -->
          <div id="userTab-orders" class="user-tab-content hidden space-y-6">
            <h3 class="font-cinzel text-lg tracking-widest uppercase text-white border-b border-[#1a1a1a] pb-2">Order History</h3>
            <div id="udOrdersList" class="space-y-4">
              <!-- Rendered via JS -->
            </div>
          </div>
          
          <!-- Addresses Tab -->
          <div id="userTab-addresses" class="user-tab-content hidden space-y-6">
            <h3 class="font-cinzel text-lg tracking-widest uppercase text-white border-b border-[#1a1a1a] pb-2">Saved Addresses</h3>
            <div id="udAddressesList" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <!-- Rendered via JS -->
            </div>
            <div class="pt-4 border-t border-[#1a1a1a]">
              <textarea id="udNewAddress" rows="3" placeholder="Enter new address..." class="w-full bg-[#0a0a0a] border border-[#1a1a1a] text-xs text-white p-3 rounded-none focus:outline-none focus:border-brand-gold/40 transition-all mb-2"></textarea>
              <button onclick="window.saveNewAddress()" class="btn-gold px-6 py-2 rounded-sm text-xs font-normal tracking-widest">ADD ADDRESS</button>
            </div>
          </div>
          
          <!-- Wishlist Tab -->
          <div id="userTab-wishlist" class="user-tab-content hidden space-y-6">
            <h3 class="font-cinzel text-lg tracking-widest uppercase text-white border-b border-[#1a1a1a] pb-2">My Wishlist</h3>
            <div id="udWishlistList" class="grid grid-cols-2 lg:grid-cols-3 gap-4">
              <!-- Rendered via JS -->
            </div>
          </div>

        </main>
      </div>
    </div>
  </div>

  <!-- Admin Dashboard Modal -->
  <div id="adminDashboardModal" class="fixed inset-0 z-50 modal-overlay hidden p-0">
    <div class="bg-black w-full h-full overflow-y-auto animate-fade-in text-white relative flex flex-col">
      <header class="sticky top-0 z-40 bg-black/90 backdrop-blur-md border-b border-brand-gold/30 p-4 sm:px-8 flex items-center justify-between">
        <h2 class="font-cinzel text-xl text-brand-gold tracking-widest uppercase flex items-center gap-3">
          <span class="w-2 h-2 bg-brand-gold rounded-full animate-pulse"></span>
          Command Center <span class="text-[10px] text-[#888888] ml-2">ADMIN</span>
        </h2>
        <button onclick="window.closeAdminDashboard()" class="text-[#888888] hover:text-white">✕</button>
      </header>
      
      <div class="max-w-7xl mx-auto w-full flex-1 grid grid-cols-1 lg:grid-cols-5 gap-8 p-4 sm:p-8">
        <!-- Admin Sidebar -->
        <aside class="lg:col-span-1 space-y-2 border-r border-[#1a1a1a] pr-4 flex flex-col">
          <button onclick="switchAdminTab('overview')" class="admin-tab-btn text-left px-4 py-3 text-xs tracking-widest uppercase border border-transparent hover:border-brand-gold/30 bg-[#111111] text-brand-gold w-full transition-colors">Overview</button>
          <button onclick="switchAdminTab('users')" class="admin-tab-btn text-left px-4 py-3 text-xs tracking-widest uppercase border border-transparent hover:border-brand-gold/30 text-[#888888] w-full transition-colors">Users</button>
          <button onclick="switchAdminTab('orders')" class="admin-tab-btn text-left px-4 py-3 text-xs tracking-widest uppercase border border-transparent hover:border-brand-gold/30 text-[#888888] w-full transition-colors">Orders</button>
          <button onclick="switchAdminTab('products')" class="admin-tab-btn text-left px-4 py-3 text-xs tracking-widest uppercase border border-transparent hover:border-brand-gold/30 text-[#888888] w-full transition-colors">Products</button>
        </aside>

        <!-- Admin Content -->
        <main class="lg:col-span-4 pb-20">
          
          <!-- Overview Tab -->
          <div id="adminTab-overview" class="admin-tab-content space-y-8">
            <h3 class="font-cinzel text-lg tracking-widest uppercase text-white border-b border-[#1a1a1a] pb-2">Business Analytics</h3>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div class="p-6 bg-[#0a0a0a] border border-[#1a1a1a] rounded-sm">
                <p class="text-[10px] text-[#888888] tracking-widest uppercase mb-2">Total Revenue</p>
                <p id="adminStatRevenue" class="text-3xl font-cinzel text-brand-gold">₹0</p>
              </div>
              <div class="p-6 bg-[#0a0a0a] border border-[#1a1a1a] rounded-sm">
                <p class="text-[10px] text-[#888888] tracking-widest uppercase mb-2">Total Orders</p>
                <p id="adminStatOrders" class="text-3xl font-cinzel text-white">0</p>
              </div>
              <div class="p-6 bg-[#0a0a0a] border border-[#1a1a1a] rounded-sm">
                <p class="text-[10px] text-[#888888] tracking-widest uppercase mb-2">Total Users</p>
                <p id="adminStatUsers" class="text-3xl font-cinzel text-white">0</p>
              </div>
            </div>
          </div>

          <!-- Users Tab -->
          <div id="adminTab-users" class="admin-tab-content hidden space-y-6">
            <h3 class="font-cinzel text-lg tracking-widest uppercase text-white border-b border-[#1a1a1a] pb-2">Registered Accounts</h3>
            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs">
                <thead class="text-[10px] text-[#666666] uppercase tracking-widest border-b border-[#1a1a1a]">
                  <tr>
                    <th class="pb-3 font-normal">Name</th>
                    <th class="pb-3 font-normal">Email</th>
                    <th class="pb-3 font-normal">Role</th>
                  </tr>
                </thead>
                <tbody id="adminUsersList" class="divide-y divide-[#1a1a1a]">
                  <!-- Rendered via JS -->
                </tbody>
              </table>
            </div>
          </div>

          <!-- Orders Tab -->
          <div id="adminTab-orders" class="admin-tab-content hidden space-y-6">
            <h3 class="font-cinzel text-lg tracking-widest uppercase text-white border-b border-[#1a1a1a] pb-2">Order Management</h3>
            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs">
                <thead class="text-[10px] text-[#666666] uppercase tracking-widest border-b border-[#1a1a1a]">
                  <tr>
                    <th class="pb-3 font-normal">Order ID</th>
                    <th class="pb-3 font-normal">Customer Info</th>
                    <th class="pb-3 font-normal">Total</th>
                    <th class="pb-3 font-normal">Status</th>
                    <th class="pb-3 font-normal text-right">Actions</th>
                  </tr>
                </thead>
                <tbody id="adminOrdersList" class="divide-y divide-[#1a1a1a]">
                  <!-- Rendered via JS -->
                </tbody>
              </table>
            </div>
          </div>

          <!-- Products Tab -->
          <div id="adminTab-products" class="admin-tab-content hidden space-y-6">
            <div class="flex items-center justify-between border-b border-[#1a1a1a] pb-2">
              <h3 class="font-cinzel text-lg tracking-widest uppercase text-white">Inventory</h3>
              <button onclick="window.openProductEditor(null)" class="btn-gold px-4 py-1.5 rounded-sm text-[10px] tracking-widest">+ NEW PRODUCT</button>
            </div>
            
            <!-- Product Editor form (hidden by default) -->
            <div id="adminProductEditor" class="hidden bg-[#0a0a0a] p-6 border border-brand-gold/30 rounded-sm mb-6 relative">
              <button onclick="document.getElementById('adminProductEditor').classList.add('hidden')" class="absolute top-4 right-4 text-[#888888] hover:text-white text-xs">✕</button>
              <h4 class="font-cinzel text-sm text-brand-gold mb-4 uppercase tracking-widest" id="adminProductEditorTitle">Add Product</h4>
              <form id="adminProductForm" class="space-y-4" onsubmit="window.saveAdminProduct(event)">
                <input type="hidden" id="apId">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-[10px] text-[#666666] tracking-widest uppercase mb-1">Product Name</label>
                    <input type="text" id="apName" required class="w-full bg-black border border-[#1a1a1a] text-xs text-white p-2 focus:border-brand-gold/40 focus:outline-none">
                  </div>
                  <div>
                    <label class="block text-[10px] text-[#666666] tracking-widest uppercase mb-1">Price (₹)</label>
                    <input type="number" id="apPrice" required class="w-full bg-black border border-[#1a1a1a] text-xs text-white p-2 focus:border-brand-gold/40 focus:outline-none">
                  </div>
                  <div>
                    <label class="block text-[10px] text-[#666666] tracking-widest uppercase mb-1">Category</label>
                    <input type="text" id="apCategory" required class="w-full bg-black border border-[#1a1a1a] text-xs text-white p-2 focus:border-brand-gold/40 focus:outline-none" placeholder="e.g. all, heavyweight, light">
                  </div>
                  <div>
                    <label class="block text-[10px] text-[#666666] tracking-widest uppercase mb-1">Image URL</label>
                    <input type="text" id="apImage" required class="w-full bg-black border border-[#1a1a1a] text-xs text-white p-2 focus:border-brand-gold/40 focus:outline-none">
                  </div>
                </div>
                <div>
                  <label class="block text-[10px] text-[#666666] tracking-widest uppercase mb-1">Description</label>
                  <textarea id="apDesc" rows="3" required class="w-full bg-black border border-[#1a1a1a] text-xs text-white p-2 focus:border-brand-gold/40 focus:outline-none"></textarea>
                </div>
                <div class="pt-2 flex gap-3">
                  <button type="submit" class="btn-gold px-6 py-2 text-xs tracking-widest rounded-sm">SAVE</button>
                  <button type="button" onclick="document.getElementById('adminProductEditor').classList.add('hidden')" class="px-6 py-2 text-xs tracking-widest border border-[#1a1a1a] hover:bg-[#111111]">CANCEL</button>
                </div>
              </form>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4" id="adminProductsList">
              <!-- Rendered via JS -->
            </div>
          </div>

        </main>
      </div>
    </div>
  </div>
`;

content = content.replace('<!-- Auth Modal -->', dashboardModals + '\n  <!-- Auth Modal -->');
fs.writeFileSync('index.html', content);
