from django.shortcuts import render
from rest_framework import viewsets
from .models import Product, Customer, Sale, Supplier
from .serializers import ProductSerializer, CustomerSerializer, SaleSerializer, SupplierSerializer
from django.contrib.auth.views import LoginView

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

class CustomerViewSet(viewsets.ModelViewSet):
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer

class SaleViewSet(viewsets.ModelViewSet):
    queryset = Sale.objects.all()
    serializer_class = SaleSerializer

class SupplierViewSet(viewsets.ModelViewSet):
    queryset = Supplier.objects.all()
    serializer_class = SupplierSerializer
    
class CustomLoginView(LoginView):
    template_name = 'login.html'
