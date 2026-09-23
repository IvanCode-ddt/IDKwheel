/**
 * data.js
 * -----------------------------------------------------------------------
 * Dữ liệu MẶC ĐỊNH dùng khi mở web lần đầu (chưa có gì trong localStorage).
 * Mọi thay đổi sau đó (thêm hòm, thêm/xoá lựa chọn) do người dùng tự làm
 * qua giao diện, lưu trong state.js.
 *
 * ẢNH:
 * - Ảnh "bìa hòm" (hiện ở màn hình chọn hòm)  -> field image của CATEGORY,
 *   đường dẫn dạng images/case-<ten-hom>.jpg
 * - Ảnh món/lựa chọn (hiện khi quay ra)       -> field image của ITEM,
 *   đường dẫn dạng images/<ten-mon>.jpg
 * Cứ thả đúng file ảnh vào thư mục images/ ở gốc project, đúng tên như
 * bên dưới, ảnh sẽ tự hiện lên. Chưa có ảnh thì tự hiện icon/màu thay thế.
 *
 * REVIEW & THÔNG SỐ (stats): mỗi món có sẵn khung "review" (1 đoạn mô tả
 * ngắn) và "stats" (vài dòng thông số kiểu Độ ngon / Giá / Thời gian chờ).
 * Mặc định để trống (null) -> giao diện tự hiện "—" hoặc gợi ý điền. Bạn
 * tự viết nội dung thật vào đây khi rảnh, không bắt buộc phải điền hết.
 * -----------------------------------------------------------------------
 */

/**
 * NÚT "GÓP Ý": dán link NHÚNG (embed) Google Form của bạn vào đây.
 * Cách lấy link: tạo form tại forms.google.com -> bấm "Gửi" (Send) -> tab
 * "<>" (Embed) -> copy phần link trong dấu ngoặc kép sau src=.
 * Để trống ("") thì nút Góp Ý sẽ báo cho người xem biết là chưa cấu hình,
 * không bị lỗi vỡ giao diện.
 */
export const FEEDBACK_FORM_URL = "";

export const PALETTE = [
  "#FF6B5E", "#FFB84C", "#4CD37A", "#4CC9F0", "#7C6CFF",
  "#FF63C3", "#FFD23F", "#3DDC97", "#5AA7FF", "#C77DFF",
];

export function colorForIndex(i) {
  return PALETTE[i % PALETTE.length];
}

export function slugify(str) {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function itemImagePath(name) {
  return `images/${slugify(name)}.jpg`;
}

export function caseImagePath(name) {
  return `images/case-${slugify(name)}.jpg`;
}

function defaultStats() {
  return [
    { label: "Độ ngon", value: null },
    { label: "Mức giá", value: null },
    { label: "Thời gian chờ", value: null },
  ];
}

function foodItem(name) {
  return {
    name,
    image: itemImagePath(name),
    review: null, // vd: "Đậm đà, nhiều topping, ăn buổi trưa hợp nhất."
    stats: defaultStats(),
  };
}

function caseOf(id, name, emoji, itemNames) {
  return {
    id,
    name,
    emoji,
    image: caseImagePath(name),
    items: itemNames.map(foodItem),
  };
}

export const DEFAULT_CATEGORIES = [
  caseOf("com-suat", "Cơm Suất", "🍱", [
    "Cơm tấm sườn bì chả", "Cơm bình dân tự chọn", "Cơm rang dưa bò",
    "Cơm gà xối mỡ", "Cơm gà xé", "Cơm trộn Hàn Quốc", "Cơm cà ri Nhật",
  ]),
  caseOf("banh-mi-mon-nhanh", "Bánh Mì & Món Nhanh", "🥖", [
    "Bánh mì pate/chả/thịt nướng", "Bánh mì chảo",
    "Xôi mặn/xôi xéo thập cẩm", "Gà rán và khoai tây chiên",
    "Burger", "Pizza",
  ]),
  caseOf("mon-nuoc", "Món Nước Đóng Hộp Tiện Lợi", "🍜", [
    "Phở bò/gà", "Bún bò Huế", "Bún riêu cua", "Bún thịt nướng",
    "Hủ tiếu Nam Vang/gõ", "Mì Quảng", "Bánh canh giò heo/cua",
  ]),
  caseOf("mi-tron-an-lien", "Mì Trộn & Ăn Liền", "🍝", [
    "Mì trộn Indomie thập cẩm trứng lòng đào", "Mì xào bò",
    "Nui xào bò", "Mì Ý sốt bò băm",
  ]),
  caseOf("do-an-vat", "Đồ Ăn Vặt / Bữa Xế", "🍡", [
    "Bánh tráng trộn/cuộn", "Kimbap chiên", "Tokbokki",
    "Gỏi cuốn", "Bánh bột lọc",
  ]),
  caseOf("nuoc-trang-mieng", "Nước & Tráng Miệng", "🧋", [
    "Trà sữa", "Cà phê/bạc xỉu", "Trà đào cam sả", "Chè bưởi/thái",
  ]),
  caseOf("choi-gi", "Hôm Nay Chơi Gì", "🎮", [
    "Valorant", "League of Legends", "CS2", "Xem phim",
    "Đi cà phê", "Đá bóng", "Đọc sách", "Đi dạo",
  ]),
];
