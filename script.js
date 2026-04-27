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

        // 1. Tulis data ke Struk
        document.getElementById('p-customer').innerText = "PELANGGAN: " + name;
        document.getElementById('p-items').innerHTML = itemsHTML;
        document.getElementById('p-total').innerHTML = `<div style="display:flex; justify-content:space-between; font-weight:bold; border-top:1px dashed #000; padding-top:5px;"><span>TOTAL</span><span>Rp ${totalFinal.toLocaleString()}</span></div>`;
        document.getElementById('p-method').innerText = "Metode: " + selectedMethod + " | " + new Date().toLocaleString('id-ID');

        // 2. Pastikan struk 'siap' di mata browser
        const receipt = document.getElementById('receipt-print');
        receipt.style.display = 'block';

        // 3. Jeda untuk render, lalu print, lalu reload
        setTimeout(() => {
            window.print();
            // Jeda lagi setelah print layar muncul baru reload
            setTimeout(() => {
                location.reload();
            }, 500);
        }, 500);
    } else {
        location.reload();
    }
}
