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

/** Chữ cái đầu để làm placeholder khi món chưa có ảnh (hoặc ảnh bị lỗi). */
function initialOf(name) {
  return (name.trim()[0] || "?").toUpperCase();
}

/**
 * "Ảnh" của 1 item: ảnh thật (nếu đường dẫn image tồn tại) đè lên trên 1
 * vòng tròn màu + chữ cái đầu. Nếu ảnh không tồn tại/lỗi (onerror), ảnh
 * tự ẩn đi, để lộ vòng tròn màu bên dưới — không bao giờ vỡ giao diện dù
 * bạn chưa kịp bỏ ảnh vào thư mục images/.
 */
export function thumbHTML(item, colorIndex, sizeClass) {
  const color = colorForIndex(colorIndex);
  const img = item.image
    ? `<img src="${item.image}" alt="" loading="lazy" onerror="this.style.display='none'" />`
    : "";
  return `
    <span class="thumb ${sizeClass}" style="--c:${color}">
      ${img}
      <span class="thumb__fallback">${initialOf(item.name)}</span>
    </span>
  `;
}

/** Thẻ 1 lựa chọn, dùng trong dải quay ngang. */
export function stripCardHTML(item, colorIndex) {
  const color = colorForIndex(colorIndex);
  return `
    <div class="strip-item" style="--c:${color}">
      ${thumbHTML(item, colorIndex, "thumb--lg")}
      <span class="strip-item__name">${escapeHTML(item.name)}</span>
    </div>
  `;
}

/** Dòng quản lý 1 lựa chọn trong danh sách (có nút xoá). */
export function manageRowHTML(item, colorIndex) {
  return `
    <li class="manage-row" data-item-id="${item.id}">
      ${thumbHTML(item, colorIndex, "thumb--sm")}
      <span class="manage-row__name">${escapeHTML(item.name)}</span>
      <button class="manage-row__del" data-remove-item="${item.id}" aria-label="Xoá ${escapeHTML(item.name)}">✕</button>
    </li>
  `;
}
