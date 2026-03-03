from rest_framework import serializers


class CalculationSerializer(serializers.Serializer):
    num1 = serializers.FloatField(required=True)
    num2 = serializers.FloatField(required=True)
    operation = serializers.ChoiceField(
        choices=["add", "subtract", "multiply", "divide"], required=True
    )

    def validate(self, attrs):
        if attrs["operation"] == "divide" and attrs["num2"] == 0:
            raise serializers.ValidationError(
                {"num2": "Division by zero is not allowed."}
            )
        return attrs
