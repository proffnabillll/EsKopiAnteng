const products = [
    { id: 1, n: 'Americano', k: 'coffee', f: 'images/Americano.jpg' },
    { id: 2, n: 'Cappuccino', k: 'coffee', f: 'images/Cappucino.jpg' },
    { id: 3, n: 'Macchiato', k: 'coffee', f: 'images/Macchiato.jpg' },
    { id: 4, n: 'Hazelnut Coffee', k: 'coffee', f: 'images/Hazelnut.jpg' },
    { id: 5, n: 'Taro Coffee', k: 'coffee', f: 'images/Taro.jpg' },
    { id: 6, n: 'Avocado Coffee', k: 'coffee', f: 'images/Avocado.jpg' },
    { id: 7, n: 'Chocomilo Coffee', k: 'coffee', f: 'images/Chocomilo.jpg' },
    { id: 8, n: 'Matcha', k: 'non-coffee', f: 'images/Matcha.jpg' }
];

let cart = [];
let activeItem = null;
let selectedType = "ICE";
let currentQty = 1;
let selectedMethod = "";

function render(f = 'all') {
    const container = document.getElementById('grid-container');
    container.innerHTML = '';
    document.querySelectorAll('nav button').forEach(b => b.classList.remove('tab-on'));
    document.getElementById('t-' + f).classList.add('tab-on');
    const list = f === 'all' ? products : products.filter(p => p.k === f);
    list.forEach(p => {
        container.innerHTML += `
            <div class="bg-white p-3 rounded-2xl border-2 border-[#3d1c02] flex flex-col relative">
                <div class="photo-box cursor-pointer" onclick="openModal(${p.id})"><img src="${p.f}"></div>
                <h3 class="font-bold text-xs mt-2 uppercase text-center">${p.n}</h3>
                <div class="flex justify-between items-center mt-2">
                    <span class="text-amber-700 font-black text-sm">8K</span>
                    <button onclick="openModal(${p.id})" class="bg-[#3d1c02] text-white w-8 h-8 rounded-lg font-bold">+</button>
                </div>
            </div>`;
    });
}

function updateCart() {
    const listDesk = document.getElementById('cart-list-desktop');
    const listMob = document.getElementById('cart-list-mobile');
    const totalDisplays = document.querySelectorAll('.total-display');
    let total = 0;
    
    // Versi Keranjang dengan Foto Produk
    const html = cart.map((i, idx) => {
        total += i.qty * 8000;
        return `
        <div class="flex items-center gap-3 bg-white p-2 border rounded-xl shadow-sm text-xs">
            <img src="${i.f}" class="w-10 h-10 rounded-lg object-cover border">
            <div class="flex-1">
                <b class="uppercase">${i.qty}x ${i.n}</b><br>
                <small class="text-gray-400">${i.type}</small>
            </div>
            <button onclick="cart.splice(${idx},1);updateCart()" class="text-red-500 font-bold px-2">X</button>
        </div>`;
    }).join('');

    listDesk.innerHTML = html || '<p class="text-center text-gray-400 mt-5 italic">Kosong</p>';
    listMob.innerHTML = html || '<p class="text-center text-gray-400 mt-5 italic">Kosong</p>';
    totalDisplays.forEach(el => el.innerText = `Rp ${total.toLocaleString('id-ID')}`);
    document.getElementById('cart-count-mob').innerText = cart.length;
}

function finalize(withPrint) {
    if(withPrint) {
        const nameInput = document.getElementById('customer-name-mob').value || document.getElementById('customer-name').value;
        const name = nameInput || "PELANGGAN";
        let totalFinal = 0;

        // ISI DATA STRUK SECARA PAKSA SEBELUM PRINT
        document.getElementById('p-customer').innerText = "PELANGGAN: " + name.toUpperCase();
        
        const itemsHTML = cart.map(i => {
            const sub = i.qty * 8000;
            totalFinal += sub;
            return `<div style="display:flex; justify-content:space-between"><span>${i.qty}x ${i.n} (${i.type})</span><span>${sub.toLocaleString()}</span></div>`;
        }).join('');

        document.getElementById('p-items').innerHTML = itemsHTML;
        document.getElementById('p-total').innerHTML = `<div style="display:flex; justify-content:space-between"><span>TOTAL</span><span>Rp ${totalFinal.toLocaleString()}</span></div>`;
        document.getElementById('p-method').innerText = "Metode: " + selectedMethod + " | " + new Date().toLocaleString('id-ID');

        // TAMPILKAN AREA STRUK
        const receipt = document.getElementById('receipt-print');
        receipt.style.display = 'block';

        // Jeda untuk render, print, lalu reload
        setTimeout(() => {
            window.print();
            location.reload();
        }, 800);
    } else {
        location.reload();
    }
}

// Fungsi pendukung lainnya (tetap sama)
function openModal(id) { activeItem = products.find(p => p.id === id); document.getElementById('m-name').innerText = activeItem.n; currentQty = 1; document.getElementById('m-qty').innerText = currentQty; document.getElementById('modal-icehot').style.display = 'flex'; }
function closeModal() { document.getElementById('modal-icehot').style.display = 'none'; }
function updateQty(v) { currentQty = Math.max(1, currentQty + v); document.getElementById('m-qty').innerText = currentQty; }
function selectType(t) { selectedType = t; }
function confirmAdd() { cart.push({ ...activeItem, type: selectedType, qty: currentQty }); closeModal(); updateCart(); }
function openPay() { document.getElementById('modal-pay').style.display = 'flex'; }
function handleQRIS() { document.getElementById('modal-pay').style.display = 'none'; document.getElementById('modal-qris').style.display = 'flex'; }
function confirmSuccess(m) { selectedMethod = m; document.getElementById('modal-pay').style.display = 'none'; document.getElementById('modal-qris').style.display = 'none'; document.getElementById('modal-success').style.display = 'flex'; }
function openMobileCart() { document.getElementById('modal-mobile-cart').style.display = 'flex'; }
function closeMobileCart() { document.getElementById('modal-mobile-cart').style.display = 'none'; }
function filter(k) { render(k); }

render();
