/**
 * data.js
 * -----------------------------------------------------------------------
 * Dữ liệu MẶC ĐỊNH dùng khi người dùng mở web lần đầu (chưa có gì trong
 * localStorage). Sau đó mọi thay đổi (thêm danh mục, thêm/xoá lựa chọn)
 * đều do người dùng tự làm qua giao diện và được lưu trong state.js.
 *
 * ẢNH: mỗi món có field "image" trỏ tới file trong thư mục /images.
 * Muốn gắn ảnh cho món nào -> chỉ cần bỏ đúng file ảnh vào thư mục
 * "images/" ở gốc project, đặt đúng tên như trong "image" bên dưới.
 * Chưa có ảnh -> cứ để nguyên, web tự hiện vòng tròn màu + chữ cái đầu
 * thay thế, không lỗi gì cả.
 *
 * Muốn có sẵn nhiều danh mục/lựa chọn hơn -> sửa DEFAULT_CATEGORIES bên
 * dưới. Không cần sửa file nào khác.
 * -----------------------------------------------------------------------
 */

// Bảng màu xoay vòng, dùng làm nền cho vòng tròn thay thế khi món chưa có ảnh.
export const PALETTE = [
  "#FF6B5E", "#FFB84C", "#4CD37A", "#4CC9F0", "#7C6CFF",
  "#FF63C3", "#FFD23F", "#3DDC97", "#5AA7FF", "#C77DFF",
];

export function colorForIndex(i) {
  return PALETTE[i % PALETTE.length];
}

// Tự sinh đường dẫn ảnh từ tên món, vd "Cơm tấm sườn bì chả"
// -> "images/com-tam-suon-bi-cha.jpg". Bạn chỉ cần đặt file ảnh đúng tên
// này (đuôi .jpg) vào thư mục images/ là ảnh sẽ tự hiện lên.
function slugify(str) {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function withImage(name) {
  return { name, image: `images/${slugify(name)}.jpg` };
}

export const DEFAULT_CATEGORIES = [
  {
    id: "com-suat",
    name: "Cơm Suất",
    emoji: "🍱",
    items: [
      "Cơm tấm sườn bì chả", "Cơm bình dân tự chọn", "Cơm rang dưa bò",
      "Cơm gà xối mỡ", "Cơm gà xé", "Cơm trộn Hàn Quốc", "Cơm cà ri Nhật",
    ].map(withImage),
  },
  {
    id: "banh-mi-mon-nhanh",
    name: "Bánh Mì & Món Nhanh",
    emoji: "🥖",
    items: [
      "Bánh mì pate/chả/thịt nướng", "Bánh mì chảo",
      "Xôi mặn/xôi xéo thập cẩm", "Gà rán và khoai tây chiên",
      "Burger", "Pizza",
    ].map(withImage),
  },
  {
    id: "mon-nuoc",
    name: "Món Nước Đóng Hộp Tiện Lợi",
    emoji: "🍜",
    items: [
      "Phở bò/gà", "Bún bò Huế", "Bún riêu cua", "Bún thịt nướng",
      "Hủ tiếu Nam Vang/gõ", "Mì Quảng", "Bánh canh giò heo/cua",
    ].map(withImage),
  },
  {
    id: "mi-tron-an-lien",
    name: "Mì Trộn & Ăn Liền",
    emoji: "🍝",
    items: [
      "Mì trộn Indomie thập cẩm trứng lòng đào", "Mì xào bò",
      "Nui xào bò", "Mì Ý sốt bò băm",
    ].map(withImage),
  },
  {
    id: "do-an-vat",
    name: "Đồ Ăn Vặt / Bữa Xế",
    emoji: "🍡",
    items: [
      "Bánh tráng trộn/cuộn", "Kimbap chiên", "Tokbokki",
      "Gỏi cuốn", "Bánh bột lọc",
    ].map(withImage),
  },
  {
    id: "nuoc-trang-mieng",
    name: "Nước & Tráng Miệng",
    emoji: "🧋",
    items: [
      "Trà sữa", "Cà phê/bạc xỉu", "Trà đào cam sả", "Chè bưởi/thái",
    ].map(withImage),
  },
  {
    id: "choi-gi",
    name: "Hôm Nay Chơi Gì",
    emoji: "🎮",
    items: [
      "Valorant", "League of Legends", "CS2", "Xem phim",
      "Đi cà phê", "Đá bóng", "Đọc sách", "Đi dạo",
    ].map(withImage),
  },
];
