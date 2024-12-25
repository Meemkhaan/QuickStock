const SHEET_URL = "https://script.google.com/macros/s/AKfycbw-JALq2VRD2jhUgizTa-Rk5NK1r7iIcQTnY7SzxEG8OB_s6BuGdfONeKDkD5QlNfZi/exec"; // Replace with your Web App URL

async function fetchUsers() {
    try {
        const response = await fetch(SHEET_URL);
        const data = await response.json();
        // Convert to key-value pairs
        return data.reduce((users, [username, password]) => {
            if (username && password) {
                users[username] = password;
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

    if (users[username] && users[username] === password) {
        alert("Login successful!");
        window.location.href = "dashboard.html"; // Redirect to a dashboard or another page
    } else {
        const alertMessage = document.getElementById("alertMessage");
        alertMessage.style.display = "block";
        alertMessage.textContent = "Invalid login credentials";
    }
});
