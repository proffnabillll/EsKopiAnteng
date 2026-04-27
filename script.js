function finalize(withPrint) {
    if (withPrint) {
        const isMobile = window.innerWidth <= 768;
        const nameInput = isMobile ? document.getElementById('customer-name-mob') : document.getElementById('customer-name');
        const name = nameInput ? nameInput.value : "PELANGGAN";
        
        let totalFinal = 0;
        
        // ISI DATA STRUK SECARA PAKSA
        document.getElementById('p-customer').innerText = "PELANGGAN: " + name.toUpperCase();
        
        const itemsHTML = cart.map(i => { 
            const sub = i.qty * 8000; function finalize(withPrint) {
    if (withPrint) {
        // Ambil Nama Pelanggan (Cek dua-duanya: mob atau desktop)
        const nameMob = document.getElementById('customer-name-mob');
        const nameDesk = document.getElementById('customer-name');
        const name = (nameMob && nameMob.value) ? nameMob.value : (nameDesk && nameDesk.value ? nameDesk.value : "PELANGGAN");
        
        let totalFinal = 0;
        let itemsHTML = "";

        // Susun daftar belanja secara manual
        cart.forEach(item => {
            const sub = item.qty * 8000;
            totalFinal += sub;
            itemsHTML += `
                <div style="display:flex; justify-content:space-between; margin-bottom:2px;">
                    <span>${item.qty}x ${item.n} (${item.type})</span>
                    <span>${sub.toLocaleString()}</span>
                </div>`;
        });

        // PAKSA ISI KE STRUK
        const pCustomer = document.getElementById('p-customer');
        const pItems = document.getElementById('p-items');
        const pTotal = document.getElementById('p-total');
        const pMethod = document.getElementById('p-method');
        const receiptArea = document.getElementById('receipt-print');

        if (pCustomer) pCustomer.innerText = "PELANGGAN: " + name.toUpperCase();
        if (pItems) pItems.innerHTML = itemsHTML;
        if (pTotal) pTotal.innerHTML = `<div style="display:flex; justify-content:space-between; font-weight:bold; border-top:1px dashed #000; padding-top:5px;"><span>TOTAL</span><span>Rp ${totalFinal.toLocaleString()}</span></div>`;
        
        const skrg = new Date();
        if (pMethod) pMethod.innerText = "Metode: " + selectedMethod + " | " + skrg.toLocaleDateString('id-ID') + " " + skrg.toLocaleTimeString('id-ID');

        // Tampilkan struk sedetik sebelum print
        if (receiptArea) receiptArea.style.display = 'block';

        setTimeout(() => {
            window.print();
            // Jeda setelah jendela print muncul baru reload
            setTimeout(() => {
                location.reload();
            }, 500);
        }, 800); // Jeda lebih lama (0.8 detik) biar HP sempat render teks
    } else {
        location.reload();
    }
}
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
