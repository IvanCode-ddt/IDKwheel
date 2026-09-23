/**
 * main.js
 * -----------------------------------------------------------------------
 * Nối tất cả lại: đọc/ghi state.js, random bằng roulette.js, vẽ UI bằng
 * render.js, và phát âm thanh "tích tích" lúc quay bằng Web Audio API
 * (không cần file mp3 nào).
 *
 * LUỒNG MÀN HÌNH:
 *   #screen-select (lưới các hòm)
 *     --click 1 hòm-->  #screen-open (hòm vàng -> quay -> kết quả)
 *     <--back-btn--
 *
 * Ý TƯỞNG NÂNG CẤP SAU NÀY:
 * - Đổi hòm vàng mặc định thành hình riêng cho từng danh mục -> sửa hàm
 *   renderIdleCrate() để ưu tiên category.openImage nếu có, thay vì luôn
 *   dùng defaultCrateSVG().
 * - Đổi kiểu tiếng tích tích -> sửa playTick()/playReveal().
 * - Thêm "không lặp lại kết quả vừa quay" -> lọc category.items trước khi
 *   gọi weightedPick(), dựa vào getHistory().
 * -----------------------------------------------------------------------
 */

import * as Store from "./state.js";
import { weightedPick, buildStrip } from "./roulette.js";
import {
  stripCardHTML, manageRowHTML, thumbHTML, caseCardHTML,
  defaultCrateSVG, statsListHTML, reviewHTML, escapeHTML,
} from "./render.js";
import { initSounds, unlockAudio, playTick, playOpen, playReveal } from "./sound.js";
import { FEEDBACK_FORM_URL } from "./data.js";

// ---------- DOM refs --------------------------------------------------------
const $screenSelect = document.getElementById("screen-select");
const $screenOpen = document.getElementById("screen-open");
const $caseGrid = document.getElementById("case-grid");
const $addCategoryForm = document.getElementById("add-category-form");
const $newCategoryInput = document.getElementById("new-category-input");

const $backBtn = document.getElementById("back-btn");
const $openCaseName = document.getElementById("open-case-name");
const $manageToggleBtn = document.getElementById("manage-toggle-btn");
const $managePanel = document.getElementById("manage-panel");

const $caseVisual = document.getElementById("case-visual");
const $rouletteViewport = document.getElementById("roulette-viewport");
const $rouletteTrack = document.getElementById("roulette-track");
const $resultDetail = document.getElementById("result-detail");
const $resultThumb = document.getElementById("result-thumb");
const $resultName = document.getElementById("result-name");
const $resultStatsSlot = document.getElementById("result-stats-slot");
const $resultReviewSlot = document.getElementById("result-review-slot");
const $spinAgainBtn = document.getElementById("spin-again-btn");
const $backToListBtn = document.getElementById("back-to-list-btn");

const $spinBtn = document.getElementById("spin-btn");

const $itemList = document.getElementById("item-list");
const $addItemForm = document.getElementById("add-item-form");
const $newItemInput = document.getElementById("new-item-input");
const $emptyState = document.getElementById("empty-state");
const $deleteCategoryBtn = document.getElementById("delete-category-btn");
const $historyList = document.getElementById("history-list");

const $feedbackBtn = document.getElementById("feedback-btn");
const $feedbackModal = document.getElementById("feedback-modal");
const $feedbackBackdrop = document.getElementById("feedback-backdrop");
const $feedbackClose = document.getElementById("feedback-close");
const $feedbackIframe = document.getElementById("feedback-iframe");
const $feedbackFallback = document.getElementById("feedback-fallback");

const CARD_WIDTH = 148; // phải khớp với CSS .strip-item (width + margin)
const WIN_INDEX = 32;
const STRIP_LENGTH = 40;
const SHAKE_MS = 500;
const OPEN_MS = 550;
const SPIN_MS = 4800;

let isSpinning = false;

/** Lên lịch các tiếng "tích" thưa dần theo thời gian, giống lúc dải quay
 *  chạy chậm lại trước khi dừng (mô phỏng CS2). */
function scheduleTicks(durationMs, count) {
  for (let i = 1; i <= count; i++) {
    const t = durationMs * Math.pow(i / count, 1.8);
    window.setTimeout(playTick, t);
  }
}

/** Tia sáng bắn ra khi nắp hòm bật mở, cho cảm giác vui nhộn hơn. */
function spawnSparkles(container) {
  const COUNT = 10;
  for (let i = 0; i < COUNT; i++) {
    const angle = (360 / COUNT) * i + (Math.random() * 20 - 10);
    const dist = 55 + Math.random() * 30;
    const rad = (angle * Math.PI) / 180;
    const tx = Math.cos(rad) * dist;
    const ty = Math.sin(rad) * dist;

    const el = document.createElement("span");
    el.className = "sparkle";
    el.style.setProperty("--tx", `${tx}px`);
    el.style.setProperty("--ty", `${ty}px`);
    el.style.setProperty("--delay", `${Math.random() * 60}ms`);
    container.appendChild(el);
    window.setTimeout(() => el.remove(), 750);
  }
}

// ---------- Điều hướng màn hình ----------------------------------------------
function showSelectScreen() {
  $screenOpen.hidden = true;
  $screenSelect.hidden = false;
}

function showOpenScreen() {
  $screenSelect.hidden = true;
  $screenOpen.hidden = false;
  resetStage();
  $managePanel.hidden = true;
  renderItems(Store.getState());
  renderHistory();
}

function resetStage() {
  isSpinning = false;
  $caseVisual.hidden = false;
  $caseVisual.classList.remove("case-visual--shake", "case-visual--open");
  $rouletteViewport.hidden = true;
  $resultDetail.hidden = true;
  $spinBtn.hidden = false;
  $spinBtn.disabled = false;
}

// ---------- Render: lưới các hòm --------------------------------------------
function renderCaseGrid(state) {
  if (state.categories.length === 0) {
    $caseGrid.innerHTML = `<p class="empty-state">Chưa có hòm nào. Thêm 1 hòm mới bên dưới nhé.</p>`;
    return;
  }
  $caseGrid.innerHTML = state.categories
    .map((c, i) => caseCardHTML(c, i))
    .join("");

  $caseGrid.querySelectorAll("[data-open-case]").forEach((btn) => {
    btn.addEventListener("click", () => {
      Store.setActiveCategory(btn.getAttribute("data-open-case"));
      showOpenScreen();
    });
  });
}

// ---------- Render: danh sách lựa chọn bên trong hòm đang mở -----------------
function renderItems(state) {
  const category = Store.getActiveCategory();
  if (!category) return;

  $openCaseName.textContent = `${category.emoji} ${category.name}`;

  if (category.items.length === 0) {
    $itemList.innerHTML = "";
    $emptyState.hidden = false;
    $spinBtn.disabled = true;
  } else {
    $emptyState.hidden = true;
    if (!isSpinning) $spinBtn.disabled = false;
    $itemList.innerHTML = category.items.map((item, i) => manageRowHTML(item, i)).join("");
    $itemList.querySelectorAll("[data-remove-item]").forEach((btn) => {
      btn.addEventListener("click", () => {
        Store.removeItem(category.id, btn.getAttribute("data-remove-item"));
      });
    });
  }
}

function renderHistory() {
  const category = Store.getActiveCategory();
  if (!category) {
    $historyList.innerHTML = "";
    return;
  }
  const history = Store.getHistory(category.id);
  $historyList.innerHTML = history.length === 0
    ? `<li class="history-empty">Chưa quay lần nào.</li>`
    : history.map((h) => `<li>${escapeHTML(h.itemName)}</li>`).join("");
}

// ---------- Thêm / xoá hòm --------------------------------------------------
$addCategoryForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = $newCategoryInput.value;
  if (!name.trim()) return;
  Store.addCategory(name);
  $newCategoryInput.value = "";
});

$backBtn.addEventListener("click", showSelectScreen);
$backToListBtn.addEventListener("click", showSelectScreen);

$deleteCategoryBtn.addEventListener("click", () => {
  const category = Store.getActiveCategory();
  if (!category) return;
  if (confirm(`Xoá cả hòm "${category.name}"?`)) {
    Store.deleteCategory(category.id);
    showSelectScreen();
  }
});

$manageToggleBtn.addEventListener("click", () => {
  $managePanel.hidden = !$managePanel.hidden;
});

// ---------- Thêm lựa chọn -------------------------------------------------------
$addItemForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const category = Store.getActiveCategory();
  if (!category) return;
  const name = $newItemInput.value;
  if (!name.trim()) return;
  Store.addItem(category.id, name);
  $newItemInput.value = "";
});

// ---------- Mở hòm: rung -> quay -> kết quả ---------------------------------
$caseVisual.innerHTML = defaultCrateSVG();

$spinBtn.addEventListener("click", spin);
$spinAgainBtn.addEventListener("click", resetStage);

function spin() {
  const category = Store.getActiveCategory();
  if (!category || category.items.length === 0 || isSpinning) return;

  isSpinning = true;
  $spinBtn.disabled = true;
  unlockAudio(); // "mở khoá" audio ngay từ cú click của người dùng

  // 1) Hòm rung nhẹ
  $caseVisual.classList.add("case-visual--shake");

  window.setTimeout(() => {
    // 2) Nắp bật mở + tia sáng + âm thanh
    $caseVisual.classList.remove("case-visual--shake");
    $caseVisual.classList.add("case-visual--open");
    playOpen();
    spawnSparkles($caseVisual);

    window.setTimeout(() => {
      // 3) Ẩn hòm, hiện dải quay
      $caseVisual.hidden = true;
      $caseVisual.classList.remove("case-visual--open");
      startRoulette(category);
    }, OPEN_MS);
  }, SHAKE_MS);
}

function startRoulette(category) {
  const winner = weightedPick(category.items);
  const strip = buildStrip(category.items, winner, { length: STRIP_LENGTH, winIndex: WIN_INDEX });

  $rouletteViewport.hidden = false;
  $rouletteTrack.style.transition = "none";
  $rouletteTrack.style.transform = "translateX(0px)";
  $rouletteTrack.innerHTML = strip.map((item, i) => stripCardHTML(item, i)).join("");

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const viewportWidth = $rouletteViewport.clientWidth;
      const jitter = Math.floor(Math.random() * (CARD_WIDTH * 0.6)) - CARD_WIDTH * 0.3;
      const targetX = -(WIN_INDEX * CARD_WIDTH - viewportWidth / 2 + CARD_WIDTH / 2) + jitter;
      $rouletteTrack.style.transition = `transform ${SPIN_MS}ms cubic-bezier(0.12, 0.85, 0.15, 1)`;
      $rouletteTrack.style.transform = `translateX(${targetX}px)`;
    });
  });

  scheduleTicks(SPIN_MS, WIN_INDEX);

  window.setTimeout(() => {
    Store.recordSpin(category.id, winner.name);
    showResult(category, winner);
  }, SPIN_MS + 150);
}

function showResult(category, winner) {
  playReveal();
  $rouletteViewport.hidden = true;

  const winnerIndex = category.items.findIndex((it) => it.id === winner.id);
  $resultThumb.innerHTML = thumbHTML(winner, Math.max(0, winnerIndex), "thumb--xl");
  $resultName.textContent = winner.name;
  $resultStatsSlot.innerHTML = statsListHTML(winner);
  $resultReviewSlot.innerHTML = reviewHTML(winner);

  $resultDetail.hidden = false;
  $spinBtn.hidden = true;
  isSpinning = false;
}

// ---------- Nút Góp Ý --------------------------------------------------------
function openFeedback() {
  if (FEEDBACK_FORM_URL) {
    if (!$feedbackIframe.src) $feedbackIframe.src = FEEDBACK_FORM_URL;
    $feedbackIframe.hidden = false;
    $feedbackFallback.hidden = true;
  } else {
    $feedbackIframe.hidden = true;
    $feedbackFallback.hidden = false;
  }
  $feedbackModal.hidden = false;
}

function closeFeedback() {
  $feedbackModal.hidden = true;
}

$feedbackBtn.addEventListener("click", openFeedback);
$feedbackClose.addEventListener("click", closeFeedback);
$feedbackBackdrop.addEventListener("click", closeFeedback);

// ---------- Boot ---------------------------------------------------------------------
initSounds();

Store.subscribe((state) => {
  renderCaseGrid(state);
  if (!$screenOpen.hidden) {
    renderItems(state);
    renderHistory();
  }
});
