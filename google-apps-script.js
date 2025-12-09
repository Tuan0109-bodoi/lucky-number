// *** HƯỚNG DẪN SETUP ***
// 1. Mở Google Sheets của bạn
// 2. Tạo 2 sheets:
//    - Sheet1: "Registrations" (lưu đăng ký)
//    - Sheet2: "Numbers" (lưu danh sách số từ 1-140 đã shuffle)
// 3. Vào Extensions > Apps Script
// 4. Xóa code mẫu và dán toàn bộ code này vào
// 5. Chạy function initializeNumbers() MỘT LẦN để tạo danh sách số
// 6. Lưu project (đặt tên tùy ý)
// 7. Click Deploy > New deployment
// 8. Chọn type: Web app
// 9. Execute as: Me
// 10. Who has access: Anyone
// 11. Click Deploy và copy URL
// 12. Dán URL đó vào file script.js

// Hàm khởi tạo danh sách số ngẫu nhiên (chạy 1 lần duy nhất)
function initializeNumbers() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  Logger.log('Bắt đầu khởi tạo...');
  
  // Tạo hoặc lấy sheet Numbers
  let numbersSheet = ss.getSheetByName('Numbers');
  if (!numbersSheet) {
    Logger.log('Tạo sheet Numbers mới...');
    numbersSheet = ss.insertSheet('Numbers');
  } else {
    Logger.log('Sheet Numbers đã tồn tại, xóa dữ liệu cũ...');
    numbersSheet.clear();
  }
  
  // Tạo array số từ 1-140
  const numbers = Array.from({length: 140}, (_, i) => i + 1);
  Logger.log('Đã tạo array 140 số');
  
  // Shuffle array (Fisher-Yates algorithm)
  for (let i = numbers.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
  }
  Logger.log('Đã shuffle xong');
  
  // Thêm header và dữ liệu
  numbersSheet.appendRow(['Số', 'Đã dùng', 'Người dùng', 'Thời gian']);
  
  // Thêm các số đã shuffle
  numbers.forEach(num => {
    numbersSheet.appendRow([num, 'Chưa', '', '']);
  });
  
  Logger.log('✅ Hoàn thành! Đã khởi tạo ' + numbers.length + ' số ngẫu nhiên!');
  Logger.log('Kiểm tra sheet "Numbers" trong file Google Sheets');
  
  // Hiển thị thông báo
  SpreadsheetApp.getUi().alert('Thành công!', 
    'Đã tạo ' + numbers.length + ' số ngẫu nhiên trong sheet "Numbers"', 
    SpreadsheetApp.getUi().ButtonSet.OK);
}

function doGet(e) {
  return ContentService.createTextOutput("Google Apps Script đang hoạt động!");
}

function doPost(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // Lấy sheet Registrations (dev only)
    let regSheet = ss.getSheetByName('Registrations');
    if (!regSheet) {
      regSheet = ss.insertSheet('Registrations');
      regSheet.appendRow(['Thời gian', 'Họ và tên', 'Bộ phận', 'Số bốc được', 'Device ID']);
    }
    
    // Lấy sheet Danh sách (hiển thị công khai)
    let publicSheet = ss.getSheetByName('Danh sách');
    if (!publicSheet) {
      publicSheet = ss.insertSheet('Danh sách');
      publicSheet.appendRow(['STT', 'Họ và tên', 'Bộ phận', 'Số bốc được', 'Thời gian']);
      
      // Format header
      const headerRange = publicSheet.getRange(1, 1, 1, 5);
      headerRange.setBackground('#4285f4');
      headerRange.setFontColor('#ffffff');
      headerRange.setFontWeight('bold');
      headerRange.setHorizontalAlignment('center');
      
      // Set column widths
      publicSheet.setColumnWidth(1, 50);  // STT
      publicSheet.setColumnWidth(2, 200); // Họ và tên
      publicSheet.setColumnWidth(3, 150); // Bộ phận
      publicSheet.setColumnWidth(4, 100); // Số
      publicSheet.setColumnWidth(5, 180); // Thời gian
    }
    
    // Lấy sheet Numbers
    const numbersSheet = ss.getSheetByName('Numbers');
    if (!numbersSheet || numbersSheet.getLastRow() <= 1) {
      throw new Error('Chưa khởi tạo danh sách số! Vui lòng chạy function initializeNumbers() trong Apps Script.');
    }
    
    // Parse dữ liệu từ request
    const data = JSON.parse(e.postData.contents);
    const deviceId = data.deviceId || '';
    
    // TẠM TẮT - Kiểm tra xem device đã đăng ký chưa
    // if (regSheet.getLastRow() > 1 && deviceId) {
    //   const existingData = regSheet.getRange(2, 5, regSheet.getLastRow() - 1, 1).getValues();
    //   
    //   for (let row of existingData) {
    //     const existingDeviceId = String(row[0]);
    //     
    //     if (existingDeviceId === deviceId) {
    //       throw new Error('Thiết bị này đã đăng ký rồi! Mỗi thiết bị chỉ được đăng ký 1 lần.');
    //     }
    //   }
    // }
    
    // Tìm số đầu tiên chưa được sử dụng
    const numbersData = numbersSheet.getRange(2, 1, numbersSheet.getLastRow() - 1, 4).getValues();
    let selectedNumber = null;
    let selectedRow = -1;
    
    for (let i = 0; i < numbersData.length; i++) {
      if (numbersData[i][1] === 'Chưa') {
        selectedNumber = numbersData[i][0];
        selectedRow = i + 2; // +2 vì bắt đầu từ row 2 và index 0
        break;
      }
    }
    
    if (!selectedNumber) {
      throw new Error('Đã hết số! Tất cả số từ 1-140 đã được bốc hết.');
    }
    
    const timestamp = new Date().toLocaleString('vi-VN');
    
    // Cập nhật sheet Numbers
    numbersSheet.getRange(selectedRow, 2).setValue('Đã dùng');
    numbersSheet.getRange(selectedRow, 3).setValue(data.name);
    numbersSheet.getRange(selectedRow, 4).setValue(timestamp);
    
    // Thêm vào sheet Registrations (dev only)
    regSheet.appendRow([
      timestamp,
      data.name,
      data.department,
      selectedNumber,
      deviceId
    ]);
    
    // Thêm vào sheet Danh sách (public)
    const stt = publicSheet.getLastRow(); // STT tự động
    publicSheet.appendRow([
      stt,
      data.name,
      data.department,
      selectedNumber,
      timestamp
    ]);
    
    // Format row mới thêm vào
    const lastRow = publicSheet.getLastRow();
    const rowRange = publicSheet.getRange(lastRow, 1, 1, 5);
    rowRange.setHorizontalAlignment('center');
    
    // Highlight số bốc được
    publicSheet.getRange(lastRow, 4).setFontWeight('bold').setFontSize(14).setFontColor('#d32f2f');
    
    // Trả về kết quả thành công với số random
    return ContentService.createTextOutput(JSON.stringify({
      'result': 'success',
      'row': regSheet.getLastRow(),
      'randomNumber': selectedNumber
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    // Xử lý lỗi
    return ContentService.createTextOutput(JSON.stringify({
      'result': 'error',
      'error': error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Test function (không bắt buộc)
function doGet(e) {
  return ContentService.createTextOutput("Google Apps Script đang hoạt động!");
}
