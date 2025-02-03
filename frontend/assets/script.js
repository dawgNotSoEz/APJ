let map;

function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 28.6139, lng: 77.2090 }, // Default: New Delhi
        zoom: 12,
    });

    fetchVendors();
}

function fetchVendors() {
    fetch("http://localhost:4567/api/vendors") // Call backend API
        .then(response => response.json())
        .then(data => {
            const vendorList = document.getElementById("vendors");
            vendorList.innerHTML = ""; // Clear old list

            data.forEach(vendor => {
                // Create a list item
                const li = document.createElement("li");
                li.innerHTML = `<strong>${vendor.name}</strong> - ${vendor.food_type}`;
                li.onclick = () => window.location.href = `vendor.html?id=${vendor.id}`;
                vendorList.appendChild(li);

                // Add marker on Google Maps
                new google.maps.Marker({
                    position: { lat: vendor.latitude, lng: vendor.longitude },
                    map: map,
                    title: vendor.name,
                });
            });
        })
        .catch(error => console.error("Error fetching vendors:", error));
}

// Fetch vendor details when on vendor.html
if (window.location.pathname.includes("vendor.html")) {
    const urlParams = new URLSearchParams(window.location.search);
    const vendorId = urlParams.get("id");

    fetch(`http://localhost:4567/api/vendor/${vendorId}`)
        .then(response => response.json())
        .then(vendor => {
            document.getElementById("vendor-name").innerText = vendor.name;
            document.getElementById("vendor-type").innerText = vendor.food_type;
            document.getElementById("location").innerText = vendor.latitude + ", " + vendor.longitude;
        });
}

function submitReview() {
    const reviewText = document.getElementById("review-text").value;
    const urlParams = new URLSearchParams(window.location.search);
    const vendorId = urlParams.get("id");

    fetch(`http://localhost:4567/api/review/${vendorId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ review: reviewText }),
    })
    .then(response => response.json())
    .then(() => location.reload()) // Reload reviews
    .catch(error => console.error("Error submitting review:", error));
}
