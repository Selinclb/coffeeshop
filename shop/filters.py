from django_filters import FilterSet, CharFilter, ChoiceFilter
from .models import Product

class ProductFilter(FilterSet):
    type = ChoiceFilter(choices=Product.TYPE_CHOICES, label='Kahve Türü')
    # Diğer filtreler eklenebilir...

    class Meta:
        model = Product
        fields = ['type', 'price']  # Filtrelemek istediğiniz alanlar