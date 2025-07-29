function showActivity(activityId) {
    document.getElementById('activity-buttons').style.display = 'none';
    document.querySelectorAll('.activity-section').forEach(section => {
        section.style.display = 'none';
    });
    document.getElementById(activityId).style.display = 'block';
}