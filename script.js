// Utility functions for data handling
const PetManager = {
    storageKey: 'registeredPets',
    
    // Get all registered pets
    getAllPets() {
        const pets = localStorage.getItem(this.storageKey);
        return pets ? JSON.parse(pets) : [];
    },
    
    // Add a new pet
    addPet(petData) {
        const pets = this.getAllPets();
        const newPet = {
            id: Date.now(),
            registrationDate: new Date().toISOString(),
            ...petData
        };
        pets.push(newPet);
        localStorage.setItem(this.storageKey, JSON.stringify(pets));
        return newPet;
    },

    // Get pet by ID
    getPetById(petId) {
        const pets = this.getAllPets();
        return pets.find(pet => pet.id === parseInt(petId));
    },

    // Delete pet
    deletePet(petId) {
        const pets = this.getAllPets();
        const updatedPets = pets.filter(pet => pet.id !== parseInt(petId));
        localStorage.setItem(this.storageKey, JSON.stringify(updatedPets));
        return true;
    },

    // Validate pet data
    validatePetData(data) {
        const errors = [];
        
        if (!data.petName?.trim()) errors.push('Pet name is required');
        if (!data.species) errors.push('Species is required');
        if (!data.contactName?.trim()) errors.push('Emergency contact name is required');
        if (!data.contactPhone?.trim()) errors.push('Emergency contact phone is required');
        
        if (data.weight && (isNaN(data.weight) || data.weight <= 0)) {
            errors.push('Weight must be a positive number');
        }
        
        if (data.dateOfBirth) {
            const dob = new Date(data.dateOfBirth);
            if (dob > new Date()) errors.push('Date of birth cannot be in the future');
        }

        return errors;
    }
};

// UI Notification Handler
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 p-4 rounded-md shadow-lg ${
        type === 'error' 
            ? 'bg-red-500 text-white' 
            : type === 'success'
                ? 'bg-green-500 text-white'
                : 'bg-blue-500 text-white'
    }`;
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 5000);
}

// Dashboard functionality
document.addEventListener('DOMContentLoaded', () => {
    const petsList = document.getElementById('petsList');
    const noPets = document.getElementById('noPets');
    const totalPetsElement = document.getElementById('totalPets');
    const searchInput = document.getElementById('searchPets');

    function formatDate(dateString) {
        return new Date(dateString).toLocaleDateString();
    }

    function createPetCard(pet) {
        const card = document.createElement('div');
        card.className = 'bg-gray-50 rounded-lg p-6 border';
        card.innerHTML = `
            <div class="flex justify-between items-start">
                <div>
                    <h3 class="text-lg font-semibold text-gray-900">${pet.petName}</h3>
                    <p class="text-sm text-gray-600">${pet.species} · ${pet.breed || 'Unknown breed'}</p>
                </div>
                <button onclick="deletePet(${pet.id})" class="text-red-600 hover:text-red-800">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                    </svg>
                </button>
            </div>
            <div class="mt-4 space-y-2">
                <p class="text-sm text-gray-600">
                    <span class="font-medium">Age/DOB:</span> 
                    ${pet.dateOfBirth ? formatDate(pet.dateOfBirth) : 'Not specified'}
                </p>
                <p class="text-sm text-gray-600">
                    <span class="font-medium">Weight:</span> 
                    ${pet.weight ? `${pet.weight} kg` : 'Not specified'}
                </p>
                <p class="text-sm text-gray-600">
                    <span class="font-medium">Emergency Contact:</span><br>
                    ${pet.contactName} · ${pet.contactPhone}
                </p>
            </div>
            <div class="mt-4">
                <button onclick="viewPetDetails(${pet.id})" 
                    class="text-sm text-blue-600 hover:text-blue-800">
                    View Details →
                </button>
            </div>
        `;
        return card;
    }

    function displayPets(pets = []) {
        petsList.innerHTML = '';
        totalPetsElement.textContent = pets.length;

        if (pets.length === 0) {
            noPets.classList.remove('hidden');
            return;
        }

        noPets.classList.add('hidden');
        pets.forEach(pet => {
            petsList.appendChild(createPetCard(pet));
        });
    }

    // Load and display pets
    function loadPets() {
        const pets = PetManager.getAllPets();
        displayPets(pets);
    }

    // Search functionality
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const pets = PetManager.getAllPets();
        const filteredPets = pets.filter(pet => 
            pet.petName.toLowerCase().includes(searchTerm) ||
            pet.species.toLowerCase().includes(searchTerm) ||
            (pet.breed && pet.breed.toLowerCase().includes(searchTerm))
        );
        displayPets(filteredPets);
    });

    // Initialize Pet Details Modal
    const modal = document.getElementById('petDetailsModal');
    const closeBtn = document.getElementById('closeModal');
    
    closeBtn.onclick = () => {
        modal.classList.add('hidden');
    };

    modal.onclick = (e) => {
        if (e.target === modal) {
            modal.classList.add('hidden');
        }
    };

    // Initial load
    loadPets();
});

// Global functions for pet operations
function viewPetDetails(petId) {
    const pet = PetManager.getPetById(petId);
    if (!pet) return;

    const modal = document.getElementById('petDetailsModal');
    
    // Update modal content
    document.getElementById('modalPetName').textContent = pet.petName;
    document.getElementById('modalSpecies').textContent = pet.species;
    document.getElementById('modalBreed').textContent = pet.breed || 'Not specified';
    document.getElementById('modalDob').textContent = pet.dateOfBirth ? 
        new Date(pet.dateOfBirth).toLocaleDateString() : 'Not specified';
    document.getElementById('modalWeight').textContent = pet.weight ? 
        `${pet.weight} kg` : 'Not specified';
    document.getElementById('modalMedicalConditions').textContent = 
        pet.medicalConditions || 'None specified';
    document.getElementById('modalContactName').textContent = pet.contactName;
    document.getElementById('modalContactPhone').textContent = pet.contactPhone;
    document.getElementById('modalRegistrationDate').textContent = 
        new Date(pet.registrationDate).toLocaleDateString();
    document.getElementById('modalLastUpdated').textContent = pet.lastUpdated ? 
        new Date(pet.lastUpdated).toLocaleDateString() : 'Never';

    // Show modal
    modal.classList.remove('hidden');
}

function deletePet(petId) {
    if (confirm('Are you sure you want to delete this pet?')) {
        if (PetManager.deletePet(petId)) {
            showNotification('Pet deleted successfully', 'success');
            location.reload();
        } else {
            showNotification('Error deleting pet', 'error');
        }
    }
}