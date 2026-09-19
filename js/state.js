/**
 * state.js
 * -----------------------------------------------------------------------
 * Lưu & đọc danh mục / lựa chọn / lịch sử quay bằng localStorage.
 * Đây là nơi DUY NHẤT đọc/ghi localStorage — nếu sau này bạn muốn chuyển
 * sang lưu server (để đồng bộ nhiều thiết bị), chỉ cần viết lại các hàm
 * trong file này (load/save/CRUD), phần UI ở main.js không cần đổi.
 * -----------------------------------------------------------------------
 */

import { DEFAULT_CATEGORIES } from "./data.js";

// Đổi tên key (v1 -> v2) khi cấu trúc dữ liệu mặc định thay đổi lớn (thêm
// field "image", đổi danh mục món ăn) để người dùng cũ tự động nhận bộ dữ
// liệu mới thay vì bị kẹt với dữ liệu cũ trong localStorage.
const STORAGE_KEY = "spin_app_state_v2";

function seedState() {
  return {
    categories: DEFAULT_CATEGORIES.map((c) => ({
      id: c.id,
      name: c.name,
      emoji: c.emoji,
      items: c.items.map((it) => ({ id: uid(), name: it.name, image: it.image ?? null })),
    })),
    // lịch sử quay gần đây, theo từng categoryId
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
    const raw = localStorage.getItem(STORAGE_KEY);
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
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
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
  return state.categories.find((c) => c.id === state.activeCategoryId) || state.categories[0] || null;
}

export function setActiveCategory(categoryId) {
  state.activeCategoryId = categoryId;
  save();
}

// ---- Danh mục ---------------------------------------------------------
export function addCategory(name, emoji = "🎲") {
  const trimmed = name.trim();
  if (!trimmed) return null;
  const category = { id: uid(), name: trimmed, emoji, items: [] };
  state.categories.push(category);
  state.activeCategoryId = category.id;
  save();
  return category;
}

export function deleteCategory(categoryId) {
  state.categories = state.categories.filter((c) => c.id !== categoryId);
  delete state.history[categoryId];
  if (state.activeCategoryId === categoryId) {
    state.activeCategoryId = state.categories[0]?.id ?? null;
  }
  save();
}

// ---- Lựa chọn (items) trong 1 danh mục ---------------------------------
// image: data URL (string) hoặc null nếu chưa có ảnh.
export function addItem(categoryId, name, image = null) {
  const trimmed = name.trim();
  if (!trimmed) return null;
  const category = state.categories.find((c) => c.id === categoryId);
  if (!category) return null;
  const item = { id: uid(), name: trimmed, image };
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

/** Gắn/đổi ảnh cho 1 item đã có sẵn (vd item mặc định chưa có ảnh). */
export function updateItemImage(categoryId, itemId, image) {
  const category = state.categories.find((c) => c.id === categoryId);
  if (!category) return;
  const item = category.items.find((it) => it.id === itemId);
  if (!item) return;
  item.image = image;
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
