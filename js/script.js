// Blood Donation Support System - Main JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Initialize components
    initializeAppointmentModal();
    setupEventListeners();
    loadDonationLocations();
    loadAvailableTimes();
    
    // Check for any saved appointment data in local storage
    checkSavedAppointmentData();
});

// Initialize the appointment modal
function initializeAppointmentModal() {
    // Setup appointment date min/max values
    const apptDateInput = document.getElementById('apptDate');
    if (apptDateInput) {
        const today = new Date();
        const maxDate = new Date();
        maxDate.setDate(today.getDate() + 60); // Allow booking 60 days in advance
        
        const todayFormatted = today.toISOString().split('T')[0];
        const maxDateFormatted = maxDate.toISOString().split('T')[0];
        
        apptDateInput.setAttribute('min', todayFormatted);
        apptDateInput.setAttribute('max', maxDateFormatted);
    }
}

// Set up all event listeners for interactive elements
function setupEventListeners() {
    // Find a Blood Drive button
    const findDriveBtn = document.getElementById('findDriveBtn');
    if (findDriveBtn) {
        findDriveBtn.addEventListener('click', function() {
            const zipCode = document.getElementById('zipCodeInput').value.trim();
            if (zipCode) {
                searchBloodDrives(zipCode);
            } else {
                showAlert('Please enter a valid ZIP code', 'warning');
            }
        });
    }

    // Make an Appointment link
    const appointmentLinks = document.querySelectorAll('a[href="#appointment"]');
    appointmentLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Get the Bootstrap modal object and show it
            const appointmentModal = new bootstrap.Modal(document.getElementById('appointmentModal'));
            appointmentModal.show();
        });
    });

    // Appointment form submission
    const submitAppointmentBtn = document.getElementById('submitAppointment');
    if (submitAppointmentBtn) {
        submitAppointmentBtn.addEventListener('click', function() {
            handleAppointmentSubmission();
        });
    }

    // Guide form submission
    const guideForm = document.getElementById('guideForm');
    if (guideForm) {
        guideForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleGuideFormSubmission();
        });
    }

    // Appointment date change - to update available times
    const apptDate = document.getElementById('apptDate');
    if (apptDate) {
        apptDate.addEventListener('change', function() {
            // Reload available times based on selected date
            loadAvailableTimes(this.value);
        });
    }

    // Zipcode input - allow search on Enter key
    const zipCodeInput = document.getElementById('zipCodeInput');
    if (zipCodeInput) {
        zipCodeInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                document.getElementById('findDriveBtn').click();
            }
        });
    }
}

// Load sample donation locations
function loadDonationLocations() {
    const locationSelect = document.getElementById('apptLocation');
    if (!locationSelect) return;
    
    // Sample data - in a real app, this would come from an API
    const locations = [
        { id: 1, name: 'Main City Blood Center', address: '123 Main St' },
        { id: 2, name: 'Eastside Community Hospital', address: '456 East Ave' },
        { id: 3, name: 'Westview Medical Center', address: '789 West Blvd' },
        { id: 4, name: 'North County Mobile Drive', address: '321 North Rd' },
        { id: 5, name: 'South Campus Donation Center', address: '654 South St' }
    ];
    
    // Clear existing options except the first one
    while (locationSelect.options.length > 1) {
        locationSelect.remove(1);
    }
    
    // Add locations to the select element
    locations.forEach(location => {
        const option = document.createElement('option');
        option.value = location.id;
        option.textContent = `${location.name} - ${location.address}`;
        locationSelect.appendChild(option);
    });
}

// Load available appointment times
function loadAvailableTimes(selectedDate) {
    const timeSelect = document.getElementById('apptTime');
    if (!timeSelect) return;
    
    // Clear existing options except the first one
    while (timeSelect.options.length > 1) {
        timeSelect.remove(1);
    }
    
    // Sample time slots - in a real app, these would be filtered based on availability
    const timeSlots = [
        '8:00 AM', '8:30 AM', '9:00 AM', '9:30 AM', 
        '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
        '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM',
        '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM',
        '5:00 PM', '5:30 PM', '6:00 PM'
    ];
    
    // Add time slots
    timeSlots.forEach(time => {
        // In a real app, you would filter available times based on the selectedDate
        // For now, we'll just add all times
        const option = document.createElement('option');
        option.value = time;
        option.textContent = time;
        timeSelect.appendChild(option);
    });
}

// Handle the appointment form submission
function handleAppointmentSubmission() {
    // Get form data
    const appointmentForm = document.getElementById('appointmentForm');
    const formElements = appointmentForm.elements;
    
    // Simple validation
    let isValid = true;
    let firstInvalidField = null;
    
    for (let i = 0; i < formElements.length; i++) {
        const field = formElements[i];
        if (field.hasAttribute('required') && !field.value.trim()) {
            isValid = false;
            field.classList.add('is-invalid');
            if (!firstInvalidField) firstInvalidField = field;
        } else {
            field.classList.remove('is-invalid');
        }
    }
    
    // If form is invalid, focus on the first invalid field
    if (!isValid) {
        firstInvalidField.focus();
        return;
    }
    
    // Collect form data
    const appointmentData = {
        firstName: document.getElementById('apptFirstName').value,
        lastName: document.getElementById('apptLastName').value,
        email: document.getElementById('apptEmail').value,
        phone: document.getElementById('apptPhone').value,
        location: document.getElementById('apptLocation').options[document.getElementById('apptLocation').selectedIndex].text,
        date: document.getElementById('apptDate').value,
        time: document.getElementById('apptTime').value,
        bloodType: document.getElementById('bloodType').value,
        firstTime: document.getElementById('firstTime').checked
    };
    
    // In a real app, you would send this data to your server
    console.log('Appointment Data:', appointmentData);
    
    // Save to local storage for demo purposes
    saveAppointmentToLocalStorage(appointmentData);
    
    // Close the modal
    bootstrap.Modal.getInstance(document.getElementById('appointmentModal')).hide();
    
    // Show success message
    showAlert('Your appointment has been scheduled successfully!', 'success');
}

// Handle guide form submission
function handleGuideFormSubmission() {
    // Get form data
    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const email = document.getElementById('email').value.trim();
    const zipCode = document.getElementById('zipCode').value.trim();
    
    // Simple validation
    if (!firstName || !lastName || !email || !zipCode) {
        showAlert('Please fill in all required fields', 'warning');
        return;
    }
    
    // In a real app, you would send this data to your server
    const guideData = { firstName, lastName, email, zipCode };
    console.log('Guide Request Data:', guideData);
    
    // Reset form
    document.getElementById('guideForm').reset();
    
    // Show success message
    showAlert('Thank you! Your donor guide will be sent to your email shortly.', 'success');
}

// Search for blood drives by ZIP code
function searchBloodDrives(zipCode) {
    // In a real app, this would make an API call to get nearby blood drives
    console.log(`Searching for blood drives near ${zipCode}`);
    
    // Simulate API response with sample data
    setTimeout(() => {
        // Sample blood drive locations - in a real app, these would come from an API
        const bloodDrives = [
            { 
                id: 1, 
                name: 'Community Center Blood Drive', 
                address: '123 Main St', 
                city: 'Anytown',
                date: '2025-05-20', 
                timeStart: '9:00 AM', 
                timeEnd: '3:00 PM',
                distance: '2.3 miles'
            },
            { 
                id: 2, 
                name: 'Local High School Drive', 
                address: '456 School Ave', 
                city: 'Anytown',
                date: '2025-05-22', 
                timeStart: '10:00 AM', 
                timeEnd: '4:00 PM',
                distance: '3.1 miles'
            },
            { 
                id: 3, 
                name: 'Downtown Medical Center', 
                address: '789 Medical Blvd', 
                city: 'Anytown',
                date: '2025-05-25', 
                timeStart: '8:00 AM', 
                timeEnd: '6:00 PM',
                distance: '4.5 miles'
            }
        ];
        
        displayBloodDriveResults(bloodDrives);
    }, 1000);
    
    // Show loading message
    showAlert('Searching for blood drives in your area...', 'info');
}

// Display blood drive search results
function displayBloodDriveResults(drives) {
    // Create modal for displaying results
    const modalHTML = `
    <div class="modal fade" id="bloodDriveResultsModal" tabindex="-1">
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header bg-danger text-white">
                    <h5 class="modal-title">Blood Drives Near You</h5>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <div class="list-group">
                        ${drives.map(drive => `
                            <div class="list-group-item">
                                <div class="d-flex w-100 justify-content-between">
                                    <h5 class="mb-1">${drive.name}</h5>
                                    <small>${drive.distance}</small>
                                </div>
                                <p class="mb-1">${drive.address}, ${drive.city}</p>
                                <p class="mb-1">${formatDate(drive.date)} • ${drive.timeStart} to ${drive.timeEnd}</p>
                                <button class="btn btn-outline-danger btn-sm mt-2" 
                                        onclick="selectBloodDrive('${drive.id}', '${drive.name}', '${drive.date}')">
                                    Schedule Appointment
                                </button>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                </div>
            </div>
        </div>
    </div>
    `;
    
    // Add modal to the document
    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = modalHTML;
    document.body.appendChild(modalContainer);
    
    // Show the modal
    const resultsModal = new bootstrap.Modal(document.getElementById('bloodDriveResultsModal'));
    resultsModal.show();
    
    // Clean up when modal is hidden
    document.getElementById('bloodDriveResultsModal').addEventListener('hidden.bs.modal', function () {
        document.body.removeChild(modalContainer);
    });
}

// Function to format date in a user-friendly way
function formatDate(dateString) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

// Select a blood drive and open the appointment modal
window.selectBloodDrive = function(driveId, driveName, driveDate) {
    // Close the search results modal
    bootstrap.Modal.getInstance(document.getElementById('bloodDriveResultsModal')).hide();
    
    // Pre-fill the appointment form with the selected drive info
    document.getElementById('apptLocation').value = driveId;
    document.getElementById('apptDate').value = driveDate;
    
    // Show the appointment modal
    const appointmentModal = new bootstrap.Modal(document.getElementById('appointmentModal'));
    appointmentModal.show();
};

// Helper function to show alerts to the user
function showAlert(message, type = 'info') {
    // Create alert element
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3`;
    alertDiv.style.zIndex = '9999';
    alertDiv.role = 'alert';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    // Add to document
    document.body.appendChild(alertDiv);
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
        if (alertDiv.parentNode) {
            const bsAlert = new bootstrap.Alert(alertDiv);
            bsAlert.close();
        }
    }, 5000);
    
    // Remove from DOM after animation
    alertDiv.addEventListener('closed.bs.alert', function () {
        if (alertDiv.parentNode) {
            document.body.removeChild(alertDiv);
        }
    });
}

// Save appointment to local storage
function saveAppointmentToLocalStorage(data) {
    // Get existing appointments or initialize empty array
    let appointments = JSON.parse(localStorage.getItem('bloodDonationAppointments') || '[]');
    
    // Add new appointment with unique ID
    data.id = Date.now();
    data.createdAt = new Date().toISOString();
    appointments.push(data);
    
    // Save back to local storage
    localStorage.setItem('bloodDonationAppointments', JSON.stringify(appointments));
}

// Check for saved appointments
function checkSavedAppointmentData() {
    const appointments = JSON.parse(localStorage.getItem('bloodDonationAppointments') || '[]');
    
    if (appointments.length > 0) {
        // Sort appointments by date
        appointments.sort((a, b) => new Date(a.date) - new Date(b.date));
        
        // Get the next upcoming appointment
        const nextAppointment = appointments.find(apt => new Date(apt.date) >= new Date());
        
        if (nextAppointment) {
            // Show info to the user about the upcoming appointment
            const message = `You have an upcoming blood donation appointment on ${formatDate(nextAppointment.date)} at ${nextAppointment.time}.`;
            setTimeout(() => {
                showAlert(message, 'info');
            }, 2000);
        }
    }
}

// Blood Type Eligibility Checker
// This function could be expanded to provide more detailed eligibility information
window.checkEligibility = function() {
    const bloodTypeSelect = document.getElementById('bloodTypeCheck');
    const bloodType = bloodTypeSelect.value;
    
    if (!bloodType) {
        showAlert('Please select your blood type', 'warning');
        return;
    }
    
    // Simple messaging based on blood type
    // In a real app, this would be more sophisticated
    let message = '';
    
    switch (bloodType) {
        case 'O-':
            message = 'Your blood type O- is especially valuable as you are a universal donor! Your donations can help patients of all blood types.';
            break;
        case 'O+':
            message = 'Your blood type O+ is very common and always in high demand. You can donate to any Rh+ blood type recipient.';
            break;
        case 'A-':
            message = 'Your blood type A- is somewhat rare. You can donate to A and AB recipients, and your plasma is valuable for all blood types.';
            break;
        case 'A+':
            message = 'Your blood type A+ is common. You can donate to A+ and AB+ recipients.';
            break;
        case 'B-':
            message = 'Your blood type B- is rare. You can donate to B and AB recipients.';
            break;
        case 'B+':
            message = 'Your blood type B+ is somewhat common. You can donate to B+ and AB+ recipients.';
            break;
        case 'AB-':
            message = 'Your blood type AB- is rare. You can donate to AB recipients, and your plasma can be given to all blood types.';
            break;
        case 'AB+':
            message = 'Your blood type AB+ means you are a universal plasma donor! While your red cells can only go to AB+ recipients, your plasma can help anyone.';
            break;
    }
    
    message += ' All blood types are needed. Schedule your donation today!';
    showAlert(message, 'info');
};
