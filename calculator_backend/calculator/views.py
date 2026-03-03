from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import CalculationSerializer
from .services import calculator_service


class CalculateAPIView(APIView):
    def post(self, request):
        serializer = CalculationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        result = calculator_service.calculate(
            num1=data["num1"],
            num2=data["num2"],
            operation=data["operation"],
        )
        return Response({"result": result}, status=status.HTTP_200_OK)
