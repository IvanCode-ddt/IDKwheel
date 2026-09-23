/**
 * render.js
 * -----------------------------------------------------------------------
 * Hàm thuần tạo HTML/SVG. Sửa 1 chỗ ở đây, đổi giao diện ở mọi nơi dùng
 * chung template.
 * -----------------------------------------------------------------------
 */

import { colorForIndex } from "./data.js";

export function escapeHTML(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function initialOf(name) {
  return (name.trim()[0] || "?").toUpperCase();
}

/** Ảnh tròn/vuông bo góc cho 1 item: ảnh thật nếu có, hoặc chữ cái đầu. */
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

/** Thẻ 1 lựa chọn trong dải quay ngang. */
export function stripCardHTML(item, colorIndex) {
  const color = colorForIndex(colorIndex);
  return `
    <div class="strip-item" style="--c:${color}">
      ${thumbHTML(item, colorIndex, "thumb--lg")}
      <span class="strip-item__name">${escapeHTML(item.name)}</span>
    </div>
  `;
}

/** Dòng quản lý 1 lựa chọn trong danh sách bên trong hòm. */
export function manageRowHTML(item, colorIndex) {
  return `
    <li class="manage-row" data-item-id="${item.id}">
      ${thumbHTML(item, colorIndex, "thumb--sm")}
      <span class="manage-row__name">${escapeHTML(item.name)}</span>
      <button class="manage-row__del" data-remove-item="${item.id}" aria-label="Xoá ${escapeHTML(item.name)}">✕</button>
    </li>
  `;
}

/** Thẻ 1 "hòm" ở màn hình chọn hòm: ảnh bìa hòm (nếu có) + tên bên dưới. */
export function caseCardHTML(category, colorIndex) {
  const color = colorForIndex(colorIndex);
  const cover = category.image
    ? `<img src="${category.image}" alt="" loading="lazy" onerror="this.style.display='none'" />`
    : "";
  const count = category.items.length;
  return `
    <button class="case-card" data-open-case="${category.id}" style="--c:${color}">
      <span class="case-card__art">
        ${cover}
        <span class="case-card__fallback">${category.emoji}</span>
      </span>
      <span class="case-card__name">${escapeHTML(category.name)}</span>
      <span class="case-card__count">${count} lựa chọn</span>
    </button>
  `;
}

/** Hòm vàng mặc định (2D, tự vẽ bằng SVG) — hiện lúc chưa bấm mở.
 *  Chia làm 2 lớp riêng (thân + nắp) để nắp có thể "bật mở" bằng CSS,
 *  xem .case-visual--open trong style.css. */
export function defaultCrateSVG() {
  return `
    <div class="crate">
      <svg viewBox="0 0 200 160" class="crate-body-svg" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="crateBodyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#FFE27A" />
            <stop offset="100%" stop-color="#E0A62A" />
          </linearGradient>
        </defs>
        <rect x="20" y="70" width="160" height="78" rx="10" fill="url(#crateBodyGrad)" stroke="#8A5A12" stroke-width="4" />
        <rect x="20" y="70" width="160" height="20" fill="#8A5A12" opacity="0.25" />
        <rect x="88" y="86" width="24" height="24" rx="4" fill="#8A5A12" />
        <rect x="94" y="92" width="12" height="12" rx="2" fill="#FFE27A" />
        <line x1="20" y1="110" x2="180" y2="110" stroke="#8A5A12" stroke-width="3" opacity="0.5" />
      </svg>
      <svg viewBox="0 0 200 160" class="crate-lid-svg" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="crateLidGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#FFD23F" />
            <stop offset="100%" stop-color="#F0B429" />
          </linearGradient>
        </defs>
        <rect x="14" y="44" width="172" height="34" rx="8" fill="url(#crateLidGrad)" stroke="#8A5A12" stroke-width="4" />
      </svg>
    </div>
  `;
}

/** Danh sách thông số (stats) của 1 item ở màn hình kết quả. */
export function statsListHTML(item) {
  const stats = item.stats || [];
  if (stats.length === 0) return "";
  return `
    <ul class="result-stats">
      ${stats
        .map((s) => `<li><span class="result-stats__label">${escapeHTML(s.label)}</span><span class="result-stats__value">${s.value ? escapeHTML(s.value) : "—"}</span></li>`)
        .join("")}
    </ul>
  `;
}

/** Đoạn review ngắn của item, hoặc gợi ý cho người chưa điền. */
export function reviewHTML(item) {
  const text = item.review && item.review.trim()
    ? escapeHTML(item.review)
    : "Chưa có mô tả cho món này — bạn có thể tự thêm ở field \"review\" trong js/data.js.";
  return `<p class="result-review">${text}</p>`;
}
