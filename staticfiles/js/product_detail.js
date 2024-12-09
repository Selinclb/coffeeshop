document.addEventListener('DOMContentLoaded', function() {
    // Accordion işlevselliği
    const accordionItems = document.querySelectorAll('.accordion-item');
    
    accordionItems.forEach(item => {
        const header = item.querySelector('.accordion-header');
        const content = item.querySelector('.accordion-content');
        
        header.addEventListener('click', () => {
            // Aktif accordion'u bul
            const currentlyActive = document.querySelector('.accordion-item.active');
            
            // Eğer başka bir accordion açıksa onu kapat
            if(currentlyActive && currentlyActive !== item) {
                currentlyActive.classList.remove('active');
                currentlyActive.querySelector('.accordion-content').style.maxHeight = null;
            }
            
            // Tıklanan accordion'u aç/kapat
            item.classList.toggle('active');
            
            if(item.classList.contains('active')) {
                content.style.maxHeight = content.scrollHeight + "px";
            } else {
                content.style.maxHeight = null;
            }
        });
    });

    // Miktar artırma/azaltma işlevselliği
    const decreaseBtn = document.querySelector('.quantity-decrease');
    const increaseBtn = document.querySelector('.quantity-increase');
    const quantityInput = document.querySelector('.quantity-controls input');
    const maxAmount = parseInt(quantityInput.getAttribute('max')) || 10;

    if(decreaseBtn && increaseBtn && quantityInput) {
        decreaseBtn.addEventListener('click', () => {
            let value = parseInt(quantityInput.value);
            if(value > 1) {
                quantityInput.value = value - 1;
            }
        });

        increaseBtn.addEventListener('click', () => {
            let value = parseInt(quantityInput.value);
            if(value < maxAmount) {
                quantityInput.value = value + 1;
            }
        });
    }
});
