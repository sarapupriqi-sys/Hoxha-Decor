from django.db import models
class Punim(models.Model):
    emri = models.CharField(max_length=150, null=True, blank=True)
    kategoria = models.CharField(max_length=100, blank=True, null=True)
    kryesor = models.BooleanField(default=False)
    data_krijimit = models.DateTimeField(auto_now_add=True)
    imazhi = models.ImageField(upload_to='punime/', blank=True, null=True)

    def __str__(self):
        return self.emri if self.emri else f"Punim {self.id}"

class FotoPunimi(models.Model):
    punim = models.ForeignKey(Punim, related_name='fotot', on_delete=models.CASCADE)
    imazhi = models.ImageField(upload_to='punime/')

class MesazhKontakti(models.Model):
    emri = models.CharField(max_length=150)
    telefoni = models.CharField(max_length=50)
    email = models.EmailField(blank=True, null=True)
    qyteti = models.CharField(max_length=100, blank=True, null=True)
    adresa = models.CharField(max_length=255, blank=True, null=True)
    prmasat = models.CharField(max_length=150, blank=True, null=True)
    mesazhi = models.TextField(blank=True, null=True)
    data_krijimit = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Mesazh nga {self.emri} - {self.telefoni}"

class Oferta(models.Model):
    emri = models.CharField(max_length=150)
    telefoni = models.CharField(max_length=50)
    lloji_punimit = models.CharField(max_length=100)
    prmasat = models.CharField(max_length=255, blank=True, null=True)
    detaje = models.TextField(blank=True, null=True)
    statusi = models.CharField(max_length=50, default='E re')
    data_krijimit = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Ofertë: {self.emri} - {self.lloji_punimit}"