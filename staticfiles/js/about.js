document.addEventListener('DOMContentLoaded', function() {
    // Ekip üyelerini dinamik olarak yükle
    loadTeamMembers();

    // Form gönderimi işleme
    const contactForm = document.querySelector('.contact-form form');
    if (contactForm) {
        contactForm.addEventListener('submit', handleFormSubmit);
    }

    // Sayfa yüklendiğinde animasyonları başlat
    animateOnScroll();
});



    const teamGrid = document.querySelector('.team-grid');
    if (teamGrid) {
        teamGrid.innerHTML = teamMembers.map(member => `
            <div class="team-member">
                <img src="${member.image}" alt="${member.name}">
                <h3>${member.name}</h3>
                <p>${member.role}</p>
            </div>
        `).join('');
    }

// Form gönderimi işleme fonksiyonu
function handleFormSubmit(e) {
    e.preventDefault();
    
    const formData = {
        name: e.target.querySelector('input[type="text"]').value,
        email: e.target.querySelector('input[type="email"]').value,
        message: e.target.querySelector('textarea').value
    };

    // Form doğrulama
    if (!validateForm(formData)) {
        return;
    }

    // Form gönderimi simülasyonu
    submitForm(formData);
}

// Form doğrulama
function validateForm(data) {
    if (!data.name || data.name.length < 2) {
        showNotification('Lütfen geçerli bir isim giriniz', 'error');
        return false;
    }
    
    if (!data.email || !isValidEmail(data.email)) {
        showNotification('Lütfen geçerli bir e-posta adresi giriniz', 'error');
        return false;
    }
    
    if (!data.message || data.message.length < 10) {
        showNotification('Mesajınız en az 10 karakter olmalıdır', 'error');
        return false;
    }

    return true;
}

// E-posta doğrulama
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Form gönderimi simülasyonu
function submitForm(formData) {
    const submitButton = document.querySelector('.submit-button');
    submitButton.innerHTML = 'Gönderiliyor...';
    submitButton.disabled = true;

    setTimeout(() => {
        showNotification('Mesajınız başarıyla gönderildi!', 'success');
        submitButton.innerHTML = 'Gönder';
        submitButton.disabled = false;
        document.querySelector('.contact-form form').reset();
    }, 1500);
}

// Bildirim gösterme
function showNotification(message, type) {
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Scroll animasyonları
function animateOnScroll() {
    const elements = document.querySelectorAll('.value-card, .team-member, .about-section');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1
    });

    elements.forEach(element => {
        element.classList.add('hidden');
        observer.observe(element);
    });
}
