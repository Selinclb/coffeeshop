document.addEventListener('DOMContentLoaded', function() {
    initializeThumbnails();
    initializeAccordion();
    initializeQuantityControls();
    initializeAddToCart();
});


// Thumbnail işlevselliği
function initializeThumbnails() {
    const mainImage = document.getElementById('mainImage');
    const thumbnails = document.querySelectorAll('.thumbnail');

    thumbnails.forEach(thumbnail => {
        thumbnail.addEventListener('click', function() {
            mainImage.src = this.src;
            thumbnails.forEach(thumb => thumb.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

// Accordion işlevselliği
function initializeAccordion() {
    const accordionItems = document.querySelectorAll('.accordion-item');
    
    accordionItems.forEach(item => {
        const header = item.querySelector('.accordion-header');
        const content = item.querySelector('.accordion-content');
        
        header.addEventListener('click', () => {
            const currentlyActive = document.querySelector('.accordion-item.active');
            
            if(currentlyActive && currentlyActive !== item) {
                currentlyActive.classList.remove('active');
                currentlyActive.querySelector('.accordion-content').style.maxHeight = null;
            }
            
            item.classList.toggle('active');
            
            if(item.classList.contains('active')) {
                content.style.maxHeight = content.scrollHeight + "px";
            } else {
                content.style.maxHeight = null;
            }
        });
    });
}

// Miktar kontrolü için fonksiyon
function initializeQuantityControls() {
    const quantityControls = document.querySelector('.quantity-controls');
    if (!quantityControls) return;

    const input = quantityControls.querySelector('input.quantity');
    const maxAmount = parseInt(quantityControls.dataset.maxAmount);

    window.decreaseQuantity = function() {
        let currentValue = parseInt(input.value);
        if (currentValue > 1) {
            input.value = currentValue - 1;
        }
    };

    window.increaseQuantity = function() {
        let currentValue = parseInt(input.value);
        if (currentValue < maxAmount) {
            input.value = currentValue + 1;
        }
    };

    // Direkt input değişikliğini kontrol et
    input.addEventListener('change', () => {
        let value = parseInt(input.value);
        if (value < 1) input.value = 1;
        if (value > maxAmount) input.value = maxAmount;
    });
}

// CSRF token alma fonksiyonu ekleyelim
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}


// Sepet çekmecesini güncelleme fonksiyonu
function updateCartDrawer() {
    fetch('/cart/items/')
        .then(response => response.json())
        .then(data => {
            // Sepet sayısını güncelle (varsa)
            const cartCount = document.querySelector('.cart-count');
            if (cartCount) {
                cartCount.textContent = data.items.length;
            }
            
            // Mini sepet içeriğini güncelle (varsa)
            const miniCart = document.querySelector('.mini-cart-items');
            if (miniCart) {
                miniCart.innerHTML = data.items.map(item => `
                    <div class="mini-cart-item">
                        <img src="${item.image}" alt="${item.title}">
                        <div class="mini-cart-item-details">
                            <h4>${item.title}</h4>
                            <p>${item.quantity} x ${item.price}₺</p>
                        </div>
                    </div>
                `).join('');
            }
        });
}
function buyNow() {
    const form = document.querySelector('.add-to-cart-form');
    const formData = new FormData(form);

    fetch(form.action, {
        method: 'POST',
        body: formData,
        headers: {
            'X-CSRFToken': getCookie('csrftoken')
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Başarılı olursa sepet sayfasına yönlendir
            window.location.href = '/sepet/';
        } else {
            // Hata mesajı göster
            showMessage(data.message, 'error');
        }
    })
    .catch(error => {
        showMessage('Bir hata oluştu.', 'error');
    });
}

function addToCart(event) {
    event.preventDefault();
    const form = document.querySelector('.add-to-cart-form');
    const formData = new FormData(form);

    fetch(form.action, {
        method: 'POST',
        body: formData,
        headers: {
            'X-CSRFToken': getCookie('csrftoken')
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Başarılı mesajı göster
            showMessage(data.message, 'success');
            // Sepet sayısını güncelle
            updateCartCount(data.cart_count);
            // Mini sepeti güncelle
            updateCartDrawer();
        } else {
            // Hata mesajı göster
            showMessage(data.message, 'error');
        }
    })
    .catch(error => {
        showMessage('Bir hata oluştu.', 'error');
    });
}

function showMessage(message, type) {
    // Mevcut mesaj varsa kaldır
    const existingMessage = document.querySelector('.message');
    if (existingMessage) {
        existingMessage.remove();
    }

    // Yeni mesaj oluştur
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;

    // Mesajı sayfaya ekle
    const addToCartSection = document.querySelector('.add-to-cart-section');
    addToCartSection.insertAdjacentElement('afterend', messageDiv);

    // 3 saniye sonra mesajı kaldır
    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
}

function updateCartCount(count) {
    const cartCount = document.querySelector('.cart-count');
    if (cartCount) {
        cartCount.textContent = count;
    }
}