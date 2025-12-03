// Simple synth using Web Audio API
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

const playTone = (freq, type, duration, startTime = 0) => {
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(freq, audioCtx.currentTime + startTime);

    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime + startTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + startTime + duration);

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.start(audioCtx.currentTime + startTime);
    oscillator.stop(audioCtx.currentTime + startTime + duration);
};

export const playPositive = () => {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    // Major chord arpeggio (C5, E5, G5)
    playTone(523.25, 'sine', 0.3, 0);
    playTone(659.25, 'sine', 0.3, 0.1);
    playTone(783.99, 'sine', 0.6, 0.2);
};

export const playNegative = () => {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    // Dissonant / Descending
    playTone(150, 'sawtooth', 0.4, 0);
    playTone(100, 'sawtooth', 0.6, 0.2);
};

export const playVictory = () => {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    // Fanfare
    playTone(523.25, 'square', 0.2, 0); // C
    playTone(523.25, 'square', 0.2, 0.2); // C
    playTone(523.25, 'square', 0.2, 0.4); // C
    playTone(659.25, 'square', 0.6, 0.6); // E
    playTone(783.99, 'square', 0.8, 0.9); // G
};
