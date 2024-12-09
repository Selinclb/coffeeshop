document.addEventListener("DOMContentLoaded", function () {
    fetchProducts();
});

// Ürünleri getir
function fetchProducts() {
    fetch('/api/products/')  // API endpoint'i
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            displayProducts(data.products);
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

// Sepete ekle
function addToCart(productId) {
    fetch('/cart/add/', {  // Yeni cart URL'i
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')  // CSRF token'ı ekleyin
        },
        body: JSON.stringify({
            product_id: productId
        })
    })
    .then(response => response.json())
    .then(data => {
        // Sepet başarıyla güncellendi
        updateCartCount(data.cart_count);
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

// CSRF token'ı al
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

// Filtreleme durumunu tutacak nesne
let filterState = {
    types: [],
    priceRange: '',
    roastLevels: []
};

// Ürünleri görüntüleme fonksiyonu
function displayProducts(filteredProducts) {
    const container = document.getElementById('productsGrid');
    container.innerHTML = '';

    if (filteredProducts.length === 0) {
        container.innerHTML = `
            <div class="no-results">
                <p>Seçilen filtrelere uygun ürün bulunamadı.</p>
            </div>
        `;
        return;
    }

    filteredProducts.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'coffee-card';
        productCard.innerHTML = `
            <img src="${product.image}" alt="${product.name}" onclick="window.location.href='product_detail.html?id=${product.id}'" style="cursor: pointer;">
            <div class="coffee-info">
                <h3 onclick="window.location.href='product_detail.html?id=${product.id}'" style="cursor: pointer;">${product.name}</h3>
                <p>${product.description}</p>
                <p class="price">${product.price} TL</p>
                <button onclick="addToCart(${product.id})">Sepete Ekle</button>
            </div>
        `;
        container.appendChild(productCard);
    });
}

// Filtreleme fonksiyonu
function filterProducts() {
    let filteredProducts = [...products];

    if (filterState.types.length > 0) {
        filteredProducts = filteredProducts.filter(product => 
            filterState.types.includes(product.type)
        );
    }

    if (filterState.priceRange) {
        const [min, max] = filterState.priceRange.split('-').map(Number);
        filteredProducts = filteredProducts.filter(product => {
            if (max) {
                return product.price >= min && product.price <= max;
            } else {
                return product.price >= min;
            }
        });
    }

    if (filterState.roastLevels.length > 0) {
        filteredProducts = filteredProducts.filter(product =>
            filterState.roastLevels.includes(product.roast)
        );
    }

    displayProducts(filteredProducts);
    updateProductCount(filteredProducts.length);
}

// Ürün sayısını güncelleme
function updateProductCount(count) {
    const productHeader = document.querySelector('.product-header h2');
    if (productHeader) {
        productHeader.textContent = `Kahve Çeşitlerimiz (${count} ürün)`;
    }
}

// Filtreleri temizleme fonksiyonu
function clearFilters() {
    filterState = {
        types: [],
        priceRange: '',
        roastLevels: []
    };

    document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = false;
    });

    document.querySelectorAll('input[type="radio"]').forEach(radio => {
        radio.checked = false;
    });

    filterProducts();
}

// Sepete ekleme fonksiyonu
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (product) {
        cart.addItem({
            id: product.id,
            name: product.name,
            price: product.price
        });
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Kahve türü filtreleri
    document.querySelectorAll('input[type="checkbox"][value]').forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            const filterType = e.target.closest('.filter-group').getAttribute('data-filter-type');
            
            if (filterType === 'type') {
                if (e.target.checked) {
                    filterState.types.push(e.target.value);
                } else {
                    filterState.types = filterState.types.filter(type => type !== e.target.value);
                }
            } else if (filterType === 'roast') {
                if (e.target.checked) {
                    filterState.roastLevels.push(e.target.value);
                } else {
                    filterState.roastLevels = filterState.roastLevels.filter(roast => roast !== e.target.value);
                }
            }
            
            filterProducts();
        });
    });

    // Fiyat aralığı filtreleri
    document.querySelectorAll('input[name="price"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            filterState.priceRange = e.target.value;
            filterProducts();
        });
    });

    // Sıralama
    const sortSelect = document.getElementById('sortProducts');
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            const sortType = e.target.value;
            let sortedProducts = [...products];

            switch(sortType) {
                case 'price-low':
                    sortedProducts.sort((a, b) => a.price - b.price);
                    break;
                case 'price-high':
                    sortedProducts.sort((a, b) => b.price - a.price);
                    break;
                case 'name':
                    sortedProducts.sort((a, b) => a.name.localeCompare(b.name));
                    break;
            }

            displayProducts(sortedProducts);
        });
    }

    // Sayfa yüklendiğinde tüm ürünleri göster
    displayProducts(products);
    updateProductCount(products.length);
});