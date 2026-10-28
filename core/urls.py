from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('about/', views.about, name='about'),
    path('punimet/', views.punimet, name='punimet'),
    path('procesi/', views.procesi, name='procesi'),
    path('kontakti/', views.contact, name='contact'),
    path('privatesia/', views.privatesia, name='privatesia'),
    path('oferta/', views.oferta_view, name='oferta'),
]