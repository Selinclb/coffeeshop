from django.db import models
from django.contrib.auth.models import User
from shop.models import Product
from django.forms import ModelForm, TextInput


class Cart(models.Model):
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, verbose_name='Kullanıcı')
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True, verbose_name='Ürün')
    quantity = models.IntegerField(verbose_name='Miktar')

    def __str__(self):
        return self.product.title


    @property
    def amount(self):
        return self.quantity * self.product.price
    
class CartForm(ModelForm):
    class Meta:
        model = Cart
        fields = ['quantity']
        widgets = {
            'quantity': TextInput(attrs={'class': 'input', 'value': 1, 'type': 'number', 'min': 1})

        }
    
class Order(models.Model):
    STATUS = (
        ('New', 'Yeni'),
        ('Accepted', 'Onaylandı'),
        ('Preaparing', 'Hazırlanıyor'),
        ('OnShipping', 'Kargoya Verildi'),
        ('Completed', 'Tamamlandı'),
        ('Canceled', 'İptal Edildi'),
    )
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, verbose_name='Kullanıcı')
    shipname = models.CharField(max_length=50, verbose_name='Ad Soyad')
    shipphone = models.CharField(max_length=20, verbose_name='Telefon')
    shipemail = models.CharField(max_length=20, verbose_name='Email')
    shipaddress = models.CharField(max_length=150, verbose_name='Adres')
    total = models.FloatField(verbose_name='Toplam')
    status = models.CharField(max_length=10, choices=STATUS, default='New', verbose_name='Durum')
    ip = models.CharField(blank=True, max_length=20, verbose_name='IP')
    note = models.CharField(blank=True, max_length=100, verbose_name='Not')
   

    def __str__(self):
        return self.shipname
    
class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, verbose_name='Kullanıcı')
    phone = models.CharField(max_length=20, verbose_name='Telefon')
    address = models.CharField(max_length=150, verbose_name='Adres')
    city = models.CharField(max_length=20, verbose_name='Şehir')
 

    class Meta:
        verbose_name = 'Profil'
        verbose_name_plural = 'Profiller'

    def __str__(self):
        return self.user.username
    
