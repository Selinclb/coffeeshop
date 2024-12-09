from django.contrib import admin
from shop.models import Category, Product, Workshop, ProductImage, PromoCode
from unfold.admin import ModelAdmin, TabularInline
from django.utils.safestring import mark_safe


@admin.register(Category)
class CategoryAdmin(ModelAdmin):
    list_display = ['title', 'image_tag','status']
    list_filter = ['status'] # yanda filtre görünümü yapar.
    readonly_fields = ['image_tag']

class ProductImageInline(TabularInline):
    model = ProductImage
    extra = 3  # Kaç tane boş form gösterileceği
    readonly_fields = ['image_tag']

@admin.register(Product)
class ProductAdmin(ModelAdmin):
    list_display= ['title','price', 'image_tag', 'amount', 'status', 'is_on_sale', 'create_at']
    list_filter=['status','category']
    prepopulated_fields={"slug":("category","title")}
    inlines = [ProductImageInline]

    def save_model(self, request, obj, form, change):
        # İndirim işaretlendiğinde ve indirimli fiyat girilmemişse
        if obj.is_on_sale and not obj.sale_price:
            # Varsayılan olarak %20 indirim uygula
            obj.sale_price = obj.price * 0.8
        # İndirim kaldırıldığında indirimli fiyatı temizle
        elif not obj.is_on_sale:
            obj.sale_price = None
        super().save_model(request, obj, form, change)

@admin.register(Workshop)
class WorkshopAdmin(ModelAdmin):
    list_display= ['title','price', 'media_preview', 'date']
    list_filter=['date']
    readonly_fields= ['media_preview']

    #panelde medya görüntüsü için hangi medya eklenmişse onu gösterir.
    def media_preview(self, obj):
        media = obj.get_media()
        if media:
            if media['type'] == 'video':
                return mark_safe(f'<video width="50" height="50" controls><source src="{media["url"]}"></video>')
            else:
                return mark_safe(f'<img src="{media["url"]}" width="50" height="50" />')
        return "Medya Yok"
    media_preview.short_description = 'Görsel'


# @admin.register(PromoCode)
# class PromoCodeAdmin(ModelAdmin):
#     list_display = ('code', 'discount_percentage', 'valid_from', 'valid_to', 'active')
#     list_filter = ('active', 'valid_from', 'valid_to')
#     search_fields = ('code',)