// Import libraries
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js"
import { getDatabase, ref, push, get, remove } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js"

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBBjE-70BbljrRsSTEXSkK7MQsX2tFJBk0",
    authDomain: "quotes-database-4a82c.firebaseapp.com",
    databaseURL: "https://quotes-database-4a82c-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "quotes-database-4a82c",
    storageBucket: "quotes-database-4a82c.appspot.com",
    messagingSenderId: "901585693351",
    appId: "1:901585693351:web:6b777ae93e4fa8a4fe0982"
};

// Initialize the app
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const complimentsRef = ref(database, "compliments");

// Select page elements
const generateRandomKudosButton = document.getElementById('generateRandomKudosButton');
const complimentDisplay = document.getElementById('compliment-display');
const complimentForm = document.getElementById('complimentForm');
const complimentInput = document.getElementById('complimentInput');
const successMessage = document.getElementById('successMessage');
const toggleFormButton = document.getElementById('toggleFormButton');
const kudoCounter = document.getElementById('kudoCounter');
const deleteKudoButton = document.getElementById('deleteKudoButton');
const deleteMessage = document.getElementById('deleteMessage');

// Select the navigation buttons from HTML (with corrected IDs)
const prevKudoButton = document.getElementById('prevKudoButton');
const firstKudoButton = document.getElementById('firstKudoButton');
const nextKudoButton = document.getElementById('nextKudoButton');

// Variables to keep track of kudos
let allKudos = [];
let currentKudoIndex = -1;

// Variable to store the Firebase keys alongside the values
let allKudosKeys = [];

// FUNCTIONS:
// Function to show/hide the submission form
toggleFormButton.addEventListener('click', () => {
    complimentForm.classList.toggle('hidden');
    if (complimentForm.classList.contains('hidden')) {
        toggleFormButton.textContent = 'Add Kudos 🎀';
    } else {
        toggleFormButton.textContent = 'Hide Form';
    }
});

// Function to update the counter
function updateKudoCounter() {
    get(complimentsRef).then((snapshot) => {
        if (snapshot.exists()) {
            const complimentsData = snapshot.val();
            const count = Object.keys(complimentsData).length;
            kudoCounter.textContent = `Total Kudos in Database: ${count}`;
        } else {
            kudoCounter.textContent = 'Total Kudos in Database: 0';
        }
    }).catch((error) => {
        console.error('Error fetching kudo count:', error);
    });
}

// Call this function when the page loads
updateKudoCounter();

// Function to show the success message for 3 seconds
function showSuccessMessage() {
    successMessage.style.display = 'block';
    setTimeout(() => {
        successMessage.style.display = 'none';
    }, 3000);
}

// Function to show the delete success message for 3 seconds
function showDeleteMessage() {
    deleteMessage.style.display = 'block';
    setTimeout(() => {
        deleteMessage.style.display = 'none';
    }, 3000);
}

// Function to handle form submission
complimentForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const newCompliment = complimentInput.value.trim();

    if (newCompliment !== '') {
        push(complimentsRef, newCompliment)
            .then((pushRef) => {
                const newKudoKey = pushRef.key;
                complimentInput.value = '';
                complimentForm.classList.add('hidden');
                toggleFormButton.textContent = 'Add Kudos 🎀';
                showSuccessMessage();
                updateKudoCounter();
                fetchCompliments(newKudoKey); // Refresh and navigate to the new kudos
            })
            .catch((error) => {
                console.error('Error adding compliment:', error);
            });
    }
});

// Function to fetch compliments data from Firebase (stores both keys and values)
// Optional: navigateToKey - when provided (e.g. after creating new kudos), navigate to that kudo
function fetchCompliments(navigateToKey = null) {
    get(complimentsRef)
        .then((snapshot) => {
            if (snapshot.exists()) {
                const complimentsData = snapshot.val();
                allKudos = Object.values(complimentsData);
                allKudosKeys = Object.keys(complimentsData); // Store the Firebase keys
                updateKudoCounter();

                if (navigateToKey !== null) {
                    // Navigate to the newly created kudos
                    const newIndex = allKudosKeys.indexOf(navigateToKey);
                    if (newIndex !== -1) {
                        currentKudoIndex = newIndex;
                        displayKudo();
                    } else if (currentKudoIndex === -1) {
                        displayRandomKudo();
                    }
                } else if (currentKudoIndex === -1) {
                    displayRandomKudo();
                }
            } else {
                complimentDisplay.textContent = "No kudos available.";
                allKudos = [];
                allKudosKeys = [];
                currentKudoIndex = -1;
                updateKudoCounter();
            }
        })
        .catch((error) => {
            console.error('Error fetching compliments:', error);
        });
}

// Function to display a random kudo
function displayRandomKudo() {
    if (allKudos.length > 0) {
        currentKudoIndex = Math.floor(Math.random() * allKudos.length);
        displayKudo();
    } else {
        complimentDisplay.textContent = "No kudos available.";
    }
}

// Function to display the first kudo (FIXED: was using assignment instead of comparison)
function displayFirstKudo() {
    if (allKudos.length > 0) {
        currentKudoIndex = 0;
        displayKudo();
    }
}

// Function to display the current kudo
function displayKudo() {
    if (currentKudoIndex >= 0 && currentKudoIndex < allKudos.length) {
        const kudo = allKudos[currentKudoIndex];
        complimentDisplay.textContent = `#${currentKudoIndex + 1}: ${kudo}`;
    }
}

// Function to display the previous kudo
function displayPreviousKudo() {
    if (allKudos.length > 0) {
        currentKudoIndex = (currentKudoIndex - 1 + allKudos.length) % allKudos.length;
        displayKudo();
    }
}

// Function to display the next kudo
function displayNextKudo() {
    if (allKudos.length > 0) {
        currentKudoIndex = (currentKudoIndex + 1) % allKudos.length;
        displayKudo();
    }
}

// Function to delete the current kudo
function deleteCurrentKudo() {
    if (currentKudoIndex >= 0 && currentKudoIndex < allKudos.length) {
        // Show confirmation dialog
        const isConfirmed = confirm("Are you sure you want to delete this kudo?");

        if (!isConfirmed) {
            return; // User clicked "Cancel", so exit the function
        }

        const keyToDelete = allKudosKeys[currentKudoIndex];
        const kudoRef = ref(database, `compliments/${keyToDelete}`);

        remove(kudoRef)
            .then(() => {
                showDeleteMessage();

                // Adjust currentKudoIndex after deletion
                if (allKudos.length === 1) {
                    // If this was the last kudo
                    currentKudoIndex = -1;
                    complimentDisplay.textContent = "No kudos available.";
                } else if (currentKudoIndex >= allKudos.length - 1) {
                    // If we deleted the last kudo, go to the previous one
                    currentKudoIndex = allKudos.length - 2;
                }
                // If we deleted a kudo in the middle, currentKudoIndex stays the same
                // which will now point to the next kudo

                fetchCompliments(); // Refresh the data

                // Display appropriate kudo after deletion
                setTimeout(() => {
                    if (allKudos.length > 0 && currentKudoIndex >= 0) {
                        displayKudo();
                    }
                }, 100); // Small delay to ensure data is refreshed
            })
            .catch((error) => {
                console.error('Error deleting kudo:', error);
                alert('Error deleting kudo. Please try again.');
            });
    }
}

// Add click event listeners to the buttons
generateRandomKudosButton.addEventListener('click', displayRandomKudo);
firstKudoButton.addEventListener('click', displayFirstKudo);
prevKudoButton.addEventListener('click', displayPreviousKudo);
nextKudoButton.addEventListener('click', displayNextKudo);
deleteKudoButton.addEventListener('click', deleteCurrentKudo);

// Fetch compliments when the page loads
fetchCompliments();