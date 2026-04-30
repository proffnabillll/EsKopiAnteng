const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

/* ── Loading Screen ── */
(function () {
    const messages = [
        "Menyeduh kopi...",
        "Memanaskan mesin...",
        "Menyiapkan es batu...",
        "Hampir siap...",
    ];
    let msgIdx = 0;
    const bar  = document.getElementById('loading-bar');
    const text = document.getElementById('loading-text');
    const screen = document.getElementById('loading-screen');

    // Simulasi progress
    let progress = 0;
    const interval = setInterval(() => {
        // Progress naik pelan-pelan, berhenti di 85 sampai semua gambar load
        const step = progress < 60 ? 4 : progress < 80 ? 1.5 : 0.5;
        progress = Math.min(progress + step, 85);
        bar.style.width = progress + '%';

        // Ganti pesan tiap 25%
        const newIdx = Math.floor(progress / 25);
        if (newIdx !== msgIdx && newIdx < messages.length) {
            msgIdx = newIdx;
            text.style.opacity = '0';
            setTimeout(() => {
                text.innerText = messages[msgIdx];
                text.style.transition = 'opacity 0.4s ease';
                text.style.opacity = '1';
            }, 300);
        }
    }, 80);

    // Tunggu semua gambar produk selesai load
    function allImagesLoaded() {
        const imgs = products.map(p => {
            return new Promise(resolve => {
                const img = new Image();
                img.onload = img.onerror = resolve;
                img.src = p.f;
            });
        });
        return Promise.all(imgs);
    }

    // Tunggu font & gambar, lalu tutup loading
    Promise.all([
        document.fonts.ready,
        new Promise(resolve => {
            // Pastikan products sudah terdefinisi
            const check = setInterval(() => {
                if (typeof products !== 'undefined') {
                    clearInterval(check);
                    allImagesLoaded().then(resolve);
                }
            }, 50);
        })
    ]).then(() => {
        clearInterval(interval);
        // Selesaikan progress ke 100%
        bar.style.transition = 'width 0.5s ease';
        bar.style.width = '100%';
        text.style.opacity = '0';
        setTimeout(() => {
            text.innerText = 'Siap!';
            text.style.opacity = '1';
        }, 200);
        // Fade out loading screen
        setTimeout(() => {
            screen.style.opacity = '0';
            setTimeout(() => { screen.style.display = 'none'; }, 520);
        }, 600);
    });
})();


async function playSound(t) {
    if (audioCtx.state === 'suspended') await audioCtx.resume();
    const o = audioCtx.createOscillator(); const g = audioCtx.createGain();
    o.connect(g); g.connect(audioCtx.destination);
    if(t==='click'){ o.frequency.setValueAtTime(400,0); g.gain.setValueAtTime(0.1,0); g.gain.exponentialRampToValueAtTime(0.01,0.1); o.start(); o.stop(0.1); }
    else if(t==='ding'){ o.frequency.setValueAtTime(600,0); g.gain.setValueAtTime(0.1,0); g.gain.exponentialRampToValueAtTime(0.01,0.2); o.start(); o.stop(0.2); }
    else if(t==='success'){ o.frequency.setValueAtTime(523,0); g.gain.setValueAtTime(0.1,0); g.gain.exponentialRampToValueAtTime(0.01,0.5); o.start(); o.stop(0.5); }
}

const products = [
    { id: 1,  n: 'Americano',       k: 'coffee',     f: 'images/Americano.jpg',  p: 8000 },
    { id: 2,  n: 'Avocado Coffee',  k: 'coffee',     f: 'images/Avocado.jpg',    p: 8000 },
    { id: 3,  n: 'Cappuccino',      k: 'coffee',     f: 'images/Cappucino.jpg',  p: 8000 },
    { id: 4,  n: 'Caramel Coffee',  k: 'coffee',     f: 'images/Caramel.jpg',    p: 8000 },
    { id: 5,  n: 'Chocomilo Coffee',k: 'coffee',     f: 'images/Chocomilo.jpg',  p: 8000 },
    { id: 6,  n: 'Coconut Coffee',  k: 'coffee',     f: 'images/Coconut.jpg',    p: 8000 },
    { id: 7,  n: 'Hazelnut Coffee', k: 'coffee',     f: 'images/Hazelnut.jpg',   p: 8000 },
    { id: 8,  n: 'Kopi Gula Aren',  k: 'coffee',     f: 'images/GulaAren.jpg',   p: 8000 },
    { id: 9,  n: 'Macchiato',       k: 'coffee',     f: 'images/Macchiato.jpg',  p: 8000 },
    { id: 10, n: 'Matcha',          k: 'non-coffee', f: 'images/Matcha.jpg',     p: 8000 },
    { id: 11, n: 'Strawberry',      k: 'non-coffee', f: 'images/Strawberry.jpg', p: 8000 },
    { id: 12, n: 'Taro Coffee',     k: 'coffee',     f: 'images/Taro.jpg',       p: 8000 },
    { id: 13, n: 'Vanilla Coffee',  k: 'coffee',     f: 'images/Vanilla.jpg',    p: 8000 }
];

let cart = [];
let activeItem = null;
let selectedType = "ICE";
let currentQty = 1;
let splitCount = 1;
let selectedMethod = "";
let pendingDeleteIndex = null;
let editingProductId = null;
let currentFilter = 'all';
let transactionHistory = JSON.parse(localStorage.getItem('pos_history') || '[]');

/* ── Smooth Modal Helpers ── */
function showModal(id) {
    const modal = document.getElementById(id);
    modal.style.display = 'flex';
    modal.style.opacity = '0';
    modal.style.transition = 'opacity 0.28s ease';
    const inner = modal.querySelector('[data-modal-inner]');
    if (inner) {
        inner.style.transform = 'scale(0.95) translateY(10px)';
        inner.style.transition = 'transform 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    }
    void modal.offsetWidth;
    modal.style.opacity = '1';
    if (inner) {
        setTimeout(() => { inner.style.transform = 'scale(1) translateY(0)'; }, 10);
    }
}

function hideModal(id) {
    const modal = document.getElementById(id);
    const inner = modal.querySelector('[data-modal-inner]');
    modal.style.opacity = '0';
    modal.style.transition = 'opacity 0.22s ease';
    if (inner) {
        inner.style.transform = 'scale(0.97) translateY(6px)';
        inner.style.transition = 'transform 0.22s ease';
    }
    setTimeout(() => {
        modal.style.display = 'none';
        modal.style.opacity = '';
        modal.style.transition = '';
        if (inner) { inner.style.transform = ''; inner.style.transition = ''; }
    }, 220);
}

function render(f = 'all') {
    currentFilter = f;
    const container = document.getElementById('grid-container');
    container.innerHTML = '';
    document.querySelectorAll('nav button').forEach(b => b.classList.remove('tab-on'));
    document.getElementById('t-' + f).classList.add('tab-on');

    const query = (document.getElementById('search-input')?.value || '').toLowerCase().trim();
    let list = f === 'all' ? products : products.filter(p => p.k === f);
    if (query) list = list.filter(p => p.n.toLowerCase().includes(query));

    if (list.length === 0) {
        container.innerHTML = `<div class="col-span-2 md:col-span-3 xl:col-span-4 text-center py-16 text-gray-400 text-sm italic">Menu tidak ditemukan</div>`;
        return;
    }

    list.forEach((p, idx) => {
        container.innerHTML += `
            <div class="bg-white p-3 rounded-2xl border-2 border-[#3d1c02] shadow-sm flex flex-col animate-pop relative" style="animation-delay: ${idx * 0.06}s; opacity:0; animation-fill-mode: forwards;">
                <div class="photo-box cursor-pointer" onclick="openModal(${p.id})">
                    <img src="${p.f}">
                </div>
                <h3 class="font-bold text-xs mt-2 uppercase truncate text-center">${p.n}</h3>
                <div class="flex justify-between items-center mt-auto pt-2 min-h-[40px]">
                    <span class="text-amber-700 font-black text-sm text-left">Rp ${(p.p||8000).toLocaleString('id-ID')}</span>
                    <button onclick="playSound('click'); openModal(${p.id})" class="bg-[#3d1c02] text-white w-9 h-9 rounded-xl font-bold btn-bounce text-xl">+</button>
                </div>
            </div>`;
    });
}

function searchMenu() {
    render(currentFilter);
}

function openModal(id) {
    activeItem = products.find(p => p.id === id);
    document.getElementById('m-name').innerText = activeItem.n;
    currentQty = 1; document.getElementById('m-qty').innerText = currentQty;
    selectedType = "ICE";
    document.getElementById('btn-ice').style.borderColor = '#3d1c02';
    document.getElementById('btn-hot').style.borderColor = 'transparent';
    document.getElementById('m-notes').value = '';
    showModal('modal-icehot');
}

function closeModal() { hideModal('modal-icehot'); }

function selectType(t) {
    playSound('click'); selectedType = t;
    document.getElementById('btn-ice').style.borderColor = t === 'ICE' ? '#3d1c02' : 'transparent';
    document.getElementById('btn-hot').style.borderColor = t === 'HOT' ? '#3d1c02' : 'transparent';
}

function updateQty(v) {
    playSound('click');
    currentQty = Math.max(1, currentQty + v);
    const el = document.getElementById('m-qty');
    el.style.transition = 'transform 0.15s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.1s ease';
    el.style.transform = v > 0 ? 'translateY(-5px)' : 'translateY(5px)';
    el.style.opacity = '0';
    setTimeout(() => {
        el.innerText = currentQty;
        el.style.transform = 'translateY(0)';
        el.style.opacity = '1';
    }, 120);
}

function confirmAdd() {
    playSound('ding');
    const notes = document.getElementById('m-notes').value.trim();
    cart.push({ ...activeItem, type: selectedType, qty: currentQty, notes });
    closeModal();
    updateCart();
}

function openMobileCart() { showModal('modal-mobile-cart'); }
function closeMobileCart() { hideModal('modal-mobile-cart'); }

function updateCart() {
    const listDesk = document.getElementById('cart-list-desktop');
    const listMob  = document.getElementById('cart-list-mobile');
    const totalDisplays = document.querySelectorAll('.total-display');
    let total = 0;

    const cartHTML = cart.map((item, index) => {
        const price = item.p || 8000;
        total += item.qty * price;
        return `<div class="cart-item-anim bg-white p-2 border border-[#3d1c02] rounded-xl text-xs flex justify-between items-center" style="animation-delay:${index * 0.05}s; opacity:0; animation-fill-mode:forwards;">
            <div class="flex items-center gap-3 flex-1 min-w-0">
                <img src="${item.f}" class="w-10 h-10 object-cover rounded-lg border flex-shrink-0">
                <div class="min-w-0">
                    <b class="uppercase block truncate">${item.qty}x ${item.n}</b>
                    <span class="uppercase text-[9px] text-gray-400">${item.type}</span>
                    ${item.notes ? `<span class="block text-[9px] text-amber-700 italic truncate">📝 ${item.notes}</span>` : ''}
                </div>
            </div>
            <button onclick="askDeleteCartItem(${index})" class="text-red-400 hover:text-red-600 font-bold text-xl ml-2 flex-shrink-0 transition-colors duration-200">&times;</button>
        </div>`;
    }).join('');

    listDesk.innerHTML = cart.length ? cartHTML : '<p class="text-center text-gray-400 mt-10 text-xs italic">Kosong</p>';
    listMob.innerHTML  = cart.length ? cartHTML : '<p class="text-center text-gray-400 py-10 italic text-xs">Kosong</p>';

    totalDisplays.forEach(el => {
        el.style.transition = 'transform 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        el.style.transform = 'scale(1.1)';
        el.innerText = `Rp ${total.toLocaleString('id-ID')}`;
        setTimeout(() => { el.style.transform = 'scale(1)'; }, 200);
    });

    document.getElementById('cart-count-mob').innerText = cart.length;
}

function askDeleteCartItem(index) {
    pendingDeleteIndex = index;
    const item = cart[index];
    document.getElementById('confirm-delete-name').innerText = `${item.qty}x ${item.n} (${item.type})`;
    showModal('modal-confirm-delete');
}

function doDeleteCartItem() {
    if (pendingDeleteIndex !== null) {
        cart.splice(pendingDeleteIndex, 1);
        pendingDeleteIndex = null;
        updateCart();
    }
    hideModal('modal-confirm-delete');
}

function removeCartItem(index) {
    cart.splice(index, 1);
    updateCart();
}

function openPay() {
    const isMobile = window.innerWidth <= 768;
    const nameInput = isMobile ? document.getElementById('customer-name-mob') : document.getElementById('customer-name');
    if (cart.length === 0) return alert("Keranjang kosong!");
    if (!nameInput.value.trim()) return alert("Isi nama pelanggan!");
    document.getElementById('enable-split').checked = false;
    document.getElementById('split-section').style.display = 'none';
    splitCount = 1; updateSplit(0);
    showModal('modal-pay');
}

function toggleSplit() {
    const isEnabled = document.getElementById('enable-split').checked;
    const section = document.getElementById('split-section');
    if (isEnabled) {
        section.style.display = 'block';
        section.style.opacity = '0';
        section.style.transform = 'translateY(-8px)';
        section.style.transition = 'opacity 0.28s ease, transform 0.28s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        setTimeout(() => { section.style.opacity = '1'; section.style.transform = 'translateY(0)'; }, 10);
    } else {
        section.style.opacity = '0';
        section.style.transform = 'translateY(-8px)';
        section.style.transition = 'opacity 0.22s ease, transform 0.22s ease';
        setTimeout(() => { section.style.display = 'none'; }, 230);
        splitCount = 1; updateSplit(0);
    }
}

function updateSplit(v) {
    splitCount = Math.max(1, splitCount + v);
    document.getElementById('split-count').innerText = splitCount;
    const total = cart.reduce((a, b) => a + (b.qty * 8000), 0);
    if (splitCount > 1) {
        const perPerson = Math.ceil(total / splitCount);
        document.getElementById('split-info').innerText = `@ Rp ${perPerson.toLocaleString()} / Orang`;
    } else {
        document.getElementById('split-info').innerText = "";
    }
}

function handleQRIS() {
    hideModal('modal-pay');
    setTimeout(() => showModal('modal-qris'), 240);
}

function confirmSuccess(method) {
    playSound('success'); selectedMethod = method;
    hideModal('modal-pay');
    hideModal('modal-qris');
    setTimeout(() => showModal('modal-success'), 240);
}

function finalize(withPrint) {
    const isMobile = window.innerWidth <= 768;
    const name = isMobile ? document.getElementById('customer-name-mob').value : document.getElementById('customer-name').value;
    let totalFinal = cart.reduce((a, b) => a + (b.qty * (b.p || 8000)), 0);

    // Simpan ke riwayat
    const tx = {
        id: Date.now(),
        time: new Date().toISOString(),
        customer: name.trim() || 'Umum',
        items: cart.map(i => ({ ...i })),
        total: totalFinal,
        method: selectedMethod,
        splitCount
    };
    transactionHistory.unshift(tx);
    localStorage.setItem('pos_history', JSON.stringify(transactionHistory));

    if (withPrint) {
        const now = new Date();
        const orderNo = String(now.getHours()).padStart(2,'0') + String(now.getMinutes()).padStart(2,'0') + String(now.getSeconds()).padStart(2,'0');
        const dateStr = now.toLocaleDateString('id-ID', { day:'2-digit', month:'2-digit', year:'numeric' });
        const timeStr = now.toLocaleTimeString('id-ID', { hour:'2-digit', minute:'2-digit', second:'2-digit' });

        // Info order
        document.getElementById('p-order-info').innerHTML = `
            <div class="rcp-meta-row"><span>No. Order</span><span>#${orderNo}</span></div>
            <div class="rcp-meta-row"><span>Tanggal</span><span>${dateStr}</span></div>
            <div class="rcp-meta-row"><span>Waktu</span><span>${timeStr}</span></div>
        `;

        // Nama pelanggan
        document.getElementById('p-customer').innerText = 'Pelanggan: ' + (name.trim() || 'Umum').toUpperCase();

        // Items
        const itemsHTML = cart.map(i => {
            const price = i.p || 8000;
            const sub = i.qty * price;
            return `<div class="rcp-item">
                <div class="rcp-item-name">${i.n}</div>
                <div class="rcp-item-type">${i.type}${i.notes ? '' : ''}</div>
                ${i.notes ? `<div class="rcp-item-notes">Catatan: ${i.notes}</div>` : ''}
                <div class="rcp-item-price">
                    <span>${i.qty} x Rp ${price.toLocaleString('id-ID')}</span>
                    <span>Rp ${sub.toLocaleString('id-ID')}</span>
                </div>
            </div>`;
        }).join('');
        document.getElementById('p-items').innerHTML = itemsHTML;

        // Total
        document.getElementById('p-total').innerHTML = `
            <div class="rcp-total-row">
                <span>TOTAL</span>
                <span>Rp ${totalFinal.toLocaleString('id-ID')}</span>
            </div>
        `;

        // Split bill
        if (splitCount > 1) {
            document.getElementById('p-split').innerHTML =
                `Split Bill ${splitCount} orang @ Rp ${Math.ceil(totalFinal / splitCount).toLocaleString('id-ID')}/orang`;
        } else {
            document.getElementById('p-split').innerHTML = '';
        }

        // Metode bayar
        document.getElementById('p-method').innerHTML = `Bayar: <b>${selectedMethod}</b>`;

        setTimeout(() => { window.print(); location.reload(); }, 100);
    } else {
        location.reload();
    }
}

function toggleAside() {
    const aside = document.getElementById('desktop-aside');
    const isMinimized = aside.classList.contains('aside-minimized');
    if (isMinimized) {
        aside.classList.remove('aside-minimized');
        aside.classList.add('aside-expanded');
    } else {
        aside.classList.remove('aside-expanded');
        aside.classList.add('aside-minimized');
    }
}

/* ── Riwayat Transaksi ── */
function openHistory() {
    const today = new Date().toLocaleDateString('id-ID', { weekday:'long', year:'numeric', month:'long', day:'numeric' });
    document.getElementById('history-date').innerText = today;

    const todayStr = new Date().toDateString();
    const todayTx = transactionHistory.filter(tx => new Date(tx.time).toDateString() === todayStr);

    const grandTotal = todayTx.reduce((a, b) => a + b.total, 0);
    document.getElementById('history-grand-total').innerText = `Rp ${grandTotal.toLocaleString('id-ID')}`;

    const list = document.getElementById('history-list');
    if (todayTx.length === 0) {
        list.innerHTML = '<p class="text-center text-gray-400 py-10 text-sm italic">Belum ada transaksi hari ini</p>';
    } else {
        list.innerHTML = todayTx.map(tx => {
            const time = new Date(tx.time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
            const itemsText = tx.items.map(i => `${i.qty}x ${i.n} (${i.type})`).join(', ');
            return `<div class="bg-white p-3 rounded-2xl border border-stone-200 text-xs">
                <div class="flex justify-between items-start mb-1">
                    <div>
                        <b class="uppercase text-[#3d1c02]">${tx.customer}</b>
                        <span class="ml-2 text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${tx.method === 'QRIS' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'}">${tx.method}</span>
                    </div>
                    <span class="text-gray-400 font-medium">${time}</span>
                </div>
                <p class="text-gray-500 truncate mb-1">${itemsText}</p>
                <p class="font-black text-[#3d1c02]">Rp ${tx.total.toLocaleString('id-ID')}</p>
            </div>`;
        }).join('');
    }
    showModal('modal-history');
}

function clearHistory() {
    if (!confirm('Hapus semua riwayat transaksi?')) return;
    transactionHistory = [];
    localStorage.removeItem('pos_history');
    hideModal('modal-history');
}

/* ── Manajemen Produk ── */
function openManage() {
    renderManageList();
    resetManageForm();
    showModal('modal-manage');
}

function renderManageList() {
    const list = document.getElementById('manage-list');
    list.innerHTML = products.map(p => `
        <div class="bg-white p-3 rounded-2xl border border-stone-200 flex items-center gap-3 text-xs">
            <img src="${p.f}" class="w-10 h-10 object-cover rounded-lg border flex-shrink-0" onerror="this.style.background='#eee'">
            <div class="flex-1 min-w-0">
                <b class="uppercase block truncate">${p.n}</b>
                <span class="text-gray-400 uppercase text-[9px]">${p.k} · Rp ${(p.p||8000).toLocaleString('id-ID')}</span>
            </div>
            <div class="flex gap-1 flex-shrink-0">
                <button onclick="editProduct(${p.id})" class="px-3 py-1.5 rounded-lg border-2 border-[#3d1c02] text-[#3d1c02] font-bold btn-bounce">✏️</button>
                <button onclick="deleteProduct(${p.id})" class="px-3 py-1.5 rounded-lg border-2 border-red-300 text-red-500 font-bold btn-bounce">🗑️</button>
            </div>
        </div>
    `).join('');
}

function editProduct(id) {
    const p = products.find(x => x.id === id);
    if (!p) return;
    editingProductId = id;
    document.getElementById('manage-name').value = p.n;
    document.getElementById('manage-cat').value = p.k;
    document.getElementById('manage-price').value = p.p || 8000;
    document.getElementById('manage-img').value = p.f;
    document.getElementById('manage-form-title').innerText = 'Edit Menu';
}

function deleteProduct(id) {
    if (!confirm('Hapus menu ini?')) return;
    const idx = products.findIndex(p => p.id === id);
    if (idx > -1) products.splice(idx, 1);
    renderManageList();
    render(currentFilter);
}

function saveManageProduct() {
    const name = document.getElementById('manage-name').value.trim();
    const cat  = document.getElementById('manage-cat').value;
    const price = parseInt(document.getElementById('manage-price').value) || 8000;
    const img  = document.getElementById('manage-img').value.trim();
    if (!name) return alert('Nama menu wajib diisi!');

    if (editingProductId !== null) {
        const p = products.find(x => x.id === editingProductId);
        if (p) { p.n = name; p.k = cat; p.p = price; if (img) p.f = img; }
    } else {
        const newId = Math.max(...products.map(p => p.id), 0) + 1;
        products.push({ id: newId, n: name, k: cat, f: img || 'images/default.jpg', p: price });
    }
    resetManageForm();
    renderManageList();
    render(currentFilter);
}

function resetManageForm() {
    editingProductId = null;
    document.getElementById('manage-name').value = '';
    document.getElementById('manage-price').value = '';
    document.getElementById('manage-img').value = '';
    document.getElementById('manage-cat').value = 'coffee';
    document.getElementById('manage-form-title').innerText = 'Tambah Menu Baru';
}

function filter(k) { render(k); }

render();
