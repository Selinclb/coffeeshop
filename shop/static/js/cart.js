// CSRF tokeni alma
function getCSRFToken() {
    let cookies = document.cookie.split(';');
    for (let cookie of cookies) {
        if (cookie.trim().startsWith('csrftoken=')) {
            return cookie.split('=')[1];
        }
    }
    return null;
}

// Sepet sayacını güncelleme fonksiyonu
function updateCartCounter(count) {
    const cartCounter = document.querySelector('.cart-count');
    if (cartCounter) {
        cartCounter.textContent = count;
    }
}

// Miktar güncelleme işlevi
function updateQuantity(itemId, action) {
    fetch(`/sepet/guncelle/${itemId}/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCSRFToken(),
        },
        body: JSON.stringify({ action: action }),
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Güncellenen miktarı ve toplamları güncelle
                const cartItem = document.querySelector(`[data-item-id="${itemId}"]`);
                cartItem.querySelector('.quantity').value = data.quantity;
                cartItem.querySelector('.item-total').textContent = `${data.item_total}₺`;

                // Ara toplam ve toplamları güncelle
                document.getElementById('subtotal').textContent = `${data.subtotal}₺`;
                document.getElementById('shipping').textContent = `${data.shipping_cost}₺`;
                document.getElementById('total').textContent = `${data.total}₺`;

                // Sepet sayacını güncelle (eğer backend'den geliyorsa)
                if (data.cart_count !== undefined) {
                    updateCartCounter(data.cart_count);
                }
            }
        })
        .catch(error => console.error('Hata:', error));
}

// Ürünü sepetten kaldırma işlevi
function removeFromCart(itemId) {
    fetch(`/sepet/sil/${itemId}/`, {
        method: 'POST',
        headers: {
            'X-CSRFToken': getCSRFToken(),
        },
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Ürün DOM'dan kaldırılır
                const cartItem = document.querySelector(`[data-item-id="${itemId}"]`);
                cartItem.remove();

                // Ara toplam ve toplamları güncelle
                document.getElementById('subtotal').textContent = `${data.subtotal}₺`;
                
                // Sepet boşsa kargo satırını gizle, değilse göster ve güncelle
                const shippingRow = document.getElementById('shipping-row');
                if (data.subtotal === 0) {
                    shippingRow.style.display = 'none';
                } else {
                    shippingRow.style.display = 'flex';
                    document.getElementById('shipping').textContent = `${data.shipping_cost}₺`;
                }
                
                // Toplam tutarı güncelle
                const totalAmount = data.subtotal === 0 ? '0' : data.total;
                document.getElementById('total').textContent = `${totalAmount}₺`;

                // Eğer sepet boşsa mesaj göster
                if (data.subtotal === 0) {
                    document.getElementById('emptyCart').style.display = 'block';
                }

                // Sepet sayacını güncelle (eğer backend'den geliyorsa)
                if (data.cart_count !== undefined) {
                    updateCartCounter(data.cart_count);
                }
            }
        })
        .catch(error => console.error('Hata:', error));
}
