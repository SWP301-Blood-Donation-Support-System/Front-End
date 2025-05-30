// Language switcher functionality
document.addEventListener('DOMContentLoaded', function() {
    // Get the language toggle button
    const languageToggle = document.getElementById('languageToggle');
    
    // Check if there's a saved language preference
    let currentLang = localStorage.getItem('language') || 'vi';
    
    // Set initial state based on saved preference
    if (currentLang === 'vi') {
        changeToVietnamese();
    }
    
    // Add click event listener to the language toggle button
    languageToggle.addEventListener('click', function() {
        // Toggle between English and Vietnamese
        if (currentLang === 'en') {
            changeToVietnamese();
            currentLang = 'vi';
        } else {
            changeToEnglish();
            currentLang = 'en';
        }
        
        // Save the language preference
        localStorage.setItem('language', currentLang);
    });
    
    // Function to change language to Vietnamese
    function changeToVietnamese() {
        // Update the button text
        document.querySelector('.language-text').textContent = 'English';
        
        // Replace text elements with Vietnamese translations
        const translations = getVietnameseTranslations();
        translatePage(translations);
        
        // Update Vietnam-specific data
        updateLocationData();
    }
    
    // Function to change language back to English
    function changeToEnglish() {
        // Update the button text
        document.querySelector('.language-text').textContent = 'Tiếng Việt';
        
        // For find-drive page, restore original blood drives
        if (window.originalBloodDrives) {
            window.bloodDrives = window.originalBloodDrives;
            
            // If results are currently displayed, refresh them
            const resultsContainer = document.getElementById('bloodDriveResults');
            if (resultsContainer && resultsContainer.style.display !== 'none') {
                displaySearchResults(window.bloodDrives);
            }
        }
        
        // For donate page, restore original donation locations
        const donationLocation = document.getElementById('donationLocation');
        if (donationLocation) {
            // Clear existing options
            while (donationLocation.options.length > 1) {
                donationLocation.remove(1);
            }
            
            // Add English locations back
            const englishLocations = [
                { value: 'center1', text: 'Main Donation Center' },
                { value: 'center2', text: 'Downtown Location' },
                { value: 'center3', text: 'West Side Center' },
                { value: 'mobile', text: 'Mobile Blood Drive (Check Schedule)' }
            ];
            
            englishLocations.forEach(location => {
                const option = document.createElement('option');
                option.value = location.value;
                option.textContent = location.text;
                donationLocation.appendChild(option);
            });
        }
        
        // Restore all English text by using the English translations
        const englishTranslations = getEnglishTranslations();
        translatePage(englishTranslations);
    }
    
    // Function to replace text content with translations
    function translatePage(translations) {
        // Loop through the translation keys
        for (const selector in translations) {
            // Find elements matching the selector
            const elements = document.querySelectorAll(selector);
            
            // Update each matching element
            elements.forEach(element => {
                if (translations[selector].html) {
                    element.innerHTML = translations[selector].text;
                } else {
                    element.textContent = translations[selector].text;
                }
            });
        }
    }
    
    // Function to update location data for Vietnam
    function updateLocationData() {
        // Update blood drive locations if on the find-drive page
        if (window.bloodDrives) {
            // Save original blood drives if not saved yet
            if (!window.originalBloodDrives) {
                window.originalBloodDrives = [...window.bloodDrives];
            }
            
            // Replace with Vietnam locations
            window.bloodDrives = getVietnameseBloodDrives();
            
            // If the results are currently displayed, refresh them
            const resultsContainer = document.getElementById('bloodDriveResults');
            if (resultsContainer && resultsContainer.style.display !== 'none') {
                displaySearchResults(window.bloodDrives);
            }
        }
        
        // Update donation locations if on the donate page
        const donationLocation = document.getElementById('donationLocation');
        if (donationLocation) {
            // Clear existing options
            while (donationLocation.options.length > 1) {
                donationLocation.remove(1);
            }
            
            // Add Vietnamese locations
            const vietnamLocations = [
                { value: 'center1', text: 'Bệnh viện Huyết học và Truyền máu (TP.HCM)' },
                { value: 'center2', text: 'Viện Huyết học - Truyền máu TW (Hà Nội)' },
                { value: 'center3', text: 'Bệnh viện Chợ Rẫy (TP.HCM)' },
                { value: 'mobile', text: 'Điểm hiến máu lưu động (Xem lịch)' }
            ];
            
            vietnamLocations.forEach(location => {
                const option = document.createElement('option');
                option.value = location.value;
                option.textContent = location.text;
                donationLocation.appendChild(option);
            });
        }
    }
    
    // Function to get English translations
    function getEnglishTranslations() {
        return {
            // Header & Navigation
            '.navbar-brand span': { text: 'Blood Services' },
            '.nav-item:nth-child(1) .nav-link': { text: 'Donate Blood' },
            '.nav-item:nth-child(2) .nav-link': { text: 'Hosting a Blood Drive' },
            '.nav-item:nth-child(3) .nav-link': { text: 'Biomedical Services' },
            '.ms-3 a.btn-outline-secondary': { text: 'Sign In' },
            '.ms-3 a.btn-danger': { text: 'Find a Blood Drive' },
            
            // Hero section on donate page
            '.bg-danger h1.display-4': { text: 'Donate Blood, Save Lives' },
            '.bg-danger p.fs-5': { text: 'Your donation can help save up to 3 lives. The donation process is safe, simple, and only takes about an hour from start to finish.' },
            '.bg-danger a.btn-light': { text: 'SCHEDULE NOW' },
            
            // Donation Process Section
            '#process h2.display-5': { text: 'The Donation Process' },
            '#process .col-md-3:nth-child(1) h3': { text: 'Registration' },
            '#process .col-md-3:nth-child(1) p': { text: 'Sign in, show ID, and read information about donating blood.' },
            '#process .col-md-3:nth-child(2) h3': { text: 'Health History' },
            '#process .col-md-3:nth-child(2) p': { text: 'Answer questions about your health history and have a mini-physical.' },
            '#process .col-md-3:nth-child(3) h3': { text: 'Donation' },
            '#process .col-md-3:nth-child(3) p': { text: 'Relax while giving blood, which usually takes 8-10 minutes.' },
            '#process .col-md-3:nth-child(4) h3': { text: 'Refreshments' },
            '#process .col-md-3:nth-child(4) p': { text: 'Enjoy refreshments while you rest for 10-15 minutes before leaving.' },
            
            // Eligibility Section
            '#eligibility h2.display-5': { text: 'Eligibility Requirements' },
            '#eligibility p.lead': { text: 'Most people can donate blood. Here are some basic requirements:' },
            '#eligibility .list-group-item:nth-child(1)': { text: '<i class="fas fa-check text-success me-2"></i> Be at least 17 years old (16 with parental consent in some states)', html: true },
            '#eligibility .list-group-item:nth-child(2)': { text: '<i class="fas fa-check text-success me-2"></i> Weigh at least 110 pounds', html: true },
            '#eligibility .list-group-item:nth-child(3)': { text: '<i class="fas fa-check text-success me-2"></i> Be in good general health and feeling well', html: true },
            '#eligibility .list-group-item:nth-child(4)': { text: '<i class="fas fa-check text-success me-2"></i> No tattoos or piercings within the past 3 months', html: true },
            '#eligibility .list-group-item:nth-child(5)': { text: '<i class="fas fa-check text-success me-2"></i> Have not donated blood in the last 56 days', html: true },
            '#eligibility p:last-of-type': { text: 'For a complete list of eligibility requirements or to check if you can donate:' },
            '#eligibility a.btn-danger': { text: 'Check Your Eligibility' },
            
            // Types of Donations Section
            '#donation-types h2.display-5': { text: 'Types of Blood Donations' },
            '#donation-types .col-md-6:nth-child(1) h3': { text: 'Whole Blood' },
            '#donation-types .col-md-6:nth-child(2) h3': { text: 'Power Red' },
            '#donation-types .col-md-6:nth-child(3) h3': { text: 'Platelets' },
            '#donation-types .col-md-6:nth-child(4) h3': { text: 'Plasma' },
              // Schedule Appointment Section
            '#schedule .card-header h2': { text: 'Schedule Your Donation' },
            'label[for="donationFullName"]': { text: 'Full Name <span class="text-danger">*</span>', html: true },
            'label[for="donationEmail"]': { text: 'Email <span class="text-danger">*</span>', html: true },
            'label[for="donationPhone"]': { text: 'Phone Number <span class="text-danger">*</span>', html: true },
            'label[for="donationType"]': { text: 'Donation Type <span class="text-danger">*</span>', html: true },
            'label[for="donationDate"]': { text: 'Date <span class="text-danger">*</span>', html: true },
            'label[for="donationTime"]': { text: 'Time <span class="text-danger">*</span>', html: true },
            'label[for="donationLocation"]': { text: 'Location <span class="text-danger">*</span>', html: true },
            'label[for="donationComments"]': { text: 'Additional Information' },
            'label[for="firstTimeDonor"]': { text: 'This is my first time donating' },
            '#donationForm button[type="submit"]': { text: 'Schedule Appointment' },
            
            // FAQ Section
            'section:nth-of-type(5) h2.display-5': { text: 'Frequently Asked Questions' },
            '#headingOne button': { text: 'Does donating blood hurt?' },
            '#headingTwo button': { text: 'How long does blood donation take?' },
            '#headingThree button': { text: 'How much blood is taken?' },
            '#headingFour button': { text: 'Can I donate if I just got a tattoo or piercing?' },
            '#headingFive button': { text: 'What should I do before and after donating?' },
            
            // Find Drive page hero section
            '.bg-danger h1:contains("Find a Blood Drive")': { text: 'Find a Blood Drive Near You' },
            '.bg-danger p:contains("Enter your location")': { text: 'Enter your location to find blood drives in your area. Your donation can help save up to 3 lives.' },
            'label[for="zipCode"]': { text: 'Zip Code' },
            'label[for="radius"]': { text: 'Radius' },
            '.col-md-2 button': { text: 'Search' },
            
            // Map section
            '#mapPlaceholder h4': { text: 'Blood Drive Map' },
            '#mapPlaceholder p': { text: 'Enter your location to view blood drives on the map' },
            '#searchResults h2': { text: 'Nearby Blood Drives' },
            '#noResultsMessage div': { text: 'Enter a zip code to find blood drives in your area.' },
            
            // Filter section
            '.card-header h3': { text: 'Filter Results' },
            'label:contains("Date Range")': { text: 'Date Range' },
            'label:contains("Time of Day")': { text: 'Time of Day' },
            'label[for="morningFilter"]': { text: 'Morning (8AM-12PM)' },
            'label[for="afternoonFilter"]': { text: 'Afternoon (12PM-5PM)' },
            'label[for="eveningFilter"]': { text: 'Evening (5PM-8PM)' },
            'label:contains("Location Type")': { text: 'Location Type' },
            'label[for="centerFilter"]': { text: 'Donation Center' },
            'label[for="mobileFilter"]': { text: 'Mobile Blood Drive' },
            '#filterForm button': { text: 'Apply Filters' },
            
            // Blood Donation Tips
            '.card-title.text-danger': { text: 'Blood Donation Tips' },
            '.card-body li:nth-child(1)': { text: '<i class="fas fa-tint text-danger me-2"></i> Drink plenty of water before donating', html: true },
            '.card-body li:nth-child(2)': { text: '<i class="fas fa-utensils text-danger me-2"></i> Eat a healthy meal before your appointment', html: true },
            '.card-body li:nth-child(3)': { text: '<i class="fas fa-id-card text-danger me-2"></i> Bring your ID and donor card if you have one', html: true },
            '.card-body li:nth-child(4)': { text: '<i class="fas fa-tshirt text-danger me-2"></i> Wear a shirt with sleeves that can be rolled up', html: true },
            '.card-body a.btn-outline-danger': { text: 'Learn More About Donating' },
            
            // Featured Drives Section
            '.py-5 h2.display-6': { text: 'Featured Blood Drives' },
            '.badge.bg-danger.mb-2': { text: 'Urgent Need' },
            '.badge.bg-success.mb-2': { text: 'High Capacity' },
            '.badge.bg-primary.mb-2': { text: 'New Location' },
            '.d-grid .btn-outline-danger': { text: 'Schedule Appointment' },
            
            // CTA Section
            '.card.bg-danger h2': { text: 'Host Your Own Blood Drive' },
            '.card.bg-danger p.lead': { text: 'Make an even bigger impact in your community by hosting a blood drive at your workplace, school or organization.' },
            '.card.bg-danger a.btn-light': { text: 'Learn About Hosting' },
            
            // Footer
            'footer h5:contains("About Us")': { text: 'About Us' },
            'footer h5:contains("Donate Blood")': { text: 'Donate Blood' },
            'footer h5:contains("Host a Drive")': { text: 'Host a Drive' },
            'footer h5:contains("Connect")': { text: 'Connect With Us' },
            'footer p.small:contains("Sign up")': { text: 'Sign up for our newsletter to stay informed about blood donation news and opportunities.' },
            'footer input[type="email"]': { placeholder: 'Your email' },
            'footer button.btn-danger': { text: 'Subscribe' },
            'footer .text-white-50:contains("rights reserved")': { text: '© 2023 Blood Donation Support System. All rights reserved.' },
            'footer a:contains("Privacy")': { text: 'Privacy Policy' },
            'footer a:contains("Terms")': { text: 'Terms of Service' },
            'footer a:contains("Contact")': { text: 'Contact Us' }
        };
    }
    
    // Vietnamese translations for the site content
    function getVietnameseTranslations() {
        return {
            // Header & Navigation
            '.navbar-brand span': { text: 'Dịch vụ Hiến máu' },
            '.nav-item:nth-child(1) .nav-link': { text: 'Hiến Máu' },
            '.nav-item:nth-child(2) .nav-link': { text: 'Tổ Chức Hiến Máu' },
            '.nav-item:nth-child(3) .nav-link': { text: 'Dịch Vụ Y Sinh' },
            '.ms-3 a.btn-outline-secondary': { text: 'Đăng Nhập' },
            '.ms-3 a.btn-danger': { text: 'Tìm Điểm Hiến Máu' },
            
            // Hero section on donate page
            '.bg-danger h1.display-4': { text: 'Hiến Máu, Cứu Sống Nhiều Người' },
            '.bg-danger p.fs-5': { text: 'Sự đóng góp của bạn có thể giúp cứu sống tới 3 người. Quy trình hiến máu an toàn, đơn giản và chỉ mất khoảng một giờ từ đầu đến cuối.' },
            '.bg-danger a.btn-light': { text: 'ĐĂNG KÝ NGAY' },
            
            // Donation Process Section
            '#process h2.display-5': { text: 'Quy Trình Hiến Máu' },
            '#process .col-md-3:nth-child(1) h3': { text: 'Đăng Ký' },
            '#process .col-md-3:nth-child(1) p': { text: 'Đăng ký, xuất trình CMND/CCCD và đọc thông tin về hiến máu.' },
            '#process .col-md-3:nth-child(2) h3': { text: 'Sức Khỏe' },
            '#process .col-md-3:nth-child(2) p': { text: 'Trả lời câu hỏi về sức khỏe và kiểm tra sức khỏe cơ bản.' },
            '#process .col-md-3:nth-child(3) h3': { text: 'Hiến Máu' },
            '#process .col-md-3:nth-child(3) p': { text: 'Thư giãn trong khi hiến máu, thường mất 8-10 phút.' },
            '#process .col-md-3:nth-child(4) h3': { text: 'Nghỉ Ngơi' },
            '#process .col-md-3:nth-child(4) p': { text: 'Thưởng thức đồ ăn nhẹ và nghỉ ngơi 10-15 phút trước khi rời đi.' },
            
            // Eligibility Section
            '#eligibility h2.display-5': { text: 'Điều Kiện Hiến Máu' },
            '#eligibility p.lead': { text: 'Hầu hết mọi người đều có thể hiến máu. Dưới đây là một số yêu cầu cơ bản:' },
            '#eligibility .list-group-item:nth-child(1)': { text: ' Ít nhất 18 tuổi', html: true },
            '#eligibility .list-group-item:nth-child(2)': { text: ' Cân nặng ít nhất 45kg', html: true },
            '#eligibility .list-group-item:nth-child(3)': { text: ' Có sức khỏe tốt và cảm thấy khỏe mạnh', html: true },
            '#eligibility .list-group-item:nth-child(4)': { text: ' Không có hình xăm hoặc xỏ khuyên trong 3 tháng qua', html: true },
            '#eligibility .list-group-item:nth-child(5)': { text: ' Chưa hiến máu trong 56 ngày qua', html: true },
            '#eligibility p:last-of-type': { text: 'Để biết danh sách đầy đủ các yêu cầu hoặc kiểm tra xem bạn có đủ điều kiện hiến máu:' },
            '#eligibility a.btn-danger': { text: 'Kiểm Tra Điều Kiện' },
            
            // Types of Donations Section
            '#donation-types h2.display-5': { text: 'Các Loại Hiến Máu' },
            '#donation-types .col-md-6:nth-child(1) h3': { text: 'Máu Toàn Phần' },
            '#donation-types .col-md-6:nth-child(2) h3': { text: 'Hồng Cầu Đậm Đặc' },
            '#donation-types .col-md-6:nth-child(3) h3': { text: 'Tiểu Cầu' },
            '#donation-types .col-md-6:nth-child(4) h3': { text: 'Huyết Tương' },
            
            // Schedule Appointment Section
            '#schedule .card-header h2': { text: 'Đăng Ký Hiến Máu' },
            'label[for="donationFirstName"]': { text: 'Tên <span class="text-danger">*</span>', html: true },
            'label[for="donationLastName"]': { text: 'Họ <span class="text-danger">*</span>', html: true },
            'label[for="donationEmail"]': { text: 'Email <span class="text-danger">*</span>', html: true },
            'label[for="donationPhone"]': { text: 'Số Điện Thoại <span class="text-danger">*</span>', html: true },
            'label[for="donationType"]': { text: 'Loại Hiến Máu <span class="text-danger">*</span>', html: true },
            'label[for="donationDate"]': { text: 'Ngày <span class="text-danger">*</span>', html: true },
            'label[for="donationTime"]': { text: 'Thời Gian <span class="text-danger">*</span>', html: true },
            'label[for="donationLocation"]': { text: 'Địa Điểm <span class="text-danger">*</span>', html: true },
            'label[for="donationComments"]': { text: 'Thông Tin Thêm' },
            'label[for="firstTimeDonor"]': { text: 'Đây là lần đầu tiên tôi hiến máu' },
            '#donationForm button[type="submit"]': { text: 'Đặt Lịch Hẹn' },
            
            // FAQ Section
            'section:nth-of-type(5) h2.display-5': { text: 'Câu Hỏi Thường Gặp' },
            '#headingOne button': { text: 'Hiến máu có đau không?' },
            '#headingTwo button': { text: 'Hiến máu mất bao lâu?' },
            '#headingThree button': { text: 'Lấy bao nhiêu máu?' },
            '#headingFour button': { text: 'Tôi có thể hiến máu nếu tôi vừa xăm hình hoặc xỏ khuyên không?' },
            '#headingFive button': { text: 'Tôi nên làm gì trước và sau khi hiến máu?' },
            
            // Find Drive page hero section
            '.bg-danger h1:contains("Find a Blood Drive")': { text: 'Tìm Điểm Hiến Máu Gần Bạn' },
            '.bg-danger p:contains("Enter your location")': { text: 'Nhập vị trí của bạn để tìm các điểm hiến máu trong khu vực. Việc hiến máu của bạn có thể giúp cứu sống tới 3 người.' },
            'label[for="zipCode"]': { text: 'Mã Bưu Chính' },
            'label[for="radius"]': { text: 'Bán Kính' },
            '.col-md-2 button': { text: 'Tìm Kiếm' },
            
            // Map section
            '#mapPlaceholder h4': { text: 'Bản Đồ Điểm Hiến Máu' },
            '#mapPlaceholder p': { text: 'Nhập vị trí của bạn để xem các điểm hiến máu trên bản đồ' },
            '#searchResults h2': { text: 'Điểm Hiến Máu Gần Đây' },
            '#noResultsMessage div': { text: 'Nhập mã bưu chính để tìm điểm hiến máu trong khu vực của bạn.' },
            
            // Filter section
            '.card-header h3': { text: 'Lọc Kết Quả' },
            'label:contains("Date Range")': { text: 'Khoảng Thời Gian' },
            'label:contains("Time of Day")': { text: 'Thời Gian Trong Ngày' },
            'label[for="morningFilter"]': { text: 'Sáng (8AM-12PM)' },
            'label[for="afternoonFilter"]': { text: 'Chiều (12PM-5PM)' },
            'label[for="eveningFilter"]': { text: 'Tối (5PM-8PM)' },
            'label:contains("Location Type")': { text: 'Loại Địa Điểm' },
            'label[for="centerFilter"]': { text: 'Trung Tâm Hiến Máu' },
            'label[for="mobileFilter"]': { text: 'Điểm Hiến Máu Lưu Động' },
            '#filterForm button': { text: 'Áp Dụng Bộ Lọc' },
            
            // Blood Donation Tips
            '.card-title.text-danger': { text: 'Lời Khuyên Khi Hiến Máu' },
            '.card-body li:nth-child(1)': { text: ' Uống nhiều nước trước khi hiến máu', html: true },
            '.card-body li:nth-child(2)': { text: ' Ăn bữa ăn đầy đủ trước khi đến', html: true },
            '.card-body li:nth-child(3)': { text: ' Mang theo CMND/CCCD và thẻ hiến máu nếu có', html: true },
            '.card-body li:nth-child(4)': { text: ' Mặc áo có thể xắn tay được', html: true },
            '.card-body a.btn-outline-danger': { text: 'Tìm Hiểu Thêm Về Hiến Máu' },
            
            // Featured Drives Section
            '.py-5 h2.display-6': { text: 'Điểm Hiến Máu Nổi Bật' },
            '.badge.bg-danger.mb-2': { text: 'Cần Gấp' },
            '.badge.bg-success.mb-2': { text: 'Sức Chứa Lớn' },
            '.badge.bg-primary.mb-2': { text: 'Địa Điểm Mới' },
            '.d-grid .btn-outline-danger': { text: 'Đặt Lịch Hẹn' },
            
            // CTA Section
            '.card.bg-danger h2': { text: 'Tổ Chức Điểm Hiến Máu Riêng' },
            '.card.bg-danger p.lead': { text: 'Tạo tác động lớn hơn trong cộng đồng của bạn bằng cách tổ chức điểm hiến máu tại nơi làm việc, trường học hoặc tổ chức của bạn.' },
            '.card.bg-danger a.btn-light': { text: 'Tìm Hiểu Về Tổ Chức' },
            
            // Footer
            'footer h5:contains("About Us")': { text: 'Về Chúng Tôi' },
            'footer h5:contains("Donate Blood")': { text: 'Hiến Máu' },
            'footer h5:contains("Host a Drive")': { text: 'Tổ Chức Hiến Máu' },
            'footer h5:contains("Connect")': { text: 'Kết Nối' },
            'footer p.small:contains("Sign up")': { text: 'Đăng ký nhận bản tin để cập nhật thông tin về hiến máu và các cơ hội.' },
            'footer input[type="email"]': { placeholder: 'Email của bạn' },
            'footer button.btn-danger': { text: 'Đăng Ký' },
            'footer .text-white-50:contains("rights reserved")': { text: '© 2023 Hệ Thống Hỗ Trợ Hiến Máu. Đã đăng ký bản quyền.' },
            'footer a:contains("Privacy")': { text: 'Chính Sách Bảo Mật' },
            'footer a:contains("Terms")': { text: 'Điều Khoản Dịch Vụ' },
            'footer a:contains("Contact")': { text: 'Liên Hệ' }
        };
    }
    
    // Vietnamese blood drive data
    function getVietnameseBloodDrives() {
        return [
            {
                id: 1,
                name: "Trung tâm Hiến máu Nhân đạo TP.HCM",
                address: "106 Nguyễn Chí Thanh, Phường 6, Quận 10, TP.HCM",
                dates: "15-16 Tháng 7, 2023",
                times: "7:30 - 16:30",
                type: "center",
                timeOfDay: ["morning", "afternoon"],
                urgency: "urgent",
                description: "Cần gấp nhóm máu O và A. Tất cả các nhóm máu đều được chào đón."
            },
            {
                id: 2,
                name: "Viện Huyết học - Truyền máu TW",
                address: "Phố Phạm Văn Bạch, Cầu Giấy, Hà Nội",
                dates: "18-20 Tháng 7, 2023",
                times: "8:00 - 17:00",
                type: "center",
                timeOfDay: ["morning", "afternoon"],
                urgency: "high",
                description: "Có hiến máu thành phần. Bãi đậu xe miễn phí cho người hiến máu."
            },
            {
                id: 3,
                name: "Trung tâm Thương mại Aeon Mall",
                address: "Tầng 1, TTTM Aeon Mall, Tân Phú, TP.HCM",
                dates: "22 Tháng 7, 2023",
                times: "9:00 - 15:00",
                type: "mobile",
                timeOfDay: ["morning", "afternoon"],
                urgency: "normal",
                description: "Nhận phiếu quà tặng 100.000đ khi tham gia hiến máu. Chấp nhận không hẹn trước."
            },
            {
                id: 4,
                name: "Bệnh viện Bạch Mai",
                address: "78 Đường Giải Phóng, Phương Mai, Đống Đa, Hà Nội",
                dates: "25-27 Tháng 7, 2023",
                times: "7:30 - 16:30",
                type: "center",
                timeOfDay: ["morning", "afternoon"],
                urgency: "high",
                description: "Chào đón tất cả người hiến máu. Đặc biệt cần hiến tiểu cầu."
            },
            {
                id: 5,
                name: "Đại học Quốc gia TP.HCM",
                address: "Khu phố 6, P.Linh Trung, TP.Thủ Đức, TP.HCM",
                dates: "29 Tháng 7, 2023",
                times: "8:00 - 13:00",
                type: "mobile",
                timeOfDay: ["morning", "afternoon"],
                urgency: "normal",
                description: "Bữa ăn nhẹ được cung cấp cho người hiến máu. Vui lòng đặt lịch trước."
            }
        ];
    }
}); 