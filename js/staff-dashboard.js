// Staff Dashboard JavaScript

class StaffDashboard {
    constructor() {
        this.currentSection = 'schedules';
        this.currentFilter = 'all';
        this.currentBloodFilter = 'all';
        this.currentSearchTerm = '';
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.currentStatusFilter = 'all';
        this.currentBloodUnitSearchTerm = '';
        this.currentBloodUnitPage = 1;
        this.statusSortMode = 'none'; // 'none', 'pending-first', 'status-asc', 'status-desc'
        this.currentDonationRecordTestFilter = 'all';
        this.currentDonationRecordSearchTerm = '';
        this.currentDonationRecordPage = 1;
        this.mockData = this.generateMockData();
        this.init();
    }

    init() {
        // Check if user is staff and logged in
        this.checkStaffAccess();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Initialize sidebar state
        this.initializeSidebarState();
        
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

        // Donor management event listeners
        this.setupDonorEventListeners();

        // Blood units management event listeners
        this.setupBloodUnitsEventListeners();

        // Donation records management event listeners
        this.setupDonationRecordsEventListeners();

        // Create record modal event listeners
        this.setupCreateRecordEventListeners();

        // Sidebar toggle event listeners
        this.setupSidebarToggle();
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
            'blood-units': 'Quản lý túi máu hậu hiến',
            'donation-records': 'Hồ sơ hiến máu',
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

        // Load section-specific data
        if (sectionName === 'donors') {
            this.loadDonors();
        } else if (sectionName === 'blood-units') {
            this.loadBloodUnits();
        } else if (sectionName === 'donation-records') {
            this.loadDonationRecords();
        }
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

    // Donor Management Methods
    setupDonorEventListeners() {
        // Blood type filter buttons
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-blood-filter]')) {
                e.preventDefault();
                const filter = e.target.getAttribute('data-blood-filter');
                this.setBloodFilter(filter, e.target);
            }
        });

        // Search functionality
        const searchInput = document.getElementById('donorSearchInput');
        const searchBtn = document.getElementById('donorSearchBtn');
        
        if (searchInput && searchBtn) {
            searchBtn.addEventListener('click', () => {
                this.currentSearchTerm = searchInput.value.trim();
                this.currentPage = 1;
                this.loadDonors();
            });

            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.currentSearchTerm = searchInput.value.trim();
                    this.currentPage = 1;
                    this.loadDonors();
                }
            });
        }

        // Pagination clicks
        document.addEventListener('click', (e) => {
            if (e.target.matches('.donor-page-btn')) {
                e.preventDefault();
                const page = parseInt(e.target.getAttribute('data-page'));
                this.currentPage = page;
                this.loadDonors();
            }
        });
    }

    setBloodFilter(filter, buttonElement) {
        this.currentBloodFilter = filter;
        this.currentPage = 1;
        
        // Update button states
        document.querySelectorAll('[data-blood-filter]').forEach(btn => {
            btn.classList.remove('active');
        });
        buttonElement.classList.add('active');

        // Reload donors with filter
        this.loadDonors();
    }

    loadDonors() {
        const loadingElement = document.getElementById('donorsLoading');
        const tableBody = document.getElementById('donorsTableBody');
        const noDataElement = document.getElementById('noDonorsMessage');
        
        // Show loading
        if (loadingElement) loadingElement.style.display = 'block';
        if (tableBody) tableBody.innerHTML = '';
        if (noDataElement) noDataElement.style.display = 'none';

        // Simulate API delay
        setTimeout(() => {
            const donors = this.getFilteredDonors();
            this.renderDonors(donors);
            this.updateDonorStats(this.mockData.donors);
            
            // Hide loading
            if (loadingElement) loadingElement.style.display = 'none';
        }, 500);
    }

    getFilteredDonors() {
        let filteredDonors = [...this.mockData.donors];

        // Apply blood type filter
        if (this.currentBloodFilter !== 'all') {
            filteredDonors = filteredDonors.filter(donor => 
                donor.bloodType.includes(this.currentBloodFilter)
            );
        }

        // Apply search filter
        if (this.currentSearchTerm) {
            const searchTerm = this.currentSearchTerm.toLowerCase();
            filteredDonors = filteredDonors.filter(donor => 
                donor.name.toLowerCase().includes(searchTerm) ||
                donor.bloodType.toLowerCase().includes(searchTerm)
            );
        }

        // Sort by last donation date (most recent first)
        filteredDonors.sort((a, b) => new Date(b.lastDonationDate) - new Date(a.lastDonationDate));

        return filteredDonors;
    }

    renderDonors(donors) {
        const tableBody = document.getElementById('donorsTableBody');
        const noDataElement = document.getElementById('noDonorsMessage');

        if (donors.length === 0) {
            if (tableBody) tableBody.innerHTML = '';
            if (noDataElement) noDataElement.style.display = 'block';
            this.renderPagination(0, 0);
            return;
        }

        // Pagination
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const paginatedDonors = donors.slice(startIndex, endIndex);

        const donorsHTML = paginatedDonors.map((donor, index) => 
            this.renderDonorRow(donor, startIndex + index + 1)
        ).join('');

        if (tableBody) {
            tableBody.innerHTML = donorsHTML;
        }

        this.renderPagination(donors.length, this.currentPage);
    }

    renderDonorRow(donor, index) {
        const age = this.calculateAge(donor.birthDate);
        const daysSinceLastDonation = this.daysSinceDate(donor.lastDonationDate);
        const status = this.getDonorStatus(daysSinceLastDonation);
        
        return `
            <tr class="donor-row">
                <td>${index}</td>
                <td>
                    <div class="donor-name">${donor.name}</div>
                    <small class="text-muted">${donor.email}</small>
                </td>
                <td>${age}</td>
                <td>
                    <span class="blood-type-badge blood-type-${donor.bloodType.replace('+', '').replace('-', '')}">${donor.bloodType}</span>
                </td>
                <td>
                    <div class="last-donation-date">${this.formatDate(donor.lastDonationDate)}</div>
                    <small class="text-muted">${daysSinceLastDonation} ngày trước</small>
                </td>
                <td>
                    <span class="donation-count">${donor.totalDonations}</span>
                </td>
                <td>
                    <span class="status-badge ${status.class}">${status.text}</span>
                </td>
                <td>
                    <div class="donor-actions">
                        <button class="btn btn-outline-primary btn-sm" title="Xem chi tiết">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-outline-success btn-sm" title="Liên hệ">
                            <i class="fas fa-phone"></i>
                        </button>
                        <button class="btn btn-outline-info btn-sm" title="Lịch sử hiến máu">
                            <i class="fas fa-history"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }

    renderPagination(totalItems, currentPage) {
        const paginationContainer = document.getElementById('donorPagination');
        if (!paginationContainer) return;

        const totalPages = Math.ceil(totalItems / this.itemsPerPage);
        
        if (totalPages <= 1) {
            paginationContainer.innerHTML = '';
            return;
        }

        let paginationHTML = '';
        
        // Previous button
        paginationHTML += `
            <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
                <a class="page-link donor-page-btn" href="#" data-page="${currentPage - 1}">
                    <i class="fas fa-chevron-left"></i>
                </a>
            </li>
        `;

        // Page numbers
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
                paginationHTML += `
                    <li class="page-item ${i === currentPage ? 'active' : ''}">
                        <a class="page-link donor-page-btn" href="#" data-page="${i}">${i}</a>
                    </li>
                `;
            } else if (i === currentPage - 3 || i === currentPage + 3) {
                paginationHTML += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
            }
        }

        // Next button
        paginationHTML += `
            <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
                <a class="page-link donor-page-btn" href="#" data-page="${currentPage + 1}">
                    <i class="fas fa-chevron-right"></i>
                </a>
            </li>
        `;

        paginationContainer.innerHTML = paginationHTML;
    }

    updateDonorStats(allDonors) {
        const totalDonors = allDonors.length;
        const eligibleDonors = allDonors.filter(donor => this.daysSinceDate(donor.lastDonationDate) >= 56).length;

        document.getElementById('totalDonors').textContent = totalDonors;
        document.getElementById('eligibleDonors').textContent = eligibleDonors;
    }

    calculateAge(birthDate) {
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        
        return age;
    }

    daysSinceDate(date) {
        const today = new Date();
        const targetDate = new Date(date);
        const diffTime = Math.abs(today - targetDate);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    getDonorStatus(daysSinceLastDonation) {
        if (daysSinceLastDonation >= 56) {
            return { class: 'status-eligible', text: 'Đủ điều kiện' };
        } else if (daysSinceLastDonation >= 30) {
            return { class: 'status-waiting', text: 'Chờ đủ thời gian' };
        } else {
            return { class: 'status-ineligible', text: 'Chưa đủ thời gian' };
        }
    }

    formatDate(date) {
        return new Date(date).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    }

    // Blood Units Management Methods
    setupBloodUnitsEventListeners() {
        // Status column header click
        const statusColumnHeader = document.getElementById('statusColumnHeader');
        if (statusColumnHeader) {
            statusColumnHeader.addEventListener('click', () => {
                this.toggleStatusSort();
            });
        }

        // Status filter buttons
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-status-filter]')) {
                e.preventDefault();
                const filter = e.target.getAttribute('data-status-filter');
                this.setStatusFilter(filter, e.target);
            }
        });

        // Search functionality
        const searchInput = document.getElementById('bloodUnitSearchInput');
        const searchBtn = document.getElementById('bloodUnitSearchBtn');
        
        if (searchInput && searchBtn) {
            searchBtn.addEventListener('click', () => {
                this.currentBloodUnitSearchTerm = searchInput.value.trim();
                this.currentBloodUnitPage = 1;
                this.loadBloodUnits();
            });

            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.currentBloodUnitSearchTerm = searchInput.value.trim();
                    this.currentBloodUnitPage = 1;
                    this.loadBloodUnits();
                }
            });
        }

        // Pagination clicks
        document.addEventListener('click', (e) => {
            if (e.target.matches('.blood-unit-page-btn')) {
                e.preventDefault();
                const page = parseInt(e.target.getAttribute('data-page'));
                this.currentBloodUnitPage = page;
                this.loadBloodUnits();
            }
        });

        // Status change clicks - improved event handling
        document.addEventListener('click', (e) => {
            // Check if the clicked element or its parent is a status change button
            let button = e.target;
            if (e.target.tagName === 'I') {
                button = e.target.parentElement;
            }
            
            if (button && button.classList.contains('status-change-btn')) {
                e.preventDefault();
                e.stopPropagation();
                console.log('Status change button clicked!', button); // Debug log
                const unitId = button.getAttribute('data-unit-id');
                const currentStatus = button.getAttribute('data-current-status');
                console.log('Unit ID:', unitId, 'Current Status:', currentStatus); // Debug log
                this.showStatusChangeOptions(unitId, currentStatus, button);
            }
        });
    }

    setStatusFilter(filter, buttonElement) {
        this.currentStatusFilter = filter;
        this.currentBloodUnitPage = 1;
        
        // Update button states
        document.querySelectorAll('[data-status-filter]').forEach(btn => {
            btn.classList.remove('active');
        });
        buttonElement.classList.add('active');

        // Reload blood units with filter
        this.loadBloodUnits();
    }

    toggleStatusSort() {
        // Cycle through sort modes: none -> pending-first -> status-asc -> status-desc -> none
        switch (this.statusSortMode) {
            case 'none':
                this.statusSortMode = 'pending-first';
                break;
            case 'pending-first':
                this.statusSortMode = 'status-asc';
                break;
            case 'status-asc':
                this.statusSortMode = 'status-desc';
                break;
            case 'status-desc':
                this.statusSortMode = 'none';
                break;
            default:
                this.statusSortMode = 'pending-first';
        }

        // Update sort icon
        this.updateStatusSortIcon();
        
        // Reset to first page and reload
        this.currentBloodUnitPage = 1;
        this.loadBloodUnits();
    }

    updateStatusSortIcon() {
        const icon = document.getElementById('statusSortIcon');
        if (!icon) return;

        // Remove all sort classes
        icon.className = icon.className.replace(/fa-sort.*?(?=\s|$)/g, '');
        
        switch (this.statusSortMode) {
            case 'none':
                icon.classList.add('fa-sort');
                icon.parentElement.title = 'Nhấp để lọc theo trạng thái';
                break;
            case 'pending-first':
                icon.classList.add('fa-sort-up');
                icon.parentElement.title = 'Đang hiển thị: Chờ duyệt trước - Nhấp để sắp xếp A-Z';
                break;
            case 'status-asc':
                icon.classList.add('fa-sort-alpha-down');
                icon.parentElement.title = 'Đang sắp xếp: A-Z - Nhấp để sắp xếp Z-A';
                break;
            case 'status-desc':
                icon.classList.add('fa-sort-alpha-up');
                icon.parentElement.title = 'Đang sắp xếp: Z-A - Nhấp để bỏ sắp xếp';
                break;
        }
    }

    loadBloodUnits() {
        const loadingElement = document.getElementById('bloodUnitsLoading');
        const tableBody = document.getElementById('bloodUnitsTableBody');
        const noDataElement = document.getElementById('noBloodUnitsMessage');
        
        // Initialize sort icon if not already done
        this.updateStatusSortIcon();
        
        // Show loading
        if (loadingElement) loadingElement.style.display = 'block';
        if (tableBody) tableBody.innerHTML = '';
        if (noDataElement) noDataElement.style.display = 'none';

        // Simulate API delay
        setTimeout(() => {
            const bloodUnits = this.getFilteredBloodUnits();
            this.renderBloodUnits(bloodUnits);
            this.updateBloodUnitsStats(this.mockData.bloodUnits);
            
            // Hide loading
            if (loadingElement) loadingElement.style.display = 'none';
        }, 500);
    }

    getFilteredBloodUnits() {
        let filteredUnits = [...this.mockData.bloodUnits];

        // Apply status filter
        if (this.currentStatusFilter !== 'all') {
            filteredUnits = filteredUnits.filter(unit => unit.status === this.currentStatusFilter);
        }

        // Apply search filter
        if (this.currentBloodUnitSearchTerm) {
            const searchTerm = this.currentBloodUnitSearchTerm.toLowerCase();
            filteredUnits = filteredUnits.filter(unit => 
                unit.id.toLowerCase().includes(searchTerm) ||
                unit.bloodType.toLowerCase().includes(searchTerm)
            );
        }

        // Apply status sorting
        switch (this.statusSortMode) {
            case 'pending-first':
                // Sort pending first, then by donation date
                filteredUnits.sort((a, b) => {
                    if (a.status === 'pending' && b.status !== 'pending') return -1;
                    if (a.status !== 'pending' && b.status === 'pending') return 1;
                    return new Date(b.donationDate) - new Date(a.donationDate);
                });
                break;
            case 'status-asc':
                // Sort by status alphabetically (A-Z), then by donation date
                filteredUnits.sort((a, b) => {
                    const statusComparison = this.getStatusText(a.status).localeCompare(this.getStatusText(b.status), 'vi');
                    if (statusComparison !== 0) return statusComparison;
                    return new Date(b.donationDate) - new Date(a.donationDate);
                });
                break;
            case 'status-desc':
                // Sort by status reverse alphabetically (Z-A), then by donation date
                filteredUnits.sort((a, b) => {
                    const statusComparison = this.getStatusText(b.status).localeCompare(this.getStatusText(a.status), 'vi');
                    if (statusComparison !== 0) return statusComparison;
                    return new Date(b.donationDate) - new Date(a.donationDate);
                });
                break;
            default:
                // Default sort by donation date (most recent first)
                filteredUnits.sort((a, b) => new Date(b.donationDate) - new Date(a.donationDate));
        }

        return filteredUnits;
    }

    renderBloodUnits(bloodUnits) {
        const tableBody = document.getElementById('bloodUnitsTableBody');
        const noDataElement = document.getElementById('noBloodUnitsMessage');

        if (bloodUnits.length === 0) {
            if (tableBody) tableBody.innerHTML = '';
            if (noDataElement) noDataElement.style.display = 'block';
            this.renderBloodUnitPagination(0, 0);
            return;
        }

        // Pagination
        const startIndex = (this.currentBloodUnitPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const paginatedUnits = bloodUnits.slice(startIndex, endIndex);

        const unitsHTML = paginatedUnits.map((unit, index) => 
            this.renderBloodUnitRow(unit, startIndex + index + 1)
        ).join('');

        if (tableBody) {
            tableBody.innerHTML = unitsHTML;
        }

        this.renderBloodUnitPagination(bloodUnits.length, this.currentBloodUnitPage);
    }

    renderBloodUnitRow(unit, index) {
        const expiryStatus = this.getExpiryStatus(unit.expiryDate);
        const statusClass = `status-${unit.status}`;
        
        // Default values for missing fields
        const componentId = unit.componentId || `BC${unit.id.substring(2)}`;
        const component = unit.component || 'Máu toàn phần';
        
        return `
            <tr class="blood-unit-row">
                <td>${index}</td>
                <td>
                    <span class="blood-unit-id">${unit.id}</span>
                </td>
                <td>
                    <span class="component-id">${componentId}</span>
                </td>
                <td>
                    <span class="badge bg-primary">${component}</span>
                </td>
                <td>
                    <span class="volume-display">${unit.volume}</span> ml
                </td>
                <td>
                    <span class="blood-type-badge blood-type-${unit.bloodType.replace('+', '').replace('-', '')}">${unit.bloodType}</span>
                </td>
                <td>
                    <div class="donation-date">${this.formatDate(unit.donationDate)}</div>
                </td>
                <td>
                    <div class="expiry-date ${expiryStatus.class}">${this.formatDate(unit.expiryDate)}</div>
                    <small class="text-muted">${expiryStatus.text}</small>
                </td>
                <td>
                    <span class="blood-unit-status ${statusClass}">${this.getStatusText(unit.status)}</span>
                </td>
                <td>
                    <div class="blood-unit-actions">
                        <button class="btn btn-outline-primary btn-sm status-change-btn" 
                                data-unit-id="${unit.id}" 
                                data-current-status="${unit.status}"
                                title="Thay đổi trạng thái">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-outline-info btn-sm" title="Xem chi tiết">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-outline-secondary btn-sm" title="In nhãn">
                            <i class="fas fa-print"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }

    showStatusChangeOptions(unitId, currentStatus, buttonElement) {
        console.log('showStatusChangeOptions called with:', unitId, currentStatus, buttonElement); // Debug log
        let statusOptions;
        
        // Special options for pending status
        if (currentStatus === 'pending') {
            statusOptions = [
                { value: 'approved', text: 'Duyệt đạt', icon: 'fas fa-check-circle', class: 'text-success' },
                { value: 'denied', text: 'Không đạt', icon: 'fas fa-times-circle', class: 'text-danger' }
            ];
        } else {
            // General options for other statuses
            statusOptions = [
                { value: 'approved', text: 'Đã duyệt', icon: 'fas fa-check-circle', class: 'text-success' },
                { value: 'denied', text: 'Từ chối', icon: 'fas fa-times-circle', class: 'text-danger' },
                { value: 'pending', text: 'Chờ duyệt', icon: 'fas fa-clock', class: 'text-warning' }
            ];
        }

        // Create dropdown
        const dropdown = document.createElement('div');
        dropdown.className = 'status-change-dropdown';
        dropdown.style.position = 'absolute';
        dropdown.style.zIndex = '1000';
        dropdown.style.backgroundColor = 'white';
        dropdown.style.border = '1px solid #dee2e6';
        dropdown.style.borderRadius = '8px';
        dropdown.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
        dropdown.style.minWidth = '150px';
        dropdown.style.padding = '8px 0';

        // For pending status, show special header
        let headerHTML = '';
        if (currentStatus === 'pending') {
            headerHTML = `
                <div style="padding: 8px 16px; background-color: #f8f9fa; border-bottom: 1px solid #dee2e6; font-weight: 600; color: #495057;">
                    <i class="fas fa-clipboard-check me-2"></i>
                    Kết quả duyệt
                </div>
            `;
        }

        const optionsHTML = statusOptions
            .filter(option => option.value !== currentStatus)
            .map(option => `
                <div class="dropdown-item status-option" data-status="${option.value}" data-unit-id="${unitId}" style="padding: 12px 16px; cursor: pointer; transition: background-color 0.2s;">
                    <i class="${option.icon} ${option.class} me-2"></i>
                    ${option.text}
                </div>
            `).join('');

        dropdown.innerHTML = headerHTML + optionsHTML;

        // Position dropdown
        const rect = buttonElement.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
        
        dropdown.style.left = (rect.left + scrollLeft) + 'px';
        dropdown.style.top = (rect.bottom + scrollTop + 5) + 'px';
        
        console.log('Dropdown positioned at:', dropdown.style.left, dropdown.style.top); // Debug log

        // Add to body
        document.body.appendChild(dropdown);
        console.log('Dropdown added to body:', dropdown); // Debug log

        // Handle clicks
        dropdown.addEventListener('click', (e) => {
            console.log('Dropdown clicked:', e.target); // Debug log
            let option = e.target;
            
            // Handle clicking on icon inside option
            if (e.target.tagName === 'I') {
                option = e.target.parentElement;
            }
            
            if (option && option.classList.contains('status-option')) {
                console.log('Status option clicked:', option); // Debug log
                const newStatus = option.getAttribute('data-status');
                const unitId = option.getAttribute('data-unit-id');
                console.log('Changing status to:', newStatus, 'for unit:', unitId); // Debug log
                this.changeBloodUnitStatus(unitId, newStatus);
                if (document.body.contains(dropdown)) {
                    document.body.removeChild(dropdown);
                }
            }
        });

        // Remove dropdown when clicking outside
        setTimeout(() => {
            document.addEventListener('click', function removeDropdown(e) {
                if (!dropdown.contains(e.target)) {
                    if (document.body.contains(dropdown)) {
                        document.body.removeChild(dropdown);
                    }
                    document.removeEventListener('click', removeDropdown);
                }
            });
        }, 100);
    }

    changeBloodUnitStatus(unitId, newStatus) {
        // Find and update the unit in mock data
        const unit = this.mockData.bloodUnits.find(u => u.id === unitId);
        if (unit) {
            unit.status = newStatus;
            
            // Show success message
            this.showStatusChangeMessage(unitId, newStatus);
            
            // Reload the blood units list
            this.loadBloodUnits();
        }
    }

    showStatusChangeMessage(unitId, newStatus) {
        const statusText = this.getStatusText(newStatus);
        
        // Determine message type and icon based on status
        let alertClass = 'alert-success';
        let icon = 'fas fa-check-circle';
        let messageText = 'Đã cập nhật trạng thái túi máu';
        
        if (newStatus === 'approved') {
            alertClass = 'alert-success';
            icon = 'fas fa-check-circle';
            messageText = 'Đã duyệt túi máu';
        } else if (newStatus === 'denied') {
            alertClass = 'alert-danger';
            icon = 'fas fa-times-circle';
            messageText = 'Đã từ chối túi máu';
        } else if (newStatus === 'pending') {
            alertClass = 'alert-warning';
            icon = 'fas fa-clock';
            messageText = 'Đã chuyển túi máu về trạng thái chờ duyệt';
        }
        
        // Create toast notification
        const toast = document.createElement('div');
        toast.className = `alert ${alertClass} alert-dismissible fade show position-fixed`;
        toast.style.top = '20px';
        toast.style.right = '20px';
        toast.style.zIndex = '9999';
        toast.style.minWidth = '300px';
        
        toast.innerHTML = `
            <i class="${icon} me-2"></i>
            ${messageText} <strong>${unitId}</strong> - <strong>${statusText}</strong>
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(toast);
        
        // Auto remove after 4 seconds
        setTimeout(() => {
            if (document.body.contains(toast)) {
                document.body.removeChild(toast);
            }
        }, 4000);
    }

    renderBloodUnitPagination(totalItems, currentPage) {
        const paginationContainer = document.getElementById('bloodUnitPagination');
        if (!paginationContainer) return;

        const totalPages = Math.ceil(totalItems / this.itemsPerPage);
        
        if (totalPages <= 1) {
            paginationContainer.innerHTML = '';
            return;
        }

        let paginationHTML = '';
        
        // Previous button
        paginationHTML += `
            <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
                <a class="page-link blood-unit-page-btn" href="#" data-page="${currentPage - 1}">
                    <i class="fas fa-chevron-left"></i>
                </a>
            </li>
        `;

        // Page numbers
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
                paginationHTML += `
                    <li class="page-item ${i === currentPage ? 'active' : ''}">
                        <a class="page-link blood-unit-page-btn" href="#" data-page="${i}">${i}</a>
                    </li>
                `;
            } else if (i === currentPage - 3 || i === currentPage + 3) {
                paginationHTML += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
            }
        }

        // Next button
        paginationHTML += `
            <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
                <a class="page-link blood-unit-page-btn" href="#" data-page="${currentPage + 1}">
                    <i class="fas fa-chevron-right"></i>
                </a>
            </li>
        `;

        paginationContainer.innerHTML = paginationHTML;
    }

    updateBloodUnitsStats(allUnits) {
        const totalUnits = allUnits.length;
        const approvedUnits = allUnits.filter(unit => unit.status === 'approved').length;
        const pendingUnits = allUnits.filter(unit => unit.status === 'pending').length;
        const totalVolume = allUnits.filter(unit => unit.status === 'approved').reduce((sum, unit) => sum + unit.volume, 0);

        document.getElementById('totalBloodUnits').textContent = totalUnits;
        document.getElementById('approvedBloodUnits').textContent = approvedUnits;
        document.getElementById('pendingBloodUnits').textContent = pendingUnits;
        document.getElementById('availableVolume').textContent = totalVolume.toLocaleString();
    }

    getExpiryStatus(expiryDate) {
        const today = new Date();
        const expiry = new Date(expiryDate);
        const daysUntilExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
        
        if (daysUntilExpiry < 0) {
            return { class: 'expiry-warning', text: 'Đã hết hạn' };
        } else if (daysUntilExpiry <= 7) {
            return { class: 'expiry-soon', text: `Còn ${daysUntilExpiry} ngày` };
        } else {
            return { class: 'expiry-normal', text: `Còn ${daysUntilExpiry} ngày` };
        }
    }

    getStatusText(status) {
        const statusMap = {
            'approved': 'Đã duyệt',
            'pending': 'Chờ duyệt',
            'denied': 'Từ chối',
            'expired': 'Hết hạn'
        };
        return statusMap[status] || status;
    }

    // Donation Records Management Methods
    setupDonationRecordsEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('donationRecordSearchInput');
        const searchBtn = document.getElementById('donationRecordSearchBtn');
        
        if (searchInput && searchBtn) {
            const performSearch = () => {
                this.searchDonationRecords();
            };
            
            searchInput.addEventListener('input', performSearch);
            searchBtn.addEventListener('click', performSearch);
            
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    performSearch();
                }
            });
        }

        // Filter buttons
        const testFilterButtons = document.querySelectorAll('[data-test-filter]');
        testFilterButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const filter = button.dataset.testFilter;
                this.setTestFilter(filter, button);
            });
        });

        // Pagination clicks
        document.addEventListener('click', (e) => {
            if (e.target.closest('.donation-record-page-btn')) {
                e.preventDefault();
                const pageBtn = e.target.closest('.donation-record-page-btn');
                const page = parseInt(pageBtn.dataset.page);
                if (!isNaN(page) && page > 0) {
                    this.currentDonationRecordPage = page;
                    this.loadDonationRecords();
                }
            }
        });

        // Record row clicks for detail view
        document.addEventListener('click', (e) => {
            const recordRow = e.target.closest('.donation-record-row');
            if (recordRow) {
                const recordId = recordRow.dataset.recordId;
                this.showDonationRecordDetail(recordId);
            }
        });

        // Back to list button
        const backBtn = document.getElementById('backToDonationRecords');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                this.showDonationRecordsList();
            });
        }

        // Edit test result functionality
        this.setupTestResultEdit();
        
        // Edit note functionality
        this.setupNoteEdit();
    }

    setupTestResultEdit() {
        const editBtn = document.getElementById('editTestResultBtn');
        const saveBtn = document.getElementById('saveTestResultBtn');
        const cancelBtn = document.getElementById('cancelTestResultBtn');
        const displayElement = document.getElementById('detailBloodTestResult');
        const editElement = document.getElementById('editBloodTestResult');
        const actionsElement = document.getElementById('testResultActions');

        if (editBtn && saveBtn && cancelBtn && displayElement && editElement && actionsElement) {
            editBtn.addEventListener('click', () => {
                this.enterEditMode('testResult');
            });

            saveBtn.addEventListener('click', () => {
                this.saveTestResult();
            });

            cancelBtn.addEventListener('click', () => {
                this.cancelEdit('testResult');
            });
        }
    }

    setupNoteEdit() {
        const editBtn = document.getElementById('editNoteBtn');
        const saveBtn = document.getElementById('saveNoteBtn');
        const cancelBtn = document.getElementById('cancelNoteBtn');
        const displayElement = document.getElementById('detailNote');
        const editElement = document.getElementById('editNote');
        const actionsElement = document.getElementById('noteActions');

        if (editBtn && saveBtn && cancelBtn && displayElement && editElement && actionsElement) {
            editBtn.addEventListener('click', () => {
                this.enterEditMode('note');
            });

            saveBtn.addEventListener('click', () => {
                this.saveNote();
            });

            cancelBtn.addEventListener('click', () => {
                this.cancelEdit('note');
            });
        }
    }

    enterEditMode(type) {
        if (type === 'testResult') {
            const displayElement = document.getElementById('detailBloodTestResult');
            const editElement = document.getElementById('editBloodTestResult');
            const editBtn = document.getElementById('editTestResultBtn');
            const actionsElement = document.getElementById('testResultActions');
            
            // Get current value
            const currentRecord = this.getCurrentRecord();
            if (currentRecord) {
                editElement.value = currentRecord.bloodTestResult;
            }
            
            // Show edit elements, hide display elements
            displayElement.style.display = 'none';
            editElement.style.display = 'block';
            editBtn.style.display = 'none';
            actionsElement.style.display = 'flex';
            
        } else if (type === 'note') {
            const displayElement = document.getElementById('detailNote');
            const editElement = document.getElementById('editNote');
            const editBtn = document.getElementById('editNoteBtn');
            const actionsElement = document.getElementById('noteActions');
            
            // Get current value
            const currentRecord = this.getCurrentRecord();
            if (currentRecord) {
                editElement.value = currentRecord.note || '';
            }
            
            // Show edit elements, hide display elements
            displayElement.style.display = 'none';
            editElement.style.display = 'block';
            editBtn.style.display = 'none';
            actionsElement.style.display = 'flex';
            
            // Focus on textarea
            editElement.focus();
        }
    }

    getCurrentRecord() {
        const recordId = document.getElementById('detailRecordId').textContent;
        return this.mockData.donationRecords.find(r => r.id === recordId);
    }

    saveTestResult() {
        const editElement = document.getElementById('editBloodTestResult');
        const newValue = editElement.value;
        
        // Update the record in mock data
        const currentRecord = this.getCurrentRecord();
        if (currentRecord) {
            currentRecord.bloodTestResult = newValue;
            
            // Update display
            this.updateTestResultDisplay(newValue);
            
            // Exit edit mode
            this.exitEditMode('testResult');
            
            // Show success message
            this.showEditSuccessMessage('Cập nhật kết quả xét nghiệm thành công!');
            
            // Refresh the list view to reflect changes
            this.loadDonationRecords();
        }
    }

    saveNote() {
        const editElement = document.getElementById('editNote');
        const newValue = editElement.value.trim();
        
        // Update the record in mock data
        const currentRecord = this.getCurrentRecord();
        if (currentRecord) {
            currentRecord.note = newValue;
            
            // Update display
            this.updateNoteDisplay(newValue);
            
            // Exit edit mode
            this.exitEditMode('note');
            
            // Show success message
            this.showEditSuccessMessage('Cập nhật ghi chú thành công!');
        }
    }

    updateTestResultDisplay(value) {
        const displayElement = document.getElementById('detailBloodTestResult');
        const testResultText = value === 'good' ? 'Máu đạt' : 'Máu chưa đạt';
        const testResultClass = value === 'good' ? 'good' : 'poor';
        
        displayElement.textContent = testResultText;
        displayElement.className = `test-result-badge ${testResultClass}`;
    }

    updateNoteDisplay(value) {
        const displayElement = document.getElementById('detailNote');
        displayElement.textContent = value || 'Không có ghi chú';
    }

    cancelEdit(type) {
        this.exitEditMode(type);
    }

    exitEditMode(type) {
        if (type === 'testResult') {
            const displayElement = document.getElementById('detailBloodTestResult');
            const editElement = document.getElementById('editBloodTestResult');
            const editBtn = document.getElementById('editTestResultBtn');
            const actionsElement = document.getElementById('testResultActions');
            
            displayElement.style.display = 'inline';
            editElement.style.display = 'none';
            editBtn.style.display = 'inline-block';
            actionsElement.style.display = 'none';
            
        } else if (type === 'note') {
            const displayElement = document.getElementById('detailNote');
            const editElement = document.getElementById('editNote');
            const editBtn = document.getElementById('editNoteBtn');
            const actionsElement = document.getElementById('noteActions');
            
            displayElement.style.display = 'block';
            editElement.style.display = 'none';
            editBtn.style.display = 'inline-block';
            actionsElement.style.display = 'none';
        }
    }

    showEditSuccessMessage(message) {
        // Create a temporary success message
        const alertDiv = document.createElement('div');
        alertDiv.className = 'alert alert-success alert-dismissible fade show position-fixed';
        alertDiv.style.top = '20px';
        alertDiv.style.right = '20px';
        alertDiv.style.zIndex = '9999';
        alertDiv.style.minWidth = '300px';
        alertDiv.innerHTML = `
            <i class="fas fa-check-circle me-2"></i>
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(alertDiv);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.remove();
            }
        }, 3000);
    }

    setTestFilter(filter, buttonElement) {
        this.currentDonationRecordTestFilter = filter;
        this.currentDonationRecordPage = 1;
        
        // Update button states
        document.querySelectorAll('[data-test-filter]').forEach(btn => {
            btn.classList.remove('active');
        });
        buttonElement.classList.add('active');

        // Reload donation records with filter
        this.loadDonationRecords();
    }

    loadDonationRecords() {
        const loadingElement = document.getElementById('donationRecordsLoading');
        const tableBody = document.getElementById('donationRecordsTableBody');
        const noDataElement = document.getElementById('noDonationRecordsMessage');
        
        // Show loading
        if (loadingElement) loadingElement.style.display = 'block';
        if (tableBody) tableBody.innerHTML = '';
        if (noDataElement) noDataElement.style.display = 'none';

        // Simulate API delay
        setTimeout(() => {
            const donationRecords = this.getFilteredDonationRecords();
            this.renderDonationRecords(donationRecords);
            this.updateDonationRecordsStats(this.mockData.donationRecords);
            
            // Hide loading
            if (loadingElement) loadingElement.style.display = 'none';
        }, 500);
    }

    getFilteredDonationRecords() {
        let filtered = this.mockData.donationRecords;

        // Apply test result filter
        if (this.currentDonationRecordTestFilter !== 'all') {
            filtered = filtered.filter(record => record.bloodTestResult === this.currentDonationRecordTestFilter);
        }

        // Apply search filter
        if (this.currentDonationRecordSearchTerm) {
            const searchTerm = this.currentDonationRecordSearchTerm.toLowerCase();
            filtered = filtered.filter(record => 
                record.id.toLowerCase().includes(searchTerm) ||
                record.donorId.toLowerCase().includes(searchTerm) ||
                record.donorName.toLowerCase().includes(searchTerm)
            );
        }

        return filtered;
    }

    renderDonationRecords(donationRecords) {
        const tableBody = document.getElementById('donationRecordsTableBody');
        const noDataElement = document.getElementById('noDonationRecordsMessage');
        const tableContainer = document.getElementById('donation-records-list');

        if (donationRecords.length === 0) {
            if (tableBody) tableBody.innerHTML = '';
            if (noDataElement) noDataElement.style.display = 'block';
            if (tableContainer) tableContainer.style.display = 'none';
            this.renderDonationRecordPagination(0, 0);
            return;
        }

        // Show table and hide no-data message
        if (noDataElement) noDataElement.style.display = 'none';
        if (tableContainer) tableContainer.style.display = 'block';

        // Pagination
        const startIndex = (this.currentDonationRecordPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const paginatedRecords = donationRecords.slice(startIndex, endIndex);

        const recordsHTML = paginatedRecords.map((record, index) => 
            this.renderDonationRecordRow(record, startIndex + index + 1)
        ).join('');

        if (tableBody) {
            tableBody.innerHTML = recordsHTML;
        }

        this.renderDonationRecordPagination(donationRecords.length, this.currentDonationRecordPage);
    }

    renderDonationRecordRow(record, index) {
        // Get donor information from donors data
        const donor = this.mockData.donors.find(d => d.id === record.donorId);
        const birthDate = donor ? this.formatDate(donor.birthDate) : '-';
        const cccd = donor ? donor.cccd : `00${String(record.donorId).padStart(2, '0')}${String(Math.floor(Math.random() * 9000) + 1000).padStart(4, '0')}${String(Math.floor(Math.random() * 90) + 10)}`;
        const phone = donor ? donor.phone : `09${String(Math.floor(Math.random() * 90000000) + 10000000)}`;
        
        return `
            <tr class="donation-record-row" data-record-id="${record.id}">
                <td>${index}</td>
                <td>
                    <span class="donation-record-id">${record.id}</span>
                </td>
                <td>
                    <span class="donor-id-display">${record.donorId}</span>
                </td>
                <td>
                    <div class="donor-name">${record.donorName}</div>
                </td>
                <td>
                    <div class="cccd-display">${cccd}</div>
                </td>
                <td>
                    <div class="phone-display">${phone}</div>
                </td>
                <td>
                    <div class="birth-date">${birthDate}</div>
                </td>
                <td>
                    <div class="donation-record-actions">
                        <button class="btn btn-outline-primary btn-sm" title="Xem lịch sử hiến máu">
                            <i class="fas fa-history"></i>
                        </button>
                        <button class="btn btn-outline-info btn-sm" title="In hồ sơ">
                            <i class="fas fa-print"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }

    showDonationRecordDetail(recordId) {
        const record = this.mockData.donationRecords.find(r => r.id === recordId);
        if (!record) return;

        // Get donor information
        const donor = this.mockData.donors.find(d => d.id === record.donorId);
        if (!donor) return;

        // Update donor info
        document.getElementById('detailDonorId').textContent = record.donorId;
        document.getElementById('detailDonorName').textContent = record.donorName;
        document.getElementById('detailDonorBirthDate').textContent = this.formatDate(donor.birthDate);

        // Get all donation records for this donor
        const donorRecords = this.mockData.donationRecords
            .filter(r => r.donorId === record.donorId)
            .sort((a, b) => new Date(b.donationDateTime) - new Date(a.donationDateTime));

        // Render donation history table
        this.renderDonationHistory(donorRecords);

        // Update title
        document.getElementById('donationRecordDetailTitle').textContent = `Lịch sử hiến máu của ${record.donorName}`;

        // Hide list and show detail
        document.getElementById('donation-records-list').style.display = 'none';
        document.getElementById('donation-record-detail').style.display = 'block';
    }

    renderDonationHistory(donorRecords) {
        const tableBody = document.getElementById('donationHistoryTableBody');
        if (!tableBody) return;

        if (donorRecords.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="11" class="text-center text-muted py-4">
                        <i class="fas fa-inbox fa-2x mb-2"></i>
                        <div>Không có lịch sử hiến máu</div>
                    </td>
                </tr>
            `;
            return;
        }

        const historyHTML = donorRecords.map((record, index) => {
            // Generate default values if not present
            const slotId = record.slotId || `SL${String(record.donorId).padStart(3, '0')}`;
            const appointmentId = record.appointmentId || `AP${record.id.replace('DR', '')}`;
            const staffId = record.staffId || `ST${String(Math.floor(Math.random() * 3) + 1).padStart(3, '0')}`;
            const bloodPressure = record.bloodPressure || '120/80';
            
            return `
                <tr>
                    <td>${index + 1}</td>
                    <td>${this.formatDateTime(record.donationDateTime)}</td>
                    <td>
                        <span class="badge bg-secondary">${slotId}</span>
                    </td>
                    <td>
                        <span class="badge bg-info">${appointmentId}</span>
                    </td>
                    <td>${staffId}</td>
                    <td>${record.donorWeight}</td>
                    <td>${record.donorTemperature}</td>
                    <td>${bloodPressure}</td>
                    <td>
                        <span class="badge bg-primary">${record.donationType}</span>
                    </td>
                    <td>${record.volumeDonated}</td>
                    <td>
                        <span class="text-truncate" style="max-width: 200px;" title="${record.note || 'Không có ghi chú'}">
                            ${record.note || '-'}
                        </span>
                    </td>
                </tr>
            `;
        }).join('');

        tableBody.innerHTML = historyHTML;
    }

    showDonationRecordsList() {
        document.getElementById('donation-record-detail').style.display = 'none';
        document.getElementById('donation-records-list').style.display = 'block';
    }

    renderDonationRecordPagination(totalItems, currentPage) {
        const paginationContainer = document.getElementById('donationRecordPagination');
        if (!paginationContainer) return;

        const totalPages = Math.ceil(totalItems / this.itemsPerPage);
        
        if (totalPages <= 1) {
            paginationContainer.innerHTML = '';
            return;
        }

        let paginationHTML = '';
        
        // Previous button
        paginationHTML += `
            <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
                <a class="page-link donation-record-page-btn" href="#" data-page="${currentPage - 1}">
                    <i class="fas fa-chevron-left"></i>
                </a>
            </li>
        `;

        // Page numbers
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
                paginationHTML += `
                    <li class="page-item ${i === currentPage ? 'active' : ''}">
                        <a class="page-link donation-record-page-btn" href="#" data-page="${i}">${i}</a>
                    </li>
                `;
            } else if (i === currentPage - 3 || i === currentPage + 3) {
                paginationHTML += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
            }
        }

        // Next button
        paginationHTML += `
            <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
                <a class="page-link donation-record-page-btn" href="#" data-page="${currentPage + 1}">
                    <i class="fas fa-chevron-right"></i>
                </a>
            </li>
        `;

        paginationContainer.innerHTML = paginationHTML;
    }

    updateDonationRecordsStats(allRecords) {
        const totalRecords = allRecords.length;
        const goodBloodRecords = allRecords.filter(record => record.bloodTestResult === 'good').length;
        const poorBloodRecords = allRecords.filter(record => record.bloodTestResult === 'poor').length;

        document.getElementById('totalDonationRecords').textContent = totalRecords;
        document.getElementById('goodBloodRecords').textContent = goodBloodRecords;
        document.getElementById('poorBloodRecords').textContent = poorBloodRecords;
    }

    formatDateTime(dateTime) {
        return new Date(dateTime).toLocaleString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    generateMockData() {
        return {
            donors: [
                {
                    id: 1,
                    name: 'Nguyễn Văn Anh',
                    email: 'nguyen.van.anh@email.com',
                    birthDate: '1990-05-15',
                    bloodType: 'A+',
                    lastDonationDate: '2025-01-10',
                    totalDonations: 12,
                    phone: '0901234567',
                    cccd: '001090012345'
                },
                {
                    id: 2,
                    name: 'Trần Thị Bình',
                    email: 'tran.thi.binh@email.com',
                    birthDate: '1985-08-22',
                    bloodType: 'O-',
                    lastDonationDate: '2024-11-25',
                    totalDonations: 8,
                    phone: '0912345678',
                    cccd: '001085023456'
                },
                {
                    id: 3,
                    name: 'Lê Minh Cường',
                    email: 'le.minh.cuong@email.com',
                    birthDate: '1992-03-10',
                    bloodType: 'B+',
                    lastDonationDate: '2025-01-05',
                    totalDonations: 15,
                    phone: '0923456789',
                    cccd: '001092034567'
                },
                {
                    id: 4,
                    name: 'Phạm Thị Dung',
                    email: 'pham.thi.dung@email.com',
                    birthDate: '1988-12-03',
                    bloodType: 'AB+',
                    lastDonationDate: '2024-12-20',
                    totalDonations: 6,
                    phone: '0934567890',
                    cccd: '001088045678'
                },
                {
                    id: 5,
                    name: 'Võ Văn Em',
                    email: 'vo.van.em@email.com',
                    birthDate: '1995-07-18',
                    bloodType: 'A-',
                    lastDonationDate: '2025-01-15',
                    totalDonations: 4,
                    phone: '0945678901'
                },
                {
                    id: 6,
                    name: 'Đặng Thị Phương',
                    email: 'dang.thi.phuong@email.com',
                    birthDate: '1991-11-27',
                    bloodType: 'O+',
                    lastDonationDate: '2024-10-12',
                    totalDonations: 18,
                    phone: '0956789012'
                },
                {
                    id: 7,
                    name: 'Hoàng Văn Giang',
                    email: 'hoang.van.giang@email.com',
                    birthDate: '1987-04-08',
                    bloodType: 'B-',
                    lastDonationDate: '2025-01-08',
                    totalDonations: 9,
                    phone: '0967890123'
                },
                {
                    id: 8,
                    name: 'Bùi Thị Hằng',
                    email: 'bui.thi.hang@email.com',
                    birthDate: '1993-09-14',
                    bloodType: 'AB-',
                    lastDonationDate: '2024-12-15',
                    totalDonations: 7,
                    phone: '0978901234'
                },
                {
                    id: 9,
                    name: 'Đỗ Minh Quang',
                    email: 'do.minh.quang@email.com',
                    birthDate: '1989-01-30',
                    bloodType: 'A+',
                    lastDonationDate: '2024-09-20',
                    totalDonations: 22,
                    phone: '0989012345'
                },
                {
                    id: 10,
                    name: 'Ngô Thị Lan',
                    email: 'ngo.thi.lan@email.com',
                    birthDate: '1994-06-25',
                    bloodType: 'O+',
                    lastDonationDate: '2025-01-12',
                    totalDonations: 3,
                    phone: '0990123456'
                },
                {
                    id: 11,
                    name: 'Dương Văn Minh',
                    email: 'duong.van.minh@email.com',
                    birthDate: '1986-10-05',
                    bloodType: 'B+',
                    lastDonationDate: '2024-08-15',
                    totalDonations: 16,
                    phone: '0901234560'
                },
                {
                    id: 12,
                    name: 'Cao Thị Nga',
                    email: 'cao.thi.nga@email.com',
                    birthDate: '1996-02-12',
                    bloodType: 'A-',
                    lastDonationDate: '2025-01-03',
                    totalDonations: 5,
                    phone: '0912345601'
                },
                {
                    id: 13,
                    name: 'Vũ Minh Tuấn',
                    email: 'vu.minh.tuan@email.com',
                    birthDate: '1984-08-17',
                    bloodType: 'AB+',
                    lastDonationDate: '2024-11-08',
                    totalDonations: 13,
                    phone: '0923456012'
                },
                {
                    id: 14,
                    name: 'Lý Thị Oanh',
                    email: 'ly.thi.oanh@email.com',
                    birthDate: '1997-12-21',
                    bloodType: 'O-',
                    lastDonationDate: '2025-01-07',
                    totalDonations: 2,
                    phone: '0934560123'
                },
                {
                    id: 15,
                    name: 'Trương Văn Phúc',
                    email: 'truong.van.phuc@email.com',
                    birthDate: '1983-05-09',
                    bloodType: 'B-',
                    lastDonationDate: '2024-07-25',
                    totalDonations: 25,
                    phone: '0945601234'
                },
                {
                    id: 16,
                    name: 'Đinh Thị Quỳnh',
                    email: 'dinh.thi.quynh@email.com',
                    birthDate: '1998-03-16',
                    bloodType: 'A+',
                    lastDonationDate: '2025-01-14',
                    totalDonations: 1,
                    phone: '0956012345'
                },
                {
                    id: 17,
                    name: 'Phan Minh Sơn',
                    email: 'phan.minh.son@email.com',
                    birthDate: '1990-11-04',
                    bloodType: 'O+',
                    lastDonationDate: '2024-12-28',
                    totalDonations: 11,
                    phone: '0967123456'
                },
                {
                    id: 18,
                    name: 'Mai Thị Trang',
                    email: 'mai.thi.trang@email.com',
                    birthDate: '1992-07-23',
                    bloodType: 'AB-',
                    lastDonationDate: '2024-10-30',
                    totalDonations: 14,
                    phone: '0978234567'
                },
                {
                    id: 19,
                    name: 'Hồ Văn Ước',
                    email: 'ho.van.uoc@email.com',
                    birthDate: '1987-01-11',
                    bloodType: 'B+',
                    lastDonationDate: '2025-01-01',
                    totalDonations: 19,
                    phone: '0989345678'
                },
                {
                    id: 20,
                    name: 'Chu Thị Vân',
                    email: 'chu.thi.van@email.com',
                    birthDate: '1995-04-28',
                    bloodType: 'A-',
                    lastDonationDate: '2024-09-12',
                    totalDonations: 10,
                    phone: '0990456789'
                }
            ],
            bloodUnits: [
                {
                    id: 'BU20250101001',
                    componentId: 'BC20250101001',
                    component: 'Hồng cầu',
                    volume: 450,
                    bloodType: 'A+',
                    donationDate: '2025-01-15',
                    expiryDate: '2025-03-15',
                    status: 'approved',
                    donorId: 1
                },
                {
                    id: 'BU20250101002',
                    componentId: 'BC20250101002',
                    component: 'Tiểu cầu',
                    volume: 450,
                    bloodType: 'O-',
                    donationDate: '2025-01-14',
                    expiryDate: '2025-03-14',
                    status: 'pending',
                    donorId: 2
                },
                {
                    id: 'BU20250101003',
                    componentId: 'BC20250101003',
                    component: 'Huyết tương',
                    volume: 350,
                    bloodType: 'B+',
                    donationDate: '2025-01-13',
                    expiryDate: '2025-03-13',
                    status: 'approved',
                    donorId: 3
                },
                {
                    id: 'BU20250101004',
                    componentId: 'BC20250101004',
                    component: 'Máu toàn phần',
                    volume: 450,
                    bloodType: 'AB+',
                    donationDate: '2025-01-12',
                    expiryDate: '2025-03-12',
                    status: 'denied',
                    donorId: 4
                },
                {
                    id: 'BU20250101005',
                    componentId: 'BC20250101005',
                    component: 'Hồng cầu',
                    volume: 450,
                    bloodType: 'A-',
                    donationDate: '2025-01-11',
                    expiryDate: '2025-03-11',
                    status: 'approved',
                    donorId: 5
                },
                {
                    id: 'BU20250101006',
                    componentId: 'BC20250101006',
                    component: 'Tiểu cầu',
                    volume: 400,
                    bloodType: 'O+',
                    donationDate: '2025-01-10',
                    expiryDate: '2025-03-10',
                    status: 'pending',
                    donorId: 6
                },
                {
                    id: 'BU20250101007',
                    componentId: 'BC20250101007',
                    component: 'Huyết tương',
                    volume: 450,
                    bloodType: 'B-',
                    donationDate: '2025-01-09',
                    expiryDate: '2025-03-09',
                    status: 'approved',
                    donorId: 7
                },
                {
                    id: 'BU20250101008',
                    componentId: 'BC20250101008',
                    component: 'Máu toàn phần',
                    volume: 450,
                    bloodType: 'AB-',
                    donationDate: '2025-01-08',
                    expiryDate: '2025-03-08',
                    status: 'approved',
                    donorId: 8
                },
                {
                    id: 'BU20250101009',
                    volume: 350,
                    bloodType: 'A+',
                    donationDate: '2025-01-07',
                    expiryDate: '2025-03-07',
                    status: 'pending',
                    donorId: 9
                },
                {
                    id: 'BU20250101010',
                    volume: 450,
                    bloodType: 'O+',
                    donationDate: '2025-01-06',
                    expiryDate: '2025-03-06',
                    status: 'approved',
                    donorId: 10
                },
                {
                    id: 'BU20250101011',
                    volume: 450,
                    bloodType: 'B+',
                    donationDate: '2025-01-05',
                    expiryDate: '2025-03-05',
                    status: 'denied',
                    donorId: 11
                },
                {
                    id: 'BU20250101012',
                    volume: 400,
                    bloodType: 'A-',
                    donationDate: '2025-01-04',
                    expiryDate: '2025-03-04',
                    status: 'approved',
                    donorId: 12
                },
                {
                    id: 'BU20250101013',
                    volume: 450,
                    bloodType: 'AB+',
                    donationDate: '2025-01-03',
                    expiryDate: '2025-03-03',
                    status: 'pending',
                    donorId: 13
                },
                {
                    id: 'BU20250101014',
                    volume: 450,
                    bloodType: 'O-',
                    donationDate: '2025-01-02',
                    expiryDate: '2025-03-02',
                    status: 'approved',
                    donorId: 14
                },
                {
                    id: 'BU20250101015',
                    volume: 350,
                    bloodType: 'B-',
                    donationDate: '2025-01-01',
                    expiryDate: '2025-03-01',
                    status: 'approved',
                    donorId: 15
                },
                {
                    id: 'BU20241201016',
                    volume: 450,
                    bloodType: 'A+',
                    donationDate: '2024-12-31',
                    expiryDate: '2025-02-28',
                    status: 'expired',
                    donorId: 16
                },
                {
                    id: 'BU20241201017',
                    volume: 450,
                    bloodType: 'O+',
                    donationDate: '2024-12-30',
                    expiryDate: '2025-02-27',
                    status: 'approved',
                    donorId: 17
                },
                {
                    id: 'BU20241201018',
                    volume: 400,
                    bloodType: 'AB-',
                    donationDate: '2024-12-29',
                    expiryDate: '2025-02-26',
                    status: 'pending',
                    donorId: 18
                },
                {
                    id: 'BU20241201019',
                    volume: 450,
                    bloodType: 'B+',
                    donationDate: '2024-12-28',
                    expiryDate: '2025-02-25',
                    status: 'approved',
                    donorId: 19
                },
                {
                    id: 'BU20241201020',
                    volume: 450,
                    bloodType: 'A-',
                    donationDate: '2024-12-27',
                    expiryDate: '2025-02-24',
                    status: 'denied',
                    donorId: 20
                }
            ],
            donationRecords: [
                {
                    id: 'DR20250115001',
                    donorId: 1,
                    donorName: 'Nguyễn Văn Anh',
                    donationDateTime: '2025-01-15 08:30:00',
                    donorWeight: 65,
                    donorTemperature: 36.5,
                    donationType: 'Máu toàn phần',
                    volumeDonated: 450,
                    bloodTestResult: 'good',
                    note: 'Người hiến khỏe mạnh, không có vấn đề gì trong quá trình hiến máu.',
                    slotId: 'SL001',
                    appointmentId: 'AP20250115001',
                    staffId: 'ST001',
                    bloodPressure: '120/80'
                },
                {
                    id: 'DR20250114001',
                    donorId: 2,
                    donorName: 'Trần Thị Bình',
                    donationDateTime: '2025-01-14 09:15:00',
                    donorWeight: 55,
                    donorTemperature: 36.8,
                    donationType: 'Huyết tương',
                    volumeDonated: 400,
                    bloodTestResult: 'poor',
                    note: 'Phát hiện chỉ số hemoglobin thấp, cần theo dõi thêm.',
                    slotId: 'SL002',
                    appointmentId: 'AP20250114001',
                    staffId: 'ST002',
                    bloodPressure: '110/70'
                },
                {
                    id: 'DR20250113001',
                    donorId: 3,
                    donorName: 'Lê Minh Cường',
                    donationDateTime: '2025-01-13 10:00:00',
                    donorWeight: 70,
                    donorTemperature: 36.2,
                    donationType: 'Máu toàn phần',
                    volumeDonated: 450,
                    bloodTestResult: 'good',
                    note: 'Tình trạng sức khỏe tốt, quá trình hiến máu suôn sẻ.',
                    slotId: 'SL003',
                    appointmentId: 'AP20250113001',
                    staffId: 'ST001',
                    bloodPressure: '125/85'
                },
                {
                    id: 'DR20250112001',
                    donorId: 4,
                    donorName: 'Phạm Thị Dung',
                    donationDateTime: '2025-01-12 14:20:00',
                    donorWeight: 58,
                    donorTemperature: 37.1,
                    donationType: 'Tiểu cầu',
                    volumeDonated: 300,
                    bloodTestResult: 'poor',
                    note: 'Phát hiện một số chỉ số bất thường trong máu, cần kiểm tra lại trước khi sử dụng.',
                    slotId: 'SL004',
                    appointmentId: 'AP20250112001',
                    staffId: 'ST003',
                    bloodPressure: '115/75'
                },
                {
                    id: 'DR20250111001',
                    donorId: 5,
                    donorName: 'Võ Văn Em',
                    donationDateTime: '2025-01-11 11:45:00',
                    donorWeight: 62,
                    donorTemperature: 36.4,
                    donationType: 'Máu toàn phần',
                    volumeDonated: 450,
                    bloodTestResult: 'good',
                    note: 'Người hiến lần đầu, rất hợp tác và không có phản ứng bất thường.',
                    slotId: 'SL005',
                    appointmentId: 'AP20250111001',
                    staffId: 'ST002',
                    bloodPressure: '118/78'
                },
                {
                    id: 'DR20250110001',
                    donorId: 6,
                    donorName: 'Đặng Thị Phương',
                    donationDateTime: '2025-01-10 13:30:00',
                    donorWeight: 60,
                    donorTemperature: 36.6,
                    donationType: 'Huyết tương',
                    volumeDonated: 400,
                    bloodTestResult: 'good',
                    note: 'Người hiến kinh nghiệm, quá trình diễn ra thuận lợi.'
                },
                {
                    id: 'DR20250109001',
                    donorId: 7,
                    donorName: 'Hoàng Văn Giang',
                    donationDateTime: '2025-01-09 09:00:00',
                    donorWeight: 68,
                    donorTemperature: 36.3,
                    donationType: 'Máu toàn phần',
                    volumeDonated: 450,
                    bloodTestResult: 'good',
                    note: 'Sức khỏe tốt, không có tiền sử bệnh lý.'
                },
                {
                    id: 'DR20250108001',
                    donorId: 8,
                    donorName: 'Bùi Thị Hằng',
                    donationDateTime: '2025-01-08 15:15:00',
                    donorWeight: 52,
                    donorTemperature: 36.7,
                    donationType: 'Tiểu cầu',
                    volumeDonated: 250,
                    bloodTestResult: 'poor',
                    note: 'Cân nặng ở mức thấp, cần cân nhắc kỹ trước khi sử dụng.'
                },
                {
                    id: 'DR20250107001',
                    donorId: 9,
                    donorName: 'Đỗ Minh Quang',
                    donationDateTime: '2025-01-07 08:45:00',
                    donorWeight: 75,
                    donorTemperature: 36.1,
                    donationType: 'Máu toàn phần',
                    volumeDonated: 450,
                    bloodTestResult: 'good',
                    note: 'Người hiến máu thường xuyên, có kinh nghiệm tốt.'
                },
                {
                    id: 'DR20250106001',
                    donorId: 10,
                    donorName: 'Ngô Thị Lan',
                    donationDateTime: '2025-01-06 16:30:00',
                    donorWeight: 57,
                    donorTemperature: 36.9,
                    donationType: 'Huyết tương',
                    volumeDonated: 350,
                    bloodTestResult: 'good',
                    note: 'Quá trình hiến máu bình thường, không có vấn đề gì.'
                },
                {
                    id: 'DR20250105001',
                    donorId: 11,
                    donorName: 'Dương Văn Minh',
                    donationDateTime: '2025-01-05 12:00:00',
                    donorWeight: 72,
                    donorTemperature: 36.4,
                    donationType: 'Máu toàn phần',
                    volumeDonated: 450,
                    bloodTestResult: 'good',
                    note: 'Tình trạng sức khỏe ổn định, hiến máu thành công.'
                },
                {
                    id: 'DR20250104001',
                    donorId: 12,
                    donorName: 'Cao Thị Nga',
                    donationDateTime: '2025-01-04 10:30:00',
                    donorWeight: 59,
                    donorTemperature: 36.5,
                    donationType: 'Tiểu cầu',
                    volumeDonated: 300,
                    bloodTestResult: 'poor',
                    note: 'Xét nghiệm phát hiện một số chỉ số bất thường, cần kiểm tra lại.'
                },
                {
                    id: 'DR20250103001',
                    donorId: 13,
                    donorName: 'Vũ Minh Tuấn',
                    donationDateTime: '2025-01-03 14:45:00',
                    donorWeight: 66,
                    donorTemperature: 36.2,
                    donationType: 'Huyết tương',
                    volumeDonated: 400,
                    bloodTestResult: 'good',
                    note: 'Người hiến hợp tác tốt, không có phản ứng phụ.'
                },
                {
                    id: 'DR20250102001',
                    donorId: 14,
                    donorName: 'Lý Thị Oanh',
                    donationDateTime: '2025-01-02 11:15:00',
                    donorWeight: 54,
                    donorTemperature: 36.7,
                    donationType: 'Máu toàn phần',
                    volumeDonated: 400,
                    bloodTestResult: 'good',
                    note: 'Người hiến trẻ tuổi, sức khỏe tốt.'
                },
                {
                    id: 'DR20250101001',
                    donorId: 15,
                    donorName: 'Trương Văn Phúc',
                    donationDateTime: '2025-01-01 15:00:00',
                    donorWeight: 78,
                    donorTemperature: 36.3,
                    donationType: 'Máu toàn phần',
                    volumeDonated: 450,
                    bloodTestResult: 'good',
                    note: 'Người hiến có kinh nghiệm lâu năm, rất tin cậy.'
                },
                {
                    id: 'DR20241231001',
                    donorId: 16,
                    donorName: 'Đinh Thị Quỳnh',
                    donationDateTime: '2024-12-31 09:30:00',
                    donorWeight: 56,
                    donorTemperature: 36.8,
                    donationType: 'Huyết tương',
                    volumeDonated: 350,
                    bloodTestResult: 'poor',
                    note: 'Xét nghiệm phát hiện một số chỉ số bất thường, cần kiểm tra kỹ trước khi sử dụng.'
                },
                {
                    id: 'DR20241230001',
                    donorId: 17,
                    donorName: 'Phan Minh Sơn',
                    donationDateTime: '2024-12-30 13:15:00',
                    donorWeight: 69,
                    donorTemperature: 36.1,
                    donationType: 'Máu toàn phần',
                    volumeDonated: 450,
                    bloodTestResult: 'good',
                    note: 'Quá trình hiến máu diễn ra suôn sẻ, không có vấn đề.'
                },
                {
                    id: 'DR20241229001',
                    donorId: 18,
                    donorName: 'Mai Thị Trang',
                    donationDateTime: '2024-12-29 16:45:00',
                    donorWeight: 61,
                    donorTemperature: 36.6,
                    donationType: 'Tiểu cầu',
                    volumeDonated: 280,
                    bloodTestResult: 'good',
                    note: 'Quá trình hiến máu bình thường.',
                    slotId: 'SL015',
                    appointmentId: 'AP20241229001',
                    staffId: 'ST002',
                    bloodPressure: '122/82'
                },
                // Additional historical records for donor 1 (Nguyễn Văn Anh)
                {
                    id: 'DR20241115001',
                    donorId: 1,
                    donorName: 'Nguyễn Văn Anh',
                    donationDateTime: '2024-11-15 09:30:00',
                    donorWeight: 64,
                    donorTemperature: 36.3,
                    donationType: 'Máu toàn phần',
                    volumeDonated: 450,
                    bloodTestResult: 'good',
                    note: 'Lần hiến máu thứ 11, tình trạng sức khỏe tốt.',
                    slotId: 'SL020',
                    appointmentId: 'AP20241115001',
                    staffId: 'ST001',
                    bloodPressure: '118/76'
                },
                {
                    id: 'DR20240915001',
                    donorId: 1,
                    donorName: 'Nguyễn Văn Anh',
                    donationDateTime: '2024-09-15 14:15:00',
                    donorWeight: 63,
                    donorTemperature: 36.4,
                    donationType: 'Huyết tương',
                    volumeDonated: 400,
                    bloodTestResult: 'good',
                    note: 'Lần hiến máu thứ 10, không có vấn đề gì.',
                    slotId: 'SL025',
                    appointmentId: 'AP20240915001',
                    staffId: 'ST003',
                    bloodPressure: '120/80'
                },
                {
                    id: 'DR20231228001',
                    donorId: 19,
                    donorName: 'Hồ Văn Ước',
                    donationDateTime: '2023-12-28 12:30:00',
                    donorWeight: 73,
                    donorTemperature: 36.4,
                    donationType: 'Máu toàn phần',
                    volumeDonated: 450,
                    bloodTestResult: 'good',
                    note: 'Người hiến có sức khỏe tốt, quá trình hiến máu bình thường.'
                },
                {
                    id: 'DR20231227001',
                    donorId: 20,
                    donorName: 'Chu Thị Vân',
                    donationDateTime: '2023-12-27 10:00:00',
                    donorWeight: 58,
                    donorTemperature: 37.0,
                    donationType: 'Huyết tương',
                    volumeDonated: 380,
                    bloodTestResult: 'poor',
                    note: 'Nhiệt độ cơ thể hơi cao, cần kiểm tra lại các chỉ số.'
                }
            ],
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

    searchDonationRecords() {
        const searchInput = document.getElementById('donationRecordSearchInput');
        if (searchInput) {
            this.currentDonationRecordSearchTerm = searchInput.value.trim();
            this.currentDonationRecordPage = 1;
            this.loadDonationRecords();
        }
    }

    // Create Record Modal Methods
    setupCreateRecordEventListeners() {
        // Save record button
        const saveBtn = document.getElementById('saveRecordBtn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                this.handleCreateRecord();
            });
        }

        // Form validation on input change
        const form = document.getElementById('createRecordForm');
        if (form) {
            const inputs = form.querySelectorAll('input, select, textarea');
            inputs.forEach(input => {
                input.addEventListener('input', () => {
                    this.validateField(input);
                });
            });
        }

        // Modal reset on close
        const modal = document.getElementById('createRecordModal');
        if (modal) {
            modal.addEventListener('hidden.bs.modal', () => {
                this.resetCreateRecordForm();
            });
        }

        // Set default values when modal opens
        const modal2 = document.getElementById('createRecordModal');
        if (modal2) {
            modal2.addEventListener('shown.bs.modal', () => {
                this.setDefaultValues();
            });
        }
    }

    setDefaultValues() {
        // Set current date as default for donation date
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('donationDate').value = today;
        
        // Set default staff ID (you can modify this based on logged-in staff)
        document.getElementById('staffId').value = 'ST001';
        
        // Generate next donor ID
        const nextDonorId = this.generateNextDonorId();
        document.getElementById('donorId').value = nextDonorId;
        
        // Generate next slot and appointment IDs
        document.getElementById('slotId').value = this.generateNextSlotId();
        document.getElementById('appointmentId').value = this.generateNextAppointmentId();
    }

    generateNextDonorId() {
        const existingIds = this.mockData.donationRecords.map(record => record.donorId);
        const maxId = Math.max(...existingIds, 0);
        return maxId + 1;
    }

    generateNextSlotId() {
        const existingSlots = this.mockData.donationRecords.map(record => record.slotId);
        const slotNumbers = existingSlots.map(slot => parseInt(slot.replace('SL', ''))).filter(num => !isNaN(num));
        const maxSlot = Math.max(...slotNumbers, 0);
        return `SL${String(maxSlot + 1).padStart(3, '0')}`;
    }

    generateNextAppointmentId() {
        const today = new Date();
        const dateStr = today.toISOString().split('T')[0].replace(/-/g, '');
        const existingAppointments = this.mockData.donationRecords
            .map(record => record.appointmentId)
            .filter(id => id.includes(dateStr));
        
        const appointmentNumbers = existingAppointments
            .map(id => parseInt(id.slice(-3)))
            .filter(num => !isNaN(num));
        
        const maxNum = Math.max(...appointmentNumbers, 0);
        return `AP${dateStr}${String(maxNum + 1).padStart(3, '0')}`;
    }

    validateField(field) {
        const value = field.value.trim();
        let isValid = true;
        let errorMessage = '';

        // Remove previous validation classes
        field.classList.remove('is-valid', 'is-invalid');

        // Check if required field is empty
        if (field.hasAttribute('required') && !value) {
            isValid = false;
            errorMessage = 'Trường này là bắt buộc';
        } else if (value) {
            // Specific validation rules
            switch (field.name) {
                case 'donorCCCD':
                    if (!/^[0-9]{12}$/.test(value)) {
                        isValid = false;
                        errorMessage = 'CCCD phải có 12 số';
                    }
                    break;
                case 'donorPhone':
                    if (!/^[0-9]{10,11}$/.test(value)) {
                        isValid = false;
                        errorMessage = 'Số điện thoại phải có 10-11 số';
                    }
                    break;
                case 'donorWeight':
                    const weight = parseFloat(value);
                    if (weight < 30 || weight > 200) {
                        isValid = false;
                        errorMessage = 'Cân nặng phải từ 30-200kg';
                    }
                    break;
                case 'donorTemperature':
                    const temp = parseFloat(value);
                    if (temp < 35 || temp > 42) {
                        isValid = false;
                        errorMessage = 'Nhiệt độ phải từ 35-42°C';
                    }
                    break;
                case 'bloodPressure':
                    if (!/^\d{2,3}\/\d{2,3}$/.test(value)) {
                        isValid = false;
                        errorMessage = 'Huyết áp phải có định dạng 120/80';
                    }
                    break;
                case 'donationVolume':
                    const volume = parseInt(value);
                    if (volume < 100 || volume > 500) {
                        isValid = false;
                        errorMessage = 'Thể tích phải từ 100-500ml';
                    }
                    break;
                case 'donorBirthDate':
                    const birthDate = new Date(value);
                    const today = new Date();
                    const age = today.getFullYear() - birthDate.getFullYear();
                    if (age < 18 || age > 65) {
                        isValid = false;
                        errorMessage = 'Tuổi phải từ 18-65';
                    }
                    break;
                case 'donationDate':
                    const donationDate = new Date(value);
                    const maxDate = new Date();
                    const minDate = new Date();
                    minDate.setFullYear(minDate.getFullYear() - 1);
                    if (donationDate > maxDate) {
                        isValid = false;
                        errorMessage = 'Ngày hiến không thể trong tương lai';
                    } else if (donationDate < minDate) {
                        isValid = false;
                        errorMessage = 'Ngày hiến không thể quá 1 năm trước';
                    }
                    break;
            }
        }

        // Apply validation classes
        if (isValid) {
            field.classList.add('is-valid');
        } else {
            field.classList.add('is-invalid');
            const feedback = field.parentElement.querySelector('.invalid-feedback');
            if (feedback) {
                feedback.textContent = errorMessage;
            }
        }

        return isValid;
    }

    handleCreateRecord() {
        const form = document.getElementById('createRecordForm');
        const formData = new FormData(form);
        let isFormValid = true;

        // Validate all fields
        const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isFormValid = false;
            }
        });

        if (!isFormValid) {
            this.showValidationError('Vui lòng kiểm tra lại các trường bắt buộc');
            return;
        }

        // Create new record object
        const newRecord = {
            id: this.generateNextRecordId(),
            donorId: parseInt(formData.get('donorId')),
            donorName: formData.get('donorName'),
            cccd: formData.get('donorCCCD'),
            phone: formData.get('donorPhone'),
            birthDate: formData.get('donorBirthDate'),
            donationDateTime: `${formData.get('donationDate')} 08:00:00`,
            donorWeight: parseFloat(formData.get('donorWeight')),
            donorTemperature: parseFloat(formData.get('donorTemperature')),
            donationType: formData.get('donationType'),
            volumeDonated: parseInt(formData.get('donationVolume')),
            bloodTestResult: 'good', // Default to good
            note: formData.get('donationNotes') || 'Không có ghi chú đặc biệt',
            slotId: formData.get('slotId'),
            appointmentId: formData.get('appointmentId'),
            staffId: formData.get('staffId'),
            bloodPressure: formData.get('bloodPressure')
        };

        // Add to mock data
        this.mockData.donationRecords.unshift(newRecord);

        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('createRecordModal'));
        modal.hide();

        // Show success message
        this.showCreateSuccessMessage();

        // Reload donation records
        this.loadDonationRecords();
    }

    generateNextRecordId() {
        const today = new Date();
        const dateStr = today.toISOString().split('T')[0].replace(/-/g, '');
        const existingRecords = this.mockData.donationRecords
            .map(record => record.id)
            .filter(id => id.includes(dateStr));
        
        const recordNumbers = existingRecords
            .map(id => parseInt(id.slice(-3)))
            .filter(num => !isNaN(num));
        
        const maxNum = Math.max(...recordNumbers, 0);
        return `DR${dateStr}${String(maxNum + 1).padStart(3, '0')}`;
    }

    showValidationError(message) {
        // Create toast notification
        const toast = document.createElement('div');
        toast.className = 'alert alert-danger alert-dismissible fade show position-fixed';
        toast.style.top = '20px';
        toast.style.right = '20px';
        toast.style.zIndex = '9999';
        toast.style.minWidth = '300px';
        
        toast.innerHTML = `
            <i class="fas fa-exclamation-triangle me-2"></i>
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(toast);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (document.body.contains(toast)) {
                toast.remove();
            }
        }, 5000);
    }

    showCreateSuccessMessage() {
        // Create toast notification
        const toast = document.createElement('div');
        toast.className = 'alert alert-success alert-dismissible fade show position-fixed';
        toast.style.top = '20px';
        toast.style.right = '20px';
        toast.style.zIndex = '9999';
        toast.style.minWidth = '300px';
        
        toast.innerHTML = `
            <i class="fas fa-check-circle me-2"></i>
            Đã tạo hồ sơ hiến máu thành công!
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(toast);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (document.body.contains(toast)) {
                toast.remove();
            }
        }, 5000);
    }

    resetCreateRecordForm() {
        const form = document.getElementById('createRecordForm');
        if (form) {
            form.reset();
            
            // Remove validation classes
            const inputs = form.querySelectorAll('input, select, textarea');
            inputs.forEach(input => {
                input.classList.remove('is-valid', 'is-invalid');
            });
        }
    }

    // Sidebar Toggle Methods
    setupSidebarToggle() {
        const toggleBtn = document.getElementById('sidebarToggle');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                this.toggleSidebar();
            });
        }

        // Close sidebar on mobile when clicking content area
        const dashboardContent = document.querySelector('.dashboard-content');
        if (dashboardContent) {
            dashboardContent.addEventListener('click', () => {
                if (window.innerWidth <= 768) {
                    this.closeSidebarOnMobile();
                }
            });
        }
    }

    toggleSidebar() {
        const sidebar = document.getElementById('dashboardSidebar');
        const toggleIcon = document.querySelector('#sidebarToggle i');
        const dashboardContainer = document.querySelector('.dashboard-container');
        
        if (sidebar.classList.contains('collapsed')) {
            // Expand sidebar
            sidebar.classList.remove('collapsed');
            dashboardContainer.classList.remove('sidebar-collapsed');
            toggleIcon.classList.remove('fa-chevron-right');
            toggleIcon.classList.add('fa-chevron-left');
            
            // Store state in localStorage
            localStorage.setItem('sidebarCollapsed', 'false');
        } else {
            // Collapse sidebar
            sidebar.classList.add('collapsed');
            dashboardContainer.classList.add('sidebar-collapsed');
            toggleIcon.classList.remove('fa-chevron-left');
            toggleIcon.classList.add('fa-chevron-right');
            
            // Store state in localStorage
            localStorage.setItem('sidebarCollapsed', 'true');
        }
    }

    closeSidebarOnMobile() {
        const sidebar = document.getElementById('dashboardSidebar');
        const dashboardContainer = document.querySelector('.dashboard-container');
        
        if (window.innerWidth <= 768 && !sidebar.classList.contains('collapsed')) {
            sidebar.classList.add('collapsed');
            dashboardContainer.classList.add('sidebar-collapsed');
        }
    }

    initializeSidebarState() {
        // Check if sidebar should be collapsed from localStorage
        const isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
        const sidebar = document.getElementById('dashboardSidebar');
        const toggleIcon = document.querySelector('#sidebarToggle i');
        const dashboardContainer = document.querySelector('.dashboard-container');
        
        if (isCollapsed) {
            sidebar.classList.add('collapsed');
            dashboardContainer.classList.add('sidebar-collapsed');
            toggleIcon.classList.remove('fa-chevron-left');
            toggleIcon.classList.add('fa-chevron-right');
        }

        // Auto-collapse on mobile devices
        if (window.innerWidth <= 768) {
            sidebar.classList.add('collapsed');
            dashboardContainer.classList.add('sidebar-collapsed');
            toggleIcon.classList.remove('fa-chevron-left');
            toggleIcon.classList.add('fa-chevron-right');
        }
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