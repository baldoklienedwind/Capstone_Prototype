from rest_framework import serializers
from decimal import Decimal
from .models import Product, Customer, Sale, Supplier

class SupplierSerializer(serializers.ModelSerializer):
    class Meta:
        model = Supplier
        fields = '__all__'

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = '__all__'

class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = ['id', 'name', 'rfid', 'loyalty_points']

class SaleSerializer(serializers.ModelSerializer):
    rfid = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = Sale
        fields = ['id', 'product', 'quantity', 'total_price', 'date', 'customer', 'rfid']
        read_only_fields = ['customer']

    def create(self, validated_data):
        rfid = validated_data.pop('rfid', None)
        customer = None

        if rfid:
            try:
                customer = Customer.objects.get(rfid=rfid)
                validated_data['customer'] = customer
            except Customer.DoesNotExist:
                raise serializers.ValidationError({'rfid': 'Customer with this RFID not found.'})

        product = validated_data['product']
        quantity = validated_data['quantity']
        total_price = validated_data['total_price']

        # Check stock
        if product.stock < quantity:
            raise serializers.ValidationError({'stock': 'Not enough stock available.'})

        # Check total price correctness using Decimal
        expected_price = product.price * quantity
        if Decimal(str(total_price)) != expected_price:
            raise serializers.ValidationError({
                'total_price': f'Total price must equal product price × quantity (₱{expected_price}).'
            })

        # Deduct stock
        product.stock -= quantity
        product.save()

        # Loyalty points = 1 point per ₱100 spent (example)
        if customer:
            earned_points = int(total_price // 100)
            customer.loyalty_points += earned_points
            customer.save()

        sale = Sale.objects.create(**validated_data)
        return sale