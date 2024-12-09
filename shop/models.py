from django.db import models
from django.contrib.auth.models import User
from django.utils.html import mark_safe
from django.utils.timezone import now

class Category (models.Model):
    STATUS =(('True', 'Evet'),('False', 'Hayır'))
    title= models.CharField(max_length=30, verbose_name='Başlık')
    image = models.ImageField(upload_to='images/', blank=True, null=True)
    status=models.CharField(max_length=10, choices=STATUS, verbose_name='Stok Durumu')

    def image_tag(self):
        if self.image:
            return mark_safe(f'<img src="{self.image.url}" width="50" height="50" />')
        return "Resim Yok"
    image_tag.short_description = 'Görsel'

    def __str__(self):
        return self.title

    class Meta:                  
        verbose_name='Kategori'
        verbose_name_plural='Kategoriler'

class Product (models.Model):
    STATUS =(('True', 'Evet'),('False', 'Hayır')) # aktif ürün pasif ürün bilgisi
    ROAST_CHOICES = [('Light', 'Hafif Kavrulmuş'),('Medium', 'Orta Kavrulmuş'),('Dark', 'Koyu Kavrulmuş ')]
    category=models.ForeignKey(Category, on_delete=models.CASCADE, verbose_name='Kategori')
    title= models.CharField(max_length=30, verbose_name='Başlık')
    description=models.TextField(blank=True, max_length=255, verbose_name='Açıklama')
    detail= models.TextField(blank=True,max_length=450, verbose_name='Ürün Bilgisi Detayı')
    image = models.ImageField(upload_to='images/', blank=True, null=True)
    price=models.FloatField(verbose_name='Fiyat')
    amount=models.IntegerField(default=0, verbose_name='Miktar')
    status=models.CharField(max_length=10, choices=STATUS, default='False', verbose_name='Stok Durumu')
    roast = models.CharField(max_length=50, verbose_name='Kavurma Seviyesi',choices=ROAST_CHOICES, default='Light')
    is_bestseller = models.BooleanField(default=False, verbose_name="En Çok Satan")
    is_on_sale = models.BooleanField(default=False, verbose_name='İndirimde')
    sale_price = models.FloatField(null=True, blank=True, verbose_name='İndirimli Fiyat')
    create_at = models.DateTimeField(auto_now_add=True)
    update_at=models.DateTimeField(auto_now=True)
    slug=models.SlugField(null=False, unique=True)
    user=models.ForeignKey(User, on_delete=models.CASCADE)
    

    class Meta:                  
        verbose_name='Ürün'
        verbose_name_plural='Ürünler'

    def __str__(self):
        return self.title

    def get_images(self):
        return self.productimage_set.all()
    
    def image_tag(self):
        if self.image:
            return mark_safe(f'<img src="{self.image.url}" width="50" height="50" />')
        return "Resim Yok"
    image_tag.short_description = 'Görsel'
    
class ProductImage(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    image = models.ImageField(upload_to='images/products/', verbose_name='Ürün Görseli')
    order = models.IntegerField(default=0, verbose_name='Sıralama')

    class Meta:
        ordering = ['order']
        verbose_name='Ürün Görseli'
        verbose_name_plural='Ürün Görselleri'

    def image_tag(self):
        if self.image:
            return mark_safe(f'<img src="{self.image.url}" width="50" height="50" />')
        return "Resim Yok"
    image_tag.short_description = 'Görsel'

class Workshop(models.Model):
    title=models.CharField(max_length=30, verbose_name='Başlık')
    description=models.TextField(blank=True, max_length=255, verbose_name='Açıklama')
    image = models.ImageField(
        upload_to='workshops/images/', 
        blank=True, 
        null=True,
        verbose_name='Resim'
    )
    video = models.FileField(
        upload_to='workshops/videos/', 
        blank=True, 
        null=True,
        verbose_name='Video',
        help_text='MP4, WebM formatları desteklenir'
    )
    price=models.FloatField(verbose_name='Fiyat')
    date=models.DateTimeField(verbose_name='Tarih')

    def get_media(self):
        """Yüklenen medya tipini ve URL'sini döndürür"""
        if self.video:
            return {'type': 'video', 'url': self.video.url}
        elif self.image:
            return {'type': 'image', 'url': self.image.url}
        return None
    
    def image_tag(self):
        if self.image:
            return mark_safe(f'<img src="{self.image.url}" width="50" height="50" />')
        return "Resim Yok"
    image_tag.short_description = 'Görsel'

    def __str__(self):
        return self.title
    
    class Meta:                  
        verbose_name='Atölye'
        verbose_name_plural='Atölyeler'



class PromoCode(models.Model):
    code = models.CharField(max_length=50, unique=True, verbose_name='Promosyon Kodu') 
    discount_percentage = models.DecimalField(max_digits=5, decimal_places=2, verbose_name='İndirim Oranı')  
    valid_from = models.DateTimeField(verbose_name='Başlangıç Tarihi') 
    valid_to = models.DateTimeField(verbose_name='Bitiş Tarihi')  
    active = models.BooleanField(default=True, verbose_name='Aktiflik Durumu') 

    def is_valid(self):
        return self.active and self.valid_from <= now() <= self.valid_to

    def __str__(self):
        return self.code





