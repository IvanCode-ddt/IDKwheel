/**
 * data.js
 * -----------------------------------------------------------------------
 * Dữ liệu MẶC ĐỊNH dùng khi người dùng mở web lần đầu (chưa có gì trong
 * localStorage). Sau đó mọi thay đổi (thêm danh mục, thêm/xoá lựa chọn)
 * đều do người dùng tự làm qua giao diện và được lưu trong state.js.
 *
 * Muốn có sẵn nhiều danh mục/lựa chọn hơn ngay từ đầu -> sửa mảng
 * DEFAULT_CATEGORIES bên dưới. Không cần sửa file nào khác.
 * -----------------------------------------------------------------------
 */

// Bảng màu xoay vòng cho từng lựa chọn (gán theo thứ tự, lặp lại khi hết).
export const PALETTE = [
  "#FF6B5E", "#FFB84C", "#4CD37A", "#4CC9F0", "#7C6CFF",
  "#FF63C3", "#FFD23F", "#3DDC97", "#5AA7FF", "#C77DFF",
];

export function colorForIndex(i) {
  return PALETTE[i % PALETTE.length];
}

export const DEFAULT_CATEGORIES = [
  {
    id: "an-gi",
    name: "Hôm Nay Ăn Gì",
    emoji: "🍜",
    items: [
      "Phở bò", "Bún chả", "Cơm tấm", "Bánh mì", "Bún bò Huế",
      "Cơm rang", "Mì cay", "Gà rán", "Pizza", "Lẩu",
    ],
  },
  {
    id: "choi-gi",
    name: "Hôm Nay Chơi Gì",
    emoji: "🎮",
    items: [
      "Valorant", "League of Legends", "CS2", "Xem phim",
      "Đi cà phê", "Đá bóng", "Đọc sách", "Đi dạo",
    ],
  },
];
