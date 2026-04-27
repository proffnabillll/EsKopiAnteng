const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

async function playSound(t) {
    if (audioCtx.state === 'suspended') await audioCtx.resume();
    const o = audioCtx.createOscillator(); const g = audioCtx.createGain();
    o.connect(g); g.connect(audioCtx.destination);
    if(t==='click'){ 
        o.frequency.setValueAtTime(400, audioCtx.currentTime); 
        g.gain.setValueAtTime(0.1, audioCtx.currentTime); 
        g.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1); 
        o.start(); o.stop(audioCtx.currentTime + 0.1); 
    }
    else if(t==='ding'){ 
        o.frequency.setValueAtTime(600, audioCtx.currentTime); 
        g.gain.setValueAtTime(0.1, audioCtx.currentTime); 
        g.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2); 
        o.start(); o.stop(audioCtx.currentTime + 0.2); 
    }
    else if(t==='success'){ 
        o.frequency.setValueAtTime(523, audioCtx.currentTime); 
        g.gain.setValueAtTime(0.1, audioCtx.currentTime); 
        g.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5); 
        o.start(); o.stop(audioCtx.currentTime + 0.5); 
    }
}

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
    if(!container) return;
    container.innerHTML = '';
    document.querySelectorAll('nav button').forEach(b => b.classList.remove('tab-on'));
    const activeBtn = document.getElementById('t-' + f);
    if(activeBtn) activeBtn.classList.add('tab-on');

    const list = f === 'all' ? products : products.filter(p => p.k === f);
    list.forEach((p, idx) => {
        container.innerHTML += `
            <div class="bg-white p-3 rounded-2xl border-2 border-[#3d1c02] shadow-sm flex flex-col animate-pop relative" style="animation-delay: ${idx*0.05}s">
                <div class="photo-box cursor-pointer" onclick="openModal(${p.id})">
                    <img src="${p.f}">
                </div>
                <h3 class="font-bold text-xs mt-2 uppercase truncate text-center">${p.n}</h3>
                <div class="flex justify-between items-center mt-auto pt-2 min-h-[40px]">
                    <span class="text-amber-700 font-black text-sm text-left">8K</span>
                    <button onclick="playSound('click'); openModal(${p.id})" class="bg-[#3d1c02] text-white w-9 h-9 rounded-xl font-bold btn-bounce text-xl">+</button>
                </div>
            </div>`;
    });
}

function openModal(id) { 
    activeItem = products.find(p => p.id === id); 
    document.getElementById('m-name').innerText = activeItem.n; 
    currentQty = 1; 
    document.getElementById('m-qty').innerText = currentQty; 
    selectedType = "ICE";
    document.getElementById('modal-icehot').style.display = 'flex'; 
}

function closeModal() { document.getElementById('modal-icehot').style.display = 'none'; }
function selectType(t) { playSound('click'); selectedType = t; }
function updateQty(v) { playSound('click'); currentQty = Math.max(1, currentQty + v); document.getElementById('m-qty').innerText = currentQty; }

function confirmAdd() { 
    playSound('ding'); 
    cart.push({ ...activeItem, type: selectedType, qty: currentQty }); 
    closeModal(); 
    updateCart(); 
}

function updateCart() {
    const listDesk = document.getElementById('cart-list-desktop');
    const listMob = document.getElementById('cart-list-mobile');
    const totalDisplays = document.querySelectorAll('.total-display');
    const cartCountMob = document.getElementById('cart-count-mob');
    
    let total = 0;
    let itemCount = 0;

    const html = cart.map((i, idx) => {
        total += i.qty * 8000;
        itemCount += i.qty; // Menghitung total seluruh qty item
        return `
        <div class="flex items-center gap-3 bg-white p-2 border rounded-xl shadow-sm text-xs mb-2">
            <img src="${i.f}" class="w-10 h-10 rounded-lg object-cover border">
            <div class="flex-1">
                <b class="uppercase">${i.qty}x ${i.n}</b><br>
                <small class="text-gray-400">${i.type}</small>
            </div>
            <button onclick="cart.splice(${idx},1);updateCart()" class="text-red-500 font-bold px-2">X</button>
        </div>`;
    }).join('');

    if(listDesk) listDesk.innerHTML = html || '<p class="text-center text-gray-400 mt-5 italic">Kosong</p>';
    if(listMob) listMob.innerHTML = html || '<p class="text-center text-gray-400 mt-5 italic">Kosong</p>';
    
    totalDisplays.forEach(el => el.innerText = `Rp ${total.toLocaleString('id-ID')}`);
    
    // KUNCI: Memperbarui angka di tombol keranjang mobile
    if(cartCountMob) {
        cartCountMob.innerText = itemCount; 
    }
}

function openPay() { document.getElementById('modal-pay').style.display = 'flex'; }
function handleQRIS() { document.getElementById('modal-pay').style.display = 'none'; document.getElementById('modal-qris').style.display = 'flex'; }
function confirmSuccess(m) { playSound('success'); selectedMethod = m; document.getElementById('modal-pay').style.display = 'none'; document.getElementById('modal-qris').style.display = 'none'; document.getElementById('modal-success').style.display = 'flex'; }

function finalize(p) {
    if(p) {
        // Logika pengisian struk sebelum print
        const name = document.getElementById('customer-name-mob').value || document.getElementById('customer-name').value || "PELANGGAN";
        document.getElementById('p-customer').innerText = "NAMA: " + name.toUpperCase();
        
        let totalFinal = 0;
        document.getElementById('p-items').innerHTML = cart.map(i => {
            totalFinal += i.qty * 8000;
            return `<div>${i.qty}x ${i.n} - ${(i.qty*8000).toLocaleString()}</div>`;
        }).join('');
        
        document.getElementById('p-total').innerText = "TOTAL: Rp " + totalFinal.toLocaleString();
        document.getElementById('p-method').innerText = "METODE: " + selectedMethod;
        
        document.getElementById('receipt-print').style.display = 'block';
        setTimeout(() => { window.print(); location.reload(); }, 500);
    } else {
        location.reload();
    }
}

function openMobileCart() { document.getElementById('modal-mobile-cart').style.display = 'flex'; }
function closeMobileCart() { document.getElementById('modal-mobile-cart').style.display = 'none'; }
function filter(k) { render(k); }

render();
