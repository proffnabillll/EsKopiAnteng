function finalize(withPrint) {
    if (withPrint) {
        const isMobile = window.innerWidth <= 768;
        const nameInput = isMobile ? document.getElementById('customer-name-mob') : document.getElementById('customer-name');
        const name = nameInput ? nameInput.value : "PELANGGAN";
        
        let totalFinal = 0;
        
        // ISI DATA STRUK SECARA PAKSA
        document.getElementById('p-customer').innerText = "PELANGGAN: " + name.toUpperCase();
        
        const itemsHTML = cart.map(i => { 
            const sub = i.qty * 8000; 
            totalFinal += sub; 
            return `<div style="display:flex; justify-content:space-between"><span>${i.qty}x ${i.n} (${i.type})</span><span>${sub.toLocaleString()}</span></div>`; 
        }).join('');
        
        document.getElementById('p-items').innerHTML = itemsHTML;
        document.getElementById('p-total').innerHTML = `<div style="display:flex; justify-content:space-between"><span>TOTAL</span><span>Rp ${totalFinal.toLocaleString()}</span></div>`;
        document.getElementById('p-method').innerText = "Metode: " + selectedMethod + " | " + new Date().toLocaleString('id-ID');

        // MUNCULKAN STRUK SEBENTAR BIAR BROWSER SEMPET BACA
        const receipt = document.getElementById('receipt-print');
        receipt.style.display = 'block';

        // JEDA 500ms (INI PENTING BIAR GAK KOSONG)
        setTimeout(() => {
            window.print();
            location.reload(); 
        }, 500);
    } else {
        location.reload();
    }
}
