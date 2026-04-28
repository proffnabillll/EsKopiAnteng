const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

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
    { id: 8, n: 'Matcha', k: 'non-coffee', f: 'images/Matcha.jpg' }
];

let cart = [];
let activeItem = null;
let selectedType = "ICE";
let currentQty = 1;
let splitCount = 1;
let selectedMethod = "";

function render(f = 'all') {
    const container = document.getElementById('grid-container');
    container.innerHTML = '';
    document.querySelectorAll('nav button').forEach(b => b.classList.remove('tab-on'));
    document.getElementById('t-' + f).classList.add('tab-on');

    const list = f === 'all' ? products : products.filter(p => p.k === f);
    list.forEach((p, idx) => {
        container.innerHTML += `
            <div class="bg-white p-3 rounded-2xl border-2 border-[#3d1c02] shadow-sm flex flex-col animate-pop relative" style="animation-delay: ${idx*0.05}s">
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
    document.getElementById('modal-icehot').style.display = 'flex'; 
}

function closeModal() { document.getElementById('modal-icehot').style.display = 'none'; }

function selectType(t) { 
    playSound('click'); selectedType = t; 
    document.getElementById('btn-ice').style.borderColor = t === 'ICE' ? '#3d1c02' : 'transparent';
    document.getElementById('btn-hot').style.borderColor = t === 'HOT' ? '#3d1c02' : 'transparent';
}

function updateQty(v) { playSound('click'); currentQty = Math.max(1, currentQty + v); document.getElementById('m-qty').innerText = currentQty; }

function confirmAdd() { playSound('ding'); cart.push({ ...activeItem, type: selectedType, qty: currentQty }); closeModal(); updateCart(); }

function openMobileCart() { document.getElementById('modal-mobile-cart').style.display = 'flex'; }
function closeMobileCart() { document.getElementById('modal-mobile-cart').style.display = 'none'; }

function updateCart() {
    const listDesk = document.getElementById('cart-list-desktop');
    const listMob = document.getElementById('cart-list-mobile');
    const totalDisplays = document.querySelectorAll('.total-display');
    let total = 0;
    const cartHTML = cart.map((item, index) => {
        total += item.qty * 8000;
        return `<div class="bg-white p-2 border border-[#3d1c02] rounded-xl text-xs flex justify-between items-center animate-pop"><div class="flex items-center gap-3"><img src="${item.f}" class="w-10 h-10 object-cover rounded-lg border"><div><b class="uppercase">${item.qty}x ${item.n}</b><br><span class="uppercase text-[9px]">${item.type}</span></div></div><button onclick="cart.splice(${index},1); updateCart();" class="text-red-500 font-bold text-xl ml-2">&times;</button></div>`;
    }).join('');
    
    listDesk.innerHTML = cart.length ? cartHTML : '<p class="text-center text-gray-400 mt-10 text-xs italic">Kosong</p>';
    listMob.innerHTML = cart.length ? cartHTML : '<p class="text-center text-gray-400 py-10 italic text-xs">Kosong</p>';
    totalDisplays.forEach(el => el.innerText = `Rp ${total.toLocaleString('id-ID')}`);
    document.getElementById('cart-count-mob').innerText = cart.length;
}

function openPay() { 
    const isMobile = window.innerWidth <= 768;
    const nameInput = isMobile ? document.getElementById('customer-name-mob') : document.getElementById('customer-name');
    if(cart.length === 0) return alert("Keranjang kosong!");
    if(!nameInput.value.trim()) return alert("Isi nama pelanggan!");
    document.getElementById('enable-split').checked = false;
    document.getElementById('split-section').style.display = 'none';
    splitCount = 1; updateSplit(0);
    document.getElementById('modal-pay').style.display = 'flex'; 
}

function toggleSplit() {
    const isEnabled = document.getElementById('enable-split').checked;
    document.getElementById('split-section').style.display = isEnabled ? 'block' : 'none';
    if(!isEnabled) { splitCount = 1; updateSplit(0); }
}

function updateSplit(v) {
    splitCount = Math.max(1, splitCount + v);
    document.getElementById('split-count').innerText = splitCount;
    const total = cart.reduce((a, b) => a + (b.qty * 8000), 0);
    if(splitCount > 1) {
        const perPerson = Math.ceil(total / splitCount);
        document.getElementById('split-info').innerText = `@ Rp ${perPerson.toLocaleString()} / Orang`;
    } else document.getElementById('split-info').innerText = "";
}

function handleQRIS() { document.getElementById('modal-pay').style.display = 'none'; document.getElementById('modal-qris').style.display = 'flex'; }

function confirmSuccess(method) { 
    playSound('success'); selectedMethod = method; 
    document.getElementById('modal-pay').style.display = 'none'; 
    document.getElementById('modal-qris').style.display = 'none';
    document.getElementById('modal-success').style.display = 'flex'; 
}

/**
 * Fungsi Finalize yang Dioptimalkan
 * Memastikan data struk terisi sebelum dicetak.
 */
function finalize(withPrint) {
    if (withPrint) {
        const isMobile = window.innerWidth <= 768;
        const name = isMobile ? document.getElementById('customer-name-mob').value : document.getElementById('customer-name').value;
        let totalFinal = 0;

        // Isi data pelanggan
        document.getElementById('p-customer').innerText = "PELANGGAN: " + name.toUpperCase();
        
        // Isi item belanja
        const itemsHTML = cart.map(i => { 
            const sub = i.qty * 8000; totalFinal += sub; 
            return `<div style="display:flex; justify-content:space-between"><span>${i.qty}x ${i.n} (${i.type})</span><span>${sub.toLocaleString()}</span></div>`; 
        }).join('');
        document.getElementById('p-items').innerHTML = itemsHTML;

        // Isi total
        document.getElementById('p-total').innerHTML = `<div style="display:flex; justify-content:space-between"><span>TOTAL</span><span>Rp ${totalFinal.toLocaleString()}</span></div>`;
        
        // Isi info split bill
        if(splitCount > 1) {
            document.getElementById('p-split').innerHTML = `SPLIT BILL (${splitCount} Orang):<br>@ Rp ${Math.ceil(totalFinal/splitCount).toLocaleString()} / Orang`;
        } else {
            document.getElementById('p-split').innerHTML = "";
        }

        // Isi metode & waktu
        const now = new Date();
        document.getElementById('p-method').innerText = "Metode: " + selectedMethod + " | " + now.toLocaleDateString('id-ID') + " " + now.toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'});

        // Jeda kecil (100ms) untuk memastikan DOM terupdate sebelum cetak
        setTimeout(() => {
            window.print();
            location.reload();
        }, 100);
    } else {
        location.reload();
    }
}

function filter(k) { render(k); }

render();
