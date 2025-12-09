# Hướng dẫn kết nối Form với Google Sheets

## Bước 1: Tạo Google Sheet

1. Truy cập [Google Sheets](https://sheets.google.com)
2. Tạo sheet mới
3. Đặt tên cho sheet (ví dụ: "Danh sách đăng ký")

## Bước 2: Thiết lập Google Apps Script

1. Trong Google Sheet, vào **Extensions** > **Apps Script**
2. Xóa code mặc định
3. Copy toàn bộ nội dung từ file `google-apps-script.js` và paste vào
4. Click **Save** (icon đĩa mềm) và đặt tên project

## Bước 3: Deploy Web App

1. Click **Deploy** > **New deployment**
2. Click icon ⚙️ bên cạnh "Select type" > chọn **Web app**
3. Điền thông tin:
   - **Description**: "Form to Sheets" (tùy chọn)
   - **Execute as**: **Me** (your email)
   - **Who has access**: **Anyone**
4. Click **Deploy**
5. Có thể cần xác thực:
   - Click **Authorize access**
   - Chọn tài khoản Google
   - Click **Advanced** > **Go to [tên project]**
   - Click **Allow**
6. **QUAN TRỌNG**: Copy **Web app URL** (dạng: https://script.google.com/macros/s/...)

## Bước 4: Cập nhật URL trong code

1. Mở file `script.js`
2. Tìm dòng:
   ```javascript
   const SCRIPT_URL = 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE';
   ```
3. Thay thế bằng URL vừa copy:
   ```javascript
   const SCRIPT_URL = 'https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec';
   ```
4. Lưu file

## Bước 5: Test

1. Mở `index.html` bằng trình duyệt
2. Điền form và submit
3. Kiểm tra Google Sheet để xem dữ liệu đã được thêm vào chưa

## Lưu ý

- Mỗi lần sửa code trong Apps Script, cần deploy lại (hoặc dùng deployment hiện tại)
- Dữ liệu sẽ được thêm vào sheet theo thứ tự: Thời gian, Họ và tên, Bộ phận
- Nếu gặp lỗi CORS, đừng lo - mode 'no-cors' đã được xử lý

## Troubleshooting

**Lỗi: "Script function not found"**
- Đảm bảo đã copy đúng code vào Apps Script
- Kiểm tra function name là `doPost`

**Dữ liệu không xuất hiện trong Sheet**
- Kiểm tra URL có đúng không
- Mở Console (F12) để xem lỗi
- Đảm bảo "Who has access" là "Anyone"

**Cần sửa lại deployment**
- Vào Apps Script > Deploy > Manage deployments
- Click Edit > Save lại
