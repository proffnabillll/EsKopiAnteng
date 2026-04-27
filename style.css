/* Gaya Global */
body { 
    font-family: 'Poppins', sans-serif; 
    background-color: #f3efea; 
    overflow: hidden; 
    display: flex; 
    flex-direction: column; 
    min-height: 100vh; 
}

/* Header & Logo */
.header-coffee { 
    background-color: #3d1c02; 
    border-bottom: 8px solid #2a1301; 
    height: 90px; 
    position: relative; 
    z-index: 50; 
}

.logo-large { 
    height: 120px; 
    width: auto; 
    position: absolute; 
    left: 20px; 
    top: 50%; 
    transform: translateY(-50%); 
    z-index: 60; 
    filter: drop-shadow(0px 4px 8px rgba(0,0,0,0.4)); 
}

/* Animasi */
@keyframes popIn { 
    from { opacity: 0; transform: scale(0.9); } 
    to { opacity: 1; transform: scale(1); } 
}

.animate-pop { 
    animation: popIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); 
}

.btn-bounce:active { 
    transform: scale(0.9); 
    transition: 0.1s; 
}

.tab-on { 
    background-color: #3d1c02 !important; 
    color: white !important; 
}

/* Kartu Produk */
.photo-box { 
    aspect-ratio: 3/4; 
    overflow: hidden; 
    border-radius: 12px; 
    border: 2px solid #3d1c02; 
    background: #eee; 
}

.photo-box img { 
    width: 100%; 
    height: 100%; 
    object-fit: cover; 
}

#desktop-aside { 
    display: flex; 
}

#mobile-bottom-bar { 
    display: none; 
}

/* Gaya Mobile (Max 768px) */
@media (max-width: 768px) {
    body { overflow: auto; }
    #desktop-aside { display: none; }
    #mobile-bottom-bar { 
        display: flex; 
        position: fixed; 
        bottom: 0; 
        left: 0; 
        right: 0; 
        z-index: 80; 
    }
    
    .header-coffee { height: 70px; }
    .logo-large { 
        height: 60px; 
        left: 10px; 
        top: 50%;
        transform: translateY(-50%);
    }
    .header-title { font-size: 1.5rem !important; margin-left: 30px; }
    .main-content { padding-bottom: 110px; }
}

/* Overlay Modal */
.modal-bg { 
    background: rgba(0,0,0,0.85); 
    backdrop-filter: blur(5px); 
    display: none; 
    position: fixed; 
    inset: 0; 
    z-index: 100; 
    align-items: center; 
    justify-content: center; 
    padding: 20px; 
}

/* Aturan Cetak Struk */
@media print {
    body * { visibility: hidden; }
    #receipt-print, #receipt-print * { visibility: visible; }
    #receipt-print { 
        position: absolute; 
        left: 0; 
        top: 0; 
        width: 58mm; 
        display: block !important; 
        padding: 5px; 
    }
    @page { margin: 0; size: auto; }
}
