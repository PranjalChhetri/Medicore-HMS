from django.contrib import admin
from django.urls import path, include
from django.shortcuts import render
import os

def home(request):
    # Serve index.html from the project root
    return render(request, os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'index.html'))

urlpatterns = [
    path('', home, name='home'),
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
]