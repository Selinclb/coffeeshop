from django.http import JsonResponse
from django.shortcuts import get_object_or_404, render
from .models import Category, Product, Workshop
from django.contrib.auth.decorators import login_required
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth import authenticate, login as auth_login, logout
from django.shortcuts import redirect
from django.contrib import messages



def index(request):
    products = Product.objects.filter(status='True')
    workshops = Workshop.objects.all().order_by('date')
    context = {
        'products': products,
        'workshops': workshops,
    }
    return render(request, 'shop/index.html', context)


def product_list(request):
    products = Product.objects.filter(status='True')
    categories = Category.objects.filter(status='True')
    roast_choices = Product.ROAST_CHOICES

    context = {
        'products': products,
        'categories': categories,
        'roast_choices': roast_choices,
    }
    return render(request, 'shop/product_list.html', context)

def product_detail(request, slug): 
    product = get_object_or_404(Product, slug=slug) 
    
    context = {
        'product': product,
    }
    return render(request, 'shop/product_detail.html', context)



def get_products(request):
    products = Product.objects.all().values('id', 'title', 'description', 'price', 'image', 'roast', 'type') 
    return JsonResponse(list(products), safe=False)

def product_list_json(request):
    try:
        products = Product.objects.all()
        data = [{
            'id': product.id,
            'title': product.title,
            'price': str(product.price),
            'description': product.description,
            'image': product.image.url if product.image else None,
            'roast': product.roast,
            'category': product.category.title,
            'status': product.status,
        } for product in products]
        return JsonResponse({'products': data}, safe=False)
    except Exception as e:
        print(f"Hata: {str(e)}")
        return JsonResponse({'error': str(e)}, status=500)
    
def atolyeler(request):
    workshops = Workshop.objects.all().order_by('date')
    context = {
        'workshops': workshops,
    }
    return render(request, 'shop/atolyeler.html', context)



def register(request):
    if request.user.is_authenticated:
        return redirect('shop:index')
        
    if request.method == 'POST':
        form = UserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            auth_login(request, user)
            messages.success(request, 'Hesabınız başarıyla oluşturuldu!')
            return redirect('shop:index')
    else:
        form = UserCreationForm()
    
    return render(request, 'shop/register.html', {
        'form': form
    })


def login_view(request):
        
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        user = authenticate(request, username=username, password=password)
        
        if user is not None:
            auth_login(request, user)
            messages.success(request, 'Başarıyla giriş yaptınız!')
            return redirect('shop:index')
        else:
            messages.error(request, 'Kullanıcı adı veya şifre hatalı!')
    
    return render(request, 'shop/login.html')


def logout_view(request):
    logout(request)
    messages.success(request, 'Başarıyla çıkış yaptınız!')
    return redirect('shop:index')


