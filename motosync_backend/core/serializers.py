from rest_framework import serializers
from decimal import Decimal
from .models import Product, Customer, Sale, Supplier

class SupplierSerializer(serializers.ModelSerializer):
    class Meta:
        model = Supplier
        fields = '__all__'

class ProductSerializer(serializers.ModelSerializer):
    supplier_name = serializers.CharField(source='supplier.name', read_only=True)

    class Meta:
        model = Product
        fields = ['id', 'name', 'description', 'srp', 'supplier_price', 'stock', 'category', 'supplier', 'supplier_name']
        read_only_fields = ['id', 'supplier_name']

class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = ['id', 'name', 'rfid', 'loyalty_points']
        read_only_fields = ['id', 'loyalty_points']

class SaleSerializer(serializers.ModelSerializer):
    rfid = serializers.CharField(write_only=True, required=False)
    product_name = serializers.CharField(source='product.name', read_only=True)
    customer_name = serializers.CharField(source='customer.name', read_only=True)

    class Meta:
        model = Sale
        fields = [
            'id', 'product', 'product_name', 'quantity', 'total_price', 'date', 'customer', 'customer_name', 'rfid'
        ]
        read_only_fields = ['id', 'product_name', 'customer', 'customer_name', 'date']

    def create(self, validated_data):
        rfid = validated_data.pop('rfid', None)
        customer = None

        if rfid:
            try:
                customer = Customer.objects.get(rfid=rfid)
                validated_data['customer'] = customer
            except Customer.DoesNotExist:
                raise serializers.ValidationError({'rfid': 'Customer with this RFID not found.'})

        product = validated_data.get('product')
        quantity = validated_data.get('quantity')
        total_price = validated_data.get('total_price')

        if product.stock < quantity:
            raise serializers.ValidationError({'stock': 'Not enough stock available.'})

        expected_price = product.srp * quantity
        if Decimal(str(total_price)) != expected_price:
            raise serializers.ValidationError({
                'total_price': f'Total price must equal product price × quantity (₱{expected_price}).'
            })

        product.stock -= quantity
        product.save()

        if customer:
            earned_points = int(total_price // 100)
            customer.loyalty_points += earned_points
            customer.save()

        sale = Sale.objects.create(**validated_data)
        return sale
