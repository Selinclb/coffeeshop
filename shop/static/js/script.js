// Header scroll efekti
window.addEventListener('scroll', () => {
    const header = document.querySelector('.header');
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

// Atölye rezervasyon işlemleri
class WorkshopReservation {
    constructor() {
        this.reservations = JSON.parse(localStorage.getItem('workshopReservations')) || [];
        this.updateReservationCount();
    }

    addReservation(workshop) {
        const existingReservation = this.reservations.find(r => r.id === workshop.id);
        if (!existingReservation) {
            this.reservations.push(workshop);
            this.saveReservations();
            this.updateReservationCount();
            this.showNotification('success', `${workshop.title} atölyesine kaydınız alındı`);
        } else {
            this.showNotification('error', 'Bu atölyeye zaten kayıtlısınız');
        }
    }

    updateReservationCount() {
        const workshopCount = document.querySelector('.workshop-count');
        if (workshopCount) {
            workshopCount.textContent = this.reservations.length;
            workshopCount.style.display = this.reservations.length === 0 ? 'none' : 'inline';
        }
    }

    saveReservations() {
        localStorage.setItem('workshopReservations', JSON.stringify(this.reservations));
    }

    showNotification(type, message) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Kullanıcı işlemleri
class UserAuth {
    constructor() {
        // Kullanıcı menüsü işlemleri
        const userMenuWrapper = document.querySelector('.user-menu-wrapper');
        if (userMenuWrapper) {
            userMenuWrapper.addEventListener('click', (e) => {
                e.preventDefault();
                this.showUserMenu(e);
            });
        }
    }

    showUserMenu(e) {
        const userMenu = document.createElement('div');
        userMenu.className = 'user-menu';
        userMenu.innerHTML = `
            <ul>
                <li><a href="/profil">Profilim</a></li>
                <li><a href="/siparislerim">Siparişlerim</a></li>
                <li><a href="{% url 'shop:logout' %}">Çıkış Yap</a></li>
            </ul>
        `;
        
        // Varsa eski menüyü kaldır
        const existingMenu = document.querySelector('.user-menu');
        if (existingMenu) {
            existingMenu.remove();
        }
        
        // Yeni menüyü ekle
        document.body.appendChild(userMenu);
        
        // Menü konumunu ayarla
        const rect = e.target.getBoundingClientRect();
        userMenu.style.position = 'absolute';
        userMenu.style.top = `${rect.bottom + window.scrollY}px`;
        userMenu.style.left = `${rect.left}px`;

        // Menü dışına tıklandığında kapat
        document.addEventListener('click', function closeMenu(e) {
            if (!userMenu.contains(e.target) && !userMenuWrapper.contains(e.target)) {
                userMenu.remove();
                document.removeEventListener('click', closeMenu);
            }
        });
    }
}

// Workshop rezervasyon nesnesi
const workshopReservation = new WorkshopReservation();
const userAuth = new UserAuth();

// Atölye rezervasyon fonksiyonu
function reserveWorkshop(workshopId, title, date, price) {
    if (!userAuth.isLoggedIn) {
        workshopReservation.showNotification('error', 'Lütfen önce giriş yapın');
        return;
    }

    workshopReservation.addReservation({
        id: workshopId,
        title: title,
        date: date,
        price: price
    });
}

// Sepet işlemleri için sınıf
class CartManager {
    constructor() {
        this.cartCount = document.querySelector('.cart-count');
        this.updateCartCount();
    }

    updateCartCount() {
        // Sayfa yüklendiğinde mevcut sepet sayısını almak için
        fetch('/sepet/')
            .then(response => response.text())
            .then(html => {
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                const cartItems = doc.querySelectorAll('.cart-item');
                if (this.cartCount) {
                    this.cartCount.textContent = cartItems.length;
                    this.cartCount.style.display = cartItems.length > 0 ? 'inline-block' : 'none';
                }
            })
            .catch(error => console.error('Sepet sayacı güncellenirken hata:', error));
    }
}

// CartManager'ı başlat
const cartManager = new CartManager();


