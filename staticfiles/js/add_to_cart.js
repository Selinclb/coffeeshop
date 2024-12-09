function displayCartItems() {
    const cartItems = document.getElementById('cartItems');
    const emptyCart = document.getElementById('emptyCart');
    
    if (cart.items.length === 0) {
        cartItems.parentElement.style.display = 'none';
        emptyCart.style.display = 'block';
        return;
    }

    cartItems.parentElement.style.display = 'grid';
    emptyCart.style.display = 'none';
    cartItems.innerHTML = '';

    cart.items.forEach((item, index) => {
        const product = products.find(p => p.id === item.id);
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <img src="${product.image}" alt="${product.name}">
            <div class="item-details">
                <h3>${product.name}</h3>
                <p>Öğütme: ${item.grind || 'Çekirdek'}</p>
                <div class="item-quantity">
                    <button onclick="updateQuantity(${index}, -1)">-</button>
                    <span>1</span>
                    <button onclick="updateQuantity(${index}, 1)">+</button>
                </div>
            </div>
            <div class="item-actions">
                <div class="item-price">${product.price} TL</div>
                <i class="fas fa-times remove-item" onclick="removeFromCart(${index})"></i>
            </div>
        `;
        cartItems.appendChild(cartItem);
    });

    updateCartSummary();
}

function updateQuantity(index, change) {
    // Miktar güncelleme mantığı eklenecek
    displayCartItems();
}

function removeFromCart(index) {
    cart.items.splice(index, 1);
    cart.saveCart();
    displayCartItems();
}

function updateCartSummary() {
    const subtotal = cart.items.reduce((total, item) => {
        const product = products.find(p => p.id === item.id);
        return total + product.price;
    }, 0);

    const shipping = subtotal > 150 ? 0 : 30;
    const total = subtotal + shipping;

    document.getElementById('subtotal').textContent = `${subtotal.toFixed(2)} TL`;
    document.getElementById('shipping').textContent = shipping === 0 ? 'Ücretsiz' : `${shipping.toFixed(2)} TL`;
    document.getElementById('total').textContent = `${total.toFixed(2)} TL`;
}

function proceedToCheckout() {
    // Ödeme sayfasına yönlendirme
    alert('Ödeme sistemi henüz entegre edilmedi.');
}

// Sayfa yüklendiğinde sepeti göster
document.addEventListener('DOMContentLoaded', displayCartItems); 