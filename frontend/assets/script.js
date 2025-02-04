// frontend/assets/script.js

// Sample Vendor Data
const vendors = [
    {
        name: "Raj's Chaat Corner",
        location: [19.0760, 72.8777], // Mumbai
        tags: ["street-chaat", "north-indian", "verified"],
        specialties: ["Pani Puri", "Bhel Puri", "Sev Puri"],
        rating: 4.5
    },
    {
        name: "Dosa Delight",
        location: [13.0827, 80.2707], // Chennai
        tags: ["south-indian", "verified"],
        specialties: ["Masala Dosa", "Rava Dosa"],
        rating: 4.7
    },
    {
        name: "Sweet Street",
        location: [22.5726, 88.3639], // Kolkata
        tags: ["desserts", "north-indian"],
        specialties: ["Rasgulla", "Mishti Doi"],
        rating: 4.6
    }
];

// Map Initialization
const map = L.map('map').setView([20.5937, 78.9629], 5); // Default to India
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Render Vendors on Map and List
function renderVendors(filterTags = []) {
    const vendorList = document.getElementById('vendors');
    vendorList.innerHTML = ''; // Clear existing vendors

    vendors.forEach(vendor => {
        // Apply filters
        if (filterTags.length === 0 || filterTags.some(tag => vendor.tags.includes(tag))) {
            // Add marker to map
            L.marker(vendor.location)
                .addTo(map)
                .bindPopup(`
                    <b>${vendor.name}</b><br>
                    Specialties: ${vendor.specialties.join(', ')}<br>
                    Rating: ${vendor.rating}/5
                `);

            // Create vendor card
            const vendorCard = document.createElement('div');
            vendorCard.className = 'vendor-card';
            vendorCard.innerHTML = `
                <h3>${vendor.name}</h3>
                <p>Specialties: ${vendor.specialties.join(', ')}</p>
                <div class="vendor-tags">
                    ${vendor.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
                <button class="cta-button">View Details</button>
            `;
            vendorList.appendChild(vendorCard);
        }
    });
}

// Initialize geolocation
if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(position => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;
        map.setView([userLat, userLng], 14);
        L.marker([userLat, userLng])
            .addTo(map)
            .bindPopup("You are here!")
            .openPopup();
    });
}

// Filter Button Event Listeners
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        this.classList.toggle('active');
        const activeFilters = Array.from(document.querySelectorAll('.filter-btn.active'))
            .map(activeBtn => activeBtn.dataset.filter);
        renderVendors(activeFilters);
    });
});

// Search Functionality
function performSearch() {
    const searchTerm = document.getElementById('search').value.toLowerCase();
    const activeFilters = Array.from(document.querySelectorAll('.filter-btn.active'))
        .map(activeBtn => activeBtn.dataset.filter);
    
    const filteredVendors = vendors.filter(vendor => 
        (activeFilters.length === 0 || activeFilters.some(tag => vendor.tags.includes(tag))) &&
        (vendor.name.toLowerCase().includes(searchTerm) || 
         vendor.specialties.some(specialty => specialty.toLowerCase().includes(searchTerm)))
    );

    // Clear existing map markers
    map.eachLayer(layer => {
        if (layer instanceof L.Marker) {
            map.removeLayer(layer);
        }
    });

    // Re-render vendors
    const vendorList = document.getElementById('vendors');
    vendorList.innerHTML = '';

    filteredVendors.forEach(vendor => {
        // Add marker to map
        L.marker(vendor.location)
            .addTo(map)
            .bindPopup(`
                <b>${vendor.name}</b><br>
                Specialties: ${vendor.specialties.join(', ')}<br>
                Rating: ${vendor.rating}/5
            `);

        // Create vendor card
        const vendorCard = document.createElement('div');
        vendorCard.className = 'vendor-card';
        vendorCard.innerHTML = `
            <h3>${vendor.name}</h3>
            <p>Specialties: ${vendor.specialties.join(', ')}</p>
            <div class="vendor-tags">
                ${vendor.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>
            <button class="cta-button">View Details</button>
        `;
        vendorList.appendChild(vendorCard);
    });
}

document.querySelector('.search-btn').addEventListener('click', performSearch);
document.getElementById('search').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') performSearch();
});

// Initial render
renderVendors();