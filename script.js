/* MYNJU - Dynamic Version with Google Sheets Backend */

// ========== CONFIG ==========
// Ganti dengan URL Web App Apps Script kamu setelah deploy
const API_URL = 'https://script.google.com/macros/s/AKfycbx8qU-0PBT2LGYQ10jenT-a0TkHlEmKrCNapBIxc8VfWCbBe2WHU1c9og3jk5uXf3jA/exec';

// ========== WISHLIST ==========
const count = document.getElementById("count");
const toast = document.getElementById("toast");
let wishlistCount = 0;

function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 1800);
}

// ========== CONTACT FLOAT ==========
const contactMain = document.getElementById("contactMain");
const contactFloat = document.querySelector(".contact-float");
if (contactMain && contactFloat) {
  contactMain.addEventListener("click", (e) => {
    e.stopPropagation();
    const open = contactFloat.classList.toggle("open");
    contactMain.setAttribute("aria-expanded", open);
    const icon = contactMain.querySelector(".contact-main-icon");
    if (icon) icon.textContent = open ? "×" : "♡";
  });
  document.addEventListener("click", (e) => {
    if (!contactFloat.contains(e.target)) {
      contactFloat.classList.remove("open");
      contactMain.setAttribute("aria-expanded", "false");
      const icon = contactMain.querySelector(".contact-main-icon");
      if (icon) icon.textContent = "♡";
    }
  });
}

// ========== PRODUCTS & FILTER ==========
let allProducts = [];

async function loadProducts() {
  const grid = document.getElementById("productGrid");
  try {
    const res = await fetch(API_URL + "?action=getProducts");
    allProducts = await res.json();
    renderProducts(allProducts);
    buildFilters(allProducts);
  } catch (err) {
    console.error(err);
    grid.innerHTML = '<div class="loading">Gagal memuat produk. Cek koneksi atau API URL.</div>';
  }
}

function renderProducts(products) {
  const grid = document.getElementById("productGrid");
  if (!products.length) {
    grid.innerHTML = '<div class="loading">Belum ada produk. Tambahkan dari Admin Panel.</div>';
    return;
  }
  grid.innerHTML = products.map(p => `
    <article data-category="${p.category || ''}" data-new="${p.isNew ? 'true' : 'false'}">
      <div class="pic">
        <img src="${p.imageUrl || 'rose-mini-dress.jpg'}" alt="${p.name}" loading="lazy">
        ${p.badge ? `<span class="badge">${p.badge}</span>` : ''}
        <button class="heart">♡</button>
      </div>
      <div class="info">
        <div><h3>${p.name}</h3><small>${p.collection || ''}</small></div>
        <b>${p.displayPrice || ('Rp' + Number(p.price).toLocaleString('id-ID'))}</b>
      </div>
      <button class="add-to-cart" data-name="${p.name}" data-price="${p.price}">
        <span class="bag-btn-label">ADD TO BAG</span><span class="bag-check">✓</span>
      </button>
    </article>
  `).join('');

  // Re-bind hearts and add-to-cart
  bindWishlist();
  bindAddToCart();
}

function buildFilters(products) {
  const container = document.getElementById("categoryFilters");
  const cats = [...new Set(products.map(p => p.category).filter(Boolean))];
  // Keep All and New, add others
  container.innerHTML = `
    <button class="shop-filter active" data-filter="all">All</button>
    <button class="shop-filter" data-filter="new">New</button>
    ${cats.map(c => `<button class="shop-filter" data-filter="${c}">${c.charAt(0).toUpperCase()+c.slice(1)}</button>`).join('')}
  `;
  bindFilters();
}

function bindFilters() {
  const filters = [...document.querySelectorAll(".shop-filter")];
  filters.forEach(btn => {
    btn.addEventListener("click", () => {
      filters.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const value = btn.dataset.filter;
      const cards = [...document.querySelectorAll("#productGrid [data-category]")];
      cards.forEach(card => {
        const cat = card.dataset.category;
        const show = value === "all" || cat === value || (value === "new" && card.dataset.new === "true");
        card.classList.toggle("is-hidden", !show);
      });
    });
  });
}

function bindWishlist() {
  document.querySelectorAll(".heart").forEach(b => {
    b.onclick = () => {
      b.classList.toggle("active");
      b.textContent = b.classList.contains("active") ? "♥" : "♡";
      wishlistCount += b.classList.contains("active") ? 1 : -1;
      count.textContent = wishlistCount;
      showToast(b.classList.contains("active") ? "♡ Added to your wishlist!" : "Removed from your wishlist");
    };
  });
}

// ========== CART ==========
document.addEventListener("DOMContentLoaded", () => {
  const t = document.getElementById("cartToggle");
  const d = document.getElementById("cartDrawer");
  const c = document.getElementById("cartClose");
  const b = document.getElementById("cartBackdrop");
  const items = document.getElementById("cartItems");
  const countEl = document.getElementById("cartCount");
  const hc = document.getElementById("cartHeaderCount");
  const total = document.getElementById("cartTotal");
  const wa = document.getElementById("cartWhatsApp");
  if (!d) return;

  let cart = [];
  const money = n => "Rp" + Number(n).toLocaleString("id-ID");

  function renderCart() {
    let n = cart.reduce((s, i) => s + i.qty, 0);
    let tot = cart.reduce((s, i) => s + i.price * i.qty, 0);
    countEl.textContent = n;
    hc.textContent = "(" + n + ")";
    total.textContent = money(tot);
    items.innerHTML = cart.length
      ? cart.map((i, k) => `
          <div class="cart-item">
            <div>
              <div class="cart-item-name">${i.name}</div>
              <div class="cart-item-price">${money(i.price)}</div>
              <div class="qty-controls">
                <button data-a="m" data-i="${k}">−</button>
                <span>${i.qty}</span>
                <button data-a="p" data-i="${k}">＋</button>
              </div>
              <button class="remove-item" data-a="r" data-i="${k}">Remove</button>
            </div>
            <strong>${money(i.price * i.qty)}</strong>
          </div>`).join("")
      : '<div class="cart-empty">Your MYNJU bag is waiting for something cute 🎀</div>';
  }

  function openCart() { d.classList.add("open"); d.setAttribute("aria-hidden", "false"); }
  function closeCart() { d.classList.remove("open"); d.setAttribute("aria-hidden", "true"); }

  t?.addEventListener("click", openCart);
  c?.addEventListener("click", closeCart);
  b?.addEventListener("click", closeCart);

  function bindAddToCart() {
    document.querySelectorAll(".add-to-cart").forEach(x => {
      x.onclick = () => {
        let f = cart.find(i => i.name === x.dataset.name);
        if (f) f.qty++;
        else cart.push({ name: x.dataset.name, price: +x.dataset.price, qty: 1 });
        renderCart();
        openCart();
        x.classList.add("added");
        setTimeout(() => x.classList.remove("added"), 1200);
      };
    });
  }
  window.bindAddToCart = bindAddToCart; // expose for re-bind

  items.addEventListener("click", e => {
    let x = e.target.closest("button");
    if (!x) return;
    let i = +x.dataset.i, a = x.dataset.a;
    if (a === "p") cart[i].qty++;
    if (a === "m") cart[i].qty--;
    if (a === "r") cart.splice(i, 1);
    cart = cart.filter(x => x.qty > 0);
    renderCart();
  });

  wa?.addEventListener("click", () => {
    if (!cart.length) return;
    let lines = cart.map(i => `${i.name} x${i.qty} - ${money(i.price * i.qty)}`).join("%0A");
    let tot = cart.reduce((s, i) => s + i.price * i.qty, 0);
    // Optional: log order to backend
    logOrderToBackend(cart, tot);
    window.open("https://wa.me/6289516258263?text=Halo%20kak%20Dira%20aku%20cek%20di%20website%20kamu%20keren%2C%20mau%20dong%20pesan%3A%0A" + lines + "%0ATotal%3A%20" + money(tot), "_blank");
  });

  renderCart();
  window.bindAddToCart = bindAddToCart;
});

async function logOrderToBackend(cart, total) {
  try {
    await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "logOrder",
        order: {
          items: cart,
          total: total,
          date: new Date().toISOString()
        }
      })
    });
  } catch (e) { /* silent */ }
}

// ========== ADMIN PANEL (4x click logo) ==========
let clickCount = 0;
let clickTimer = null;
let adminToken = null;

document.getElementById("siteLogo")?.addEventListener("click", (e) => {
  e.preventDefault();
  clickCount++;
  clearTimeout(clickTimer);
  clickTimer = setTimeout(() => { clickCount = 0; }, 2000);
  if (clickCount >= 4) {
    clickCount = 0;
    document.getElementById("adminOverlay").style.display = "flex";
    document.getElementById("adminPassword").focus();
  }
});

document.getElementById("adminClose")?.addEventListener("click", () => {
  document.getElementById("adminOverlay").style.display = "none";
});

document.getElementById("adminLoginBtn")?.addEventListener("click", async () => {
  const pass = document.getElementById("adminPassword").value;
  const errEl = document.getElementById("loginError");
  errEl.textContent = "";
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "login", password: pass })
    });
    const data = await res.json();
    if (data.success) {
      adminToken = data.token;
      document.getElementById("adminLogin").style.display = "none";
      document.getElementById("adminDashboard").style.display = "block";
      loadAdminProducts();
      loadAdminOrders();
    } else {
      errEl.textContent = data.error || "Password salah";
    }
  } catch (e) {
    errEl.textContent = "Gagal koneksi ke backend";
  }
});

// Tabs
document.querySelectorAll(".admin-tab").forEach(tab => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".admin-tab").forEach(t => t.classList.remove("active"));
    tab.classList.add("active");
    document.querySelectorAll(".admin-tab-content").forEach(c => c.style.display = "none");
    document.getElementById("tab-" + tab.dataset.tab).style.display = "block";
  });
});

// Product Form
document.getElementById("productForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const product = {
    id: document.getElementById("prodId").value || undefined,
    name: document.getElementById("prodName").value,
    category: document.getElementById("prodCategory").value,
    price: Number(document.getElementById("prodPrice").value),
    displayPrice: document.getElementById("prodDisplayPrice").value,
    imageUrl: document.getElementById("prodImage").value,
    badge: document.getElementById("prodBadge").value,
    collection: document.getElementById("prodCollection").value,
    isNew: document.getElementById("prodIsNew").checked,
    active: document.getElementById("prodActive").checked,
    description: document.getElementById("prodDesc").value
  };
  const action = product.id ? "updateProduct" : "addProduct";
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, token: adminToken, product })
    });
    const data = await res.json();
    if (data.success) {
      showToast("Produk tersimpan!");
      document.getElementById("productForm").reset();
      document.getElementById("prodId").value = "";
      loadAdminProducts();
      loadProducts(); // refresh public
    } else {
      alert(data.error || "Gagal simpan");
    }
  } catch (e) { alert("Error koneksi"); }
});

document.getElementById("prodReset")?.addEventListener("click", () => {
  document.getElementById("productForm").reset();
  document.getElementById("prodId").value = "";
});

async function loadAdminProducts() {
  if (!adminToken) return;
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "getAllProducts", token: adminToken })
    });
    const products = await res.json();
    const list = document.getElementById("productList");
    list.innerHTML = products.map(p => `
      <div class="admin-item">
        <div>
          <strong>${p.name}</strong> — ${p.category} — ${p.displayPrice || p.price}
          ${p.active ? '' : ' <em>(inactive)</em>'}
        </div>
        <div>
          <button class="btn-edit" data-id="${p.id}">Edit</button>
          <button class="btn-delete" data-id="${p.id}">Hapus</button>
        </div>
      </div>
    `).join("");
    list.querySelectorAll(".btn-edit").forEach(btn => {
      btn.onclick = () => editProduct(products.find(x => x.id === btn.dataset.id));
    });
    list.querySelectorAll(".btn-delete").forEach(btn => {
      btn.onclick = () => deleteProduct(btn.dataset.id);
    });
  } catch (e) { console.error(e); }
}

function editProduct(p) {
  if (!p) return;
  document.getElementById("prodId").value = p.id;
  document.getElementById("prodName").value = p.name || "";
  document.getElementById("prodCategory").value = p.category || "dress";
  document.getElementById("prodPrice").value = p.price || "";
  document.getElementById("prodDisplayPrice").value = p.displayPrice || "";
  document.getElementById("prodImage").value = p.imageUrl || "";
  document.getElementById("prodBadge").value = p.badge || "";
  document.getElementById("prodCollection").value = p.collection || "";
  document.getElementById("prodIsNew").checked = p.isNew === true || p.isNew === "TRUE";
  document.getElementById("prodActive").checked = p.active === true || p.active === "TRUE" || p.active !== false;
  document.getElementById("prodDesc").value = p.description || "";
  document.getElementById("productForm").scrollIntoView({ behavior: "smooth" });
}

async function deleteProduct(id) {
  if (!confirm("Hapus produk ini?")) return;
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "deleteProduct", token: adminToken, id })
    });
    const data = await res.json();
    if (data.success) {
      showToast("Produk dihapus");
      loadAdminProducts();
      loadProducts();
    }
  } catch (e) { alert("Gagal hapus"); }
}

async function loadAdminOrders() {
  if (!adminToken) return;
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "getOrders", token: adminToken })
    });
    const orders = await res.json();
    const list = document.getElementById("orderList");
    if (!orders.length) {
      list.innerHTML = "<p>Belum ada pesanan.</p>";
      return;
    }
    list.innerHTML = orders.map(o => `
      <div class="admin-item">
        <div>
          <strong>${o.id.slice(0,8)}...</strong> — ${new Date(o.date).toLocaleString("id-ID")}<br>
          Total: Rp${Number(o.total).toLocaleString("id-ID")} — Status: ${o.status || "new"}
          <small>${o.items ? JSON.parse(o.items || "[]").map(i => i.name + " x" + i.qty).join(", ") : ""}</small>
        </div>
        <div>
          <button class="btn-delete" data-id="${o.id}">Hapus</button>
        </div>
      </div>
    `).join("");
    list.querySelectorAll(".btn-delete").forEach(btn => {
      btn.onclick = () => deleteOrder(btn.dataset.id);
    });
  } catch (e) { console.error(e); }
}

async function deleteOrder(id) {
  if (!confirm("Hapus pesanan ini?")) return;
  try {
    await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "deleteOrder", token: adminToken, id })
    });
    loadAdminOrders();
  } catch (e) {}
}

// ========== AUTO SCROLL (preserved) ==========
document.addEventListener("DOMContentLoaded", () => {
  const AUTO_SCROLL_DELAY = 2000;
  const AUTO_SCROLL_SPEED = 0.65;
  const BOTTOM_THRESHOLD = 4;
  let idleTimer = null;
  let autoScrollFrame = null;
  let autoScrolling = false;
  let activityLocked = false;

  const stopAutoScroll = () => {
    if (autoScrollFrame !== null) {
      cancelAnimationFrame(autoScrollFrame);
      autoScrollFrame = null;
    }
    autoScrolling = false;
  };
  const isAtBottom = () => {
    const scrollTop = window.scrollY || window.pageYOffset;
    const viewportBottom = scrollTop + window.innerHeight;
    return viewportBottom >= document.documentElement.scrollHeight - BOTTOM_THRESHOLD;
  };
  const runAutoScroll = () => {
    if (!autoScrolling) return;
    if (isAtBottom()) {
      window.scrollTo({ top: 0, behavior: "instant" });
    } else {
      window.scrollBy(0, AUTO_SCROLL_SPEED);
    }
    autoScrollFrame = requestAnimationFrame(runAutoScroll);
  };
  const startAutoScroll = () => {
    if (autoScrolling || activityLocked) return;
    autoScrolling = true;
    runAutoScroll();
  };
  const resetIdleTimer = () => {
    activityLocked = true;
    stopAutoScroll();
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => {
      activityLocked = false;
      startAutoScroll();
    }, AUTO_SCROLL_DELAY);
  };
  const userActivity = (event) => {
    if (event.type === "scroll" && autoScrolling) return;
    resetIdleTimer();
  };
  ["mousemove", "mousedown", "touchstart", "touchmove", "keydown", "click", "wheel"].forEach(ev => {
    window.addEventListener(ev, userActivity, { passive: true });
  });
  window.addEventListener("scroll", () => {
    if (!autoScrolling) resetIdleTimer();
  }, { passive: true });
  resetIdleTimer();
});

// Load products on start
document.addEventListener("DOMContentLoaded", loadProducts);
