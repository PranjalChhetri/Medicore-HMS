from django.contrib import admin
from django.urls import path, include
from django.shortcuts import render
import os

def home(request):
    return render(request, 'index.html')

urlpatterns = [
    path('', home, name='home'),
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
]