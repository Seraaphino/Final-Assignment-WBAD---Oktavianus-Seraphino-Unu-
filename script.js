// Car data as specified in the requirements
const cars = [
    {
        id: 1,
        name: "Toyota Avanza",
        price: 500000,
        image: "screenshots/avanza.jpg"
    },
    {
        id: 2,
        name: "Toyota Kijang Innova", 
        price: 700000,
        image: "screenshots/innova.jpg"
    },
    {
        id: 3,
        name: "Honda HRV",
        price: 600000,
        image: "screenshots/hrv.jpg"
    },
    {
        id: 4,
        name: "Daihatsu Sigra",
        price: 450000,
        image: "screenshots/sigra.jpg"
    }
];

// Global variables
let selectedCars = [];
let bookings = [];

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    renderCars();
    loadBookings();
    renderBookings();
});

// Render cars grid
function renderCars() {
    const carsGrid = document.getElementById('cars-grid');
    carsGrid.innerHTML = '';
    
    cars.forEach(car => {
        const carCard = document.createElement('div');
        carCard.className = 'car-card loading';
        carCard.innerHTML = `
            <img src="${car.image}" alt="${car.name}" class="car-image">
            <div class="car-info">
                <h3 class="car-name">${car.name}</h3>
                <p class="car-price">Rp ${formatPrice(car.price)} / hari</p>
                <div class="car-controls">
                    <div class="checkbox-container">
                        <input type="checkbox" id="car-${car.id}" onchange="toggleCar(${car.id})">
                        <label for="car-${car.id}">Pilih mobil ini</label>
                    </div>
                    <div class="date-duration">
                        <div class="input-group">
                            <label for="start-date-${car.id}">Tanggal Mulai</label>
                            <input type="date" id="start-date-${car.id}" min="${getTodayDate()}" onchange="updateCarData(${car.id})">
                        </div>
                        <div class="input-group">
                            <label for="duration-${car.id}">Durasi (hari)</label>
                            <input type="number" id="duration-${car.id}" min="1" max="30" placeholder="1" onchange="updateCarData(${car.id})">
                        </div>
                    </div>
                </div>
            </div>
        `;
        carsGrid.appendChild(carCard);
    });
}

// Toggle car selection
function toggleCar(carId) {
    const checkbox = document.getElementById(`car-${carId}`);
    const startDate = document.getElementById(`start-date-${carId}`).value;
    const duration = parseInt(document.getElementById(`duration-${carId}`).value) || 1;
    
    if (checkbox.checked) {
        if (!startDate) {
            alert('Silakan pilih tanggal mulai sewa!');
            checkbox.checked = false;
            return;
        }
        
        const car = cars.find(c => c.id === carId);
        const selectedCar = {
            id: carId,
            name: car.name,
            price: car.price,
            startDate: startDate,
            duration: duration,
            subtotal: car.price * duration
        };
        
        selectedCars.push(selectedCar);
    } else {
        selectedCars = selectedCars.filter(car => car.id !== carId);
    }
    
    updateBookingSummary();
}

// Update car data when date or duration changes
function updateCarData(carId) {
    const checkbox = document.getElementById(`car-${carId}`);
    if (checkbox.checked) {
        // Remove and re-add the car to update data
        checkbox.checked = false;
        toggleCar(carId);
        checkbox.checked = true;
        toggleCar(carId);
    }
}

// Update booking summary
function updateBookingSummary() {
    const summaryDiv = document.getElementById('booking-summary');
    
    if (selectedCars.length === 0) {
        summaryDiv.innerHTML = '<p style="text-align: center; color: #7f8c8d;">Belum ada mobil yang dipilih</p>';
        return;
    }
    
    let summaryHTML = '<h3 style="margin-bottom: 1rem; color: #2c3e50;">Ringkasan Pemesanan:</h3>';
    let total = 0;
    
    selectedCars.forEach(car => {
        summaryHTML += `
            <div class="summary-item">
                <div>
                    <strong>${car.name}</strong><br>
                    <small>${formatDate(car.startDate)} - ${car.duration} hari</small>
                </div>
                <div>Rp ${formatPrice(car.subtotal)}</div>
            </div>
        `;
        total += car.subtotal;
    });
    
    summaryHTML += `
        <div class="summary-item">
            <strong>Total Keseluruhan:</strong>
            <strong>Rp ${formatPrice(total)}</strong>
        </div>
    `;
    
    summaryDiv.innerHTML = summaryHTML;
}

// Calculate total (validation and display)
function calculateTotal() {
    const customerName = document.getElementById('customerName').value.trim();
    
    if (!customerName) {
        alert('Silakan masukkan nama pelanggan!');
        return;
    }
    
    if (selectedCars.length === 0) {
        alert('Silakan pilih minimal satu mobil!');
        return;
    }
    
    // Validate all selected cars have proper data
    for (let car of selectedCars) {
        if (!car.startDate || car.duration < 1) {
            alert(`Data tidak lengkap untuk ${car.name}. Silakan periksa tanggal dan durasi!`);
            return;
        }
    }
    
    updateBookingSummary();
    
    const total = selectedCars.reduce((sum, car) => sum + car.subtotal, 0);
    alert(`Perhitungan berhasil!\n\nPelanggan: ${customerName}\nJumlah mobil: ${selectedCars.length}\nTotal: Rp ${formatPrice(total)}\n\nSilakan klik "Save Booking" untuk menyimpan.`);
}

// Save booking to localStorage
function saveBooking() {
    const customerName = document.getElementById('customerName').value.trim();
    
    if (!customerName) {
        alert('Silakan masukkan nama pelanggan!');
        return;
    }
    
    if (selectedCars.length === 0) {
        alert('Silakan pilih minimal satu mobil!');
        return;
    }
    
    // Validate all selected cars
    for (let car of selectedCars) {
        if (!car.startDate || car.duration < 1) {
            alert(`Data tidak lengkap untuk ${car.name}. Silakan periksa tanggal dan durasi!`);
            return;
        }
    }
    
    const booking = {
        id: Date.now(),
        customerName: customerName,
        cars: [...selectedCars],
        total: selectedCars.reduce((sum, car) => sum + car.subtotal, 0),
        timestamp: new Date().toISOString(),
        date: new Date().toLocaleDateString('id-ID', {
            day: '2-digit',
            month: '2-digit', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    };
    
    bookings.push(booking);
    localStorage.setItem('carRentalBookings', JSON.stringify(bookings));
    
    alert(`Pemesanan berhasil disimpan!\n\nID Booking: ${booking.id}\nPelanggan: ${customerName}\nTotal: Rp ${formatPrice(booking.total)}`);
    
    // Reset form
    resetForm();
    renderBookings();
    scrollToSection('orders');
}

// Load bookings from localStorage
function loadBookings() {
    const savedBookings = localStorage.getItem('carRentalBookings');
    if (savedBookings) {
        bookings = JSON.parse(savedBookings);
    }
}

// Render bookings list
function renderBookings() {
    const ordersList = document.getElementById('orders-list');
    
    if (bookings.length === 0) {
        ordersList.innerHTML = '<p style="text-align: center; color: #7f8c8d; padding: 2rem;">Belum ada pemesanan</p>';
        return;
    }
    
    ordersList.innerHTML = '';
    
    // Sort bookings by timestamp (newest first)
    const sortedBookings = [...bookings].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    sortedBookings.forEach(booking => {
        const orderCard = document.createElement('div');
        orderCard.className = 'order-card';
        
        const carsText = booking.cars.map(car => 
            `${car.name} (${car.duration} hari)`
        ).join(', ');
        
        orderCard.innerHTML = `
            <div class="order-header">
                <div class="order-id">ID: ${booking.id}</div>
                <div class="order-date">${booking.date}</div>
            </div>
            <div class="order-details">
                <div class="order-customer">Pelanggan: ${booking.customerName}</div>
                <div class="order-cars">Mobil: ${carsText}</div>
            </div>
            <div class="order-total">Total: Rp ${formatPrice(booking.total)}</div>
            <button class="btn-delete" onclick="deleteBooking(${booking.id})">Hapus Pemesanan</button>
        `;
        
        ordersList.appendChild(orderCard);
    });
}

// Delete booking
function deleteBooking(bookingId) {
    if (confirm('Apakah Anda yakin ingin menghapus pemesanan ini?')) {
        bookings = bookings.filter(booking => booking.id !== bookingId);
        localStorage.setItem('carRentalBookings', JSON.stringify(bookings));
        renderBookings();
        alert('Pemesanan berhasil dihapus!');
    }
}

// Reset form
function resetForm() {
    document.getElementById('customerName').value = '';
    selectedCars = [];
    
    // Uncheck all checkboxes and clear inputs
    cars.forEach(car => {
        document.getElementById(`car-${car.id}`).checked = false;
        document.getElementById(`start-date-${car.id}`).value = '';
        document.getElementById(`duration-${car.id}`).value = '';
    });
    
    updateBookingSummary();
}

// Utility functions
function formatPrice(price) {
    return price.toLocaleString('id-ID');
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

function getTodayDate() {
    const today = new Date();
    return today.toISOString().split('T')[0];
}

function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
    }
}

// Smooth scrolling for navigation links
document.addEventListener('DOMContentLoaded', function() {
    const navLinks = document.querySelectorAll('.nav-center a');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            scrollToSection(targetId);
        });
    });
});

// Add some interactive effects
document.addEventListener('DOMContentLoaded', function() {
    // Add loading animation to elements
    const elements = document.querySelectorAll('.loading');
    elements.forEach((el, index) => {
        setTimeout(() => {
            el.style.opacity = '1';
        }, index * 100);
    });
    
    // Add hover effects to buttons
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
});

