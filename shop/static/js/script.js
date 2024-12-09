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
                <li><a href="/cikis/">Çıkış Yap</a></li>
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

// Profil yönetimi için sınıf
class ProfileManager {
    constructor() {
        this.init();
    }

    init() {
        document.addEventListener('DOMContentLoaded', () => {
            const profileContent = document.querySelector('.profile-content');
            if (!profileContent) return;

            // Başlangıçta aktif sekmeyi göster
            const hash = window.location.hash || '#profile';
            this.loadSection(hash.replace('#', ''));

            // Nav linklerine tıklandığında
            document.querySelectorAll('.profile-nav .nav-link').forEach(link => {
                link.addEventListener('click', (e) => {
                    if (!link.getAttribute('href').startsWith('#')) return;
                    
                    e.preventDefault();
                    const section = link.getAttribute('data-section');
                    this.loadSection(section);
                    window.location.hash = section;
                });
            });
        });
    }

    loadSection(section) {
        // Aktif nav linkini güncelle
        document.querySelectorAll('.profile-nav .nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-section') === section) {
                link.classList.add('active');
            }
        });

        // İlgili içeriği yükle
        const contentArea = document.querySelector('.profile-content');
        switch(section) {
            case 'profile':
                contentArea.innerHTML = this.getProfileForm();
                this.initProfileForm();
                break;
            case 'orders':
                contentArea.innerHTML = this.getOrdersContent();
                break;
            case 'addresses':
                contentArea.innerHTML = this.getAddressesContent();
                break;
            case 'password':
                contentArea.innerHTML = this.getPasswordForm();
                this.initPasswordForm();
                break;
        }
    }

    getTurkiyeSehirleri() {
        const sehirler = [
            'Adana', 'Adıyaman', 'Afyonkarahisar', 'Ağrı', 'Aksaray', 'Amasya', 'Ankara', 'Antalya', 'Ardahan', 'Artvin',
            'Aydın', 'Balıkesir', 'Bartın', 'Batman', 'Bayburt', 'Bilecik', 'Bingöl', 'Bitlis', 'Bolu', 'Burdur',
            'Bursa', 'Çanakkale', 'Çankırı', 'Çorum', 'Denizli', 'Diyarbakır', 'Düzce', 'Edirne', 'Elazığ', 'Erzincan',
            'Erzurum', 'Eskişehir', 'Gaziantep', 'Giresun', 'Gümüşhane', 'Hakkari', 'Hatay', 'Iğdır', 'Isparta', 'İstanbul',
            'İzmir', 'Kahramanmaraş', 'Karabük', 'Karaman', 'Kars', 'Kastamonu', 'Kayseri', 'Kilis', 'Kırıkkale', 'Kırklareli',
            'Kırşehir', 'Kocaeli', 'Konya', 'Kütahya', 'Malatya', 'Manisa', 'Mardin', 'Mersin', 'Muğla', 'Muş',
            'Nevşehir', 'Niğde', 'Ordu', 'Osmaniye', 'Rize', 'Sakarya', 'Samsun', 'Şanlıurfa', 'Siirt', 'Sinop',
            'Sivas', 'Şırnak', 'Tekirdağ', 'Tokat', 'Trabzon', 'Tunceli', 'Uşak', 'Van', 'Yalova', 'Yozgat', 'Zonguldak'
        ];

        return sehirler;  
    }

    getProfileForm() {
        const sehirler = this.getTurkiyeSehirleri();
        return `
            <div class="profile-card card">
                <div class="card-header">
                    <h2><i class="fas fa-user-circle me-2"></i>Hesap Bilgilerim</h2>
                </div>
                <div class="card-body">
                    <form id="profile-form">
                        <input type="hidden" name="action" value="update_profile">
                        <div class="row">
                            <div class="col-md-6">
                                <div class="form-group mb-3">
                                    <label><i class="fas fa-user me-2"></i>Kullanıcı Adı:</label>
                                    <input type="text" class="form-control" value="${profileData.username}" disabled>
                                </div>
                                <div class="form-group mb-3">
                                    <label><i class="fas fa-envelope me-2"></i>E-posta:</label>
                                    <input type="email" class="form-control" value="${profileData.email}" disabled>
                                </div>
                                <div class="form-group mb-3">
                                    <label><i class="fas fa-phone me-2"></i>Telefon:</label>
                                    <input type="tel" name="phone" class="form-control" value="${profileData.phone}" required>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="form-group mb-3">
                                    <label><i class="fas fa-map-marker-alt me-2"></i>Adres:</label>
                                    <textarea name="address" class="form-control" rows="3" required>${profileData.address}</textarea>
                                </div>
                                <div class="form-group mb-3">
                                    <label><i class="fas fa-city me-2"></i>Şehir:</label>
                                    <select name="city" class="form-control" required>
                                        <option value="">Şehir Seçiniz</option>
                                        ${sehirler.map(sehir => `
                                            <option value="${sehir}" ${profileData.city === sehir ? 'selected' : ''}>
                                                ${sehir}
                                            </option>
                                        `).join('')}
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div class="text-end">
                            <button type="submit" class="btn profile-btn-primary">
                                <i class="fas fa-save me-2"></i>Bilgileri Güncelle
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;
    }

    getPasswordForm() {
        return `
            <div class="profile-card card">
                <div class="card-header">
                    <h2>Şifre Değiştir</h2>
                </div>
                <div class="card-body">
                    <form id="password-form">
                        <div class="form-group mb-3">
                            <label>Mevcut Şifre:</label>
                            <input type="password" name="old_password" class="form-control" required>
                        </div>
                        <div class="form-group mb-3">
                            <label>Yeni Şifre:</label>
                            <input type="password" name="new_password1" class="form-control" required>
                        </div>
                        <div class="form-group mb-3">
                            <label>Yeni Şifre (Tekrar):</label>
                            <input type="password" name="new_password2" class="form-control" required>
                        </div>
                        <div class="text-end">
                            <button type="submit" class="btn profile-btn-primary">
                                <i class="fas fa-save"></i> Şifreyi Değiştir
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;
    }

    getAddressesContent() {
        return `
            <div class="profile-card card">
                <div class="card-header d-flex justify-content-between align-items-center">
                    <h2><i class="fas fa-map-marker-alt me-2"></i>Adreslerim</h2>
                    <button class="btn profile-btn-primary" onclick="profileManager.showAddressForm()">
                        <i class="fas fa-plus me-2"></i>Yeni Adres Ekle
                    </button>
                </div>
                <div class="card-body">
                    <div class="row" id="addresses-list">
                        ${this.renderAddresses()}
                    </div>
                </div>
            </div>
        `;
    }

    renderAddresses() {
        if (!profileData.addresses || profileData.addresses.length === 0) {
            return `
                <div class="col-12 text-center py-5">
                    <i class="fas fa-home fa-3x mb-3 text-muted"></i>
                    <p class="text-muted">Henüz kayıtlı adresiniz bulunmuyor.</p>
                </div>
            `;
        }

        return profileData.addresses.map(address => `
            <div class="col-md-6 mb-3">
                <div class="card h-100">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <h5 class="card-title">
                                <i class="fas fa-map-marker-alt me-2"></i>${address.title}
                            </h5>
                            ${address.is_default ? '<span class="badge bg-primary">Varsayılan</span>' : ''}
                        </div>
                        <p class="card-text">
                            <strong>${address.full_name}</strong><br>
                            ${address.address}<br>
                            ${address.city}, ${address.country}<br>
                            <i class="fas fa-phone me-1"></i>${address.phone}
                        </p>
                        <div class="address-actions mt-3">
                            <button class="btn btn-sm btn-outline-primary me-2" 
                                onclick="profileManager.showAddressForm(${address.id})">
                                <i class="fas fa-edit me-1"></i>Düzenle
                            </button>
                            ${!address.is_default ? `
                                <button class="btn btn-sm btn-outline-success me-2" 
                                    onclick="profileManager.setDefaultAddress(${address.id})">
                                    <i class="fas fa-check me-1"></i>Varsayılan Yap
                                </button>
                            ` : ''}
                            <button class="btn btn-sm btn-outline-danger" 
                                onclick="profileManager.deleteAddress(${address.id})">
                                <i class="fas fa-trash me-1"></i>Sil
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    showAddressForm(addressId = null) {
        const address = addressId ? profileData.addresses.find(a => a.id === addressId) : null;
        const modalHtml = `
            <div class="modal fade" id="addressFormModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">
                                <i class="fas fa-map-marker-alt me-2"></i>
                                ${address ? 'Adresi Düzenle' : 'Yeni Adres Ekle'}
                            </h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <form id="addressForm">
                                <input type="hidden" name="address_id" value="${address ? address.id : ''}">
                                
                                <div class="form-group mb-3">
                                    <label>Adres Başlığı:</label>
                                    <input type="text" name="title" class="form-control" 
                                        value="${address ? address.title : ''}" required>
                                    <small class="text-muted">Örn: Ev, İş</small>
                                </div>

                                <div class="form-group mb-3">
                                    <label>Ad Soyad:</label>
                                    <input type="text" name="full_name" class="form-control" 
                                        value="${address ? address.full_name : ''}" required>
                                </div>

                                <div class="form-group mb-3">
                                    <label>Telefon:</label>
                                    <input type="tel" name="phone" class="form-control" 
                                        value="${address ? address.phone : ''}" required>
                                </div>

                                <div class="form-group mb-3">
                                    <label>Adres:</label>
                                    <textarea name="address" class="form-control" rows="3" required>${address ? address.address : ''}</textarea>
                                </div>

                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="form-group mb-3">
                                            <label>Şehir:</label>
                                            <input type="text" name="city" class="form-control" 
                                                value="${address ? address.city : ''}" required>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="form-group mb-3">
                                            <label>Ülke:</label>
                                            <input type="text" name="country" class="form-control" 
                                                value="${address ? address.country : ''}" required>
                                        </div>
                                    </div>
                                </div>

                                <div class="form-check mb-3">
                                    <input type="checkbox" name="is_default" class="form-check-input" 
                                        id="defaultAddress" ${address && address.is_default ? 'checked' : ''}>
                                    <label class="form-check-label" for="defaultAddress">
                                        Varsayılan adres olarak ayarla
                                    </label>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">İptal</button>
                            <button type="button" class="btn btn-primary" onclick="profileManager.saveAddress()">
                                <i class="fas fa-save me-2"></i>Kaydet
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Varsa eski modalı kaldır
        const existingModal = document.getElementById('addressFormModal');
        if (existingModal) {
            existingModal.remove();
        }

        // Yeni modalı ekle ve göster
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        const modal = new bootstrap.Modal(document.getElementById('addressFormModal'));
        modal.show();
    }

    async saveAddress() {
        const form = document.getElementById('addressForm');
        const formData = new FormData(form);

        try {
            const response = await fetch('/profil/adres/kaydet/', {
                method: 'POST',
                body: formData,
                headers: {
                    'X-CSRFToken': this.getCsrfToken()
                }
            });

            if (response.ok) {
                this.showNotification('success', 'Adres başarıyla kaydedildi');
                bootstrap.Modal.getInstance(document.getElementById('addressFormModal')).hide();
                // Adres listesini güncelle
                const data = await response.json();
                profileData.addresses = data.addresses;
                this.loadSection('addresses');
            } else {
                this.showNotification('error', 'Adres kaydedilemedi');
            }
        } catch (error) {
            this.showNotification('error', 'Bir hata oluştu');
        }
    }

    async deleteAddress(addressId) {
        if (!confirm('Bu adresi silmek istediğinizden emin misiniz?')) return;

        try {
            const response = await fetch(`/profil/adres/sil/${addressId}/`, {
                method: 'POST',
                headers: {
                    'X-CSRFToken': this.getCsrfToken()
                }
            });

            if (response.ok) {
                this.showNotification('success', 'Adres başarıyla silindi');
                const data = await response.json();
                profileData.addresses = data.addresses;
                this.loadSection('addresses');
            } else {
                this.showNotification('error', 'Adres silinemedi');
            }
        } catch (error) {
            this.showNotification('error', 'Bir hata oluştu');
        }
    }

    async setDefaultAddress(addressId) {
        try {
            const response = await fetch(`/profil/adres/varsayilan/${addressId}/`, {
                method: 'POST',
                headers: {
                    'X-CSRFToken': this.getCsrfToken()
                }
            });

            if (response.ok) {
                this.showNotification('success', 'Varsayılan adres güncellendi');
                const data = await response.json();
                profileData.addresses = data.addresses;
                this.loadSection('addresses');
            } else {
                this.showNotification('error', 'Varsayılan adres güncellenemedi');
            }
        } catch (error) {
            this.showNotification('error', 'Bir hata oluştu');
        }
    }

    getOrdersContent() {
        return `
            <div class="profile-card card">
                <div class="card-header">
                    <h2><i class="fas fa-shopping-bag me-2"></i>Siparişlerim</h2>
                </div>
                <div class="card-body">
                    <div class="table-responsive">
                        <table class="table table-hover">
                            <thead>
                                <tr>
                                    <th><i class="fas fa-hashtag me-2"></i>Sipariş No</th>
                                    <th><i class="fas fa-calendar me-2"></i>Tarih</th>
                                    <th><i class="fas fa-lira-sign me-2"></i>Tutar</th>
                                    <th><i class="fas fa-info-circle me-2"></i>Durum</th>
                                    <th><i class="fas fa-cog me-2"></i>İşlemler</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${this.renderOrders()}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    }

    renderOrders() {
        if (!profileData.orders || profileData.orders.length === 0) {
            return `
                <tr>
                    <td colspan="5" class="text-center py-4">
                        <i class="fas fa-box-open fa-3x mb-3 text-muted"></i>
                        <p class="text-muted">Henüz siparişiniz bulunmuyor.</p>
                    </td>
                </tr>
            `;
        }
        
        return profileData.orders.map(order => `
            <tr>
                <td>#${order.id}</td>
                <td>${order.date}</td>
                <td>${order.total} TL</td>
                <td>
                    <span class="badge bg-${this.getStatusColor(order.status)}">
                        ${order.status}
                    </span>
                </td>
                <td>
                    <button class="btn btn-sm btn-outline-primary" onclick="profileManager.showOrderDetails(${order.id})">
                        <i class="fas fa-eye"></i> Detay
                    </button>
                </td>
            </tr>
        `).join('');
    }

    getStatusColor(status) {
        const colors = {
            'Beklemede': 'warning',
            'Onaylandı': 'info',
            'Hazırlanıyor': 'primary',
            'Kargoda': 'info',
            'Tamamlandı': 'success',
            'İptal Edildi': 'danger'
        };
        return colors[status] || 'secondary';
    }

    showOrderDetails(orderId) {
        // Sipariş detaylarını getir
        const order = profileData.orders.find(o => o.id === orderId);
        if (!order) return;

        const modalHtml = `
            <div class="modal fade" id="orderDetailModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">
                                <i class="fas fa-shopping-bag me-2"></i>
                                Sipariş #${order.id} Detayı
                            </h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="order-info mb-4">
                                <div class="row">
                                    <div class="col-md-6">
                                        <p><i class="fas fa-calendar me-2"></i>Tarih: ${order.date}</p>
                                        <p><i class="fas fa-truck me-2"></i>Durum: 
                                            <span class="badge bg-${this.getStatusColor(order.status)}">${order.status}</span>
                                        </p>
                                    </div>
                                    <div class="col-md-6">
                                        <p><i class="fas fa-map-marker-alt me-2"></i>Teslimat Adresi:</p>
                                        <address class="ms-4">
                                            ${order.address}<br>
                                            ${order.city}, ${order.country}
                                        </address>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="table-responsive">
                                <table class="table">
                                    <thead>
                                        <tr>
                                            <th>Ürün</th>
                                            <th>Adet</th>
                                            <th>Birim Fiyat</th>
                                            <th>Toplam</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${this.renderOrderItems(order.items)}
                                    </tbody>
                                    <tfoot>
                                        <tr>
                                            <td colspan="3" class="text-end"><strong>Ara Toplam:</strong></td>
                                            <td>${order.subtotal} TL</td>
                                        </tr>
                                        <tr>
                                            <td colspan="3" class="text-end"><strong>Kargo:</strong></td>
                                            <td>${order.shipping} TL</td>
                                        </tr>
                                        <tr>
                                            <td colspan="3" class="text-end"><strong>Toplam:</strong></td>
                                            <td><strong>${order.total} TL</strong></td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Kapat</button>
                            ${this.getOrderActions(order)}
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Varsa eski modalı kaldır
        const existingModal = document.getElementById('orderDetailModal');
        if (existingModal) {
            existingModal.remove();
        }

        // Yeni modalı ekle ve göster
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        const modal = new bootstrap.Modal(document.getElementById('orderDetailModal'));
        modal.show();
    }

    renderOrderItems(items) {
        return items.map(item => `
            <tr>
                <td>
                    <div class="d-flex align-items-center">
                        <img src="${item.image}" alt="${item.name}" class="me-2" style="width: 50px; height: 50px; object-fit: cover;">
                        <div>
                            <div class="fw-bold">${item.name}</div>
                            ${item.options ? `<small class="text-muted">${item.options}</small>` : ''}
                        </div>
                    </div>
                </td>
                <td>${item.quantity}</td>
                <td>${item.price} TL</td>
                <td>${item.total} TL</td>
            </tr>
        `).join('');
    }

    getOrderActions(order) {
        let actions = '';
        
        switch(order.status) {
            case 'Beklemede':
                actions += `
                    <button type="button" class="btn btn-danger" onclick="profileManager.cancelOrder(${order.id})">
                        <i class="fas fa-times me-2"></i>İptal Et
                    </button>
                `;
                break;
            case 'Tamamlandı':
                actions += `
                    <button type="button" class="btn btn-primary" onclick="profileManager.reorderItems(${order.id})">
                        <i class="fas fa-redo me-2"></i>Tekrar Sipariş Ver
                    </button>
                `;
                break;
        }

        actions += `
            <button type="button" class="btn btn-primary" onclick="profileManager.downloadInvoice(${order.id})">
                <i class="fas fa-file-pdf me-2"></i>Faturayı İndir
            </button>
        `;

        return actions;
    }

    async cancelOrder(orderId) {
        if (!confirm('Siparişi iptal etmek istediğinizden emin misiniz?')) return;

        try {
            const response = await fetch(`/siparis/iptal/${orderId}/`, {
                method: 'POST',
                headers: {
                    'X-CSRFToken': this.getCsrfToken()
                }
            });

            if (response.ok) {
                this.showNotification('success', 'Sipariş başarıyla iptal edildi');
                // Modalı kapat ve siparişleri yenile
                bootstrap.Modal.getInstance(document.getElementById('orderDetailModal')).hide();
                this.loadSection('orders');
            } else {
                this.showNotification('error', 'Sipariş iptal edilemedi');
            }
        } catch (error) {
            this.showNotification('error', 'Bir hata oluştu');
        }
    }

    async reorderItems(orderId) {
        try {
            const response = await fetch(`/siparis/tekrar/${orderId}/`, {
                method: 'POST',
                headers: {
                    'X-CSRFToken': this.getCsrfToken()
                }
            });

            if (response.ok) {
                this.showNotification('success', 'Ürünler sepete eklendi');
                // Sepet sayacını güncelle
                cartManager.updateCartCount();
            } else {
                this.showNotification('error', 'Ürünler sepete eklenemedi');
            }
        } catch (error) {
            this.showNotification('error', 'Bir hata oluştu');
        }
    }

    async downloadInvoice(orderId) {
        try {
            const response = await fetch(`/siparis/fatura/${orderId}/`);
            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `fatura-${orderId}.pdf`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
            } else {
                this.showNotification('error', 'Fatura indirilemedi');
            }
        } catch (error) {
            this.showNotification('error', 'Bir hata oluştu');
        }
    }

    // Form işlemleri
    initProfileForm() {
        const form = document.getElementById('profile-form');
        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            formData.append('action', 'update_profile');

            try {
                const response = await fetch('/profil/', {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'X-CSRFToken': this.getCsrfToken()
                    }
                });
                
                if (response.ok) {
                    this.showNotification('success', 'Profil bilgileriniz güncellendi.');
                } else {
                    this.showNotification('error', 'Bir hata oluştu.');
                }
            } catch (error) {
                this.showNotification('error', 'Bir hata oluştu.');
            }
        });
    }

    // Yardımcı metodlar
    getCsrfToken() {
        return csrfToken;
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

// ProfileManager'ı başlat
const profileManager = new ProfileManager();

// Google Maps başlatma fonksiyonu
function initMap() {
    // Kahve dükkanının konumu (örnek koordinatlar)
    const location = {
        lat: 38.432028, 
        lng: 27.138667  
    };

    // Harita seçenekleri
    const mapOptions = {
        zoom: 15,
        center: location,
        styles: [
            {
                "featureType": "all",
                "elementType": "geometry",
                "stylers": [
                    {
                        "color": "#f5f5f5"
                    }
                ]
            },
            {
                "featureType": "poi.business",
                "elementType": "labels.text",
                "stylers": [
                    {
                        "visibility": "on"
                    }
                ]
            }
            // Daha fazla stil ekleyebilirsiniz
        ]
    };

    // Haritayı oluştur
    const map = new google.maps.Map(document.getElementById('map'), mapOptions);

    // Marker ekle
    const marker = new google.maps.Marker({
        position: location,
        map: map,
        title: 'Coffee Shop'
    });

    // Info window ekle
    const infoWindow = new google.maps.InfoWindow({
        content: `
            <div style="padding: 10px;">
                <h4 style="margin: 0 0 5px;">Coffee Shop</h4>
                <p style="margin: 0;">Adres bilgisi buraya gelecek</p>
            </div>
        `
    });

    // Marker'a tıklandığında info window'u göster
    marker.addListener('click', () => {
        infoWindow.open(map, marker);
    });
}

// Sayfa yüklendiğinde haritayı başlat
document.addEventListener('DOMContentLoaded', () => {
    // Google Maps API yüklendiyse haritayı başlat
    if (typeof google !== 'undefined') {
        initMap();
    }
});


