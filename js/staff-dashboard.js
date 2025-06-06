// Staff Dashboard JavaScript

class StaffDashboard {
    constructor() {
        this.currentSection = 'schedules';
        this.currentFilter = 'all';
        this.mockData = this.generateMockData();
        this.init();
    }

    init() {
        // Check if user is staff and logged in
        this.checkStaffAccess();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Initialize the dashboard
        this.loadSection('schedules');
        this.loadSchedules();
    }

    checkStaffAccess() {
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        const userRole = localStorage.getItem('userRole');
        
        if (!isLoggedIn || userRole !== 'staff') {
            // Redirect to home page if not staff
            window.location.href = 'index.html';
            return;
        }
    }

    setupEventListeners() {
        // Sidebar navigation
        document.querySelectorAll('.dashboard-sidebar .nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = e.currentTarget.getAttribute('data-section');
                this.loadSection(section);
            });
        });

        // Filter buttons
        document.addEventListener('click', (e) => {
            if (e.target.matches('.filter-buttons .btn')) {
                e.preventDefault();
                const filter = e.target.getAttribute('data-filter');
                this.setFilter(filter, e.target);
            }
        });

        // Back to schedules button
        document.addEventListener('click', (e) => {
            if (e.target.matches('#backToSchedules') || e.target.closest('#backToSchedules')) {
                e.preventDefault();
                this.showSchedulesList();
            }
        });

        // Schedule item click
        document.addEventListener('click', (e) => {
            if (e.target.closest('.schedule-item')) {
                e.preventDefault();
                const scheduleId = e.target.closest('.schedule-item').getAttribute('data-schedule-id');
                this.showScheduleDetail(scheduleId);
            }
        });
    }

    loadSection(sectionName) {
        // Update sidebar active state
        document.querySelectorAll('.dashboard-sidebar .nav-link').forEach(link => {
            link.classList.remove('active');
        });
        document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');

        // Update breadcrumb
        const breadcrumbMap = {
            'schedules': 'Lịch đặt hiến',
            'donors': 'Quản lý người hiến',
            'reports': 'Báo cáo thống kê'
        };
        document.getElementById('currentSection').textContent = breadcrumbMap[sectionName];

        // Show/hide sections
        document.querySelectorAll('.section-content').forEach(section => {
            section.style.display = 'none';
        });
        document.getElementById(`${sectionName}-section`).style.display = 'block';

        // Update content title
        document.querySelector('.content-title').textContent = breadcrumbMap[sectionName];

        this.currentSection = sectionName;
    }

    setFilter(filter, buttonElement) {
        this.currentFilter = filter;
        
        // Update button states
        document.querySelectorAll('.filter-buttons .btn').forEach(btn => {
            btn.classList.remove('active');
        });
        buttonElement.classList.add('active');

        // Reload schedules with filter
        this.loadSchedules();
    }

    loadSchedules() {
        const schedulesContainer = document.querySelector('.schedules-list');
        let filteredSchedules = this.mockData.schedules;

        // Apply filter
        if (this.currentFilter === 'upcoming') {
            filteredSchedules = filteredSchedules.filter(schedule => new Date(schedule.date) >= new Date());
        } else if (this.currentFilter === 'past') {
            filteredSchedules = filteredSchedules.filter(schedule => new Date(schedule.date) < new Date());
        }

        if (filteredSchedules.length === 0) {
            schedulesContainer.innerHTML = this.renderEmptyState('Không có lịch hiến máu nào');
            return;
        }

        const schedulesHTML = filteredSchedules.map(schedule => this.renderScheduleItem(schedule)).join('');
        schedulesContainer.innerHTML = schedulesHTML;
    }

    renderScheduleItem(schedule) {
        const scheduleDate = new Date(schedule.date);
        const isUpcoming = scheduleDate >= new Date();
        const formattedDate = scheduleDate.toLocaleDateString('vi-VN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        const donorCount = schedule.timeSlots.reduce((total, slot) => total + slot.donors.length, 0);

        return `
            <div class="schedule-item" data-schedule-id="${schedule.id}">
                <div class="schedule-item-header">
                    <div class="schedule-date">${formattedDate}</div>
                    <span class="schedule-status ${isUpcoming ? 'upcoming' : 'past'}">
                        ${isUpcoming ? 'Sắp tới' : 'Đã qua'}
                    </span>
                </div>
                <div class="schedule-info">
                    <div class="schedule-info-item">
                        <i class="fas fa-users"></i>
                        <span>${donorCount} người hiến</span>
                    </div>
                    <div class="schedule-info-item">
                        <i class="fas fa-clock"></i>
                        <span>${schedule.timeSlots.length} ca làm việc</span>
                    </div>
                    <div class="schedule-info-item">
                        <i class="fas fa-phone"></i>
                        <span>${schedule.contact}</span>
                    </div>
                </div>
            </div>
        `;
    }

    showScheduleDetail(scheduleId) {
        const schedule = this.mockData.schedules.find(s => s.id === scheduleId);
        if (!schedule) return;

        const scheduleDate = new Date(schedule.date).toLocaleDateString('vi-VN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        document.getElementById('scheduleDetailTitle').textContent = `Chi tiết lịch hiến máu - ${scheduleDate}`;
        
        const detailContent = document.querySelector('.schedule-detail-content');
        detailContent.innerHTML = this.renderTimeSlots(schedule.timeSlots);

        // Hide schedules list and show detail
        document.getElementById('schedules-section').style.display = 'none';
        document.getElementById('schedule-detail-section').style.display = 'block';
    }

    showSchedulesList() {
        document.getElementById('schedule-detail-section').style.display = 'none';
        document.getElementById('schedules-section').style.display = 'block';
    }

    renderTimeSlots(timeSlots) {
        if (timeSlots.length === 0) {
            return this.renderEmptyState('Không có ca làm việc nào');
        }

        return `
            <div class="time-slots">
                ${timeSlots.map(slot => this.renderTimeSlot(slot)).join('')}
            </div>
        `;
    }

    renderTimeSlot(slot) {
        const slotIcons = {
            'morning': 'fas fa-sun',
            'afternoon': 'fas fa-cloud-sun',
            'evening': 'fas fa-moon'
        };

        const slotNames = {
            'morning': 'Ca sáng',
            'afternoon': 'Ca chiều', 
            'evening': 'Ca tối'
        };

        return `
            <div class="time-slot">
                <div class="time-slot-header">
                    <i class="${slotIcons[slot.period] || 'fas fa-clock'}"></i>
                    <span>${slotNames[slot.period] || slot.period} (${slot.timeRange})</span>
                    <span class="ms-auto">${slot.donors.length} người hiến</span>
                </div>
                <div class="donors-list">
                    ${slot.donors.length > 0 ? 
                        slot.donors.map(donor => this.renderDonorItem(donor)).join('') :
                        '<div class="empty-state"><p>Chưa có người đăng ký cho ca này</p></div>'
                    }
                </div>
            </div>
        `;
    }

    renderDonorItem(donor) {
        const initials = donor.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
        
        return `
            <div class="donor-item">
                <div class="donor-info">
                    <div class="donor-avatar">${initials}</div>
                    <div class="donor-details">
                        <h6>${donor.name}</h6>
                        <small>Số điện thoại: ${donor.phone}</small>
                    </div>
                </div>
                <div class="donor-meta">
                    <span class="donor-age">${donor.age} tuổi</span>
                    <span class="donor-type">${donor.donationType}</span>
                </div>
            </div>
        `;
    }

    renderEmptyState(message) {
        return `
            <div class="empty-state">
                <i class="fas fa-calendar-times"></i>
                <h4>Trống</h4>
                <p>${message}</p>
            </div>
        `;
    }

    generateMockData() {
        return {
            schedules: [
                {
                    id: '1',
                    date: '2024-01-25',
                    location: 'Bệnh viện Chợ Rẫy - TP.HCM',
                    contact: '028-3855-4269',
                    timeSlots: [
                        {
                            period: 'morning',
                            timeRange: '07:00 - 11:00',
                            donors: [
                                { name: 'Nguyễn Văn A', age: 25, phone: '0901234567', donationType: 'Máu toàn phần' },
                                { name: 'Trần Thị B', age: 30, phone: '0912345678', donationType: 'Huyết tương' },
                                { name: 'Lê Minh C', age: 28, phone: '0923456789', donationType: 'Máu toàn phần' },
                                { name: 'Phạm Thị D', age: 32, phone: '0934567890', donationType: 'Tiểu cầu' }
                            ]
                        },
                        {
                            period: 'afternoon',
                            timeRange: '13:00 - 17:00',
                            donors: [
                                { name: 'Võ Văn E', age: 27, phone: '0945678901', donationType: 'Máu toàn phần' },
                                { name: 'Đặng Thị F', age: 29, phone: '0956789012', donationType: 'Huyết tương' }
                            ]
                        }
                    ]
                },
                {
                    id: '2',
                    date: '2024-01-30',
                    location: 'Trường Đại học Bách Khoa TP.HCM',
                    contact: '028-3864-5500',
                    timeSlots: [
                        {
                            period: 'morning',
                            timeRange: '08:00 - 12:00',
                            donors: [
                                { name: 'Hoàng Văn G', age: 21, phone: '0967890123', donationType: 'Máu toàn phần' },
                                { name: 'Bùi Thị H', age: 22, phone: '0978901234', donationType: 'Máu toàn phần' },
                                { name: 'Đỗ Minh I', age: 23, phone: '0989012345', donationType: 'Huyết tương' }
                            ]
                        }
                    ]
                },
                {
                    id: '3',
                    date: '2024-01-15',
                    location: 'Viện Huyết học - Truyền máu Trung ương',
                    contact: '024-3869-3931',
                    timeSlots: [
                        {
                            period: 'morning',
                            timeRange: '07:30 - 11:30',
                            donors: [
                                { name: 'Ngô Văn J', age: 35, phone: '0990123456', donationType: 'Máu toàn phần' },
                                { name: 'Dương Thị K', age: 26, phone: '0901234560', donationType: 'Tiểu cầu' }
                            ]
                        },
                        {
                            period: 'afternoon', 
                            timeRange: '14:00 - 18:00',
                            donors: [
                                { name: 'Vũ Minh L', age: 31, phone: '0912345601', donationType: 'Huyết tương' },
                                { name: 'Cao Thị M', age: 24, phone: '0923456012', donationType: 'Máu toàn phần' },
                                { name: 'Lý Văn N', age: 33, phone: '0934560123', donationType: 'Máu toàn phần' }
                            ]
                        }
                    ]
                }
            ]
        };
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Only initialize if we're on the staff dashboard page
    if (window.location.pathname.includes('staff-dashboard.html')) {
        window.staffDashboard = new StaffDashboard();
    }
});

// Export for global access
window.StaffDashboard = StaffDashboard; 