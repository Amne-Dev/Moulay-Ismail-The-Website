const subjectButtons = document.getElementById('subject-buttons');
const cardsContainer = document.getElementById('cards-container');

// API configuration
const API_BASE = window.location.origin + '/api';

// Current language tracking
let currentLanguage = 'en';

document.querySelectorAll('.subject-btn').forEach(button => {
    button.addEventListener('click', () => loadLessonCards(button.dataset.subject));
});

document.getElementById('switch-to-arabic').addEventListener('click', function() {
    currentLanguage = 'ar';
    document.documentElement.lang = 'ar';
    document.querySelectorAll('.subject-btn').forEach(button => {
        switch (button.dataset.subject) {
            case 'maths': button.innerText = 'الرياضيات'; break;
            case 'physics': button.innerText = 'الفيزياء'; break;
            case 'engineering': button.innerText = 'الهندسة'; break;
            case 'biology': button.innerText = 'علم الأحياء'; break;
            case 'english': button.innerText = 'الإنجليزية'; break;
            case 'french': button.innerText = 'الفرنسية'; break;
            case 'arabic': button.innerText = 'العربية'; break;
            case 'philosophy': button.innerText = 'الفلسفة'; break;
            case 'islamic-education': button.innerText = 'التربية الإسلامية'; break;
            case 'other': button.innerText = 'أخرى'; break;
        }
    });
    document.querySelectorAll('.languageDropdown').forEach(button => button.innerText = 'Ar');
    document.getElementById('sidebar').style.display = 'none';
    document.getElementById('sidebar-arabic').style.display = 'flex';
});

document.getElementById('switch-to-english').addEventListener('click', function() {
    currentLanguage = 'en';
    document.documentElement.lang = 'en';
    document.querySelectorAll('.subject-btn').forEach(button => {
        switch (button.dataset.subject) {
            case 'maths': button.innerText = 'Maths'; break;
            case 'physics': button.innerText = 'Physics'; break;
            case 'engineering': button.innerText = 'Engineering'; break;
            case 'biology': button.innerText = 'Biology'; break;
            case 'english': button.innerText = 'English'; break;
            case 'french': button.innerText = 'French'; break;
            case 'arabic': button.innerText = 'Arabic'; break;
            case 'philosophy': button.innerText = 'Philosophy'; break;
            case 'islamic-education': button.innerText = 'Islamic Education'; break;
            case 'other': button.innerText = 'Other'; break;
        }
    });
    document.querySelectorAll('.languageDropdown').forEach(button => button.innerText = 'En');
    document.getElementById('sidebar').style.display = 'flex';
    document.getElementById('sidebar-arabic').style.display = 'none';
});

document.getElementById('switch-to-arabic-ar').addEventListener('click', function() {
    document.getElementById('switch-to-arabic').click();
});

document.getElementById('switch-to-english-ar').addEventListener('click', function() {
    document.getElementById('switch-to-english').click();
});

// Updated function to load lessons from API with enhanced UI
async function loadLessonCards(subject) {
    // Dispatch loading start event
    window.dispatchEvent(new CustomEvent('lessonLoadStart'));
    
    // Show loading state
    cardsContainer.innerHTML = '<div class="text-center"><div class="spinner-border" role="status"><span class="visually-hidden">Loading...</span></div></div>';
    
    // Hide other sections
    const noLessonsMessage = document.getElementById('no-lessons-message');
    const errorMessage = document.getElementById('error-message');
    if (noLessonsMessage) noLessonsMessage.style.display = 'none';
    if (errorMessage) errorMessage.style.display = 'none';
    
    try {
        const lessons = await getLessonsForSubject(subject);
        
        cardsContainer.innerHTML = ''; // Clear loading spinner
        
        if (lessons.length === 0) {
            // Show no lessons message
            if (noLessonsMessage) {
                const noLessonsText = document.getElementById('no-lessons-text');
                if (noLessonsText) {
                    noLessonsText.textContent = `No lessons have been added for ${subject} yet.`;
                }
                noLessonsMessage.style.display = 'block';
            }
            cardsContainer.style.display = 'none';
        } else {
            // Populate teacher filter
            populateTeacherFilter(lessons);
            
            // Render lesson cards
            lessons.forEach(lesson => {
                const cardElement = document.createElement('div');
                cardElement.className = 'list-group-item';
                cardElement.style = 'background-color: var(--bg-sec); color: var(--text-sec); margin-bottom: 1rem; border-radius: 10px; padding: 1.5rem; transition: transform 0.2s ease;';
                
                // Extract teacher and video link from lesson data
                const teacher = lesson.metadata?.teacher || extractTeacherFromBody(lesson.body) || 'Unknown Teacher';
                const videoLink = lesson.metadata?.videoLink || lesson.metadata?.link || extractLinkFromBody(lesson.body) || '#';
                
                cardElement.innerHTML = `
                    <div class="d-flex align-items-center">
                        <div class="flex-grow-1">
                            <h5 style="color: #fff; margin-bottom: 0.5rem;">${escapeHtml(lesson.title)}</h5>
                            <p style="color: var(--text-sec); margin-bottom: 0.25rem;">
                                <i class="bi bi-person-fill"></i> Teacher: ${escapeHtml(teacher)}
                            </p>
                            ${lesson.body && lesson.body !== `Subject: ${subject}\nTeacher: ${teacher}` ? 
                                `<p style="color: var(--text-sec); font-size: 0.9em; margin-bottom: 0;">${escapeHtml(lesson.body.substring(0, 100))}${lesson.body.length > 100 ? '...' : ''}</p>` : 
                                ''
                            }
                            ${lesson.metadata?.duration ? 
                                `<small style="color: var(--text-sec);"><i class="bi bi-clock"></i> ${lesson.metadata.duration}</small>` : 
                                ''
                            }
                        </div>
                        <div class="ms-3">
                            ${videoLink !== '#' ? 
                                `<a href="${escapeHtml(videoLink)}" class="btn btn-primary" target="_blank" rel="noopener noreferrer">
                                    <i class="bi bi-play-circle"></i> Watch
                                </a>` :
                                `<button class="btn btn-secondary" disabled>
                                    <i class="bi bi-x-circle"></i> No Video
                                </button>`
                            }
                        </div>
                    </div>
                `;
                
                // Add hover effect
                cardElement.addEventListener('mouseenter', () => {
                    cardElement.style.transform = 'translateY(-2px)';
                    cardElement.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
                });
                
                cardElement.addEventListener('mouseleave', () => {
                    cardElement.style.transform = 'translateY(0)';
                    cardElement.style.boxShadow = 'none';
                });
                
                cardsContainer.appendChild(cardElement);
            });
            
            cardsContainer.style.display = 'block';
            
            // Update lesson count
            updateLessonCount();
        }
        
        // Show search/filter section and back button
        const searchFilterSection = document.getElementById('search-filter-section');
        const backButtonSection = document.getElementById('back-button-section');
        if (searchFilterSection) searchFilterSection.style.display = 'flex';
        if (backButtonSection) backButtonSection.style.display = 'block';
        
    } catch (error) {
        console.error('Error loading lessons:', error);
        
        // Show error message
        if (errorMessage) {
            const errorText = document.getElementById('error-text');
            if (errorText) {
                errorText.textContent = `There was an error loading ${subject} lessons. Please check your internet connection and try again.`;
            }
            
            // Setup retry button
            const retryBtn = document.getElementById('retry-btn');
            if (retryBtn) {
                retryBtn.onclick = () => loadLessonCards(subject);
            }
            
            errorMessage.style.display = 'block';
        }
        
        cardsContainer.style.display = 'none';
    }

    // Hide subject buttons
    subjectButtons.style.display = 'none';
    
    // Dispatch loading complete event
    window.dispatchEvent(new CustomEvent('lessonLoadComplete'));
}

// Function to populate teacher filter dropdown
function populateTeacherFilter(lessons) {
    const teacherFilter = document.getElementById('teacher-filter');
    if (!teacherFilter) return;
    
    // Get unique teachers
    const teachers = [...new Set(lessons.map(lesson => {
        return lesson.metadata?.teacher || extractTeacherFromBody(lesson.body) || 'Unknown Teacher';
    }))].sort();
    
    // Clear existing options (except "All Teachers")
    teacherFilter.innerHTML = '<option value="">All Teachers</option>';
    
    // Add teacher options
    teachers.forEach(teacher => {
        const option = document.createElement('option');
        option.value = teacher;
        option.textContent = teacher;
        teacherFilter.appendChild(option);
    });
}

// Fetch lessons from API with fallback to hardcoded data
async function getLessonsForSubject(subject) {
    try {
        // First, try to get lessons from the API
        const response = await fetch(`${API_BASE}/content?section=lessons&language=${currentLanguage}&isActive=true`);
        
        if (response.ok) {
            const allLessons = await response.json();
            
            // Filter lessons by subject
            const filteredLessons = allLessons.filter(lesson => {
                // Check if metadata contains subject
                if (lesson.metadata && lesson.metadata.subject === subject) {
                    return true;
                }
                
                // Check if body contains subject information
                if (lesson.body && lesson.body.toLowerCase().includes(`subject: ${subject}`)) {
                    return true;
                }
                
                // Check if title contains subject-related keywords
                const subjectKeywords = getSubjectKeywords(subject);
                return subjectKeywords.some(keyword => 
                    lesson.title.toLowerCase().includes(keyword.toLowerCase())
                );
            });
            
            // Sort by order if available, otherwise by title
            filteredLessons.sort((a, b) => {
                if (a.order !== undefined && b.order !== undefined) {
                    return a.order - b.order;
                }
                return a.title.localeCompare(b.title);
            });
            
            console.log(`✅ Loaded ${filteredLessons.length} lessons for ${subject} from API`);
            return filteredLessons;
        }
    } catch (error) {
        console.warn('API request failed, falling back to hardcoded data:', error);
        
        // Dispatch event to show offline indicator
        window.dispatchEvent(new CustomEvent('usingFallbackData'));
        window.usingFallbackData = true;
    }
    
    // Fallback to hardcoded data if API fails
    console.log(`📱 Using fallback data for ${subject}`);
    window.usingFallbackData = true;
    window.dispatchEvent(new CustomEvent('usingFallbackData'));
    
    return getHardcodedLessonsForSubject(subject);
}

// Helper function to get subject-related keywords for filtering
function getSubjectKeywords(subject) {
    const keywordMap = {
        'english': ['english', 'grammar', 'vocabulary', 'tense', 'verb', 'adjective', 'adverb', 'pronoun'],
        'maths': ['math', 'mathematics', 'algebra', 'calculus', 'geometry', 'function', 'equation', 'derivative'],
        'physics': ['physics', 'wave', 'mechanics', 'circuit', 'energy', 'force', 'motion', 'electromagnetic'],
        'engineering': ['engineering', 'analysis', 'functional', 'energy chain', 'information', 'technical'],
        'biology': ['biology', 'genetic', 'reproduction', 'variation', 'population', 'cell', 'organism'],
        'french': ['french', 'français', 'grammaire', 'vocabulaire'],
        'arabic': ['arabic', 'عربي', 'نحو', 'صرف', 'بلاغة'],
        'philosophy': ['philosophy', 'ethics', 'logic', 'metaphysics'],
        'islamic-education': ['islamic', 'islam', 'quran', 'hadith', 'fiqh']
    };
    
    return keywordMap[subject] || [subject];
}

// Helper function to extract teacher from body text
function extractTeacherFromBody(body) {
    if (!body) return null;
    
    const teacherMatch = body.match(/Teacher:\s*(.+)/i);
    return teacherMatch ? teacherMatch[1].trim() : null;
}

// Helper function to extract link from body text or metadata
function extractLinkFromBody(body) {
    if (!body) return null;
    
    const urlMatch = body.match(/(https?:\/\/[^\s]+)/);
    return urlMatch ? urlMatch[1] : null;
}

// HTML escape function for security
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Fallback hardcoded data (your original data)
function getHardcodedLessonsForSubject(subject) {
    if (subject === 'english') {
        return [
            { title: 'The Future Tense with "will" and "be going to"', metadata: { teacher: 'Mohamed Fettah', videoLink: 'https://www.youtube.com/watch?v=bOfDvsHddE0&t=9s' }, body: 'Subject: english\nTeacher: Mohamed Fettah', order: 0 },
            { title: 'What and how I learn English', metadata: { teacher: 'Mohamed Fettah', videoLink: 'https://www.youtube.com/watch?v=sTbrX9yrRA8&t=626s' }, body: 'Subject: english\nTeacher: Mohamed Fettah', order: 1 },
            { title: 'Learning vocabulary (health)', metadata: { teacher: 'Mohamed Fettah', videoLink: 'https://www.youtube.com/watch?v=8DFA1lQ8HFM&t=1219s' }, body: 'Subject: english\nTeacher: Mohamed Fettah', order: 2 },
            { title: 'How to tell others about me', metadata: { teacher: 'Mohamed Fettah', videoLink: 'https://www.youtube.com/watch?v=MChmfeYZMew&t=296s' }, body: 'Subject: english\nTeacher: Mohamed Fettah', order: 3 },
            { title: 'Quantity and quantifiers', metadata: { teacher: 'Mohamed Fettah', videoLink: 'https://www.youtube.com/watch?v=wsmpvTuGJa8&t=393s' }, body: 'Subject: english\nTeacher: Mohamed Fettah', order: 4 },
            { title: 'Superlative form', metadata: { teacher: 'Mohamed Fettah', videoLink: 'https://www.youtube.com/watch?v=WGD0pXtnElU&t=166s' }, body: 'Subject: english\nTeacher: Mohamed Fettah', order: 5 },
            { title: 'My family tree', metadata: { teacher: 'Mohamed Fettah', videoLink: 'https://www.youtube.com/watch?v=cAzOqyMNwHc&t=312s' }, body: 'Subject: english\nTeacher: Mohamed Fettah', order: 6 },
            { title: 'Using too and enough', metadata: { teacher: 'Mohamed Fettah', videoLink: 'https://www.youtube.com/watch?v=WEx7cx5pljw' }, body: 'Subject: english\nTeacher: Mohamed Fettah', order: 7 },
            { title: 'Comparative form', metadata: { teacher: 'Mohamed Fettah', videoLink: 'https://www.youtube.com/watch?v=wZWi5DLi1Mc' }, body: 'Subject: english\nTeacher: Mohamed Fettah', order: 8 },
            { title: 'Expressing purpose', metadata: { teacher: 'Mohamed Fettah', videoLink: 'https://www.youtube.com/watch?v=16DrNprmkrc&t=31s' }, body: 'Subject: english\nTeacher: Mohamed Fettah', order: 9 },
            { title: 'Adverbs of frequency', metadata: { teacher: 'Mohamed Fettah', videoLink: 'https://www.youtube.com/watch?v=sNEuYYcT61U&t=89s' }, body: 'Subject: english\nTeacher: Mohamed Fettah', order: 10 },
            { title: 'Expressing and seeking advice', metadata: { teacher: 'Mohamed Fettah', videoLink: 'https://www.youtube.com/watch?v=-3Uz2gae9Os&t=119s' }, body: 'Subject: english\nTeacher: Mohamed Fettah', order: 11 },
            { title: 'Used to and didn\'t use to', metadata: { teacher: 'Mohamed Fettah', videoLink: 'https://www.youtube.com/watch?v=D_mfEkPA2s4&t=345s' }, body: 'Subject: english\nTeacher: Mohamed Fettah', order: 12 },
            { title: 'Present perfect', metadata: { teacher: 'Mohamed Fettah', videoLink: 'https://www.youtube.com/watch?v=E_NmFgcWdeE&t=41s' }, body: 'Subject: english\nTeacher: Mohamed Fettah', order: 13 },
            { title: 'The past simple', metadata: { teacher: 'Mohamed Fettah', videoLink: 'https://www.youtube.com/watch?v=VdE-mKLHtpA' }, body: 'Subject: english\nTeacher: Mohamed Fettah', order: 14 },
            { title: 'Pronouns in English', metadata: { teacher: 'Mohamed Fettah', videoLink: 'https://www.youtube.com/watch?v=ZAtVkfcWWRQ&t=724s' }, body: 'Subject: english\nTeacher: Mohamed Fettah', order: 15 },
            { title: 'The present simple', metadata: { teacher: 'Mohamed Fettah', videoLink: 'https://www.youtube.com/watch?v=qkXB2HkB8lo&t=931s' }, body: 'Subject: english\nTeacher: Mohamed Fettah', order: 16 },
            { title: 'Expressing wishes', metadata: { teacher: 'Mohamed Fettah', videoLink: 'https://www.youtube.com/watch?v=prbEP8JVL0c' }, body: 'Subject: english\nTeacher: Mohamed Fettah', order: 17 },
            { title: 'Conditional sentence', metadata: { teacher: 'Mohamed Fettah', videoLink: 'https://www.youtube.com/watch?v=1xPoZx-jopY&t=1633s' }, body: 'Subject: english\nTeacher: Mohamed Fettah', order: 18 },
            { title: 'The passive voice', metadata: { teacher: 'Mohamed Fettah', videoLink: 'https://www.youtube.com/watch?v=PpaUB8rBt-4&t=9s' }, body: 'Subject: english\nTeacher: Mohamed Fettah', order: 19 }
        ];
    } else if (subject === 'maths') {
        return [
            { title: 'Limits and Continuity', metadata: { teacher: 'Teacher A', videoLink: '#' }, body: 'Subject: maths\nTeacher: Teacher A', order: 0 },
            { title: 'Derivation and Study of Functions', metadata: { teacher: 'Teacher A', videoLink: '#' }, body: 'Subject: maths\nTeacher: Teacher A', order: 1 },
            { title: 'Mean Value Theorem (MVT)', metadata: { teacher: 'Teacher A', videoLink: '#' }, body: 'Subject: maths\nTeacher: Teacher A', order: 2 },
            { title: 'Numerical Sequences', metadata: { teacher: 'Teacher A', videoLink: '#' }, body: 'Subject: maths\nTeacher: Teacher A', order: 3 },
            { title: 'Logarithmic Functions', metadata: { teacher: 'Teacher A', videoLink: '#' }, body: 'Subject: maths\nTeacher: Teacher A', order: 4 },
            { title: 'Exponential Functions', metadata: { teacher: 'Teacher A', videoLink: '#' }, body: 'Subject: maths\nTeacher: Teacher A', order: 5 },
            { title: 'Differential Equations', metadata: { teacher: 'Teacher A', videoLink: '#' }, body: 'Subject: maths\nTeacher: Teacher A', order: 6 },
            { title: 'Complex Numbers (Part 1)', metadata: { teacher: 'Teacher A', videoLink: '#' }, body: 'Subject: maths\nTeacher: Teacher A', order: 7 },
            { title: 'Primitive Functions and Integral Calculus', metadata: { teacher: 'Teacher A', videoLink: '#' }, body: 'Subject: maths\nTeacher: Teacher A', order: 8 },
            { title: 'Complex Numbers (Part 2)', metadata: { teacher: 'Teacher A', videoLink: '#' }, body: 'Subject: maths\nTeacher: Teacher A', order: 9 },
            { title: 'Arithmetic', metadata: { teacher: 'Teacher A', videoLink: '#' }, body: 'Subject: maths\nTeacher: Teacher A', order: 10 },
            { title: 'Algebraic Structures', metadata: { teacher: 'Teacher A', videoLink: '#' }, body: 'Subject: maths\nTeacher: Teacher A', order: 11 },
            { title: 'Probabilities', metadata: { teacher: 'Teacher A', videoLink: '#' }, body: 'Subject: maths\nTeacher: Teacher A', order: 12 }
        ];
    } else if (subject === 'physics') {
        return [
            { title: 'Progressive Mechanical Waves', metadata: { teacher: 'Teacher B', videoLink: '#' }, body: 'Subject: physics\nTeacher: Teacher B', order: 0 },
            { title: 'Periodic Progressive Mechanical Waves', metadata: { teacher: 'Teacher B', videoLink: '#' }, body: 'Subject: physics\nTeacher: Teacher B', order: 1 },
            { title: 'Propagation of Light Waves', metadata: { teacher: 'Teacher B', videoLink: '#' }, body: 'Subject: physics\nTeacher: Teacher B', order: 2 },
            { title: 'Radioactive Decay', metadata: { teacher: 'Teacher B', videoLink: '#' }, body: 'Subject: physics\nTeacher: Teacher B', order: 3 },
            { title: 'Nuclei, Mass, and Energy', metadata: { teacher: 'Teacher B', videoLink: '#' }, body: 'Subject: physics\nTeacher: Teacher B', order: 4 }
        ];
    } else if (subject === 'engineering') {
        return [
            { title: 'Functional Analysis: General Introduction', metadata: { teacher: 'Teacher C', videoLink: '#' }, body: 'Subject: engineering\nTeacher: Teacher C', order: 0 },
            { title: 'Functional Analysis: Industrial Enterprise', metadata: { teacher: 'Teacher C', videoLink: '#' }, body: 'Subject: engineering\nTeacher: Teacher C', order: 1 },
            { title: 'Functional Analysis: External Functional Analysis', metadata: { teacher: 'Teacher C', videoLink: '#' }, body: 'Subject: engineering\nTeacher: Teacher C', order: 2 },
            { title: 'Functional Analysis: Internal Functional Analysis', metadata: { teacher: 'Teacher C', videoLink: '#' }, body: 'Subject: engineering\nTeacher: Teacher C', order: 3 },
            { title: 'Functional Analysis: Functional Chain', metadata: { teacher: '@sciences-ingenieur0 (on youtube)', videoLink: 'https://www.youtube.com/watch?v=iOrObZl6X5w' }, body: 'Subject: engineering\nTeacher: @sciences-ingenieur0 (on youtube)', order: 4 },
            { title: 'Energy Chain: Function Supply', metadata: { teacher: 'Teacher C', videoLink: '#' }, body: 'Subject: engineering\nTeacher: Teacher C', order: 5 },
            { title: 'Energy Chain: Function Distribute', metadata: { teacher: 'Teacher C', videoLink: '#' }, body: 'Subject: engineering\nTeacher: Teacher C', order: 6 },
            { title: 'Energy Chain: Function Convert', metadata: { teacher: 'Teacher C', videoLink: '#' }, body: 'Subject: engineering\nTeacher: Teacher C', order: 7 },
            { title: 'Energy Chain: Function Transmit', metadata: { teacher: 'Teacher C', videoLink: '#' }, body: 'Subject: engineering\nTeacher: Teacher C', order: 8 },
            { title: 'Information Chain: Technical Drawing', metadata: { teacher: 'Teacher C', videoLink: '#' }, body: 'Subject: engineering\nTeacher: Teacher C', order: 9 },
            { title: 'Information Chain: Orthogonal Projection', metadata: { teacher: 'Teacher C', videoLink: '#' }, body: 'Subject: engineering\nTeacher: Teacher C', order: 10 },
            { title: 'Information Chain: Cuts and Sections', metadata: { teacher: 'Teacher C', videoLink: '#' }, body: 'Subject: engineering\nTeacher: Teacher C', order: 11 },
            { title: 'Information Chain: View Correspondence', metadata: { teacher: 'Teacher C', videoLink: '#' }, body: 'Subject: engineering\nTeacher: Teacher C', order: 12 },
            { title: 'Information Chain: Threading and Tapping', metadata: { teacher: 'Teacher C', videoLink: '#' }, body: 'Subject: engineering\nTeacher: Teacher C', order: 13 }
        ];
    } else if (subject === 'biology') {
        return [
            { title: 'Transfer of Genetic Information During Sexual Reproduction - Human Genetics', metadata: { teacher: 'Teacher D', videoLink: '#' }, body: 'Subject: biology\nTeacher: Teacher D', order: 0 },
            { title: 'Variation and Population Genetics', metadata: { teacher: 'Teacher D', videoLink: '#' }, body: 'Subject: biology\nTeacher: Teacher D', order: 1 }
        ];
    }
    
    // Return empty array for subjects without lessons
    return [];
}

function goBack() {
    if (cardsContainer.style.display === 'block') {
        cardsContainer.style.display = 'none';
        subjectButtons.style.display = 'flex';
    } else {
        window.history.back();
    }
}