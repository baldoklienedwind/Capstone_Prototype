# core/admin.py
from django.contrib import admin
from .models import Supplier, Product, Customer, Sale

admin.site.register(Supplier)
admin.site.register(Product)
admin.site.register(Customer)
admin.site.register(Sale)