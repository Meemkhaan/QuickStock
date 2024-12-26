document.addEventListener("DOMContentLoaded", () => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    const username = localStorage.getItem("username");
    const businessName = localStorage.getItem("businessName");

    if (!isLoggedIn || !username || !businessName) {
        alert("You must log in first!");
        window.location.href = "index.html";
        return;
    }
        // Display user information
        document.getElementById("welcomeMessage").textContent = `Welcome, ${businessName}!`;
});

document.getElementById("logoutButton").addEventListener("click", () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("username");
    alert("You have been logged out.");
    window.location.href = "index.html";
});

// Fix for scroll to selected medicines
document.getElementById('scrollToSelected').addEventListener('click', () => {
    const selectedSection = document.getElementById('selected-medicines-section');
    if (selectedSection) {
        selectedSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
        console.error('Selected Medicines section not found.');
    }
});


const SHEET_ID = '1FQg-uoP3eJ3E5NhWAn3k_gJfF0TOm4yyp3955T7UlVY';
const API_KEY = 'AIzaSyAoUbq6tei8kxKILLvXWQO9hT2DmVUK7xU';

class MedicineOrderSystem {
    constructor() {
        this.vendors = [];
        this.currentVendor = null;
        this.filteredMedicines = [];
        this.selectedMedicines = [];
        this.isLoading = false;
        this.init();
    }

    async init() {
        this.setupEventListeners();
        await this.loadVendors();
    }

    setupEventListeners() {
        document.getElementById('vendorSelect').addEventListener('change', () => {
            this.clearSelectedMedicines();
            this.loadMedicines();
        });
        document.getElementById('medicineSearch').addEventListener('input', (e) => 
            this.searchMedicines(e.target.value));
    }

    async fetchData(endpoint) {
        try {
            const response = await fetch(
                `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${endpoint}?key=${API_KEY}`
            );
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            if (!data.values) {
                throw new Error('No data received from the API');
            }
            return data.values;
        } catch (error) {
            console.error(`Error fetching ${endpoint}:`, error);
            this.showError(`Failed to load ${endpoint}. Please try again later.`);
            return [];
        }
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        document.querySelector('.container').prepend(errorDiv);
        setTimeout(() => errorDiv.remove(), 5000);
    }

    async loadVendors() {
        try {
            this.setLoading(true);
            const data = await this.fetchData('Vendors');
            this.vendors = data.slice(1).map(([id, name, whatsapp]) => ({ id, name, whatsapp }));
            this.populateVendorSelect();
        } catch (error) {
            document.getElementById('vendorError').style.display = 'block';
        } finally {
            this.setLoading(false);
        }
    }

    async loadMedicines() {
        const vendorId = document.getElementById('vendorSelect').value;
        document.getElementById('searchContainer').style.display = vendorId ? 'block' : 'none';
        
        if (!vendorId) {
            this.currentVendor = null;
            this.selectedMedicines = [];
            this.renderSelectedMedicines();
            this.updateActionButtons();
            this.renderMedicines([]);
            return;
        }

        try {
            this.setLoading(true);
            const data = await this.fetchData('Medicines');
            this.filteredMedicines = data.slice(1)
                .filter(row => row[1] === vendorId)
                .map(([id, vendorId, name]) => ({ id, name }));

            document.getElementById('medicineError').style.display = 
                this.filteredMedicines.length === 0 ? 'block' : 'none';
            this.renderMedicines();
        } catch (error) {
            this.renderMedicines([]);
        } finally {
            this.setLoading(false);
        }
    }

    searchMedicines(query) {
        const searchTerm = query.toLowerCase();
        const filtered = this.filteredMedicines.filter(medicine =>
            medicine.name.toLowerCase().includes(searchTerm)
        );
        this.renderMedicines(filtered);
    }

    populateVendorSelect() {
        const select = document.getElementById('vendorSelect');
        select.innerHTML = '<option value="">-- Select Vendor --</option>' +
            this.vendors.map(vendor =>
                `<option value="${vendor.id}">${vendor.name}</option>`
            ).join('');
    }

    renderMedicines(medicines = this.filteredMedicines) {
        this.displayedMedicines = medicines;
        const medicineTable = document.getElementById('medicineTable');
        medicineTable.innerHTML = medicines.map((medicine, index) => `
            <tr>
                <td>${medicine.name}</td>
                <td>
                    <input type="number" min="1" id="qty-${index}" 
                           class="quantity-input" placeholder="Quantity">
                </td>
                <td>
                    <button onclick="medicineSystem.addMedicine(${index})">Add</button>
                </td>
            </tr>
        `).join('');
    }

    addMedicine(index) {
        const qtyInput = document.getElementById(`qty-${index}`);
        const quantity = parseInt(qtyInput.value);

        if (!quantity || quantity < 1) {
            alert('Please enter a valid quantity');
            return;
        }

        const filteredMedicine = this.displayedMedicines[index];
        const existing = this.selectedMedicines.find(item => item.id === filteredMedicine.id);

        if (existing) {
            existing.quantity += quantity;
        } else {
            this.selectedMedicines.push({ ...filteredMedicine, quantity });
        }

        qtyInput.value = '';
        this.renderSelectedMedicines();
        this.updateActionButtons();
    }

    renderSelectedMedicines() {
        const selectedTable = document.getElementById('selectedMedicinesTable');
        selectedTable.innerHTML = this.selectedMedicines.map((medicine, index) => `
            <tr>
                <td>${medicine.name}</td>
                <td>${medicine.quantity}</td>
                <td>
                    <button onclick="medicineSystem.removeMedicine(${index})">Remove</button>
                </td>
            </tr>
        `).join('');
    }

    removeMedicine(index) {
        this.selectedMedicines.splice(index, 1);
        this.renderSelectedMedicines();
        this.updateActionButtons();
    }

    clearSelectedMedicines() {
        this.selectedMedicines = [];
        this.renderSelectedMedicines();
        this.updateActionButtons();
    }

    updateActionButtons() {
        const hasSelectedMedicines = this.selectedMedicines.length > 0;
        ['previewBtn', 'printBtn', 'whatsappBtn', 'pdfBtn'].forEach(btnId => {
            document.getElementById(btnId).disabled = !hasSelectedMedicines;
        });
    }

    setLoading(loading) {
        this.isLoading = loading;
        document.body.classList.toggle('loading', loading);
    }

    generateOrderSummary(includeDate = false) {
        const date = new Date().toLocaleDateString();
        const headerLine = includeDate ? `Order Date: ${date} By: \n\n` : '';
        return headerLine + this.selectedMedicines.map(medicine =>
            `${medicine.name}: ${medicine.quantity}`
        ).join('\n');
    }

    previewOrder() {
        const summary = this.generateOrderSummary();
        alert('Order Preview:\n\n' + summary);
    }

    printOrder() {
        // Create a new window for print
        const printWindow = window.open('', '_blank');
        const vendorName = document.getElementById('vendorSelect').selectedOptions[0].text;
        const OwnerName = "Bismillah Medical Store";
        
        // Build print content
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Medicine Order</title>
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; }
                    h2 { margin-bottom: 10px; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    th { background: #f4f4f4; }
                    @media print {
                        @page { margin: 0.5cm; }
                    }
                    @media screen and (max-width: 480px) {
                        body { padding: 10px; }
                        th, td { padding: 6px; font-size: 14px; }
                    }
                </style>
            </head>
            <body>
                <h2>Medicine Order Summary</h2>
                <p><strong>From:</strong> ${OwnerName}</p>
                <p><strong>Vendor:</strong> ${vendorName}</p>
                <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
                <table>
                    <thead>
                        <tr>
                            <th>Medicine</th>
                            <th>Quantity</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${this.selectedMedicines.map(medicine => `
                            <tr>
                                <td>${medicine.name}</td>
                                <td>${medicine.quantity}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </body>
            </html>
        `);
        
        printWindow.document.close();
        printWindow.focus();
        
        // Wait for content to load then print
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 250);
    }

    sendWhatsApp() {
        const vendorSelect = document.getElementById('vendorSelect');
        const selectedVendor = this.vendors.find(v => v.id === vendorSelect.value);
    
        if (!selectedVendor || !selectedVendor.whatsapp) {
            alert('No WhatsApp number available for this vendor.');
            return;
        }
    
        // Ensure the phone number is in the correct format
        const whatsappNumber = selectedVendor.whatsapp.replace(/[^\d]/g, ''); // Remove non-numeric characters
        if (whatsappNumber.length < 10) {
            alert('Invalid WhatsApp number.');
            return;
        }
    
        // Generate the message
        const message = encodeURIComponent(this.generateOrderSummary(true));
        const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;
    
        // Open the WhatsApp link
        try {
            window.location.href = whatsappUrl; // Works better on mobile
        } catch (error) {
            console.error('Error opening WhatsApp:', error);
            alert('Failed to open WhatsApp. Please try again.');
        }
    }
    
    

    generatePDF() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        // Get the current date in YYYY-MM-DD format
        const orderDate = new Date().toISOString().split('T')[0]; 
    
        // Add PDF content
        doc.text('Medicine Order', 20, 20);
        const vendorName = document.getElementById('vendorSelect').selectedOptions[0].text;
        doc.text(`Vendor: ${vendorName}`, 20, 30);
        doc.text(`Order Date: ${orderDate}`, 20, 40);

    
        doc.autoTable({
            head: [['Medicine', 'Quantity']],
            body: this.selectedMedicines.map(medicine => [
                medicine.name,
                medicine.quantity.toString()
            ]),
            startY: 40
        });
    
        // Generate the file name
        const fileName = `Medicine-Order-${orderDate}-${vendorName.replace(/\s+/g, '_')}.pdf`;
    
        // Save the PDF with the generated file name
        doc.save(fileName);
    }
    
}

const medicineSystem = new MedicineOrderSystem();

function previewOrder() { medicineSystem.previewOrder(); }
function printOrder() { medicineSystem.printOrder(); }
function sendWhatsApp() { medicineSystem.sendWhatsApp(); }
function generatePDF() { medicineSystem.generatePDF(); }