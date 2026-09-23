/**
 * state.js
 * -----------------------------------------------------------------------
 * Lưu & đọc danh mục (hòm) / lựa chọn / lịch sử quay bằng sessionStorage.
 *
 * DÙNG sessionStorage (KHÔNG PHẢI localStorage) CÓ CHỦ ĐÍCH: mỗi khi người
 * dùng đóng tab/đóng trình duyệt rồi mở lại, toàn bộ hòm/lựa chọn họ tự
 * thêm sẽ tự mất, web quay về đúng bộ dữ liệu mặc định trong data.js.
 * Lưu ý: sessionStorage cũng KHÔNG dùng chung giữa các tab — mở 2 tab thì
 * mỗi tab có dữ liệu riêng, không đồng bộ với nhau.
 *
 * VERSION TRACKING: mỗi lần bạn sửa cấu trúc dữ liệu mặc định (thêm hòm,
 * đổi field...) trong data.js, hãy tăng APP_VERSION lên 1 bên dưới. Lần
 * kế tiếp người xem mở web (kể cả khi họ vẫn còn dữ liệu cũ trong cùng 1
 * tab do chưa đóng), web sẽ tự phát hiện version cũ hơn và nạp lại dữ liệu
 * mặc định mới nhất, không bị kẹt dữ liệu lỗi thời.
 *
 * Nơi DUY NHẤT đọc/ghi sessionStorage — muốn chuyển sang lưu server sau
 * này, chỉ cần viết lại các hàm trong file này.
 * -----------------------------------------------------------------------
 */

import { DEFAULT_CATEGORIES, itemImagePath, caseImagePath } from "./data.js?v=1";

const STORAGE_KEY = "spin_app_state";
const VERSION_KEY = "spin_app_version";

// Tăng số này mỗi khi đổi cấu trúc dữ liệu mặc định trong data.js.
export const APP_VERSION = "1";

function seedState() {
  return {
    categories: DEFAULT_CATEGORIES.map((c) => ({
      id: c.id,
      name: c.name,
      emoji: c.emoji,
      image: c.image ?? null,
      items: c.items.map((it) => ({
        id: uid(),
        name: it.name,
        image: it.image ?? null,
        review: it.review ?? null,
        stats: it.stats ?? [],
      })),
    })),
    history: {}, // { [categoryId]: [{itemName, ts}] }
    activeCategoryId: DEFAULT_CATEGORIES[0]?.id ?? null,
  };
}

function uid() {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

let state = load();
const listeners = new Set();

function load() {
  try {
    // Version cũ hơn (hoặc lần đầu mở) -> bỏ qua dữ liệu cũ, nạp lại mặc định.
    const storedVersion = sessionStorage.getItem(VERSION_KEY);
    if (storedVersion !== APP_VERSION) {
      sessionStorage.setItem(VERSION_KEY, APP_VERSION);
      sessionStorage.removeItem(STORAGE_KEY);
      return seedState();
    }

    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return seedState();
    const parsed = JSON.parse(raw);
    if (!parsed.categories || parsed.categories.length === 0) return seedState();
    return parsed;
  } catch (e) {
    console.warn("Không đọc được dữ liệu cũ, dùng dữ liệu mặc định.", e);
    return seedState();
  }
}

function save() {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    sessionStorage.setItem(VERSION_KEY, APP_VERSION);
  } catch (e) {
    console.warn("Không lưu được dữ liệu.", e);
  }
  listeners.forEach((fn) => fn(state));
}

export function subscribe(fn) {
  listeners.add(fn);
  fn(state);
  return () => listeners.delete(fn);
}

export function getState() {
  return state;
}

export function getActiveCategory() {
  return state.categories.find((c) => c.id === state.activeCategoryId) || null;
}

export function setActiveCategory(categoryId) {
  state.activeCategoryId = categoryId;
  save();
}

// ---- Danh mục (hòm) -----------------------------------------------------
export function addCategory(name, emoji = "🎲") {
  const trimmed = name.trim();
  if (!trimmed) return null;
  const category = {
    id: uid(),
    name: trimmed,
    emoji,
    image: caseImagePath(trimmed),
    items: [],
  };
  state.categories.push(category);
  save();
  return category;
}

export function deleteCategory(categoryId) {
  state.categories = state.categories.filter((c) => c.id !== categoryId);
  delete state.history[categoryId];
  if (state.activeCategoryId === categoryId) {
    state.activeCategoryId = null;
  }
  save();
}

// ---- Lựa chọn (items) trong 1 hòm ----------------------------------------
export function addItem(categoryId, name) {
  const trimmed = name.trim();
  if (!trimmed) return null;
  const category = state.categories.find((c) => c.id === categoryId);
  if (!category) return null;
  const item = {
    id: uid(),
    name: trimmed,
    image: itemImagePath(trimmed),
    review: null,
    stats: [
      { label: "Độ ngon", value: null },
      { label: "Mức giá", value: null },
      { label: "Thời gian chờ", value: null },
    ],
  };
  category.items.push(item);
  save();
  return item;
}

export function removeItem(categoryId, itemId) {
  const category = state.categories.find((c) => c.id === categoryId);
  if (!category) return;
  category.items = category.items.filter((it) => it.id !== itemId);
  save();
}

// ---- Lịch sử quay --------------------------------------------------------
export function recordSpin(categoryId, itemName) {
  if (!state.history[categoryId]) state.history[categoryId] = [];
  state.history[categoryId].unshift({ itemName, ts: Date.now() });
  state.history[categoryId] = state.history[categoryId].slice(0, 10);
  save();
}

export function getHistory(categoryId) {
  return state.history[categoryId] || [];
}

export function resetAll() {
  state = seedState();
  save();
}
