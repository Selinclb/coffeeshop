from django.urls import path
from . import views


app_name = 'settings'

urlpatterns = [
    path('about/', views.about, name='about'),
    path('faq/', views.faq, name='faq'),
    path('shipping-returns/', views.shipping_returns, name='shipping_returns'),
    path('shop-policy/', views.shop_policy, name='shop_policy'),
] 