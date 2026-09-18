/**
 * roulette.js
 * -----------------------------------------------------------------------
 * Thuần logic, không đụng DOM. Nhận vào 1 mảng item {id, name, ...} bất kỳ
 * (không quan tâm đó là món ăn, trò chơi, hay thứ gì khác sau này bạn thêm)
 * và trả về kết quả ngẫu nhiên + dải hiển thị cho animation.
 * -----------------------------------------------------------------------
 */

/**
 * Chọn ngẫu nhiên 1 item trong danh sách.
 * weightFn (tuỳ chọn): (item) => number, mặc định mọi item đồng xác suất.
 * Muốn sau này 1 lựa chọn "dễ ra hơn" (vd ưu tiên món ăn hay chọn) chỉ cần
 * truyền weightFn khi gọi hàm này ở main.js.
 */
export function weightedPick(items, weightFn = () => 1) {
  const weighted = items.map((item) => ({ item, w: Math.max(0, weightFn(item)) }));
  const total = weighted.reduce((s, x) => s + x.w, 0);
  if (total <= 0) return items[Math.floor(Math.random() * items.length)];
  let r = Math.random() * total;
  for (const entry of weighted) {
    r -= entry.w;
    if (r <= 0) return entry.item;
  }
  return weighted[weighted.length - 1].item;
}

/**
 * Dựng dải item cho animation cuộn ngang: length item ngẫu nhiên (chỉ để
 * mắt nhìn thấy khi lướt qua) + item thắng thật đặt cố định ở winIndex.
 * Cần ít nhất 2 item trong `items` để dải trông đa dạng; nếu chỉ có 1 thì
 * dải sẽ lặp lại chính nó, vẫn hoạt động bình thường.
 */
export function buildStrip(items, winner, { length = 40, winIndex = 32 } = {}) {
  const strip = [];
  for (let i = 0; i < length; i++) {
    if (i === winIndex) {
      strip.push(winner);
    } else {
      strip.push(items[Math.floor(Math.random() * items.length)]);
    }
  }
  return strip;
}
