// Check if data exists in localStorage, if not, use default data
let vendorsData = JSON.parse(localStorage.getItem('vendors')) || [
    {
        "id": 1,
        "name": "Vendor A",
        "whatsapp": "+923422251896",
        "medicines": [
            { "id": 101, "name": "Paracetamol" },
            { "id": 102, "name": "Ibuprofen" }
        ]
    },
    {
        "id": 2,
        "name": "Vendor Bc",
        "whatsapp": "+923142219865",
        "medicines": [
            { "id": 201, "name": "Amoxicillin" },
            { "id": 202, "name": "Ciprofloxacin" }
        ]
    }
];

// Save data to localStorage
function saveToLocalStorage() {
    localStorage.setItem('vendors', JSON.stringify(vendorsData));
}

// Render vendors and medicines
function renderVendors() {
    const vendorListDiv = document.getElementById('vendorList');
    vendorListDiv.innerHTML = '';

    vendorsData.forEach((vendor, index) => {
        const vendorDiv = document.createElement('div');
        vendorDiv.classList.add('col-md-4', 'mb-4');
        vendorDiv.innerHTML = `
            <div class="card shadow-sm">
                <div class="card-body">
                    <h5 class="card-title">${vendor.name}</h5>
                    <p class="card-text">WhatsApp: <a href="https://wa.me/${vendor.whatsapp}" target="_blank">${vendor.whatsapp}</a></p>
                    <h6>Medicines</h6>
                    <ul id="medicines-${index}">
                        ${renderMedicines(vendor.medicines, index)}
                    </ul>
                    <button class="btn btn-success btn-sm" onclick="showAddMedicineModal(${index})">Add Medicine</button>
                    <button class="btn btn-warning btn-sm" onclick="editVendor(${index})">Edit Vendor</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteVendor(${index})">Delete Vendor</button>
                </div>
            </div>
        `;
        vendorListDiv.appendChild(vendorDiv);
    });
}

// Render medicines for a vendor
function renderMedicines(medicines, vendorIndex) {
    return medicines.map((medicine, index) => `
        <li class="d-flex justify-content-between">
            ${medicine.name} 
            <button class="btn btn-danger btn-sm" onclick="removeMedicine(${vendorIndex}, ${index})">Remove</button>
        </li>
    `).join('');
}

// Show modal to add medicine
function showAddMedicineModal(vendorIndex) {
    const vendor = vendorsData[vendorIndex];
    document.getElementById('addMedicineModal').dataset.vendorIndex = vendorIndex;
    new bootstrap.Modal(document.getElementById('addMedicineModal')).show();
}

// Save medicine after adding
function saveMedicine() {
    const vendorIndex = document.getElementById('addMedicineModal').dataset.vendorIndex;
    const medicineName = document.getElementById('medicineName').value;

    if (medicineName) {
        const newMedicine = {
            id: Date.now(),
            name: medicineName
        };

        vendorsData[vendorIndex].medicines.push(newMedicine);
        document.getElementById('medicineName').value = ''; // Clear input
        saveToLocalStorage(); // Save changes to localStorage
        renderVendors();
        bootstrap.Modal.getInstance(document.getElementById('addMedicineModal')).hide();
    }
}

// Edit vendor details
function editVendor(index) {
    const vendor = vendorsData[index];
    const newName = prompt('Edit Vendor Name', vendor.name);
    const newWhatsapp = prompt('Edit WhatsApp', vendor.whatsapp);
    
    if (newName) vendor.name = newName;
    if (newWhatsapp) vendor.whatsapp = newWhatsapp;
    
    saveToLocalStorage(); // Save changes to localStorage
    renderVendors();
}

// Delete vendor
function deleteVendor(index) {
    if (confirm(`Are you sure you want to delete ${vendorsData[index].name}?`)) {
        vendorsData.splice(index, 1);
        saveToLocalStorage(); // Save changes to localStorage
        renderVendors();
    }
}

// Remove medicine from vendor
function removeMedicine(vendorIndex, medicineIndex) {
    if (confirm('Are you sure you want to remove this medicine?')) {
        vendorsData[vendorIndex].medicines.splice(medicineIndex, 1);
        saveToLocalStorage(); // Save changes to localStorage
        renderVendors();
    }
}

// Add a new vendor
function addVendor() {
    const name = document.getElementById('vendorName').value;
    const whatsapp = document.getElementById('vendorWhatsapp').value;

    if (name && whatsapp) {
        const newVendor = {
            id: Date.now(),
            name: name,
            whatsapp: whatsapp,
            medicines: []
        };
        vendorsData.push(newVendor);
        saveToLocalStorage(); // Save changes to localStorage
        renderVendors();
    } else {
        alert('Please fill in both fields.');
    }

    // Clear form
    document.getElementById('vendorName').value = '';
    document.getElementById('vendorWhatsapp').value = '';
}

// Initial render
renderVendors();
