from django.conf import settings
from django.conf.urls.static import static
from django.urls import path
from . import views

app_name = 'shop'

urlpatterns = [
    # Ana sayfalar
    path('', views.index, name='index'),
    
    # Ürün sayfaları
    path('urunlerimiz/', views.product_list, name='product_list'),
    path('urun/<slug:slug>/', views.product_detail, name='product_detail'),
    
    
    # Kullanıcı sayfaları
    path('atolyelerimiz/', views.atolyeler, name='atolyeler'),
    path('kayit/', views.register, name='register'),
    path('giris/', views.login_view, name='login'),
    path('cikis/', views.logout_view, name='logout'),
    
    
    # API endpoints
    path('api/products/', views.product_list_json, name='product_list_json'),

    
] 

# Static ve media dosyaları için URL'ler (development)
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)