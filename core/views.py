from django.shortcuts import render

def home(request):
    return render(request, 'index.html')

def about(request): # <--- U korrigjua nga ';' në ':'
    return render(request, 'about.html')

def punimet(request):
    return render(request, 'punimet.html')

def procesi(request):
    return render(request, 'procesi.html')

def contact(request):
    return render(request, 'contact.html')

from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('about/', views.about, name='about'),
    path('punimet/', views.punimet, name='punimet'),
    path('procesi/', views.procesi, name='procesi'),
    path('kontakti/', views.contact, name='contact'), # <--- U shtua për t'u lidhur me emrin 'contact'
]