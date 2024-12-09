from django.shortcuts import render
from .models import About, TeamMember, ContactInfo, FAQ, Settings


def about(request):
    about_info = About.objects.first() 
    team_members = TeamMember.objects.all().order_by('order') 
    contact_info = ContactInfo.objects.first()  
    
    context = {
        'about': about_info,
        'team_members': team_members,
        'contact_info': contact_info,
    }
    return render(request, 'shop/about.html', context)

def faq(request):
    faqs = FAQ.objects.all() 
    return render(request, 'shop/faq.html', {'faqs': faqs})

def shipping_returns(request):
    settings = Settings.objects.first()
    return render(request, 'shop/shipping_returns.html', {'settings': settings})

def shop_policy(request):
    settings = Settings.objects.first()
    return render(request, 'shop/shop_policy.html', {'settings': settings})