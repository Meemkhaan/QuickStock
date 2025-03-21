const SHEET_URL = "https://script.google.com/macros/s/AKfycbw-JALq2VRD2jhUgizTa-Rk5NK1r7iIcQTnY7SzxEG8OB_s6BuGdfONeKDkD5QlNfZi/exec"; // Replace with your Web App URL

async function fetchUsers() {
    try {
        const response = await fetch(SHEET_URL);
        const data = await response.json();
        // Convert to key-value pairs
        return data.reduce((users, [username, password, businessName]) => {
            if (username && password && businessName) {
                users[username] = { password, businessName };
            }
            return users;
        }, {});
    } catch (error) {
        console.error("Error fetching users:", error);
        return {};
    }
}

document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    const users = await fetchUsers();

    if (users[username] && users[username].password === password) {
        // Store login information in localStorage
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("username", username);
        localStorage.setItem("businessName", users[username].businessName); // Store BusinessName
        window.location.href = "dashboard.html"; // Redirect to dashboard
    } else {
        const alertMessage = document.getElementById("alertMessage");
        alertMessage.style.display = "block";
        alertMessage.textContent = "Invalid login credentials";
    }
});

