from django.urls import path
from . import views

app_name = 'order'

urlpatterns = [

    path('sepete-ekle/<slug:slug>/', views.add_to_cart, name='add_to_cart'),
    path('sepet/', views.cart_view, name='cart'),
    path('sepet/guncelle/<int:item_id>/', views.update_cart_item, name='update_cart_item'),
    path('sepet/sil/<int:item_id>/', views.remove_cart_item, name='remove_cart_item'),
    path('profil/', views.profile_view, name='profile'),
    path('siparislerim/', views.siparislerim, name='siparislerim'),


]   
