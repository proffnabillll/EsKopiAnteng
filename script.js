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
    { id: 1, n: 'Americano', k: 'coffee', f: 'images/Americano.jpg' },
    { id: 2, n: 'Cappuccino', k: 'coffee', f: 'images/Cappucino.jpg' },
    { id: 3, n: 'Macchiato', k: 'coffee', f: 'images/Macchiato.jpg' },
    { id: 4, n: 'Hazelnut Coffee', k: 'coffee', f: 'images/Hazelnut.jpg' },
    { id: 5, n: 'Taro Coffee', k: 'coffee', f: 'images/Taro.jpg' },
    { id: 6, n: 'Avocado Coffee', k: 'coffee', f: 'images/Avocado.jpg' },
    { id: 7, n: 'Chocomilo Coffee', k: 'coffee', f: 'images/Chocomilo.jpg' },
    { id: 8, n: 'Matcha', k: 'non-coffee', f: 'images/Matcha.jpg' },
    { id: 9,  n: 'Vanilla Coffee',    k: 'coffee',     f: 'images/Vanilla.jpg' },
    { id: 10, n: 'Strawberry',        k: 'non-coffee', f: 'images/Strawberry.jpg' },
    { id: 11, n: 'Caramel Coffee',    k: 'coffee',     f: 'images/Caramel.jpg' },
    { id: 12, n: 'Kopi Gula Aren',    k: 'coffee',     f: 'images/GulaAren.jpg' },
    { id: 13, n: 'Coconut Coffee',    k: 'coffee',     f: 'images/Coconut.jpg' }
];

let cart = [];
let activeItem = null;
let selectedType = "ICE";
let currentQty = 1;
let splitCount = 1;
let selectedMethod = "";

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
    const container = document.getElementById('grid-container');
    container.innerHTML = '';
    document.querySelectorAll('nav button').forEach(b => b.classList.remove('tab-on'));
    document.getElementById('t-' + f).classList.add('tab-on');

    const list = f === 'all' ? products : products.filter(p => p.k === f);
    list.forEach((p, idx) => {
        container.innerHTML += `
            <div class="bg-white p-3 rounded-2xl border-2 border-[#3d1c02] shadow-sm flex flex-col animate-pop relative" style="animation-delay: ${idx * 0.06}s; opacity:0; animation-fill-mode: forwards;">
                <div class="photo-box cursor-pointer" onclick="openModal(${p.id})">
                    <img src="${p.f}">
                </div>
                <h3 class="font-bold text-xs mt-2 uppercase truncate text-center">${p.n}</h3>
                <div class="flex justify-between items-center mt-auto pt-2 min-h-[40px]">
                    <span class="text-amber-700 font-black text-sm text-left">Rp. 8000</span>
                    <button onclick="playSound('click'); openModal(${p.id})" class="bg-[#3d1c02] text-white w-9 h-9 rounded-xl font-bold btn-bounce text-xl">+</button>
                </div>
            </div>`;
    });
}

function openModal(id) {
    activeItem = products.find(p => p.id === id);
    document.getElementById('m-name').innerText = activeItem.n;
    currentQty = 1; document.getElementById('m-qty').innerText = currentQty;
    selectedType = "ICE";
    document.getElementById('btn-ice').style.borderColor = '#3d1c02';
    document.getElementById('btn-hot').style.borderColor = 'transparent';
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

function confirmAdd() { playSound('ding'); cart.push({ ...activeItem, type: selectedType, qty: currentQty }); closeModal(); updateCart(); }

function openMobileCart() { showModal('modal-mobile-cart'); }
function closeMobileCart() { hideModal('modal-mobile-cart'); }

function updateCart() {
    const listDesk = document.getElementById('cart-list-desktop');
    const listMob  = document.getElementById('cart-list-mobile');
    const totalDisplays = document.querySelectorAll('.total-display');
    let total = 0;

    const cartHTML = cart.map((item, index) => {
        total += item.qty * 8000;
        return `<div class="cart-item-anim bg-white p-2 border border-[#3d1c02] rounded-xl text-xs flex justify-between items-center" style="animation-delay:${index * 0.05}s; opacity:0; animation-fill-mode:forwards;">
            <div class="flex items-center gap-3">
                <img src="${item.f}" class="w-10 h-10 object-cover rounded-lg border">
                <div><b class="uppercase">${item.qty}x ${item.n}</b><br><span class="uppercase text-[9px]">${item.type}</span></div>
            </div>
            <button onclick="removeCartItem(${index})" class="text-red-400 hover:text-red-600 font-bold text-xl ml-2 transition-colors duration-200">&times;</button>
        </div>`;
    }).join('');

    listDesk.innerHTML = cart.length ? cartHTML : '<p class="text-center text-gray-400 mt-10 text-xs italic">Kosong</p>';
    listMob.innerHTML  = cart.length ? cartHTML : '<p class="text-center text-gray-400 py-10 italic text-xs">Kosong</p>';

    // Animasi total
    totalDisplays.forEach(el => {
        el.style.transition = 'transform 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        el.style.transform = 'scale(1.1)';
        el.innerText = `Rp ${total.toLocaleString('id-ID')}`;
        setTimeout(() => { el.style.transform = 'scale(1)'; }, 200);
    });

    document.getElementById('cart-count-mob').innerText = cart.length;
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
    if (withPrint) {
        const isMobile = window.innerWidth <= 768;
        const name = isMobile ? document.getElementById('customer-name-mob').value : document.getElementById('customer-name').value;
        let totalFinal = 0;

        document.getElementById('p-customer').innerText = "PELANGGAN: " + name.toUpperCase();
        const itemsHTML = cart.map(i => {
            const sub = i.qty * 8000; totalFinal += sub;
            return `<div style="display:flex; justify-content:space-between"><span>${i.qty}x ${i.n} (${i.type})</span><span>${sub.toLocaleString()}</span></div>`;
        }).join('');
        document.getElementById('p-items').innerHTML = itemsHTML;
        document.getElementById('p-total').innerHTML = `<div style="display:flex; justify-content:space-between"><span>TOTAL</span><span>Rp ${totalFinal.toLocaleString()}</span></div>`;
        if (splitCount > 1) {
            document.getElementById('p-split').innerHTML = `SPLIT BILL (${splitCount} Orang):<br>@ Rp ${Math.ceil(totalFinal / splitCount).toLocaleString()} / Orang`;
        } else {
            document.getElementById('p-split').innerHTML = "";
        }
        const now = new Date();
        document.getElementById('p-method').innerText = "Metode: " + selectedMethod + " | " + now.toLocaleDateString('id-ID') + " " + now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
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

function filter(k) { render(k); }

render();
