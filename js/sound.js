/**
 * sound.js
 * -----------------------------------------------------------------------
 * Quản lý âm thanh cho lúc mở hòm. Ưu tiên dùng file mp3 THẬT nếu bạn đã
 * bỏ vào thư mục sounds/ (đúng tên bên dưới); nếu chưa có file, tự động
 * phát âm thanh tổng hợp bằng Web Audio API để tạm có cảm giác, không bị
 * im lặng.
 *
 * CÁCH THÊM ÂM THANH THẬT CỦA BẠN:
 * 1. Cắt file mp3 (tiếng "tích" ngắn, tiếng "bật khoá/nắp mở").
 * 2. Đặt tên đúng như SOUND_FILES bên dưới, thả vào thư mục sounds/.
 * 3. Load lại trang — web tự nhận ra, không cần sửa code gì thêm.
 * -----------------------------------------------------------------------
 */

const SOUND_FILES = {
  tick: "sounds/tick.mp3",       // tiếng "tích" lặp lại lúc dải đang quay
  open: "sounds/mo-hom.mp3",     // tiếng khoá/nắp bật ra lúc mở hòm
  reveal: "sounds/ket-qua.mp3",  // (không bắt buộc) tiếng lúc hiện kết quả
};

const available = { tick: false, open: false, reveal: false };

async function checkFile(key, path) {
  try {
    const res = await fetch(path, { method: "HEAD" });
    available[key] = res.ok;
  } catch (e) {
    available[key] = false;
  }
}

/** Gọi 1 lần lúc mới mở trang để dò xem đã có file mp3 thật chưa. */
export async function initSounds() {
  await Promise.all(Object.entries(SOUND_FILES).map(([key, path]) => checkFile(key, path)));
}

function playFile(path, volume) {
  try {
    const audio = new Audio(path);
    audio.volume = volume;
    audio.play().catch(() => {});
  } catch (e) {
    /* bỏ qua nếu trình duyệt chặn phát tự động */
  }
}

// ---- Âm thanh tổng hợp tạm thời (Web Audio), dùng khi chưa có mp3 thật ----
let ctx = null;
function getCtx() {
  if (!ctx) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    ctx = new AudioCtx();
  }
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

/** Gọi trong sự kiện click đầu tiên để "mở khoá" audio trên trình duyệt. */
export function unlockAudio() {
  try { getCtx(); } catch (e) { /* bỏ qua */ }
}

function synthTick() {
  try {
    const c = getCtx();
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = "square";
    osc.frequency.value = 1250;
    gain.gain.value = 0.16;
    osc.connect(gain).connect(c.destination);
    const now = c.currentTime;
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
    osc.start(now);
    osc.stop(now + 0.06);
  } catch (e) { /* bỏ qua */ }
}

function synthOpen() {
  // Mô phỏng tiếng "cạch" cơ học: 1 tiếng click trầm + 1 tiếng vang kim loại ngắn.
  try {
    const c = getCtx();
    const now = c.currentTime;

    const click = c.createOscillator();
    const clickGain = c.createGain();
    click.type = "square";
    click.frequency.value = 180;
    clickGain.gain.value = 0.3;
    click.connect(clickGain).connect(c.destination);
    clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    click.start(now);
    click.stop(now + 0.09);

    const ring = c.createOscillator();
    const ringGain = c.createGain();
    ring.type = "triangle";
    ring.frequency.setValueAtTime(900, now + 0.05);
    ring.frequency.exponentialRampToValueAtTime(500, now + 0.3);
    ringGain.gain.value = 0.12;
    ring.connect(ringGain).connect(c.destination);
    ringGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    ring.start(now + 0.05);
    ring.stop(now + 0.4);
  } catch (e) { /* bỏ qua */ }
}

function synthReveal() {
  try {
    const c = getCtx();
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = "sine";
    const now = c.currentTime;
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.25);
    gain.gain.value = 0.22;
    osc.connect(gain).connect(c.destination);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    osc.start(now);
    osc.stop(now + 0.55);
  } catch (e) { /* bỏ qua */ }
}

// ---- API dùng ở main.js: tự chọn file thật hoặc âm tổng hợp ----
export function playTick() {
  available.tick ? playFile(SOUND_FILES.tick, 0.5) : synthTick();
}
export function playOpen() {
  available.open ? playFile(SOUND_FILES.open, 0.7) : synthOpen();
}
export function playReveal() {
  available.reveal ? playFile(SOUND_FILES.reveal, 0.6) : synthReveal();
}
