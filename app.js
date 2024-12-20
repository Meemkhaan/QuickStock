// Initialize Firebase
const firebaseConfig = {
    apiKey: "AIzaSyCiGGt83bM_ZG8fiQfdbBxi5yoRY-hU1EY",
    authDomain: "medicine-order-system-3439a.firebaseapp.com",
    projectId: "medicine-order-system-3439a",
    storageBucket: "medicine-order-system-3439a.firebasestorage.app",
    messagingSenderId: "186164167458",
    appId: "1:186164167458:web:072c663551bc4c57e01b7b",
    measurementId: "G-GXFY5XFWXX"
  };

const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Add Vendor Function
document.getElementById('addVendorForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const vendorName = document.getElementById('vendorName').value;
    const vendorWhatsapp = document.getElementById('vendorWhatsapp').value;

    try {
        const docRef = await db.collection('vendors').add({
            name: vendorName,
            whatsapp: vendorWhatsapp,
            medicines: []  // Initialize with empty medicines array
        });

        console.log("Vendor added with ID: ", docRef.id);
        fetchVendors();  // Refresh the vendors list
    } catch (error) {
        console.error("Error adding vendor: ", error);
    }
});

// Fetch Vendors from Firestore
async function fetchVendors() {
    const vendorsList = document.getElementById('vendorsList');
    vendorsList.innerHTML = '';  // Clear the list

    try {
        const snapshot = await db.collection('vendors').get();
        snapshot.forEach(doc => {
            const vendor = doc.data();
            const li = document.createElement('li');
            li.textContent = `${vendor.name} - ${vendor.whatsapp}`;
            vendorsList.appendChild(li);
        });

        // Populate medicine select dropdown
        const medicineVendorId = document.getElementById('medicineVendorId');
        medicineVendorId.innerHTML = '';  // Clear previous options
        snapshot.forEach(doc => {
            const vendor = doc.data();
            const option = document.createElement('option');
            option.value = doc.id;
            option.textContent = vendor.name;
            medicineVendorId.appendChild(option);
        });

    } catch (error) {
        console.error("Error fetching vendors: ", error);
    }
}

// Add Medicine to Vendor
document.getElementById('addMedicineForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const medicineVendorId = document.getElementById('medicineVendorId').value;
    const medicineName = document.getElementById('medicineName').value;

    try {
        const vendorDoc = await db.collection('vendors').doc(medicineVendorId).get();
        const vendorData = vendorDoc.data();
        vendorData.medicines.push({ id: Date.now(), name: medicineName });

        await db.collection('vendors').doc(medicineVendorId).update({
            medicines: vendorData.medicines
        });

        console.log("Medicine added to vendor");
        fetchVendors();  // Refresh the vendors list

    } catch (error) {
        console.error("Error adding medicine: ", error);
    }
});

// Initial call to fetch vendors when the page loads
fetchVendors();
