function finalize(withPrint) {
    if (withPrint) {
        const isMobile = window.innerWidth <= 768;
        const nameInput = isMobile ? document.getElementById('customer-name-mob') : document.getElementById('customer-name');
        const name = nameInput ? nameInput.value.toUpperCase() : "PELANGGAN";
        
        let totalFinal = 0;
        const itemsHTML = cart.map(i => { 
            const sub = i.qty * 8000; 
            totalFinal += sub; 
            return `<div style="display:flex; justify-content:space-between; margin-bottom: 2px;">
                        <span>${i.qty}x ${i.n} (${i.type})</span>
                        <span>${sub.toLocaleString()}</span>
                    </div>`; 
        }).join('');

        // Masukkan data ke elemen struk
        const receipt = document.getElementById('receipt-print');
        document.getElementById('p-customer').innerText = "PELANGGAN: " + name;
        document.getElementById('p-items').innerHTML = itemsHTML;
        document.getElementById('p-total').innerHTML = `<div style="display:flex; justify-content:space-between; font-weight:bold; border-top:1px dashed #000; padding-top:5px;"><span>TOTAL</span><span>Rp ${totalFinal.toLocaleString()}</span></div>`;
        document.getElementById('p-method').innerText = "Metode: " + selectedMethod + " | " + new Date().toLocaleString('id-ID');

        // FORCE RENDER: Pastikan elemen struk tampil sebentar di layar (tapi tidak terlihat user)
        receipt.style.display = 'block';
        receipt.style.opacity = '1';

        // Kasih jeda sedikit lebih lama (700ms) untuk memastikan render selesai
        setTimeout(() => {
            window.print();
            receipt.style.display = 'none'; // Sembunyikan lagi setelah print
            location.reload();
        }, 700); 
    } else {
        location.reload();
    }
}
