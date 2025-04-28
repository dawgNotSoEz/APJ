// frontend/assets/script.js

const API_BASE_URL = 'http://localhost:4567/api';
let map;
let markers = [];

// Map Initialization
function initMap() {
    map = L.map('map').setView([20.5937, 78.9629], 5); // Default to India
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

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
}

// API Calls
async function fetchVendors() {
    try {
        const response = await fetch(`${API_BASE_URL}/vendors`);
        if (!response.ok) throw new Error('Failed to fetch vendors');
        return await response.json();
    } catch (error) {
        showError('Failed to load vendors. Please try again later.');
        console.error('Error fetching vendors:', error);
        return [];
    }
}

async function fetchVendorDetails(vendorId) {
    try {
        const response = await fetch(`${API_BASE_URL}/vendors/${vendorId}`);
        if (!response.ok) throw new Error('Failed to fetch vendor details');
        return await response.json();
    } catch (error) {
        showError('Failed to load vendor details. Please try again later.');
        console.error('Error fetching vendor details:', error);
        return null;
    }
}

async function fetchVendorReviews(vendorId) {
    try {
        const response = await fetch(`${API_BASE_URL}/vendors/${vendorId}/reviews`);
        if (!response.ok) throw new Error('Failed to fetch reviews');
        return await response.json();
    } catch (error) {
        showError('Failed to load reviews. Please try again later.');
        console.error('Error fetching reviews:', error);
        return [];
    }
}

async function submitReview(vendorId, rating, comment) {
    try {
        const response = await fetch(`${API_BASE_URL}/vendors/${vendorId}/reviews`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ rating, comment })
        });
        if (!response.ok) throw new Error('Failed to submit review');
        return await response.json();
    } catch (error) {
        showError('Failed to submit review. Please try again later.');
        console.error('Error submitting review:', error);
        return null;
    }
}

// UI Functions
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);
    setTimeout(() => errorDiv.remove(), 5000);
}

function showLoading() {
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'loading-spinner';
    loadingDiv.innerHTML = '<div class="spinner"></div>';
    document.body.appendChild(loadingDiv);
    return loadingDiv;
}

function hideLoading(loadingDiv) {
    loadingDiv.remove();
}

// Render Functions
function renderVendors(vendors, filterTags = []) {
    const vendorList = document.getElementById('vendors');
    vendorList.innerHTML = ''; // Clear existing vendors

    // Clear existing markers
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];

    vendors.forEach(vendor => {
        // Apply filters
        if (filterTags.length === 0 || filterTags.some(tag => vendor.tags?.includes(tag))) {
            // Add marker to map
            const marker = L.marker([vendor.latitude, vendor.longitude])
                .addTo(map)
                .bindPopup(`
                    <b>${vendor.name}</b><br>
                    ${vendor.description || ''}<br>
                    Rating: ${vendor.rating || 'N/A'}/5
                `);
            markers.push(marker);

            // Create vendor card
            const vendorCard = document.createElement('div');
            vendorCard.className = 'vendor-card';
            vendorCard.innerHTML = `
                <h3>${vendor.name}</h3>
                <p>${vendor.description || ''}</p>
                <div class="vendor-tags">
                    ${vendor.tags?.map(tag => `<span class="tag">${tag}</span>`).join('') || ''}
                </div>
                <button class="cta-button" onclick="viewVendorDetails(${vendor.id})">View Details</button>
            `;
            vendorList.appendChild(vendorCard);
        }
    });
}

function renderVendorDetails(vendor) {
    const vendorName = document.getElementById('vendor-name');
    const vendorType = document.getElementById('vendor-type');
    const vendorLocation = document.getElementById('location');

    vendorName.textContent = vendor.name;
    vendorType.textContent = vendor.description || 'No description available';
    vendorLocation.textContent = `${vendor.neighborhood || 'Unknown location'}`;

    // Render reviews
    renderReviews(vendor.id);
}

function renderReviews(vendorId) {
    const reviewList = document.getElementById('review-list');
    reviewList.innerHTML = '';

    fetchVendorReviews(vendorId).then(reviews => {
        reviews.forEach(review => {
            const reviewItem = document.createElement('li');
            reviewItem.className = 'review-item';
            reviewItem.innerHTML = `
                <div class="review-rating">${'★'.repeat(review.rating)}${'☆'.repeat(5-review.rating)}</div>
                <div class="review-comment">${review.comment}</div>
                <div class="review-date">${new Date(review.created_at).toLocaleDateString()}</div>
            `;
            reviewList.appendChild(reviewItem);
        });
    });
}

// Event Handlers
async function viewVendorDetails(vendorId) {
    const loadingDiv = showLoading();
    try {
        const vendor = await fetchVendorDetails(vendorId);
        if (vendor) {
            window.location.href = `vendor.html?id=${vendorId}`;
        }
    } finally {
        hideLoading(loadingDiv);
    }
}

async function submitReview() {
    const vendorId = new URLSearchParams(window.location.search).get('id');
    const rating = document.getElementById('review-rating').value;
    const comment = document.getElementById('review-text').value;

    if (!rating || !comment) {
        showError('Please provide both rating and comment');
        return;
    }

    const loadingDiv = showLoading();
    try {
        const result = await submitReview(vendorId, parseInt(rating), comment);
        if (result) {
            document.getElementById('review-text').value = '';
            document.getElementById('review-rating').value = '';
            renderReviews(vendorId);
            showError('Review submitted successfully!');
        }
    } finally {
        hideLoading(loadingDiv);
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    initMap();
    
    // Check if we're on the vendor details page
    const vendorId = new URLSearchParams(window.location.search).get('id');
    if (vendorId) {
        const loadingDiv = showLoading();
        try {
            const vendor = await fetchVendorDetails(vendorId);
            if (vendor) {
                renderVendorDetails(vendor);
            }
        } finally {
            hideLoading(loadingDiv);
        }
    } else {
        // We're on the main page
        const loadingDiv = showLoading();
        try {
            const vendors = await fetchVendors();
            renderVendors(vendors);
        } finally {
            hideLoading(loadingDiv);
        }
    }
});

// Filter Button Event Listeners
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', async function() {
        this.classList.toggle('active');
        const activeFilters = Array.from(document.querySelectorAll('.filter-btn.active'))
            .map(activeBtn => activeBtn.dataset.filter);
        const vendors = await fetchVendors();
        renderVendors(vendors, activeFilters);
    });
});

// Search Functionality
async function performSearch() {
    const searchTerm = document.getElementById('search').value.toLowerCase();
    const activeFilters = Array.from(document.querySelectorAll('.filter-btn.active'))
        .map(activeBtn => activeBtn.dataset.filter);
    
    const loadingDiv = showLoading();
    try {
        const vendors = await fetchVendors();
        const filteredVendors = vendors.filter(vendor => 
            (activeFilters.length === 0 || activeFilters.some(tag => vendor.tags?.includes(tag))) &&
            (vendor.name.toLowerCase().includes(searchTerm) || 
             vendor.description?.toLowerCase().includes(searchTerm))
        );
        renderVendors(filteredVendors);
    } finally {
        hideLoading(loadingDiv);
    }
}

document.querySelector('.search-btn').addEventListener('click', performSearch);
document.getElementById('search').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') performSearch();
});