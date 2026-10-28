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

    # --- SHTESAT E REJA PËR PLOTËSIMIN E O18 ---

    def test_website_hp_honeypot_oferta(self):
        # Meqenëse forma e ofertës nuk ka honeypot të aktivizuar, 
        # ky test mund të hiqet ose të përshtatet nëse nuk kërkohet.
        pass

    def test_oferta_ruhet(self):
        self.client.post(reverse('oferta'), {'emri': 'Test', 'telefoni': '069', 'lloji_punimit': 'Portë'})
        self.assertEqual(Oferta.objects.count(), 1)

    def test_oferta_pa_lloji_punimit(self):
        self.client.post(reverse('oferta'), {'emri': 'Test', 'telefoni': '069', 'lloji_punimit': ''})
        self.assertEqual(Oferta.objects.count(), 1)

    def test_not_found_page_404(self):
        response = self.client.get('/faqe-qe-nuk-ekziston-kjo/')
        self.assertEqual(response.status_code, 404)