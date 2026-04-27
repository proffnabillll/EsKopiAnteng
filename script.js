// 1. Pastikan AudioContext didefinisikan di paling atas
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

async function playSound(t) {
    // KUNCI UTAMA: Paksa AudioContext bangun jika dia tertidur/suspended
    if (audioCtx.state === 'suspended') {
        await audioCtx.resume();
    }

    // Buat oscillator dan gain node baru setiap kali fungsi dipanggil
    const o = audioCtx.createOscillator(); 
    const g = audioCtx.createGain();
    
    o.connect(g); 
    g.connect(audioCtx.destination);

    if(t === 'click'){ 
        o.frequency.setValueAtTime(400, audioCtx.currentTime); 
        g.gain.setValueAtTime(0.1, audioCtx.currentTime); 
        g.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1); 
        o.start(); 
        o.stop(audioCtx.currentTime + 0.1); 
    }
    else if(t === 'ding'){ 
        o.frequency.setValueAtTime(600, audioCtx.currentTime); 
        g.gain.setValueAtTime(0.1, audioCtx.currentTime); 
        g.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2); 
        o.start(); 
        o.stop(audioCtx.currentTime + 0.2); 
    }
    else if(t === 'success'){ 
        o.frequency.setValueAtTime(523, audioCtx.currentTime); // Nada Do tinggi
        g.gain.setValueAtTime(0.1, audioCtx.currentTime); 
        g.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5); 
        o.start(); 
        o.stop(audioCtx.currentTime + 0.5); 
    }
}
