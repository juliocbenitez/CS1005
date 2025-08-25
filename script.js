// subscribe.jss

function initSubscribe() {
    const subscribeBtn = document.getElementById("subscribeBtn");
    const emailInput = document.getElementById("email");

    if (!subscribeBtn || !emailInput) return; // Safety check

    subscribeBtn.addEventListener("click", function () {
        const email = emailInput.value.trim();

        if (email) {
            alert("Thank you for subscribing!");
            emailInput.value = ""; // Clear field after success
        } else {
            alert("Please fill out this field");
            emailInput.focus(); // Put cursor back in the field
        }
    });
}

// Run once DOM has loaded
document.addEventListener("DOMContentLoaded", initSubscribe);

// ---- Gallery Cart ----
const cart = [];

const viewCartBtn = document.querySelector('.view-cart');
const cartCountEl = document.querySelector('#cartCount');

document.querySelectorAll('.gallery .tile').forEach(tile => {
    const addBtn = tile.querySelector('.button-add');
    const name = tile.querySelector('.name')?.textContent?.trim() || 'Untitled Item';
    const desc = tile.querySelector('.desc')?.textContent?.trim() || '';
    const img = tile.querySelector('img')?.getAttribute('src') || '';

    if (addBtn) {
        addBtn.addEventListener('click', () => {
            cart.push({ name, desc, img });
            updateCartCount();

            pulseCartCount();
        });
    }
});

const modal = buildCartModal();
document.body.appendChild(modal.overlay);

if (viewCartBtn) {
    viewCartBtn.addEventListener('click', openCartModal);
}

const externalClear = document.getElementById('clearCart');
if (externalClear) externalClear.addEventListener('click', () => { clearCart(); openCartModal(); });

const externalProcess = document.getElementById('processOrder');
if (externalProcess) externalProcess.addEventListener('click', () => { processOrder(); openCartModal(); });

/* ---------- Functions ---------- */
function updateCartCount() {
    if (cartCountEl) {
        cartCountEl.textContent = String(cart.length);
    }
}

function pulseCartCount() {
    if (!cartCountEl) return;
    cartCountEl.style.transition = 'transform 150ms ease';
    cartCountEl.style.transform = 'scale(1.25)';
    setTimeout(() => (cartCountEl.style.transform = 'scale(1)'), 150);
}

function openCartModal() {
    renderCartItems();
    modal.overlay.style.display = 'block';

    modal.closeBtn.focus();
    document.addEventListener('keydown', onEscClose);
}

function closeCartModal() {
    modal.overlay.style.display = 'none';
    document.removeEventListener('keydown', onEscClose);
}

function onEscClose(e) {
    if (e.key === 'Escape') closeCartModal();
}

function clearCart() {
    cart.length = 0;
    updateCartCount();
    renderCartItems();
}

function processOrder() {
    if (cart.length === 0) {
        alert('Your cart is empty. Add items first.');
        return;
    }

    const summary = cart.map((it, i) => `${i + 1}. ${it.name}`).join('\n');
    alert(`Thanks! Your order has been received:\n\n${summary}`);
    clearCart();
}

function renderCartItems() {
    const list = modal.list;
    list.innerHTML = '';

    if (cart.length === 0) {
        const empty = document.createElement('li');
        empty.textContent = 'Your cart is empty.';
        empty.style.opacity = '0.8';
        list.appendChild(empty);
        modal.count.textContent = '0';
        return;
    }

    cart.forEach(item => {
        const li = document.createElement('li');
        li.style.display = 'grid';
        li.style.gridTemplateColumns = item.img ? '48px 1fr' : '1fr';
        li.style.gap = '12px';
        li.style.alignItems = 'center';

        if (item.img) {
            const thumb = document.createElement('img');
            thumb.src = item.img;
            thumb.alt = item.name;
            thumb.style.width = '48px';
            thumb.style.height = '48px';
            thumb.style.objectFit = 'cover';
            thumb.style.borderRadius = '8px';
            thumb.style.border = '1px solid #e5e7eb';
            li.appendChild(thumb);
        }

        const textWrap = document.createElement('div');
        const title = document.createElement('div');
        title.textContent = item.name;
        title.style.fontWeight = '600';

        const sub = document.createElement('div');
        sub.textContent = item.desc || '';
        sub.style.fontSize = '0.9rem';
        sub.style.opacity = '0.8';

        textWrap.appendChild(title);
        if (item.desc) textWrap.appendChild(sub);
        li.appendChild(textWrap);

        list.appendChild(li);
    });

    modal.count.textContent = String(cart.length);
}

/* ---------- Modal Builder ---------- */
function buildCartModal() {
    const style = document.createElement('style');
    style.textContent = `
    .cart-overlay {
      position: fixed; inset: 0; background: rgba(0,0,0,0.45);
      display: none; z-index: 1000;
    }
    .cart-dialog {
      position: absolute; left: 50%; top: 50%;
      transform: translate(-50%, -50%);
      width: min(92vw, 560px);
      background: #fff; color: #111827;
      border-radius: 14px; box-shadow: 0 20px 50px rgba(0,0,0,0.20);
      overflow: hidden; outline: none;
      font-family: system-ui, -apple-system, Segoe UI, Roboto, Inter, Arial, sans-serif;
    }
    .cart-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 14px 16px; border-bottom: 1px solid #e5e7eb; background: #f9fafb;
    }
    .cart-title { font-size: 1.05rem; font-weight: 700; }
    .cart-close {
      border: none; background: transparent; font-size: 20px; line-height: 1;
      cursor: pointer; padding: 6px; border-radius: 8px;
    }
    .cart-close:hover { background: #f3f4f6; }
    .cart-body { padding: 14px 16px; max-height: 50vh; overflow: auto; }
    .cart-body ul { list-style: none; margin: 0; padding: 0; display: grid; gap: 12px; }
    .cart-footer {
      display: flex; align-items: center; justify-content: space-between;
      gap: 12px; padding: 12px 16px; border-top: 1px solid #e5e7eb; background: #fafafa;
      flex-wrap: wrap;
    }
    .cart-actions { display: flex; gap: 8px; }
    .cart-btn {
      border: 1px solid #e5e7eb; background: #111827; color: white;
      padding: 10px 14px; border-radius: 10px; cursor: pointer; font-weight: 600;
    }
    .cart-btn.secondary { background: white; color: #111827; }
    .cart-btn:hover { filter: brightness(1.05); }
    .cart-count { font-weight: 700; }
    @media (prefers-reduced-motion: no-preference) {
      .cart-dialog { animation: cartPop 160ms ease-out; }
      @keyframes cartPop {
        from { transform: translate(-50%, -48%) scale(0.98); opacity: 0; }
        to   { transform: translate(-50%, -50%) scale(1); opacity: 1; }
      }
    }
  `;
    document.head.appendChild(style);

    const overlay = document.createElement('div');
    overlay.className = 'cart-overlay';

    const dialog = document.createElement('div');
    dialog.className = 'cart-dialog';
    dialog.setAttribute('role', 'dialog');
    dialog.setAttribute('aria-modal', 'true');
    dialog.setAttribute('aria-labelledby', 'cartTitle');

    // Header
    const header = document.createElement('div');
    header.className = 'cart-header';

    const title = document.createElement('div');
    title.className = 'cart-title';
    title.id = 'cartTitle';
    title.textContent = 'Shopping Cart';

    const closeBtn = document.createElement('button');
    closeBtn.className = 'cart-close';
    closeBtn.setAttribute('aria-label', 'Close cart');
    closeBtn.innerHTML = '&times;';
    closeBtn.addEventListener('click', closeCartModal);

    header.appendChild(title);
    header.appendChild(closeBtn);

    // Body
    const body = document.createElement('div');
    body.className = 'cart-body';

    const list = document.createElement('ul');

    body.appendChild(list);

    // Footer
    const footer = document.createElement('div');
    footer.className = 'cart-footer';

    const left = document.createElement('div');
    left.innerHTML = `Items in cart: <span class="cart-count">0</span>`;
    const countSpan = left.querySelector('.cart-count');

    const actions = document.createElement('div');
    actions.className = 'cart-actions';

    const clearBtn = document.createElement('button');
    clearBtn.className = 'cart-btn secondary';
    clearBtn.textContent = 'Clear Cart';
    clearBtn.addEventListener('click', clearCart);

    const processBtn = document.createElement('button');
    processBtn.className = 'cart-btn';
    processBtn.textContent = 'Process Order';
    processBtn.addEventListener('click', processOrder);

    actions.appendChild(clearBtn);
    actions.appendChild(processBtn);

    footer.appendChild(left);
    footer.appendChild(actions);

    dialog.appendChild(header);
    dialog.appendChild(body);
    dialog.appendChild(footer);

    overlay.appendChild(dialog);

    // Click on backdrop closes dialog
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeCartModal();
    });

    return {
        overlay,
        dialog,
        list,
        closeBtn,
        count: countSpan
    };
}

/* ---------------- Contact Form Modal + Validation ---------------- */

(function () {
  const style = document.createElement('style');
  style.textContent = `
    .cu-overlay {
      position: fixed; inset: 0; background: rgba(0,0,0,.45);
      display: none; z-index: 1000;
    }
    .cu-dialog {
      position: absolute; left: 50%; top: 50%;
      transform: translate(-50%, -50%);
      width: min(92vw, 520px);
      background: #fff; color: #111827;
      border-radius: 14px; box-shadow: 0 20px 50px rgba(0,0,0,.2);
      overflow: hidden; outline: none;
      font-family: system-ui, -apple-system, "Segoe UI", Roboto, Inter, Arial, sans-serif;
    }
    .cu-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 14px 16px; border-bottom: 1px solid #e5e7eb; background: #f9fafb;
    }
    .cu-title { font-size: 1.05rem; font-weight: 700; }
    .cu-close {
      border: none; background: transparent; font-size: 20px; line-height: 1;
      cursor: pointer; padding: 6px; border-radius: 8px;
    }
    .cu-close:hover { background: #f3f4f6; }
    .cu-body { padding: 18px 16px; font-size: 1rem; }
    .cu-footer { padding: 12px 16px; border-top: 1px solid #e5e7eb; background: #fafafa; text-align: right; }
    .cu-btn {
      border: 1px solid #e5e7eb; background: #111827; color: #fff;
      padding: 10px 14px; border-radius: 10px; cursor: pointer; font-weight: 600;
    }
    .cu-btn:hover { filter: brightness(1.05); }
    @media (prefers-reduced-motion: no-preference) {
      .cu-dialog { animation: cuPop 160ms ease-out; }
      @keyframes cuPop {
        from { transform: translate(-50%,-48%) scale(.98); opacity: 0; }
        to   { transform: translate(-50%,-50%) scale(1);   opacity: 1; }
      }
    }
  `;
  document.head.appendChild(style);

  // Build modal once
  const overlay = document.createElement('div');
  overlay.className = 'cu-overlay';
  overlay.setAttribute('role', 'presentation');

  const dialog = document.createElement('div');
  dialog.className = 'cu-dialog';
  dialog.setAttribute('role', 'dialog');
  dialog.setAttribute('aria-modal', 'true');
  dialog.setAttribute('aria-labelledby', 'cuTitle');

  const header = document.createElement('div');
  header.className = 'cu-header';

  const title = document.createElement('div');
  title.className = 'cu-title';
  title.id = 'cuTitle';
  title.textContent = 'Message Status';

  const closeBtn = document.createElement('button');
  closeBtn.className = 'cu-close';
  closeBtn.setAttribute('aria-label', 'Close dialog');
  closeBtn.innerHTML = '&times;';

  const body = document.createElement('div');
  body.className = 'cu-body';
  body.textContent = '';

  const footer = document.createElement('div');
  footer.className = 'cu-footer';

  const okBtn = document.createElement('button');
  okBtn.className = 'cu-btn';
  okBtn.textContent = 'OK';

  header.appendChild(title);
  header.appendChild(closeBtn);
  footer.appendChild(okBtn);

  dialog.appendChild(header);
  dialog.appendChild(body);
  dialog.appendChild(footer);
  overlay.appendChild(dialog);
  document.body.appendChild(overlay);

  function openModal(message) {
    body.textContent = message;
    overlay.style.display = 'block';
    closeBtn.focus();
    document.addEventListener('keydown', onEsc);
  }
  function closeModal() {
    overlay.style.display = 'none';
    document.removeEventListener('keydown', onEsc);
  }
  function onEsc(e) {
    if (e.key === 'Escape') closeModal();
  }

  // Close on X, OK, or clicking the dimmed overlay
  closeBtn.addEventListener('click', closeModal);
  okBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });

  // ---- Form handling ----
  const form = document.querySelector('.contact-form');
  if (!form) return;

  const nameEl = form.querySelector('#name');
  const emailEl = form.querySelector('#email');
  const topicEl = form.querySelector('#topic');
  const msgEl = form.querySelector('#message');

  // Use custom validation (novalidate is set on the form)
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const nameVal = (nameEl?.value || '').trim();
    const emailVal = (emailEl?.value || '').trim();
    const msgVal = (msgEl?.value || '').trim();

    // If any of these are empty, show the required message
    if (!nameVal || !emailVal || !msgVal) {
      openModal('Please enter your name, email, and feedback');
      return;
    }

    // Success flow
    openModal('Thank you for your message!');
    form.reset();
  });
})();

/* =========================================================
   Gallery Cart with sessionStorage
   - Add items -> sessionStorage
   - View items -> reads from sessionStorage (modal)
   - Clear / Process -> clears sessionStorage
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  const STORAGE_KEY = 'bh_cart_v1'; // sessionStorage key
  const viewCartEl = document.querySelector('.view-cart');
  const cartCountEl = document.getElementById('cartCount');

  /* --------------- sessionStorage helpers --------------- */
  const readCart = () => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.warn('Cart parse error:', e);
      return [];
    }
  };

  const saveCart = (cartArray) => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(cartArray));
  };

  const clearCart = () => {
    sessionStorage.removeItem(STORAGE_KEY);
    updateCartCount();
  };

  const cartCount = () => readCart().reduce((n, it) => n + (it.qty || 1), 0);

  const updateCartCount = () => {
    if (cartCountEl) cartCountEl.textContent = String(cartCount());
  };

  /* ----------------- ADD TO CART (sessionStorage) ----------------- */
  // Scans each .tile and wires the "Add to Cart" button
  document.querySelectorAll('.gallery .tile').forEach(tile => {
    const btn = tile.querySelector('.button-add');
    if (!btn) return;

    btn.addEventListener('click', () => {
      const name = tile.querySelector('.name')?.textContent?.trim() || 'Untitled Item';
      const desc = tile.querySelector('.desc')?.textContent?.trim() || '';
      const img  = tile.querySelector('img')?.getAttribute('src') || '';
      const id   = name.toLowerCase().replace(/\s+/g, '-'); // simple id

      const cart = readCart();
      const existing = cart.find(i => i.id === id);
      if (existing) {
        existing.qty = (existing.qty || 1) + 1;
      } else {
        cart.push({ id, name, desc, img, qty: 1 });
      }
      saveCart(cart);
      updateCartCount();
      pulseCount();
    });
  });

  function pulseCount() {
    if (!cartCountEl) return;
    cartCountEl.style.transition = 'transform 150ms ease';
    cartCountEl.style.transform = 'scale(1.2)';
    setTimeout(() => (cartCountEl.style.transform = 'scale(1)'), 150);
  }

  /* ----------------- VIEW CART (retrieve + render) ----------------- */
  // Minimal modal created on the fly (uses retrieved sessionStorage data)
  const modal = buildCartModal();

  function openCartModal(e) {
    if (e) e.preventDefault();
    renderCartModal();
    modal.overlay.style.display = 'block';
    modal.close.focus();
    document.addEventListener('keydown', onEsc);
  }

  function closeCartModal() {
    modal.overlay.style.display = 'none';
    document.removeEventListener('keydown', onEsc);
  }

  function onEsc(ev) {
    if (ev.key === 'Escape') closeCartModal();
  }

  function renderCartModal() {
    const list = modal.list;
    list.innerHTML = '';
    const cart = readCart();

    if (cart.length === 0) {
      const li = document.createElement('li');
      li.textContent = 'Your cart is empty.';
      li.style.opacity = '0.8';
      list.appendChild(li);
      modal.count.textContent = '0';
      return;
    }

    cart.forEach(item => {
      const li = document.createElement('li');
      li.style.display = 'grid';
      li.style.gridTemplateColumns = item.img ? '48px 1fr auto' : '1fr auto';
      li.style.gap = '12px';
      li.style.alignItems = 'center';

      if (item.img) {
        const img = document.createElement('img');
        img.src = item.img;
        img.alt = item.name;
        img.style.width = '48px';
        img.style.height = '48px';
        img.style.objectFit = 'cover';
        img.style.border = '1px solid #e5e7eb';
        img.style.borderRadius = '8px';
        li.appendChild(img);
      }

      const text = document.createElement('div');
      const title = document.createElement('div');
      title.textContent = item.name;
      title.style.fontWeight = '600';
      const sub = document.createElement('div');
      sub.textContent = item.desc || '';
      sub.style.opacity = '0.75';
      sub.style.fontSize = '0.9rem';
      text.appendChild(title);
      if (item.desc) text.appendChild(sub);
      li.appendChild(text);

      const qty = document.createElement('div');
      qty.textContent = `×${item.qty || 1}`;
      qty.style.fontWeight = '700';
      li.appendChild(qty);

      list.appendChild(li);
    });

    modal.count.textContent = String(cartCount());
  }

  // Wire the "View Cart" <a>
  if (viewCartEl) viewCartEl.addEventListener('click', openCartModal);

  // Modal button handlers that operate on sessionStorage
  modal.clear.addEventListener('click', () => {
    clearCart();     // <-- clears sessionStorage
    renderCartModal();
  });

  modal.process.addEventListener('click', () => {
    const cart = readCart();
    if (cart.length === 0) {
      alert('Your cart is empty.');
      return;
    }
    // Demo: summarize order, then clear storage
    const summary = cart.map(i => `${i.name} ×${i.qty || 1}`).join('\n');
    alert(`Order placed:\n\n${summary}`);
    clearCart();     // <-- clears sessionStorage
    closeCartModal();
  });

  modal.close.addEventListener('click', closeCartModal);
  modal.overlay.addEventListener('click', (e) => {
    if (e.target === modal.overlay) closeCartModal();
  });

  // Initialize count on page load from sessionStorage
  updateCartCount();

  /* ----------------- Modal builder (styling included) ----------------- */
  function buildCartModal() {
    // Inject tiny CSS so no external file is required
    const style = document.createElement('style');
    style.textContent = `
      .cart-ov { position: fixed; inset: 0; background: rgba(0,0,0,.45); display:none; z-index: 1000; }
      .cart-dl { position:absolute; left:50%; top:50%; transform:translate(-50%,-50%);
                 width:min(92vw,560px); background:#fff; color:#111827; border-radius:14px;
                 box-shadow:0 20px 50px rgba(0,0,0,.2); overflow:hidden; font-family:system-ui, -apple-system, Segoe UI, Roboto, Inter, Arial, sans-serif; }
      .cart-hd { display:flex; align-items:center; justify-content:space-between; padding:14px 16px; border-bottom:1px solid #e5e7eb; background:#f9fafb; }
      .cart-tt { font-weight:700; }
      .cart-x  { border:none; background:transparent; font-size:20px; line-height:1; cursor:pointer; padding:6px; border-radius:8px; }
      .cart-x:hover { background:#f3f4f6; }
      .cart-bd { padding:14px 16px; max-height:50vh; overflow:auto; }
      .cart-bd ul { list-style:none; margin:0; padding:0; display:grid; gap:12px; }
      .cart-ft { display:flex; align-items:center; justify-content:space-between; gap:12px; padding:12px 16px; border-top:1px solid #e5e7eb; background:#fafafa; flex-wrap:wrap; }
      .cart-ac { display:flex; gap:8px; }
      .cart-btn { border:1px solid #e5e7eb; background:#111827; color:#fff; padding:10px 14px; border-radius:10px; cursor:pointer; font-weight:600; }
      .cart-btn.secondary { background:#fff; color:#111827; }
      .cart-btn:hover { filter:brightness(1.05); }
    `;
    document.head.appendChild(style);

    const overlay = document.createElement('div');
    overlay.className = 'cart-ov';

    const dialog = document.createElement('div');
    dialog.className = 'cart-dl';
    dialog.setAttribute('role', 'dialog');
    dialog.setAttribute('aria-modal', 'true');
    dialog.setAttribute('aria-labelledby', 'cartTitle');

    const header = document.createElement('div');
    header.className = 'cart-hd';

    const title = document.createElement('div');
    title.className = 'cart-tt';
    title.id = 'cartTitle';
    title.textContent = 'Your Cart';

    const close = document.createElement('button');
    close.className = 'cart-x';
    close.setAttribute('aria-label', 'Close cart');
    close.innerHTML = '&times;';

    header.appendChild(title);
    header.appendChild(close);

    const body = document.createElement('div');
    body.className = 'cart-bd';
    const list = document.createElement('ul');
    body.appendChild(list);

    const footer = document.createElement('div');
    footer.className = 'cart-ft';

    const left = document.createElement('div');
    left.innerHTML = `Items in cart: <strong class="cart-count">0</strong>`;
    const count = left.querySelector('.cart-count');

    const actions = document.createElement('div');
    actions.className = 'cart-ac';

    const clear = document.createElement('button');
    clear.className = 'cart-btn secondary';
    clear.textContent = 'Clear Cart';

    const process = document.createElement('button');
    process.className = 'cart-btn';
    process.textContent = 'Process Order';

    actions.appendChild(clear);
    actions.appendChild(process);
    footer.appendChild(left);
    footer.appendChild(actions);

    dialog.appendChild(header);
    dialog.appendChild(body);
    dialog.appendChild(footer);
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);

    return { overlay, dialog, list, close, clear, process, count };
  }
});

/* =========================================================
   Contact form:
   - Draft is saved in sessionStorage while typing
   - On submit, validated entry is appended to localStorage
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  const DRAFT_KEY = 'bh_contact_draft_v1';   // sessionStorage (in-tab draft)
  const STORE_KEY = 'bh_feedback_v1';        // localStorage (persistent records)

  const form = document.querySelector('.contact-form');
  if (!form) return;

  const fields = {
    name: form.querySelector('#name'),
    email: form.querySelector('#email'),
    topic: form.querySelector('#topic'),
    message: form.querySelector('#message'),
  };

  /* ---------------- Draft (sessionStorage) ---------------- */
  // Restore any existing draft
  try {
    const draft = JSON.parse(sessionStorage.getItem(DRAFT_KEY) || 'null');
    if (draft) {
      for (const k of Object.keys(fields)) {
        if (draft[k] && fields[k]) fields[k].value = draft[k];
      }
    }
  } catch { /* ignore */ }

  // Save draft on any input change
  form.addEventListener('input', () => {
    const draft = {
      name: fields.name?.value?.trim() || '',
      email: fields.email?.value?.trim() || '',
      topic: fields.topic?.value || '',
      message: fields.message?.value?.trim() || '',
    };
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  });

  /* ---------------- Helpers (localStorage) ---------------- */
  const loadAll = () => {
    try {
      return JSON.parse(localStorage.getItem(STORE_KEY) || '[]');
    } catch {
      return [];
    }
  };

  const saveAll = (arr) => {
    localStorage.setItem(STORE_KEY, JSON.stringify(arr));
  };

  /* ---------------- Submit -> localStorage ---------------- */
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const entry = {
      id: 'fb_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
      name: fields.name.value.trim(),
      email: fields.email.value.trim(),
      topic: fields.topic.value || '',
      message: fields.message.value.trim(),
      createdAt: new Date().toISOString(),
      source: 'about-contact',
    };

    // Basic validation (aligns with your requirement)
    if (!entry.name || !entry.email || !entry.message) {
      alert('Please enter your name, email, and feedback.');
      return;
    }
    if (!entry.topic) {
      alert('Please select a topic.');
      return;
    }

    // Append to localStorage
    const records = loadAll();
    records.push(entry);

    try {
      saveAll(records);
      // Clear draft + form
      sessionStorage.removeItem(DRAFT_KEY);
      form.reset();
      alert('Thank you for your message! Your entry was saved locally.');
    } catch (err) {
      console.error('Local save failed:', err);
      alert('Sorry—could not save your message locally.');
    }
  });

  /* ---------------- Optional: expose readers ----------------
     In console:
       window.bhListFeedback()   -> view saved entries from localStorage
       window.bhClearFeedback()  -> clear saved entries (CAUTION)
  ----------------------------------------------------------- */
  window.bhListFeedback = () => loadAll();
  window.bhClearFeedback = () => localStorage.removeItem(STORE_KEY);
});