// Add this to your existing PetManager object
Object.assign(PetManager, {
    updatePet(petId, updatedData) {
        const pets = this.getAllPets();
        const index = pets.findIndex(pet => pet.id === parseInt(petId));
        
        if (index !== -1) {
            pets[index] = {
                ...pets[index],
                ...updatedData,
                lastUpdated: new Date().toISOString()
            };
            localStorage.setItem(this.storageKey, JSON.stringify(pets));
            return true;
        }
        return false;
    }
});

// Add this to your PetDetailsModal object
Object.assign(PetDetailsModal, {
    editPet(petId) {
        const pet = this.getPetById(petId);
        if (!pet) return;

        // Hide details modal
        this.hideModal();

        // Show edit modal
        const editModal = document.getElementById('editPetModal');
        editModal.setAttribute('data-pet-id', petId);

        // Populate form fields
        document.getElementById('editPetId').value = petId;
        document.getElementById('editPetName').value = pet.petName;
        document.getElementById('editSpecies').value = pet.species;
        document.getElementById('editBreed').value = pet.breed || '';
        document.getElementById('editWeight').value = pet.weight || '';
        document.getElementById('editDateOfBirth').value = pet.dateOfBirth || '';
        document.getElementById('editMedicalConditions').value = pet.medicalConditions || '';
        document.getElementById('editContactName').value = pet.contactName;
        document.getElementById('editContactPhone').value = pet.contactPhone;

        editModal.classList.remove('hidden');
    }
});

// Initialize edit form handling
document.addEventListener('DOMContentLoaded', () => {
    const editModal = document.getElementById('editPetModal');
    const editForm = document.getElementById('editPetForm');
    const closeEditBtn = document.getElementById('closeEditModal');
    const cancelEditBtn = document.getElementById('cancelEdit');

    function closeEditModal() {
        editModal.classList.add('hidden');
    }

    editForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const petId = document.getElementById('editPetId').value;
        
        const formData = new FormData(editForm);
        const updatedData = Object.fromEntries(formData.entries());
        
        if (PetManager.updatePet(petId, updatedData)) {
            showNotification('Pet details updated successfully!', 'success');
            closeEditModal();
            location.reload(); // Refresh to show updated data
        } else {
            showNotification('Error updating pet details', 'error');
        }
    });

    closeEditBtn.onclick = closeEditModal;
    cancelEditBtn.onclick = closeEditModal;
    editModal.onclick = (e) => {
        if (e.target === editModal) closeEditModal();
    };
});