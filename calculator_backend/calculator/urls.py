from django.urls import path

from .views import CalculateAPIView


urlpatterns = [
    path("calculate/", CalculateAPIView.as_view(), name="calculate"),
]
