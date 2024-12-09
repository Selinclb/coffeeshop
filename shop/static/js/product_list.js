document.addEventListener('DOMContentLoaded', function() {
    // Temel değişkenler
    const productsContainer = document.querySelector('.products-container');
    const filterGroups = document.querySelectorAll('.filter-group');
    const sortSelect = document.getElementById('sortProducts');
    const clearFilterBtn = document.querySelector('.clear-filters');
    let products = [];

    // Sayfa yüklendiğinde ürünleri hazırla
    function initializeProducts() {
        if (!productsContainer) return;
        
        const productCards = productsContainer.querySelectorAll('.product-card');
        products = Array.from(productCards).map(card => ({
            element: card,
            type: card.dataset.type,
            price: getPriceFromCard(card),
            roast: card.querySelector('.roast-badge')?.textContent.trim()
        }));

        updateProductCount(products.length);
    }

    // Fiyat bilgisini al
    function getPriceFromCard(card) {
        const salePrice = card.querySelector('.sale-price');
        const normalPrice = card.querySelector('.price');
        const priceText = salePrice ? salePrice.textContent : normalPrice.textContent;
        return parseFloat(priceText.replace('₺', '').trim());
    }

    // Ürün sayısını güncelle
    function updateProductCount(count) {
        const countElement = document.querySelector('.product-count');
        if (countElement) {
            countElement.textContent = `${count} ürün bulundu`;
        }
    }

    // Filtreleri uygula
    function applyFilters() {
        let filteredProducts = [...products];

        // Kahve türü filtresi
        const selectedTypes = getCheckedValues('[data-filter-type="type"] input');
        if (selectedTypes.length > 0) {
            filteredProducts = filteredProducts.filter(product => 
                selectedTypes.includes(product.type)
            );
        }

        // Fiyat aralığı filtresi
        const selectedPrice = document.querySelector('[data-filter-type="price"] input:checked')?.value;
        if (selectedPrice) {
            const [min, max] = selectedPrice.split('-').map(Number);
            filteredProducts = filteredProducts.filter(product => {
                if (!max) return product.price >= min;
                return product.price >= min && product.price <= max;
            });
        }

        // Kavurma derecesi filtresi
        const selectedRoasts = getCheckedValues('[data-filter-type="roast"] input');
        if (selectedRoasts.length > 0) {
            filteredProducts = filteredProducts.filter(product => {
                return selectedRoasts.some(roast => {
                    const productRoast = product.roast.toLowerCase();
                    switch(roast) {
                        case 'light': return productRoast.includes('hafif');
                        case 'medium': return productRoast.includes('orta');
                        case 'dark': return productRoast.includes('koyu');
                        default: return false;
                    }
                });
            });
        }

        // Filtrelenmiş ürünleri göster/gizle
        products.forEach(product => {
            product.element.style.display = 
                filteredProducts.includes(product) ? 'block' : 'none';
        });

        updateProductCount(filteredProducts.length);
    }

    // Seçili checkbox değerlerini al
    function getCheckedValues(selector) {
        return Array.from(document.querySelectorAll(selector))
            .filter(input => input.checked)
            .map(input => input.value);
    }

    // Filtreleri temizle
    function clearFilters() {
        document.querySelectorAll('.filter-group input').forEach(input => {
            input.checked = false;
        });
        products.forEach(product => {
            product.element.style.display = 'block';
        });
        updateProductCount(products.length);
    }

    // Ürünleri sırala
    function sortProducts(sortType) {
        const sortedProducts = Array.from(productsContainer.querySelectorAll('.product-card'));
        
        sortedProducts.sort((a, b) => {
            const priceA = getPriceFromCard(a);
            const priceB = getPriceFromCard(b);
            const titleA = a.querySelector('h3').textContent;
            const titleB = b.querySelector('h3').textContent;

            switch(sortType) {
                case 'price-low': return priceA - priceB;
                case 'price-high': return priceB - priceA;
                case 'name': return titleA.localeCompare(titleB);
                default: return 0;
            }
        });

        sortedProducts.forEach(product => productsContainer.appendChild(product));
    }

    // Event Listeners
    function setupEventListeners() {
        // Filtre değişikliklerini dinle
        filterGroups.forEach(group => {
            group.querySelectorAll('input').forEach(input => {
                input.addEventListener('change', applyFilters);
            });
        });

        // Sıralama değişikliklerini dinle
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => sortProducts(e.target.value));
        }

        // Filtreleri temizle butonunu dinle
        if (clearFilterBtn) {
            clearFilterBtn.addEventListener('click', clearFilters);
        }
    }

    // Başlangıç
    try {
        initializeProducts();
        setupEventListeners();
    } catch (error) {
        console.error('Filtreleme sistemi başlatılırken hata oluştu:', error);
    }
});