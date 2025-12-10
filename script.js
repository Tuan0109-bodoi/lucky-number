// Countdown Timer
function updateCountdown() {
    // Set target time - 2 hours 28 minutes 54 seconds from now
    const targetTime = new Date().getTime() + (2 * 60 * 60 * 1000) + (28 * 60 * 1000) + (54 * 1000);

    function update() {
        const now = new Date().getTime();
        const distance = targetTime - now;

        if (distance < 0) {
            // Timer ended
            document.getElementById('days').textContent = '00';
            document.getElementById('hours').textContent = '00';
            document.getElementById('minutes').textContent = '00';
            document.getElementById('seconds').textContent = '00';
            return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        document.getElementById('days').textContent = String(days).padStart(2, '0');
        document.getElementById('hours').textContent = String(hours).padStart(2, '0');
        document.getElementById('minutes').textContent = String(minutes).padStart(2, '0');
        document.getElementById('seconds').textContent = String(seconds).padStart(2, '0');
    }

    update();
    setInterval(update, 1000);
}

// *** HƯỚNG DẪN SETUP GOOGLE SHEETS ***
// 1. Mở Google Sheets, tạo sheet mới
// 2. Vào Tools > Script editor
// 3. Dán code từ file google-apps-script.js vào
// 4. Deploy > New deployment > Web app
// 5. Execute as: Me
// 6. Who has access: Anyone
// 7. Copy URL và thay thế vào SCRIPT_URL bên dưới

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzyTtBaeau7TkvgGi1divOB5rio8DuMp-kp2itOSwuGyJxBU-xE1MKTsh0usjcdCVW3/exec'; // Thay bằng URL từ Google Apps Script

// Tạo hoặc lấy Device ID (để tránh 1 thiết bị submit nhiều lần)
function getDeviceId() {
    let deviceId = localStorage.getItem('deviceId');
    if (!deviceId) {
        deviceId = 'device_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('deviceId', deviceId);
    }
    return deviceId;
}

// Kiểm tra xem đã submit chưa
function checkAlreadySubmitted() {
    return localStorage.getItem('hasSubmitted') === 'true';
}

// Đánh dấu đã submit
function markAsSubmitted() {
    localStorage.setItem('hasSubmitted', 'true');
}

// Form submission
document.getElementById('registrationForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const submitButton = this.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    const name = document.getElementById('name').value;
    const department = document.getElementById('color').value;

    // Disable button và hiển thị loading
    submitButton.disabled = true;
    submitButton.textContent = 'Đang kiểm tra...';

    // Bước 1: Kiểm tra đã đăng ký chưa
    fetch(`${SCRIPT_URL}?action=check&name=${encodeURIComponent(name)}&department=${encodeURIComponent(department)}`)
        .then(response => response.text())
        .then(text => {
            let checkData;
            try {
                checkData = JSON.parse(text);
            } catch (e) {
                console.error('Response không phải JSON:', text);
                throw new Error('Lỗi kết nối. Vui lòng thử lại.');
            }

            if (checkData.error) {
                throw new Error(checkData.error);
            }

            if (checkData.exists) {
                // Đã đăng ký rồi, hiển thị số cũ
                submitButton.disabled = false;
                submitButton.textContent = originalText;
                alert(`Bạn đã đăng ký rồi!\nSố của bạn là: ${checkData.number}`);
                showNumberModal(checkData.number);
                return null; // Signal to skip next then
            }

            return checkData; // Chưa đăng ký, tiếp tục
        })
        .then(checkData => {
            if (!checkData) return null; // Đã đăng ký rồi, skip

            // Bước 2: Chưa đăng ký, tiến hành submit
            submitButton.textContent = 'Đang gửi...';

            const formData = {
                name: name,
                department: department,
                timestamp: new Date().toLocaleString('vi-VN'),
                deviceId: getDeviceId()
            };

            return fetch(SCRIPT_URL, {
                method: 'POST',
                body: JSON.stringify(formData)
            });
        })
        .then(response => {
            if (!response) return null; // Đã đăng ký rồi, skip
            return response.text();
        })
        .then(text => {
            if (!text) return; // Đã đăng ký rồi, skip

            const data = JSON.parse(text);
            if (data.result === 'success' && data.randomNumber) {
                // Lưu số vào localStorage để có thể hiển thị lại
                localStorage.setItem('lastNumber', data.randomNumber);
                localStorage.setItem('lastNumberTime', Date.now());

                // Hiển thị số trong modal đẹp
                showNumberModal(data.randomNumber);
                // Reset form
                document.getElementById('registrationForm').reset();
            } else if (data.result === 'error') {
                alert('Có lỗi xảy ra: ' + (data.error || 'Vui lòng thử lại'));
            } else {
                alert('Có lỗi xảy ra. Vui lòng thử lại sau.');
            }
        })
        .catch((error) => {
            console.error('Error details:', error);
            alert('Có lỗi xảy ra: ' + error.message);
        })
        .finally(() => {
            // Enable button
            submitButton.disabled = false;
            submitButton.textContent = originalText;
        });
});

// Hàm hiển thị modal với số
function showNumberModal(number) {
    const modal = document.getElementById('resultModal');
    const numberDisplay = document.getElementById('numberDisplay');

    numberDisplay.textContent = number;
    modal.classList.add('show');

    // Tạo hiệu ứng confetti
    createConfetti();
}

// Hàm đóng modal
function closeModal() {
    const modal = document.getElementById('resultModal');
    modal.classList.remove('show');
}

// Tạo hiệu ứng confetti
function createConfetti() {
    const colors = ['#ffd700', '#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24'];
    const modalContent = document.querySelector('.modal-content');

    for (let i = 0; i < 30; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.animationDelay = Math.random() * 2 + 's';
            confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';
            modalContent.appendChild(confetti);

            setTimeout(() => confetti.remove(), 5000);
        }, i * 50);
    }
}

// Đóng modal khi click bên ngoài
window.onclick = function (event) {
    const modal = document.getElementById('resultModal');
    if (event.target === modal) {
        closeModal();
    }
}

// Kiểm tra và hiển thị lại số khi load trang (trong vòng 5 phút)
window.addEventListener('DOMContentLoaded', function () {
    const lastNumber = localStorage.getItem('lastNumber');
    const lastNumberTime = localStorage.getItem('lastNumberTime');

    if (lastNumber && lastNumberTime) {
        const timeElapsed = Date.now() - parseInt(lastNumberTime);
        const fiveMinutes = 5 * 60 * 1000;

        // Nếu submit trong vòng 5 phút, hiển thị lại số
        if (timeElapsed < fiveMinutes) {
            setTimeout(() => {
                showNumberModal(parseInt(lastNumber));
            }, 500);
        } else {
            // Xóa số cũ nếu quá 5 phút
            localStorage.removeItem('lastNumber');
            localStorage.removeItem('lastNumberTime');
        }
    }
});
