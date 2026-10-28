from django.core import mail
from django.test import TestCase, override_settings
from django.urls import reverse

from .models import MesazhKontakti, Oferta


@override_settings(SECURE_SSL_REDIRECT=False)
class FaqetTest(TestCase):
    def test_faqet_hapen(self):
        for name in ['home', 'about', 'punimet', 'procesi', 'contact', 'privatesia']:
            with self.subTest(name=name):
                self.assertEqual(self.client.get(reverse(name)).status_code, 200)

    def test_kontakti_ruhet_dhe_dergon_email(self):
        self.client.post(reverse('contact'), {'emri': 'Test', 'telefoni': '0690000000'})
        self.assertEqual(MesazhKontakti.objects.count(), 1)
        self.assertEqual(len(mail.outbox), 1)

    def test_kontakti_pa_telefon_nuk_ruhet(self):
        self.client.post(reverse('contact'), {'emri': 'Test'})
        self.assertEqual(MesazhKontakti.objects.count(), 0)

    def test_honeypot(self):
        self.client.post(reverse('contact'), {'emri': 'Bot', 'telefoni': '1', 'website': 'x'})
        self.assertEqual(MesazhKontakti.objects.count(), 0)

    def test_oferta_ruhet(self):
        self.client.post(reverse('oferta'), {'emri': 'Test', 'telefoni': '069', 'lloji_punimit': 'Portë'})
        self.assertEqual(Oferta.objects.count(), 1)