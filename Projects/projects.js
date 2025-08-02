// Dynamic projects data that loads from API
let projectsData = {
    theory: [],
    practice: []
};

let projectsDataAr = {
    theory: [],
    practice: []
};

// API utility functions
const API = {
    baseUrl: window.location.origin + '/api',
    
    async request(url, options = {}) {
        try {
            const response = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    },
    
    async getProjects(language = 'en') {
        return await this.request(`${this.baseUrl}/content?section=projects&language=${language}`);
    }
};

// Load projects from API
async function loadProjectsFromAPI() {
    try {
        // Load English projects
        const englishProjects = await API.getProjects('en');
        
        // Load Arabic projects
        const arabicProjects = await API.getProjects('ar');
        
        // Group projects by type
        projectsData.theory = englishProjects
            .filter(project => project.metadata?.type === 'theory')
            .sort((a, b) => (a.order || 0) - (b.order || 0))
            .map(project => ({
                title: project.title,
                link: project.metadata?.projectLink || '#',
                name: project.metadata?.studentName || 'Unknown Student',
                image: project.imageUrl || 'https://placehold.co/150',
                description: project.body || ''
            }));
            
        projectsData.practice = englishProjects
            .filter(project => project.metadata?.type === 'practice')
            .sort((a, b) => (a.order || 0) - (b.order || 0))
            .map(project => ({
                title: project.title,
                link: project.metadata?.projectLink || '#',
                name: project.metadata?.studentName || 'Unknown Student',
                image: project.imageUrl || 'https://placehold.co/150',
                description: project.body || ''
            }));
            
        // Arabic projects
        projectsDataAr.theory = arabicProjects
            .filter(project => project.metadata?.type === 'theory')
            .sort((a, b) => (a.order || 0) - (b.order || 0))
            .map(project => ({
                title: project.title,
                link: project.metadata?.projectLink || '#',
                name: project.metadata?.studentName || 'Unknown Student',
                image: project.imageUrl || 'https://placehold.co/150',
                description: project.body || ''
            }));
            
        projectsDataAr.practice = arabicProjects
            .filter(project => project.metadata?.type === 'practice')
            .sort((a, b) => (a.order || 0) - (b.order || 0))
            .map(project => ({
                title: project.title,
                link: project.metadata?.projectLink || '#',
                name: project.metadata?.studentName || 'Unknown Student',
                image: project.imageUrl || 'https://placehold.co/150',
                description: project.body || ''
            }));
            
        console.log('Projects loaded successfully');
        
    } catch (error) {
        console.error('Failed to load projects from API:', error);
        
        // Fallback to static data if API fails
        loadFallbackData();
    }
}

// Fallback static data (original data as backup)
function loadFallbackData() {
    console.log('Using fallback static data');
    
    projectsData.theory = [
        { title: "A new Vision for Designing Student's Time-Table at School", link: "https://github.com/Amne-Dev/MyIsmail-Web/raw/refs/heads/main/Projects/projectworks%20of%20students/Aya%20Hammi%20Mly%20ismail.docx", name: "Aya Hammi", image: "https://placehold.co/150" },
        { title: "A New Vision for Fighting Bullying at School", link: "https://github.com/Amne-Dev/MyIsmail-Web/raw/refs/heads/main/Projects/projectworks%20of%20students/Boufaris%20Sara%20Mly%20ismail.docx", name: "Boufaris Sara", image: "https://placehold.co/150" },
        { title: "A new vision to convert the student's footsteps at school into electricity", link: "https://github.com/Amne-Dev/MyIsmail-Web/raw/refs/heads/main/Projects/projectworks%20of%20students/Boulangas%20Kaoutar%20Mly%20ismail.docx", name: "Boulangas Kaoutar", image: "https://placehold.co/150" },
        { title: "Student's Engagement in Community Service Projects", link: "https://github.com/Amne-Dev/MyIsmail-Web/raw/refs/heads/main/Projects/projectworks%20of%20students/Elbaraka%20Fares%20Mly%20ismail.docx", name: "Elbaraka Fares", image: "https://placehold.co/150" },
        { title: "Quality of Education in Morocco: Between theory and practice", link: "https://github.com/Amne-Dev/MyIsmail-Web/raw/refs/heads/main/Projects/projectworks%20of%20students/Fatima%20Zahra%20Ben%20Daouia%20Mly%20ismail.docx", name: "Fatima Zahra Ben Daouia", image: "https://placehold.co/150" },
        { title: "A New Vision for Sustainable Education", link: "https://github.com/Amne-Dev/MyIsmail-Web/raw/refs/heads/main/Projects/projectworks%20of%20students/Firdaws%20Idrissi%20Mly%20ismail.docx", name: "Firdaws Idrissi", image: "https://placehold.co/150" },
        { title: "Energy Storage Solutions: Electromagnetism for Developing Efficient and Sustainable Battery Technologies", link: "https://github.com/Amne-Dev/MyIsmail-Web/raw/refs/heads/main/Projects/projectworks%20of%20students/Hassan%20Ihyaoui%20Mly%20Ismail.docx", name: "Hassan Ihyaoui", image: "https://placehold.co/150" },
        { title: "A New Vision to the Teaching and Learning Process of Math", link: "https://github.com/Amne-Dev/MyIsmail-Web/raw/refs/heads/main/Projects/projectworks%20of%20students/imane%20zaghdoud%20Mly%20Ismail.docx", name: "Imane Zaghdoud", image: "https://placehold.co/150" },
        { title: "The Moroccan Education System Between Theory and Practice", link: "https://github.com/Amne-Dev/MyIsmail-Web/raw/refs/heads/main/Projects/projectworks%20of%20students/Malak%20Ben%20Sghir%20Mly%20ismail.docx", name: "Malak Ben Sghir", image: "https://placehold.co/150" },
        { title: "Gender Equality and Equity in Children's Education", link: "https://github.com/Amne-Dev/MyIsmail-Web/raw/refs/heads/main/Projects/projectworks%20of%20students/Meryeme%20Essaissi%20Mly%20ismail.docx", name: "Meryeme Essaissi", image: "https://placehold.co/150" },
        { title: "A New Vision to Save Life Below Water", link: "https://github.com/Amne-Dev/MyIsmail-Web/raw/refs/heads/main/Projects/projectworks%20of%20students/Nour%20ElHouda%20Boukhita%20Mly%20Ismail.docx", name: "Nour ElHouda Boukhita", image: "https://placehold.co/150" },
        { title: "Children's Education in Case Divorce in Morocco", link: "https://github.com/Amne-Dev/MyIsmail-Web/raw/refs/heads/main/Projects/projectworks%20of%20students/Oumaima%20Lakhlif%20Mly%20ismail.docx", name: "Oumaima Lakhlif", image: "https://placehold.co/150" },
        { title: "A New Vision for Saving Water Sources in the Region of Fes Meknes", link: "https://github.com/Amne-Dev/MyIsmail-Web/raw/refs/heads/main/Projects/projectworks%20of%20students/Rahmani%20Mohamed%20Karim%20Mly%20ismail.docx", name: "Rahmani Mohamed Karim", image: "https://placehold.co/150" },
        { title: "Taking Individual Actions for Zero Hunger", link: "https://github.com/Amne-Dev/MyIsmail-Web/raw/refs/heads/main/Projects/projectworks%20of%20students/Walid%20Mzoughi%20Mly%20Ismail.docx", name: "Walid Mzoughi", image: "https://placehold.co/150" }
    ];
    
    projectsData.practice = [
        { title: "Coming Soon.", link: "#", name: "Soon...", image: "https://placehold.co/150" }
    ];
    
    // Copy to Arabic data as well
    projectsDataAr = JSON.parse(JSON.stringify(projectsData));
}

// Enhanced loadProjects function with dynamic data
function loadProjects(type) {
    const container = document.getElementById('cards-container');
    container.innerHTML = '';

    const lang = document.documentElement.lang;
    const projects = lang === 'ar' ? projectsDataAr : projectsData;
    
    if (!projects[type] || projects[type].length === 0) {
        container.innerHTML = `
            <div class="text-center py-5">
                <h5 class="text-muted">No ${type} projects found</h5>
                <p class="text-muted">Projects will appear here once they are added by the administrator.</p>
            </div>
        `;
    } else {
        projects[type].forEach(project => {
            const card = document.createElement('div');
            card.className = 'list-group-item';
            card.style = 'background-color: var(--bg-sec); color: var(--text-sec); margin-bottom: 1rem; border-radius: 10px; padding: 1.5rem;';
            card.innerHTML = `
                <div class="d-flex align-items-center">
                    <img src="${project.image}" alt="Student Image" class="me-3" style="width: 10vh; height: auto; border-radius: 10px;" onerror="this.src='https://placehold.co/150'">
                    <div>
                        <h5 style="color: #fff;">${escapeHtml(project.title)}</h5>
                        <a href="${project.link}" target="_blank" style="color: var(--misc-sec);">View Project</a>
                        <p class="mb-0" style="color: var(--misc);">${escapeHtml(project.name)}</p>
                        ${project.description ? `<p class="mb-0 mt-1" style="color: var(--text-sec); font-size: 0.9rem;">${escapeHtml(project.description)}</p>` : ''}
                    </div>
                </div>
            `;
            container.appendChild(card);
        });
    }

    // Hide selection buttons and show cards
    document.getElementById('btn-practice').style.display = 'none';
    document.getElementById('btn-theory').style.display = 'none';
    document.getElementById('selection-buttons').style.height = '0';
    container.style.display = 'block';
}

// Enhanced goBack function
function goBack() {
    const cardsContainer = document.getElementById('cards-container');
    const selectionButtons = document.getElementById('selection-buttons');
    const practiceButton = document.getElementById('btn-practice');
    const theoryButton = document.getElementById('btn-theory');
    
    if (cardsContainer.style.display === 'block') {
        cardsContainer.style.display = 'none';
        practiceButton.style.display = 'block';
        theoryButton.style.display = 'block';
        selectionButtons.style.height = '100vh';
    } else {
        window.history.back();
    }
}

// Utility function for HTML escaping
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Load projects data when the page loads
document.addEventListener('DOMContentLoaded', () => {
    loadProjectsFromAPI();
});

// Add refresh functionality
function refreshProjects() {
    console.log('Refreshing projects data...');
    loadProjectsFromAPI();
}

// Auto-refresh every 5 minutes to get latest data
setInterval(refreshProjects, 5 * 60 * 1000);

// Make functions available globally for backwards compatibility
window.projects = projectsData;
window.projectsAr = projectsDataAr;
window.loadProjects = loadProjects;
window.goBack = goBack;
window.refreshProjects = refreshProjects;