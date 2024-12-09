from django.db import models
from tinymce.models import HTMLField

class ContactInfo(models.Model):
    address = models.TextField(verbose_name='Adres')
    email = models.EmailField(verbose_name='E-posta')
    phone = models.CharField(max_length=20, verbose_name='Telefon')
    facebook = models.URLField(blank=True, null=True, verbose_name='Facebook')
    twitter = models.URLField(blank=True, null=True, verbose_name='Twitter')
    instagram = models.URLField(blank=True, null=True, verbose_name='Instagram')

    class Meta:
        verbose_name = 'İletişim Bilgisi'
        verbose_name_plural = 'İletişim Bilgileri'

    def __str__(self):
        return "İletişim Bilgileri"
    
class About(models.Model):
    description = models.TextField(blank=True, max_length=255, verbose_name='Hikayemiz')
    detail = models.TextField(blank=True, max_length=450, verbose_name='Biz Kimiz?')

    def __str__(self):
        return self.description

    class Meta:
        verbose_name = 'Hakkımızda'
        verbose_name_plural = 'Hakkımızda'

class TeamMember(models.Model):
    about = models.ForeignKey(About, on_delete=models.CASCADE, related_name='team_members', verbose_name='Hakkımızda')
    name = models.CharField(max_length=100, verbose_name='Ad Soyad')
    title = models.CharField(max_length=100, verbose_name='Ünvan')
    image = models.ImageField(upload_to='team/', verbose_name='Üye Fotoğrafı')
    order = models.PositiveIntegerField(default=0, verbose_name='Sıralama')

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = 'Ekip Üyesi'
        verbose_name_plural = 'Ekip Üyeleri'
        ordering = ['order']



class FAQ(models.Model):
    question = models.CharField(max_length=255, verbose_name='Soru')
    answer = models.TextField(blank=True, verbose_name='Cevap')
    order = models.PositiveIntegerField(default=0, verbose_name='Sıralama')

    def __str__(self):
        return self.question

    class Meta:
        verbose_name = 'Sıkça Sorulan Sorular'
        verbose_name_plural = 'Sıkça Sorulan Sorular'
        ordering = ['order']

class Settings(models.Model): 
    title = models.CharField(max_length=100, default='Ayarlar', verbose_name='Başlık')
    aboutus = models.ForeignKey(About, on_delete=models.CASCADE, related_name='settings', verbose_name='Hakkımızda ve Ekip Üyeleri')
    shipping_cost = models.DecimalField(max_digits=10, decimal_places=2, default=29.99, verbose_name='Kargo Ücreti')
    free_shipping_threshold = models.DecimalField(max_digits=10, decimal_places=2, default=500.00, verbose_name='Ücretsiz Kargo Limiti')
    shipping_returns = HTMLField(blank=True, verbose_name='Gönderim ve İade Politikası')
    shop_policy = HTMLField(blank=True, verbose_name='Mağaza Politikası')
    faq = models.ForeignKey(FAQ, on_delete=models.CASCADE, related_name='settings', verbose_name='Sıkça Sorulan Sorular')
    contact_info = models.ForeignKey(ContactInfo, on_delete=models.CASCADE, related_name='settings', verbose_name='İletişim Bilgileri')

    def __str__(self):
        return self.title

    class Meta:
        verbose_name = 'Ayarlar'
        verbose_name_plural = 'Ayarlar'

    def save(self, *args, **kwargs):
        if not self.pk and Settings.objects.exists():
            # Eğer başka bir kayıt varsa, güncelle
            return Settings.objects.update(**self.__dict__)
        return super(Settings, self).save(*args, **kwargs)