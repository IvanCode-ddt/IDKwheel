/**
 * render.js
 * -----------------------------------------------------------------------
 * Hàm thuần tạo HTML cho 1 lựa chọn (item). Dùng chung cho dải quay,
 * danh sách quản lý, và kết quả — sửa 1 chỗ, đổi giao diện mọi nơi.
 * -----------------------------------------------------------------------
 */

import { colorForIndex } from "./data.js";

export function escapeHTML(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

/** Thẻ 1 lựa chọn, dùng trong dải quay ngang. */
export function stripCardHTML(item, colorIndex) {
  const color = colorForIndex(colorIndex);
  return `
    <div class="strip-item" style="--c:${color}">
      <span class="strip-item__dot"></span>
      <span class="strip-item__name">${escapeHTML(item.name)}</span>
    </div>
  `;
}

/** Dòng quản lý 1 lựa chọn trong danh sách (có nút xoá). */
export function manageRowHTML(item, colorIndex) {
  const color = colorForIndex(colorIndex);
  return `
    <li class="manage-row" style="--c:${color}" data-item-id="${item.id}">
      <span class="manage-row__dot"></span>
      <span class="manage-row__name">${escapeHTML(item.name)}</span>
      <button class="manage-row__del" data-remove-item="${item.id}" aria-label="Xoá ${escapeHTML(item.name)}">✕</button>
    </li>
  `;
}
