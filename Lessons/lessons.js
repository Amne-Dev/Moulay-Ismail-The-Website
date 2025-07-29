const subjectButtons = document.getElementById('subject-buttons');
const cardsContainer = document.getElementById('cards-container');

document.querySelectorAll('.subject-btn').forEach(button => {
    button.addEventListener('click', () => loadLessonCards(button.dataset.subject));
});

document.getElementById('switch-to-arabic').addEventListener('click', function() {
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

function loadLessonCards(subject) {
    cardsContainer.innerHTML = ''; // Clear previous cards
    const lessons = getLessonsForSubject(subject);
    lessons.forEach(lesson => {
        lesson.cards.forEach(card => {
            const cardElement = document.createElement('div');
            cardElement.className = 'list-group-item';
            cardElement.style = 'background-color: var(--bg-sec); color: var(--text-sec); margin-bottom: 1rem; border-radius: 10px; padding: 1.5rem;';
            cardElement.innerHTML = `
                <div class="d-flex align-items-center">
                    <div>
                        <h5 style="color: #fff;">${card.title}</h5>
                        <p style="color: var(--text-sec);">Teacher: ${card.teacher}</p>
                    </div>
                 <a href="${card.link}" class="btn btn-primary" style="position: absolute; right: 1rem; border: none;" download>Watch</a>    
                </div>
            `;
            cardsContainer.appendChild(cardElement);
        });
    });

    subjectButtons.style.display = 'none';
    cardsContainer.style.display = 'block';
}

function getLessonsForSubject(subject) {
    if (subject === 'english') {
        return [
            { title: 'The Future Tense with "will" and "be going to"', cards: [{ title: 'The Future Tense with "will" and "be going to"', teacher: 'Mohamed Fettah', link: 'https://www.youtube.com/watch?v=bOfDvsHddE0&t=9s' }] },
            { title: 'What and how I learn English', cards: [{ title: 'What and how I learn English', teacher: 'Mohamed Fettah', link: 'https://www.youtube.com/watch?v=sTbrX9yrRA8&t=626s' }] },
            { title: 'Learning vocabulary (health)', cards: [{ title: 'Learning vocabulary (health)', teacher: 'Mohamed Fettah', link: 'https://www.youtube.com/watch?v=8DFA1lQ8HFM&t=1219s' }] },
            { title: 'How to tell others about me', cards: [{ title: 'How to tell others about me', teacher: 'Mohamed Fettah', link: 'https://www.youtube.com/watch?v=MChmfeYZMew&t=296s' }] },
            { title: 'Quantity and quantifiers', cards: [{ title: 'Quantity and quantifiers', teacher: 'Mohamed Fettah', link: 'https://www.youtube.com/watch?v=wsmpvTuGJa8&t=393s' }] },
            { title: 'Superlative form', cards: [{ title: 'Superlative form', teacher: 'Mohamed Fettah', link: 'https://www.youtube.com/watch?v=WGD0pXtnElU&t=166s' }] },
            { title: 'My family tree', cards: [{ title: 'My family tree', teacher: 'Mohamed Fettah', link: 'https://www.youtube.com/watch?v=cAzOqyMNwHc&t=312s' }] },
            { title: 'Using too and enough', cards: [{ title: 'Using too and enough', teacher: 'Mohamed Fettah', link: 'https://www.youtube.com/watch?v=WEx7cx5pljw' }] },
            { title: 'Comparative form', cards: [{ title: 'Comparative form', teacher: 'Mohamed Fettah', link: 'https://www.youtube.com/watch?v=wZWi5DLi1Mc' }] },
            { title: 'Expressing purpose', cards: [{ title: 'Expressing purpose', teacher: 'Mohamed Fettah', link: 'https://www.youtube.com/watch?v=16DrNprmkrc&t=31s' }] },
            { title: 'Adverbs of frequency', cards: [{ title: 'Adverbs of frequency', teacher: 'Mohamed Fettah', link: 'https://www.youtube.com/watch?v=sNEuYYcT61U&t=89s' }] },
            { title: 'Expressing and seeking advice', cards: [{ title: 'Expressing and seeking advice', teacher: 'Mohamed Fettah', link: 'https://www.youtube.com/watch?v=-3Uz2gae9Os&t=119s' }] },
            { title: 'Used to and didn’t use to', cards: [{ title: 'Used to and didn’t use to', teacher: 'Mohamed Fettah', link: 'https://www.youtube.com/watch?v=D_mfEkPA2s4&t=345s' }] },
            { title: 'Present perfect', cards: [{ title: 'Present perfect', teacher: 'Mohamed Fettah', link: 'https://www.youtube.com/watch?v=E_NmFgcWdeE&t=41s' }] },
            { title: 'The past simple', cards: [{ title: 'The past simple', teacher: 'Mohamed Fettah', link: 'https://www.youtube.com/watch?v=VdE-mKLHtpA' }] },
            { title: 'Pronouns in English', cards: [{ title: 'Pronouns in English', teacher: 'Mohamed Fettah', link: 'https://www.youtube.com/watch?v=ZAtVkfcWWRQ&t=724s' }] },
            { title: 'The present simple', cards: [{ title: 'The present simple', teacher: 'Mohamed Fettah', link: 'https://www.youtube.com/watch?v=qkXB2HkB8lo&t=931s' }] },
            { title: 'Expressing wishes', cards: [{ title: 'Expressing wishes', teacher: 'Mohamed Fettah', link: 'https://www.youtube.com/watch?v=prbEP8JVL0c' }] },
            { title: 'Conditional sentence', cards: [{ title: 'Conditional sentence', teacher: 'Mohamed Fettah', link: 'https://www.youtube.com/watch?v=1xPoZx-jopY&t=1633s' }] },
            { title: 'The passive voice', cards: [{ title: 'The passive voice', teacher: 'Mohamed Fettah', link: 'https://www.youtube.com/watch?v=PpaUB8rBt-4&t=9s' }] }
        ];
    } else if (subject === 'maths') {
        return [
            { title: 'Limits and Continuity', cards: [{ title: 'Limits and Continuity', teacher: 'Teacher A', link: '#' }] },
            { title: 'Derivation and Study of Functions', cards: [{ title: 'Derivation and Study of Functions', teacher: 'Teacher A', link: '#' }] },
            { title: 'Mean Value Theorem (MVT)', cards: [{ title: 'Mean Value Theorem (MVT)', teacher: 'Teacher A', link: '#' }] },
            { title: 'Numerical Sequences', cards: [{ title: 'Numerical Sequences', teacher: 'Teacher A', link: '#' }] },
            { title: 'Logarithmic Functions', cards: [{ title: 'Logarithmic Functions', teacher: 'Teacher A', link: '#' }] },
            { title: 'Exponential Functions', cards: [{ title: 'Exponential Functions', teacher: 'Teacher A', link: '#' }] },
            { title: 'Differential Equations', cards: [{ title: 'Differential Equations', teacher: 'Teacher A', link: '#' }] },
            { title: 'Complex Numbers (Part 1)', cards: [{ title: 'Complex Numbers (Part 1)', teacher: 'Teacher A', link: '#' }] },
            { title: 'Primitive Functions and Integral Calculus', cards: [{ title: 'Primitive Functions and Integral Calculus', teacher: 'Teacher A', link: '#' }] },
            { title: 'Complex Numbers (Part 2)', cards: [{ title: 'Complex Numbers (Part 2)', teacher: 'Teacher A', link: '#' }] },
            { title: 'Arithmetic', cards: [{ title: 'Arithmetic', teacher: 'Teacher A', link: '#' }] },
            { title: 'Algebraic Structures', cards: [{ title: 'Algebraic Structures', teacher: 'Teacher A', link: '#' }] },
            { title: 'Probabilities', cards: [{ title: 'Probabilities', teacher: 'Teacher A', link: '#' }] }
        ];
    } else if (subject === 'physics') {
        return [
            { title: 'Progressive Mechanical Waves', cards: [{ title: 'Progressive Mechanical Waves', teacher: 'Teacher B', link: '#' }] },
            { title: 'Periodic Progressive Mechanical Waves', cards: [{ title: 'Periodic Progressive Mechanical Waves', teacher: 'Teacher B', link: '#' }] },
            { title: 'Propagation of Light Waves', cards: [{ title: 'Propagation of Light Waves', teacher: 'Teacher B', link: '#' }] },
            { title: 'Radioactive Decay', cards: [{ title: 'Radioactive Decay', teacher: 'Teacher B', link: '#' }] },
            { title: 'Nuclei, Mass, and Energy', cards: [{ title: 'Nuclei, Mass, and Energy', teacher: 'Teacher B', link: '#' }] },
            { title: 'RC Circuit', cards: [{ title: 'RC Circuit', teacher: 'Teacher B', link: '#' }] },
            { title: 'RL Circuit', cards: [{ title: 'RL Circuit', teacher: 'Teacher B', link: '#' }] },
            { title: 'Free Oscillations of an RLC Series Circuit', cards: [{ title: 'Free Oscillations of an RLC Series Circuit', teacher: 'Teacher B', link: '#' }] },
            { title: 'RLC Series Circuit in Forced Sinusoidal Regime', cards: [{ title: 'RLC Series Circuit in Forced Sinusoidal Regime', teacher: 'Teacher B', link: '#' }] },
            { title: 'Electromagnetic Waves', cards: [{ title: 'Electromagnetic Waves', teacher: 'Teacher B', link: '#' }] },
            { title: 'Amplitude Modulation', cards: [{ title: 'Amplitude Modulation', teacher: 'Teacher B', link: '#' }] },
            { title: 'Slow and Fast Transformations', cards: [{ title: 'Slow and Fast Transformations', teacher: 'Teacher B', link: '#' }] },
            { title: 'Temporal Monitoring of a Chemical Transformation - Reaction Rate', cards: [{ title: 'Temporal Monitoring of a Chemical Transformation - Reaction Rate', teacher: 'Teacher B', link: '#' }] },
            { title: 'Chemical Transformations Occurring in Both Directions', cards: [{ title: 'Chemical Transformations Occurring in Both Directions', teacher: 'Teacher B', link: '#' }] },
            { title: 'Equilibrium State of a Chemical System', cards: [{ title: 'Equilibrium State of a Chemical System', teacher: 'Teacher B', link: '#' }] },
            { title: 'Transformations Related to Acid-Base Reactions', cards: [{ title: 'Transformations Related to Acid-Base Reactions', teacher: 'Teacher B', link: '#' }] },
            { title: 'Acid-Base Titration', cards: [{ title: 'Acid-Base Titration', teacher: 'Teacher B', link: '#' }] },
            { title: 'Newton\'s Laws', cards: [{ title: 'Newton\'s Laws', teacher: 'Teacher B', link: '#' }] },
            { title: 'Vertical Free Fall of a Solid', cards: [{ title: 'Vertical Free Fall of a Solid', teacher: 'Teacher B', link: '#' }] },
            { title: 'Planar Movements', cards: [{ title: 'Planar Movements', teacher: 'Teacher B', link: '#' }] },
            { title: 'Movement of Satellites and Planets', cards: [{ title: 'Movement of Satellites and Planets', teacher: 'Teacher B', link: '#' }] },
            { title: 'Rotational Motion of a Solid Around a Fixed Axis', cards: [{ title: 'Rotational Motion of a Solid Around a Fixed Axis', teacher: 'Teacher B', link: '#' }] },
            { title: 'Mechanical Oscillating Systems', cards: [{ title: 'Mechanical Oscillating Systems', teacher: 'Teacher B', link: '#' }] },
            { title: 'Energy Aspects of Mechanical Oscillations', cards: [{ title: 'Energy Aspects of Mechanical Oscillations', teacher: 'Teacher B', link: '#' }] },
            { title: 'Atom and Newtonian Mechanics', cards: [{ title: 'Atom and Newtonian Mechanics', teacher: 'Teacher B', link: '#' }] },
            { title: 'Spontaneous Evolution of a Chemical System', cards: [{ title: 'Spontaneous Evolution of a Chemical System', teacher: 'Teacher B', link: '#' }] },
            { title: 'Spontaneous Transformations in Batteries and Energy Production', cards: [{ title: 'Spontaneous Transformations in Batteries and Energy Production', teacher: 'Teacher B', link: '#' }] },
            { title: 'Forced Transformations (Electrolysis)', cards: [{ title: 'Forced Transformations (Electrolysis)', teacher: 'Teacher B', link: '#' }] },
            { title: 'Esterification and Hydrolysis Reactions', cards: [{ title: 'Esterification and Hydrolysis Reactions', teacher: 'Teacher B', link: '#' }] },
            { title: 'Controlling the Evolution of a Chemical System', cards: [{ title: 'Controlling the Evolution of a Chemical System', teacher: 'Teacher B', link: '#' }] }
        ];
    } else if (subject === 'engineering') {
        return [
            { title: 'Module 1: Functional Analysis', cards: [
                { title: 'Functional Analysis: General Introduction', teacher: 'Teacher C', link: '#' },
                { title: 'Functional Analysis: Industrial Enterprise', teacher: 'Teacher C', link: '#' },
                { title: 'Functional Analysis: External Functional Analysis', teacher: 'Teacher C', link: '#' },
                { title: 'Functional Analysis: Internal Functional Analysis', teacher: 'Teacher C', link: '#' },
                { title: 'Functional Analysis: Functional Chain', teacher: '@sciences-ingenieur0 (on youtube)', link: 'https://www.youtube.com/watch?v=iOrObZl6X5w' },
            ]},
            { title: 'Module 2: Energy Chain', cards: [
                { title: 'Energy Chain: Function Supply', teacher: 'Teacher C', link: '#' },
                { title: 'Energy Chain: Function Distribute', teacher: 'Teacher C', link: '#' },
                { title: 'Energy Chain: Function Convert', teacher: 'Teacher C', link: '#' },
                { title: 'Energy Chain: Function Transmit', teacher: 'Teacher C', link: '#' },
            ]},
            { title: 'Module 3: Information Chain', cards: [
                { title: 'Information Chain: Technical Drawing', teacher: 'Teacher C', link: '#' },
                { title: 'Information Chain: Orthogonal Projection', teacher: 'Teacher C', link: '#' },
                { title: 'Information Chain: Cuts and Sections', teacher: 'Teacher C', link: '#' },
                { title: 'Information Chain: View Correspondence', teacher: 'Teacher C', link: '#' },
                { title: 'Information Chain: Threading and Tapping', teacher: 'Teacher C', link: '#' }
            ]}
        ];
    } else if (subject === 'biology') {
        return [
            { title: 'Transfer of Genetic Information During Sexual Reproduction - Human Genetics', cards: [{ title: 'Transfer of Genetic Information During Sexual Reproduction - Human Genetics', teacher: 'Teacher D', link: '#' }] },
            { title: 'Variation and Population Genetics', cards: [{ title: 'Variation and Population Genetics', teacher: 'Teacher D', link: '#' }] }
        ];
    }
    // Add more subjects and lessons as needed
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