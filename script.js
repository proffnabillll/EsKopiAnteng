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

function openModal(id) { 
    activeItem = products.find(p => p.id === id); 
    document.getElementById('m-name').innerText = activeItem.n; 
    currentQty = 1; 
    document.getElementById('m-qty').innerText = currentQty; 
    document.getElementById('modal-icehot').style.display = 'flex'; 
}

function closeModal() { document.getElementById('modal-icehot').style.display = 'none'; }
function updateQty(v) { currentQty = Math.max(1, currentQty + v); document.getElementById('m-qty').innerText = currentQty; }
function confirmAdd() { cart.push({ ...activeItem, type: selectedType, qty: currentQty }); closeModal(); updateCart(); }

function updateCart() {
    const listDesk = document.getElementById('cart-list-desktop');
    const listMob = document.getElementById('cart-list-mobile');
    const totalDisplays = document.querySelectorAll('.total-display');
    let total = 0;
    const cartHTML = cart.map((item, idx) => {
        total += item.qty * 8000;
        return `<div class="flex justify-between items-center border-b py-2 text-xs">
                    <span>${item.qty}x ${item.n} (${item.type})</span>
                    <button onclick="cart.splice(${idx},1); updateCart()" class="text-red-500 font-bold">X</button>
                </div>`;
    }).join('');
    listDesk.innerHTML = cartHTML || 'Kosong';
    listMob.innerHTML = cartHTML || 'Kosong';
    totalDisplays.forEach(el => el.innerText = `Rp ${total.toLocaleString()}`);
    document.getElementById('cart-count-mob').innerText = cart.length;
}

function openPay() { document.getElementById('modal-pay').style.display = 'flex'; }

function confirmSuccess(method) { 
    selectedMethod = method; 
    document.getElementById('modal-pay').style.display = 'none'; 
    document.getElementById('modal-success').style.display = 'flex'; 
}

// FUNGSI FINAL (PERBAIKAN STRUK KOSONG)
function finalize(withPrint) {
    if (withPrint) {
        const name = document.getElementById('customer-name-mob').value || document.getElementById('customer-name').value || "PELANGGAN";
        let totalFinal = 0;
        
        // ISI DATA STRUK SECARA REAL-TIME
        document.getElementById('p-customer').innerText = "PELANGGAN: " + name.toUpperCase();
        
        const itemsHTML = cart.map(i => { 
            const sub = i.qty * 8000; totalFinal += sub; 
            return `<div style="display:flex; justify-content:space-between"><span>${i.qty}x ${i.n}</span><span>${sub.toLocaleString()}</span></div>`; 
        }).join('');
        
        document.getElementById('p-items').innerHTML = itemsHTML;
        document.getElementById('p-total').innerHTML = `TOTAL: Rp ${totalFinal.toLocaleString()}`;
        document.getElementById('p-method').innerText = "Metode: " + selectedMethod + " | " + new Date().toLocaleString();

        // PAKSA MUNCULKAN STRUK
        document.getElementById('receipt-print').style.display = 'block';

        // TUNGGU 1 DETIK AGAR RENDER SELESAI BARU PRINT
        setTimeout(() => {
            window.print();
            location.reload();
        }, 1000);
    } else {
        location.reload();
    }
}

function filter(k) { render(k); }
function openMobileCart() { document.getElementById('modal-mobile-cart').style.display = 'flex'; }
function closeMobileCart() { document.getElementById('modal-mobile-cart').style.display = 'none'; }
function selectType(t) { selectedType = t; }

render();
