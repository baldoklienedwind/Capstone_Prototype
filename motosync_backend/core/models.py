from django.db import models
from django.utils import timezone

class Supplier(models.Model):
    name = models.CharField(max_length=100)
    contact_info = models.TextField(blank=True)

class Product(models.Model):
    CATEGORY_CHOICES = [
        ('accessory', 'Accessory'),
        ('part', 'Part'),
        ('oil', 'Oil'),
        ('cleaner', 'Cleaner'),
    ]

    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    srp = models.DecimalField(max_digits=10, decimal_places=2)
    supplier_price = models.DecimalField(max_digits=10, decimal_places=2)
    stock = models.PositiveIntegerField(default=0)
    supplier = models.ForeignKey(Supplier, on_delete=models.CASCADE)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='accessory')

    def is_low_stock(self):
        return self.stock <= 5

class Customer(models.Model):
    name = models.CharField(max_length=100)
    rfid = models.CharField(max_length=50, unique=True)
    loyalty_points = models.PositiveIntegerField(default=0)

class Sale(models.Model):
    customer = models.ForeignKey(Customer, on_delete=models.SET_NULL, null=True, blank=True)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField()
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    date = models.DateTimeField(default=timezone.now)
