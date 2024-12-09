// Kahve menüsü verileri
const coffees = [
    {
        id: 1,
        name: 'Espresso',
        description: 'Yoğun aromaya sahip klasik İtalyan kahvesi',
        price: '30 TL',
        image: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04'
    },
    {
        id: 2,
        name: 'Cappuccino',
        description: 'Espresso, buharla ısıtılmış süt ve süt köpüğü',
        price: '40 TL',
        image: 'https://images.unsplash.com/photo-1534778101976-62847782c213'
    },
    {
        id: 3,
        name: 'Latte',
        description: 'Espresso ve bol süt ile hazırlanan kahve',
        price: '35 TL',
        image: 'https://images.unsplash.com/photo-1570968915860-54d5c301fa9f'
    }
];

// Kahve kartlarını oluşturan fonksiyon
function createCoffeeCards() {
    const coffeeList = document.getElementById('coffeeList');
    
    coffees.forEach(coffee => {
        const coffeeCard = document.createElement('div');
        coffeeCard.className = 'coffee-card';
        
        coffeeCard.innerHTML = `
            <img src="${coffee.image}" alt="${coffee.name}">
            <div class="coffee-info">
                <h3>${coffee.name}</h3>
                <p>${coffee.description}</p>
                <p class="price">${coffee.price}</p>
                <button onclick="orderCoffee('${coffee.name}', ${coffee.id})">Sipariş Ver</button>
            </div>
        `;
        
        coffeeList.appendChild(coffeeCard);
    });
}

// Sipariş fonksiyonu
function orderCoffee(coffeeName, coffeeId) {
    const selectedCoffee = coffees.find(coffee => coffee.id === coffeeId);
    cart.addItem({
        id: coffeeId,
        name: coffeeName,
        price: selectedCoffee.price
    });
}
// Sayfa yüklendiğinde kahve kartlarını oluştur
document.addEventListener('DOMContentLoaded', () => {
    createCoffeeCards();
});

// Header scroll efekti
window.addEventListener('scroll', () => {
    const header = document.querySelector('.header');
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

// Sepet işlemleri
class Cart {
    constructor() {
        this.items = JSON.parse(localStorage.getItem('cart')) || [];
        this.updateCartCount();
    }

    addItem(item) {
        // Ürün zaten sepette varsa, ekleme yapma
        const existingItem = this.items.find(i => i.id === item.id);
        if (!existingItem) {
            this.items.push(item);
            this.saveCart();
            this.updateCartCount();
            this.showNotification(`${item.name} sepete eklendi`);
        } else {
            this.showNotification(`${item.name} zaten sepette`);
        }
    }

    removeItem(itemId) {
        this.items = this.items.filter(item => item.id !== itemId);
        this.saveCart();
        this.updateCartCount();
    }

    updateCartCount() {
        const cartCount = document.querySelector('.cart-count');
        cartCount.textContent = this.items.length;
        
        // Sepet boşsa sayıyı gizle
        if (this.items.length === 0) {
            cartCount.style.display = 'none';
        } else {
            cartCount.style.display = 'inline';
        }
    }

    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.items));
    }

    // Sepeti temizleme fonksiyonu (isteğe bağlı)
    clearCart() {
        this.items = [];
        this.saveCart();
        this.updateCartCount();
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        document.body.appendChild(notification);

        // 3 saniye sonra bildirimi kaldır
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Kullanıcı işlemleri
class UserAuth {
    constructor() {
        this.isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        this.updateLoginButton();
    }

    login(username, password) {
        // Burada gerçek bir API çağrısı yapılabilir
        this.isLoggedIn = true;
        localStorage.setItem('isLoggedIn', 'true');
        this.updateLoginButton();
    }

    logout() {
        this.isLoggedIn = false;
        localStorage.setItem('isLoggedIn', 'false');
        this.updateLoginButton();
    }

    updateLoginButton() {
        const loginButton = document.querySelector('.login');
        const userIcon = loginButton.querySelector('i');
        
        if (this.isLoggedIn) {
            loginButton.innerHTML = `
                <i class="fas fa-user"></i>
                <span>Hesabım</span>
            `;
            loginButton.addEventListener('click', this.showUserMenu);
        } else {
            loginButton.innerHTML = `
                <i class="fas fa-user"></i>
                <span>Giriş</span>
            `;
        }
    }

    showUserMenu(e) {
        e.preventDefault();
        // Kullanıcı menüsünü göster
        const userMenu = document.createElement('div');
        userMenu.className = 'user-menu';
        userMenu.innerHTML = `
            <ul>
                <li><a href="/profil">Profilim</a></li>
                <li><a href="/siparislerim">Siparişlerim</a></li>
                <li><a href="#" id="logout">Çıkış Yap</a></li>
            </ul>
        `;
        
        document.body.appendChild(userMenu);

        // Menü dışına tıklandığında kapat
        document.addEventListener('click', function closeMenu(e) {
            if (!userMenu.contains(e.target)) {
                userMenu.remove();
                document.removeEventListener('click', closeMenu);
            }
        });
    }
}

// Sepet nesnesi
const cart = new Cart();
const userAuth = new UserAuth();

// Sayfa yüklendiğinde sepet sayacını güncelle
document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
});

// Sepet sayacını güncelle
function updateCartCount() {
    const cartCount = document.querySelector('.cart-count');
    if (cartCount) {
        cartCount.textContent = cart.items.length;
    }
}

// Sepete yönlendirme fonksiyonu
function redirectToCart(event) {
    event.preventDefault(); // Varsayılan davranışı engelle
    window.location.href = 'add_to_cart.html'; // Yönlendirme
}

