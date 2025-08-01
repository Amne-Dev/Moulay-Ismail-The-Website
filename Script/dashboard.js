// Dashboard functionality
let allContent = [];
let currentEditId = null;

// DOM elements
const contentList = document.getElementById('contentList');
const emptyState = document.getElementById('emptyState');
const contentModal = new bootstrap.Modal(document.getElementById('contentModal'));

// Initialize dashboard
document.addEventListener('DOMContentLoaded', () => {
    loadContent();
    setupFilters();
});

// Load all content
async function loadContent() {
    try {
        const response = await Auth.request(`${Auth.apiUrl}/content/admin/all`);
        allContent = response;
        updateStats();
        renderContent(allContent);
    } catch (error) {
        console.error('Error loading content:', error);
        Auth.showAlert('Failed to load content: ' + error.message);
    }
}

// Update statistics
function updateStats() {
    const total = allContent.length;
    const active = allContent.filter(item => item.isActive).length;
    const hero = allContent.filter(item => item.section === 'hero').length;
    const slideshow = allContent.filter(item => item.section === 'slideshow').length;

    document.getElementById('totalContent').textContent = total;
    document.getElementById('activeContent').textContent = active;
    document.getElementById('heroContent').textContent = hero;
    document.getElementById('slideshowContent').textContent = slideshow;
}

// Render content list
function renderContent(content) {
    if (content.length === 0) {
        contentList.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }

    emptyState.style.display = 'none';
    
    const html = content.map(item => `
        <div class="content-card">
            <div class="row align-items-center">
                <div class="col-md-8">
                    <div class="d-flex align-items-center mb-2">
                        <span class="section-badge me-2">${item.section.toUpperCase()}</span>
                        <small class="text-muted">
                            ${item.language.toUpperCase()} | 
                            Order: ${item.order} | 
                            ${item.isActive ? 'Active' : 'Inactive'}
                        </small>
                    </div>
                    <h5 class="mb-1">${escapeHtml(item.title)}</h5>
                    <p class="mb-1 text-muted">${truncateText(escapeHtml(item.body), 150)}</p>
                    ${item.imageUrl ? `<small class="text-muted">Image: ${item.imageUrl}</small>` : ''}
                    <div class="mt-2">
                        <small class="text-muted">
                            Created: ${formatDate(item.createdAt)} | 
                            Updated: ${formatDate(item.updatedAt)}
                        </small>
                    </div>
                </div>
                <div class="col-md-4 text-end">
                    <button class="btn btn-edit btn-custom btn-sm" onclick="editContent('${item._id}')">
                        Edit
                    </button>
                    <button class="btn btn-delete btn-custom btn-sm" onclick="deleteContent('${item._id}', '${escapeHtml(item.title)}')">
                        Delete
                    </button>
                </div>
            </div>
        </div>
    `).join('');

    contentList.innerHTML = html;
}

// Setup filter functionality
function setupFilters() {
    const sectionFilter = document.getElementById('sectionFilter');
    const languageFilter = document.getElementById('languageFilter');
    const statusFilter = document.getElementById('statusFilter');

    [sectionFilter, languageFilter, statusFilter].forEach(filter => {
        filter.addEventListener('change', applyFilters);
    });
}

// Apply filters
function applyFilters() {
    const sectionFilter = document.getElementById('sectionFilter').value;
    const languageFilter = document.getElementById('languageFilter').value;
    const statusFilter = document.getElementById('statusFilter').value;

    let filteredContent = allContent;

    if (sectionFilter) {
        filteredContent = filteredContent.filter(item => item.section === sectionFilter);
    }

    if (languageFilter) {
        filteredContent = filteredContent.filter(item => item.language === languageFilter);
    }

    if (statusFilter !== '') {
        const isActive = statusFilter === 'true';
        filteredContent = filteredContent.filter(item => item.isActive === isActive);
    }

    renderContent(filteredContent);
}

// Open create modal
function openCreateModal() {
    currentEditId = null;
    document.getElementById('modalTitle').textContent = 'Add New Content';
    document.getElementById('contentForm').reset();
    document.getElementById('contentId').value = '';
    document.getElementById('isActive').checked = true;
    document.getElementById('language').value = 'en';
    document.getElementById('order').value = '0';
}

// Edit content
function editContent(id) {
    const content = allContent.find(item => item._id === id);
    if (!content) return;

    currentEditId = id;
    document.getElementById('modalTitle').textContent = 'Edit Content';
    document.getElementById('contentId').value = content._id;
    document.getElementById('title').value = content.title;
    document.getElementById('body').value = content.body;
    document.getElementById('imageUrl').value = content.imageUrl || '';
    document.getElementById('section').value = content.section;
    document.getElementById('language').value = content.language || 'en';
    document.getElementById('order').value = content.order || 0;
    document.getElementById('isActive').checked = content.isActive;

    contentModal.show();
}

// Save content (create or update)
async function saveContent() {
    const form = document.getElementById('contentForm');
    const formData = new FormData(form);
    const spinner = document.getElementById('saveSpinner');
    const saveBtn = document.getElementById('saveBtn');

    // Validate required fields
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    // Show loading state
    spinner.classList.remove('d-none');
    saveBtn.disabled = true;

    const data = {
        title: formData.get('title'),
        body: formData.get('body'),
        imageUrl: formData.get('imageUrl') || '',
        section: formData.get('section'),
        language: formData.get('language') || 'en',
        order: parseInt(formData.get('order')) || 0,
        isActive: document.getElementById('isActive').checked
    };

    try {
        let response;
        if (currentEditId) {
            // Update existing content
            response = await Auth.request(`${Auth.apiUrl}/content/${currentEditId}`, {
                method: 'PUT',
                body: JSON.stringify(data)
            });
            Auth.showAlert('Content updated successfully!', 'success');
        } else {
            // Create new content
            response = await Auth.request(`${Auth.apiUrl}/content`, {
                method: 'POST',
                body: JSON.stringify(data)
            });
            Auth.showAlert('Content created successfully!', 'success');
        }

        contentModal.hide();
        loadContent(); // Reload content list
    } catch (error) {
        console.error('Error saving content:', error);
        Auth.showAlert('Error saving content: ' + error.message);
    } finally {
        // Hide loading state
        spinner.classList.add('d-none');
        saveBtn.disabled = false;
    }
}

// Delete content
async function deleteContent(id, title) {
    if (!confirm(`Are you sure you want to delete "${title}"?\n\nThis action cannot be undone.`)) {
        return;
    }

    try {
        await Auth.request(`${Auth.apiUrl}/content/${id}`, {
            method: 'DELETE'
        });
        
        Auth.showAlert('Content deleted successfully!', 'success');
        loadContent(); // Reload content list
    } catch (error) {
        console.error('Error deleting content:', error);
        Auth.showAlert('Error deleting content: ' + error.message);
    }
}

// Utility functions
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
}