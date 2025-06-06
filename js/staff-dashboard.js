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

        // Donor management event listeners
        this.setupDonorEventListeners();

        // Blood units management event listeners
        this.setupBloodUnitsEventListeners();
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
        const activeDonors = allDonors.filter(donor => this.daysSinceDate(donor.lastDonationDate) <= 365).length;
        const recentDonors = allDonors.filter(donor => this.daysSinceDate(donor.lastDonationDate) <= 30).length;
        const eligibleDonors = allDonors.filter(donor => this.daysSinceDate(donor.lastDonationDate) >= 56).length;

        document.getElementById('totalDonors').textContent = totalDonors;
        document.getElementById('activeDonors').textContent = activeDonors;
        document.getElementById('recentDonors').textContent = recentDonors;
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

        // Status change clicks
        document.addEventListener('click', (e) => {
            if (e.target.matches('.status-change-btn')) {
                e.preventDefault();
                const unitId = e.target.getAttribute('data-unit-id');
                const currentStatus = e.target.getAttribute('data-current-status');
                this.showStatusChangeOptions(unitId, currentStatus, e.target);
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

    loadBloodUnits() {
        const loadingElement = document.getElementById('bloodUnitsLoading');
        const tableBody = document.getElementById('bloodUnitsTableBody');
        const noDataElement = document.getElementById('noBloodUnitsMessage');
        
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

        // Sort by donation date (most recent first)
        filteredUnits.sort((a, b) => new Date(b.donationDate) - new Date(a.donationDate));

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
        
        return `
            <tr class="blood-unit-row">
                <td>${index}</td>
                <td>
                    <span class="blood-unit-id">${unit.id}</span>
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
        const statusOptions = [
            { value: 'approved', text: 'Đã duyệt', icon: 'fas fa-check-circle', class: 'text-success' },
            { value: 'denied', text: 'Từ chối', icon: 'fas fa-times-circle', class: 'text-danger' },
            { value: 'pending', text: 'Chờ duyệt', icon: 'fas fa-clock', class: 'text-warning' }
        ];

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

        const optionsHTML = statusOptions
            .filter(option => option.value !== currentStatus)
            .map(option => `
                <div class="dropdown-item status-option" data-status="${option.value}" data-unit-id="${unitId}">
                    <i class="${option.icon} ${option.class} me-2"></i>
                    ${option.text}
                </div>
            `).join('');

        dropdown.innerHTML = optionsHTML;

        // Position dropdown
        const rect = buttonElement.getBoundingClientRect();
        dropdown.style.left = rect.left + 'px';
        dropdown.style.top = (rect.bottom + 5) + 'px';

        // Add to body
        document.body.appendChild(dropdown);

        // Handle clicks
        dropdown.addEventListener('click', (e) => {
            if (e.target.matches('.status-option')) {
                const newStatus = e.target.getAttribute('data-status');
                const unitId = e.target.getAttribute('data-unit-id');
                this.changeBloodUnitStatus(unitId, newStatus);
                document.body.removeChild(dropdown);
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
        
        // Create toast notification
        const toast = document.createElement('div');
        toast.className = 'alert alert-success alert-dismissible fade show position-fixed';
        toast.style.top = '20px';
        toast.style.right = '20px';
        toast.style.zIndex = '9999';
        toast.style.minWidth = '300px';
        
        toast.innerHTML = `
            <i class="fas fa-check-circle me-2"></i>
            Đã cập nhật trạng thái túi máu <strong>${unitId}</strong> thành <strong>${statusText}</strong>
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(toast);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            if (document.body.contains(toast)) {
                document.body.removeChild(toast);
            }
        }, 3000);
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

    generateMockData() {
        return {
            donors: [
                {
                    id: 1,
                    name: 'Nguyễn Văn Anh',
                    email: 'nguyen.van.anh@email.com',
                    birthDate: '1990-05-15',
                    bloodType: 'A+',
                    lastDonationDate: '2024-01-10',
                    totalDonations: 12,
                    phone: '0901234567'
                },
                {
                    id: 2,
                    name: 'Trần Thị Bình',
                    email: 'tran.thi.binh@email.com',
                    birthDate: '1985-08-22',
                    bloodType: 'O-',
                    lastDonationDate: '2023-11-25',
                    totalDonations: 8,
                    phone: '0912345678'
                },
                {
                    id: 3,
                    name: 'Lê Minh Cường',
                    email: 'le.minh.cuong@email.com',
                    birthDate: '1992-03-10',
                    bloodType: 'B+',
                    lastDonationDate: '2024-01-05',
                    totalDonations: 15,
                    phone: '0923456789'
                },
                {
                    id: 4,
                    name: 'Phạm Thị Dung',
                    email: 'pham.thi.dung@email.com',
                    birthDate: '1988-12-03',
                    bloodType: 'AB+',
                    lastDonationDate: '2023-12-20',
                    totalDonations: 6,
                    phone: '0934567890'
                },
                {
                    id: 5,
                    name: 'Võ Văn Em',
                    email: 'vo.van.em@email.com',
                    birthDate: '1995-07-18',
                    bloodType: 'A-',
                    lastDonationDate: '2024-01-15',
                    totalDonations: 4,
                    phone: '0945678901'
                },
                {
                    id: 6,
                    name: 'Đặng Thị Phương',
                    email: 'dang.thi.phuong@email.com',
                    birthDate: '1991-11-27',
                    bloodType: 'O+',
                    lastDonationDate: '2023-10-12',
                    totalDonations: 18,
                    phone: '0956789012'
                },
                {
                    id: 7,
                    name: 'Hoàng Văn Giang',
                    email: 'hoang.van.giang@email.com',
                    birthDate: '1987-04-08',
                    bloodType: 'B-',
                    lastDonationDate: '2024-01-08',
                    totalDonations: 9,
                    phone: '0967890123'
                },
                {
                    id: 8,
                    name: 'Bùi Thị Hằng',
                    email: 'bui.thi.hang@email.com',
                    birthDate: '1993-09-14',
                    bloodType: 'AB-',
                    lastDonationDate: '2023-12-15',
                    totalDonations: 7,
                    phone: '0978901234'
                },
                {
                    id: 9,
                    name: 'Đỗ Minh Quang',
                    email: 'do.minh.quang@email.com',
                    birthDate: '1989-01-30',
                    bloodType: 'A+',
                    lastDonationDate: '2023-09-20',
                    totalDonations: 22,
                    phone: '0989012345'
                },
                {
                    id: 10,
                    name: 'Ngô Thị Lan',
                    email: 'ngo.thi.lan@email.com',
                    birthDate: '1994-06-25',
                    bloodType: 'O+',
                    lastDonationDate: '2024-01-12',
                    totalDonations: 3,
                    phone: '0990123456'
                },
                {
                    id: 11,
                    name: 'Dương Văn Minh',
                    email: 'duong.van.minh@email.com',
                    birthDate: '1986-10-05',
                    bloodType: 'B+',
                    lastDonationDate: '2023-08-15',
                    totalDonations: 16,
                    phone: '0901234560'
                },
                {
                    id: 12,
                    name: 'Cao Thị Nga',
                    email: 'cao.thi.nga@email.com',
                    birthDate: '1996-02-12',
                    bloodType: 'A-',
                    lastDonationDate: '2024-01-03',
                    totalDonations: 5,
                    phone: '0912345601'
                },
                {
                    id: 13,
                    name: 'Vũ Minh Tuấn',
                    email: 'vu.minh.tuan@email.com',
                    birthDate: '1984-08-17',
                    bloodType: 'AB+',
                    lastDonationDate: '2023-11-08',
                    totalDonations: 13,
                    phone: '0923456012'
                },
                {
                    id: 14,
                    name: 'Lý Thị Oanh',
                    email: 'ly.thi.oanh@email.com',
                    birthDate: '1997-12-21',
                    bloodType: 'O-',
                    lastDonationDate: '2024-01-07',
                    totalDonations: 2,
                    phone: '0934560123'
                },
                {
                    id: 15,
                    name: 'Trương Văn Phúc',
                    email: 'truong.van.phuc@email.com',
                    birthDate: '1983-05-09',
                    bloodType: 'B-',
                    lastDonationDate: '2023-07-25',
                    totalDonations: 25,
                    phone: '0945601234'
                },
                {
                    id: 16,
                    name: 'Đinh Thị Quỳnh',
                    email: 'dinh.thi.quynh@email.com',
                    birthDate: '1998-03-16',
                    bloodType: 'A+',
                    lastDonationDate: '2024-01-14',
                    totalDonations: 1,
                    phone: '0956012345'
                },
                {
                    id: 17,
                    name: 'Phan Minh Sơn',
                    email: 'phan.minh.son@email.com',
                    birthDate: '1990-11-04',
                    bloodType: 'O+',
                    lastDonationDate: '2023-12-28',
                    totalDonations: 11,
                    phone: '0967123456'
                },
                {
                    id: 18,
                    name: 'Mai Thị Trang',
                    email: 'mai.thi.trang@email.com',
                    birthDate: '1992-07-23',
                    bloodType: 'AB-',
                    lastDonationDate: '2023-10-30',
                    totalDonations: 14,
                    phone: '0978234567'
                },
                {
                    id: 19,
                    name: 'Hồ Văn Ước',
                    email: 'ho.van.uoc@email.com',
                    birthDate: '1987-01-11',
                    bloodType: 'B+',
                    lastDonationDate: '2024-01-01',
                    totalDonations: 19,
                    phone: '0989345678'
                },
                {
                    id: 20,
                    name: 'Chu Thị Vân',
                    email: 'chu.thi.van@email.com',
                    birthDate: '1995-04-28',
                    bloodType: 'A-',
                    lastDonationDate: '2023-09-12',
                    totalDonations: 10,
                    phone: '0990456789'
                }
            ],
            bloodUnits: [
                {
                    id: 'BU20240101001',
                    volume: 450,
                    bloodType: 'A+',
                    donationDate: '2024-01-15',
                    expiryDate: '2024-03-15',
                    status: 'approved',
                    donorId: 1
                },
                {
                    id: 'BU20240101002',
                    volume: 450,
                    bloodType: 'O-',
                    donationDate: '2024-01-14',
                    expiryDate: '2024-03-14',
                    status: 'pending',
                    donorId: 2
                },
                {
                    id: 'BU20240101003',
                    volume: 350,
                    bloodType: 'B+',
                    donationDate: '2024-01-13',
                    expiryDate: '2024-03-13',
                    status: 'approved',
                    donorId: 3
                },
                {
                    id: 'BU20240101004',
                    volume: 450,
                    bloodType: 'AB+',
                    donationDate: '2024-01-12',
                    expiryDate: '2024-03-12',
                    status: 'denied',
                    donorId: 4
                },
                {
                    id: 'BU20240101005',
                    volume: 450,
                    bloodType: 'A-',
                    donationDate: '2024-01-11',
                    expiryDate: '2024-03-11',
                    status: 'approved',
                    donorId: 5
                },
                {
                    id: 'BU20240101006',
                    volume: 400,
                    bloodType: 'O+',
                    donationDate: '2024-01-10',
                    expiryDate: '2024-03-10',
                    status: 'pending',
                    donorId: 6
                },
                {
                    id: 'BU20240101007',
                    volume: 450,
                    bloodType: 'B-',
                    donationDate: '2024-01-09',
                    expiryDate: '2024-03-09',
                    status: 'approved',
                    donorId: 7
                },
                {
                    id: 'BU20240101008',
                    volume: 450,
                    bloodType: 'AB-',
                    donationDate: '2024-01-08',
                    expiryDate: '2024-03-08',
                    status: 'approved',
                    donorId: 8
                },
                {
                    id: 'BU20240101009',
                    volume: 350,
                    bloodType: 'A+',
                    donationDate: '2024-01-07',
                    expiryDate: '2024-03-07',
                    status: 'pending',
                    donorId: 9
                },
                {
                    id: 'BU20240101010',
                    volume: 450,
                    bloodType: 'O+',
                    donationDate: '2024-01-06',
                    expiryDate: '2024-03-06',
                    status: 'approved',
                    donorId: 10
                },
                {
                    id: 'BU20240101011',
                    volume: 450,
                    bloodType: 'B+',
                    donationDate: '2024-01-05',
                    expiryDate: '2024-03-05',
                    status: 'denied',
                    donorId: 11
                },
                {
                    id: 'BU20240101012',
                    volume: 400,
                    bloodType: 'A-',
                    donationDate: '2024-01-04',
                    expiryDate: '2024-03-04',
                    status: 'approved',
                    donorId: 12
                },
                {
                    id: 'BU20240101013',
                    volume: 450,
                    bloodType: 'AB+',
                    donationDate: '2024-01-03',
                    expiryDate: '2024-03-03',
                    status: 'pending',
                    donorId: 13
                },
                {
                    id: 'BU20240101014',
                    volume: 450,
                    bloodType: 'O-',
                    donationDate: '2024-01-02',
                    expiryDate: '2024-03-02',
                    status: 'approved',
                    donorId: 14
                },
                {
                    id: 'BU20240101015',
                    volume: 350,
                    bloodType: 'B-',
                    donationDate: '2024-01-01',
                    expiryDate: '2024-03-01',
                    status: 'approved',
                    donorId: 15
                },
                {
                    id: 'BU20231201016',
                    volume: 450,
                    bloodType: 'A+',
                    donationDate: '2023-12-31',
                    expiryDate: '2024-02-29',
                    status: 'expired',
                    donorId: 16
                },
                {
                    id: 'BU20231201017',
                    volume: 450,
                    bloodType: 'O+',
                    donationDate: '2023-12-30',
                    expiryDate: '2024-02-28',
                    status: 'approved',
                    donorId: 17
                },
                {
                    id: 'BU20231201018',
                    volume: 400,
                    bloodType: 'AB-',
                    donationDate: '2023-12-29',
                    expiryDate: '2024-02-27',
                    status: 'pending',
                    donorId: 18
                },
                {
                    id: 'BU20231201019',
                    volume: 450,
                    bloodType: 'B+',
                    donationDate: '2023-12-28',
                    expiryDate: '2024-02-26',
                    status: 'approved',
                    donorId: 19
                },
                {
                    id: 'BU20231201020',
                    volume: 450,
                    bloodType: 'A-',
                    donationDate: '2023-12-27',
                    expiryDate: '2024-02-25',
                    status: 'denied',
                    donorId: 20
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