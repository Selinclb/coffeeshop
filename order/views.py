from django.shortcuts import render, get_object_or_404, redirect
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from .models import Cart, Order, Profile
from shop.models import Product
from settings.models import Settings
import json
from django.views.decorators.http import require_POST

@login_required(login_url='shop:login')
def cart_view(request):
    cart_items = Cart.objects.filter(user=request.user)
    subtotal = sum(item.amount for item in cart_items)
    cart_empty = not cart_items.exists()
    # Site ayarlarını al
    site_settings = Settings.objects.first()
    if not site_settings:
        site_settings = Settings.objects.create()
    
    # Kargo ücreti hesaplama - sepet boşsa 0
    shipping_cost = 0 if cart_empty else (
        float(site_settings.shipping_cost) 
        if subtotal < float(site_settings.free_shipping_threshold) 
        else 0
    )
    total = subtotal + shipping_cost
    
    context = {
        'cart_items': cart_items,
        'cart_empty': cart_empty,
        'subtotal': subtotal,
        'shipping_cost': shipping_cost,
        'total': total,
        'free_shipping_threshold': site_settings.free_shipping_threshold,
        'cart_count': cart_items.count()
    }
    return render(request, 'shop/cart.html', context)

# Sepete ekleme işlemi
@login_required(login_url='shop:login')
def add_to_cart(request, slug):
    if request.method == 'POST':
        try:
            product = get_object_or_404(Product, slug=slug)
            quantity = int(request.POST.get('quantity', 1))
            
            # Stok kontrolü
            if quantity > product.amount:
                return JsonResponse({
                    'success': False,
                    'message': 'Üzgünüz, istediğiniz miktarda ürün stokta yok.'
                })
            
            # Sepette aynı üründen var mı kontrol et
            cart_item, created = Cart.objects.get_or_create(
                user=request.user,
                product=product,
                defaults={'quantity': quantity}
            )
            
            # Eğer ürün zaten sepette varsa miktarını güncelle
            if not created:
                cart_item.quantity += quantity
                if cart_item.quantity > product.amount:
                    return JsonResponse({
                        'success': False,
                        'message': 'Üzgünüz, istediğiniz miktarda ürün stokta yok.'
                    })
                cart_item.save()
                message = 'Ürün miktarı güncellendi.'
            else:
                message = 'Ürün sepete eklendi.'
            
            return JsonResponse({
                'success': True,
                'message': message,
                'cart_count': Cart.objects.filter(user=request.user).count()
            })
            
        except Exception as e:
            return JsonResponse({
                'success': False,
                'message': f'Bir hata oluştu: {str(e)}'
            })
    
    return JsonResponse({'success': False, 'message': 'Geçersiz istek.'})

@require_POST
@login_required(login_url='shop:login')
def update_cart_item(request, item_id):
    try:
        data = json.loads(request.body)
        action = data.get('action')
        
        cart_item = get_object_or_404(Cart, id=item_id, user=request.user)
        
        if action == 'increase':
            cart_item.quantity += 1
        elif action == 'decrease' and cart_item.quantity > 1:
            cart_item.quantity -= 1
            
        cart_item.save()
        
        # Sepet toplamlarını hesapla
        cart_items = Cart.objects.filter(user=request.user)
        subtotal = sum(item.amount for item in cart_items)
        shipping_cost = 29.99 if subtotal < 500 else 0
        total = subtotal + shipping_cost
        
        return JsonResponse({
            'success': True,
            'quantity': cart_item.quantity,
            'item_total': cart_item.amount,
            'subtotal': subtotal,
            'shipping_cost': shipping_cost,
            'total': total
        })
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=400)

@require_POST
@login_required(login_url='shop:login')
def remove_cart_item(request, item_id):
    try:
        cart_item = get_object_or_404(Cart, id=item_id, user=request.user)
        cart_item.delete()
        
        # Güncel sepet toplamlarını hesapla
        cart_items = Cart.objects.filter(user=request.user)
        subtotal = sum(item.amount for item in cart_items)
        shipping_cost = 29.99 if subtotal < 500 else 0
        total = subtotal + shipping_cost
        
        return JsonResponse({
            'success': True,
            'subtotal': subtotal,
            'shipping_cost': shipping_cost,
            'total': total,
            'cart_count': cart_items.count()
        })
        
    except Exception as e:
        return JsonResponse({
            'success': False, 
            'error': str(e)
        }, status=400)
    

@login_required
def profile_view(request):
    profile, created = Profile.objects.get_or_create(
        user=request.user,
        defaults={
            'phone': '',
            'address': '',
            'city': '',
        }
    )
    
    if request.method == 'POST':
        try:
            # Form verilerini al
            phone = request.POST.get('phone', '')
            address = request.POST.get('address', '')
            city = request.POST.get('city', '')
            
            # Profili güncelle
            profile.phone = phone
            profile.address = address
            profile.city = city
            profile.save()
            
            if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                return JsonResponse({
                    'success': True,
                    'message': 'Profil bilgileriniz başarıyla güncellendi.'
                })
            else:
                messages.success(request, 'Profil bilgileriniz başarıyla güncellendi.')
                return redirect('order:profile')
                
        except Exception as e:
            if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                return JsonResponse({
                    'success': False,
                    'message': str(e)
                }, status=400)
            else:
                messages.error(request, f'Bir hata oluştu: {str(e)}')
                return redirect('order:profile')
    
    context = {
        'profile': profile,
    }
    return render(request, 'shop/profile.html', context)

@login_required
def siparislerim(request):
    orders = Order.objects.filter(user=request.user)
    return render(request, 'shop/siparislerim.html', {'orders': orders})


