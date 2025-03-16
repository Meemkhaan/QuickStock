const SHEET_ID = '1FQg-uoP3eJ3E5NhWAn3k_gJfF0TOm4yyp3955T7UlVY';
const API_KEY = 'AIzaSyAoUbq6tei8kxKILLvXWQO9hT2DmVUK7xU';
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzwkwgYdRwfdK1uAW4x70i9h01sV5InJoi_LOuqFzO6XesPOAwePh-VmOBQNadaK5My/exec';

async function loadVendors() {
    try {
        const data = await fetchSheetData('Vendors!A1:C');
        const vendors = data.slice(1).map(([id, name, whatsapp]) => ({ id, name, whatsapp }));

        const tbody = document.querySelector('#vendorTable tbody');
        tbody.innerHTML = vendors.map(vendor => `
            <tr>
                <td>${vendor.name}</td>
                <td>${vendor.whatsapp || '-'}</td>
                <td>
                    <button onclick="editVendor('${vendor.id}', '${vendor.name}', '${vendor.whatsapp || ''}')">Edit</button>
                    <button class="delete" onclick="deleteVendor('${vendor.id}')">Delete</button>
                </td>
            </tr>
        `).join('');

        const select = document.getElementById('medicineVendor');
        select.innerHTML = '<option value="">Select Vendor</option>' + 
            vendors.map(vendor => `<option value="${vendor.id}">${vendor.name}</option>`).join('');
    } catch (error) {
        showAlert('Failed to load vendors', 'error');
    }
}

async function loadMedicines() {
    try {
        const data = await fetchSheetData('Medicines!A1:C');
        const medicines = data.slice(1).map(([id, vendorId, name]) => ({ id, vendorId, name }));

        const vendors = await loadVendors();
        const tbody = document.querySelector('#medicineTable tbody');
        tbody.innerHTML = medicines.map(medicine => {
            const vendor = vendors.find(v => v.id === medicine.vendorId);
            return `
                <tr>
                    <td>${medicine.name}</td>
                    <td>${vendor ? vendor.name : 'Unknown'}</td>
                    <td>
                        <button onclick="editMedicine('${medicine.id}', '${medicine.name}', '${medicine.vendorId}')">Edit</button>
                        <button class="delete" onclick="deleteMedicine('${medicine.id}')">Delete</button>
                    </td>
                </tr>
            `;
        }).join('');
    } catch (error) {
        showAlert('Failed to load medicines', 'error');
    }
}

async function fetchSheetData(range) {
    const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${range}?key=${API_KEY}`
    );
    const data = await response.json();
    return data.values || [];
}

function showAlert(message, type) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;
    document.body.insertBefore(alertDiv, document.body.firstChild);
    setTimeout(() => alertDiv.remove(), 3000);
}

document.addEventListener('DOMContentLoaded', () => {
    loadVendors();
    loadMedicines();
});
