from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register('products', views.ProductViewSet)
router.register('customers', views.CustomerViewSet)
router.register('sales', views.SaleViewSet)
router.register('suppliers', views.SupplierViewSet)

urlpatterns = [
    path('', include(router.urls)),
]