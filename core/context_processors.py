from django.conf import settings

def business_info(request):
    return {'BUSINESS_INFO': settings.BUSINESS_INFO}