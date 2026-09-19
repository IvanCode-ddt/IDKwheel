/**
 * main.js
 * -----------------------------------------------------------------------
 * Nối tất cả lại: đọc/ghi state.js, random bằng roulette.js, vẽ UI bằng
 * render.js. Đây là file "lắp ráp" — muốn thêm tính năng mới, thường chỉ
 * cần thêm 1 hàm renderXxx() + 1 event listener ở đây.
 *
 * Ý TƯỞNG NÂNG CẤP SAU NÀY (gợi ý, không bắt buộc làm ngay):
 * - Trọng số cho từng lựa chọn (món hay ăn thì dễ ra hơn) -> đã có sẵn
 *   tham số weightFn trong roulette.weightedPick, chỉ cần lưu thêm field
 *   "weight" vào item trong state.js rồi truyền vào khi gọi.
 * - Âm thanh khi quay/khi ra kết quả -> thêm file js/sound.js, gọi trong
 *   hàm spin() bên dưới.
 * - Chia sẻ danh mục qua link -> encode categories ra query string.
 * - Loại bỏ lựa chọn vừa quay trúng khỏi lượt sau ("không lặp lại") ->
 *   lọc items trước khi gọi weightedPick, dựa vào getHistory().
 * -----------------------------------------------------------------------
 */

import * as Store from "./state.js";
import { weightedPick, buildStrip } from "./roulette.js";
import { stripCardHTML, manageRowHTML, thumbHTML, escapeHTML } from "./render.js";
import { colorForIndex } from "./data.js";

// ---------- DOM refs --------------------------------------------------------
const $tabs = document.getElementById("category-tabs");
const $addCategoryForm = document.getElementById("add-category-form");
const $newCategoryInput = document.getElementById("new-category-input");

const $categoryTitle = document.getElementById("category-title");
const $deleteCategoryBtn = document.getElementById("delete-category-btn");

const $itemList = document.getElementById("item-list");
const $addItemForm = document.getElementById("add-item-form");
const $newItemInput = document.getElementById("new-item-input");
const $emptyState = document.getElementById("empty-state");

const $spinBtn = document.getElementById("spin-btn");
const $rouletteViewport = document.getElementById("roulette-viewport");
const $rouletteTrack = document.getElementById("roulette-track");

const $resultPanel = document.getElementById("result-panel");
const $resultThumb = document.getElementById("result-thumb");
const $resultName = document.getElementById("result-name");
const $spinAgainBtn = document.getElementById("spin-again-btn");

const $historyList = document.getElementById("history-list");

const CARD_WIDTH = 148; // phải khớp với CSS .strip-item (width + margin)
const WIN_INDEX = 32;
const STRIP_LENGTH = 40;

let isSpinning = false;

// ---------- Render: tabs danh mục -------------------------------------------
function renderTabs(state) {
  $tabs.innerHTML = state.categories
    .map((c) => {
      const active = c.id === state.activeCategoryId ? "tab--active" : "";
      return `<button class="tab ${active}" data-category-id="${c.id}">
        <span class="tab__emoji">${c.emoji}</span>${escapeHTML(c.name)}
      </button>`;
    })
    .join("");

  $tabs.querySelectorAll("[data-category-id]").forEach((btn) => {
    btn.addEventListener("click", () => {
      Store.setActiveCategory(btn.getAttribute("data-category-id"));
      resetRouletteView();
    });
  });
}

// ---------- Render: danh sách lựa chọn của danh mục đang chọn ----------------
function renderItems(state) {
  const category = Store.getActiveCategory();
  if (!category) {
    $categoryTitle.textContent = "Chưa có danh mục nào";
    $itemList.innerHTML = "";
    $emptyState.hidden = false;
    $spinBtn.disabled = true;
    $deleteCategoryBtn.hidden = true;
    return;
  }

  $categoryTitle.textContent = `${category.emoji} ${category.name}`;
  $deleteCategoryBtn.hidden = false;

  if (category.items.length === 0) {
    $itemList.innerHTML = "";
    $emptyState.hidden = false;
    $spinBtn.disabled = true;
  } else {
    $emptyState.hidden = true;
    $spinBtn.disabled = isSpinning;
    $itemList.innerHTML = category.items
      .map((item, i) => manageRowHTML(item, i))
      .join("");
    $itemList.querySelectorAll("[data-remove-item]").forEach((btn) => {
      btn.addEventListener("click", () => {
        Store.removeItem(category.id, btn.getAttribute("data-remove-item"));
      });
    });
  }
}

// ---------- Render: lịch sử quay gần đây -------------------------------------
function renderHistory() {
  const category = Store.getActiveCategory();
  if (!category) {
    $historyList.innerHTML = "";
    return;
  }
  const history = Store.getHistory(category.id);
  if (history.length === 0) {
    $historyList.innerHTML = `<li class="history-empty">Chưa quay lần nào.</li>`;
    return;
  }
  $historyList.innerHTML = history
    .map((h) => `<li>${escapeHTML(h.itemName)}</li>`)
    .join("");
}

// ---------- Thêm danh mục -----------------------------------------------------
$addCategoryForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = $newCategoryInput.value;
  if (!name.trim()) return;
  Store.addCategory(name);
  $newCategoryInput.value = "";
  resetRouletteView();
});

$deleteCategoryBtn.addEventListener("click", () => {
  const category = Store.getActiveCategory();
  if (!category) return;
  if (confirm(`Xoá danh mục "${category.name}"?`)) {
    Store.deleteCategory(category.id);
    resetRouletteView();
  }
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

// ---------- Quay -------------------------------------------------------------------
$spinBtn.addEventListener("click", spin);
$spinAgainBtn.addEventListener("click", () => {
  resetRouletteView();
  spin();
});

function spin() {
  const category = Store.getActiveCategory();
  if (!category || category.items.length === 0 || isSpinning) return;

  isSpinning = true;
  $spinBtn.disabled = true;
  $resultPanel.hidden = true;

  const winner = weightedPick(category.items);
  const strip = buildStrip(category.items, winner, { length: STRIP_LENGTH, winIndex: WIN_INDEX });

  $rouletteViewport.hidden = false;
  $rouletteTrack.style.transition = "none";
  $rouletteTrack.style.transform = "translateX(0px)";
  $rouletteTrack.innerHTML = strip
    .map((item, i) => stripCardHTML(item, i))
    .join("");

  // 2 frame để trình duyệt áp dụng vị trí ban đầu trước khi bắt đầu animate
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const viewportWidth = $rouletteViewport.clientWidth;
      const jitter = Math.floor(Math.random() * (CARD_WIDTH * 0.6)) - CARD_WIDTH * 0.3;
      const targetX = -(WIN_INDEX * CARD_WIDTH - viewportWidth / 2 + CARD_WIDTH / 2) + jitter;
      $rouletteTrack.style.transition = "transform 4.8s cubic-bezier(0.12, 0.85, 0.15, 1)";
      $rouletteTrack.style.transform = `translateX(${targetX}px)`;
    });
  });

  window.setTimeout(() => {
    Store.recordSpin(category.id, winner.name);
    const winnerIndex = category.items.findIndex((it) => it.id === winner.id);
    $resultThumb.innerHTML = thumbHTML(winner, Math.max(0, winnerIndex), "thumb--xl");
    $resultName.textContent = winner.name;
    $resultPanel.hidden = false;
    isSpinning = false;
    $spinBtn.disabled = category.items.length === 0;
  }, 5000);
}

function resetRouletteView() {
  $rouletteViewport.hidden = true;
  $resultPanel.hidden = true;
  isSpinning = false;
}

// ---------- Boot ---------------------------------------------------------------------
Store.subscribe((state) => {
  renderTabs(state);
  renderItems(state);
  renderHistory();
});
