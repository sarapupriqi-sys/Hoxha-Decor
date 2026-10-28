from django.contrib import admin
from .models import Punim, FotoPunimi, MesazhKontakti, Oferta

class FotoPunimiInline(admin.TabularInline):
    model = FotoPunimi
    extra = 3  # Numri i fushave boshe për shtim fotosh

admin.site.register(Punim)

@admin.register(MesazhKontakti)
class MesazhKontaktiAdmin(admin.ModelAdmin):
    list_display = ('emri', 'telefoni', 'qyteti', 'data_krijimit')
    search_fields = ('emri', 'telefoni', 'email', 'qyteti', 'mesazhi')
    list_filter = ('data_krijimit',)
    readonly_fields = ('emri', 'telefoni', 'email', 'qyteti', 'adresa', 'prmasat', 'mesazhi', 'data_krijimit')

@admin.register(Oferta)
class OfertaAdmin(admin.ModelAdmin):
    list_display = ('emri', 'telefoni', 'lloji_punimit', 'statusi', 'data_krijimit')
    search_fields = ('emri', 'telefoni', 'lloji_punimit')
    list_filter = ('statusi', 'lloji_punimit', 'data_krijimit')
    readonly_fields = ('emri', 'telefoni', 'lloji_punimit', 'prmasat', 'detaje', 'data_krijimit')

