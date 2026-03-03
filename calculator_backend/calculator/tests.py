from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase


class CalculateAPITests(APITestCase):
    endpoint = reverse("calculate")

    def test_add_operation(self):
        response = self.client.post(
            self.endpoint, {"num1": 10, "num2": 5, "operation": "add"}, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["result"], 15)

    def test_subtract_operation(self):
        response = self.client.post(
            self.endpoint,
            {"num1": 10, "num2": 5, "operation": "subtract"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["result"], 5)

    def test_multiply_operation(self):
        response = self.client.post(
            self.endpoint,
            {"num1": 10, "num2": 5, "operation": "multiply"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["result"], 50)

    def test_divide_operation(self):
        response = self.client.post(
            self.endpoint,
            {"num1": 10, "num2": 5, "operation": "divide"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["result"], 2)

    def test_division_by_zero_returns_400(self):
        response = self.client.post(
            self.endpoint,
            {"num1": 10, "num2": 0, "operation": "divide"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("num2", response.data)

    def test_invalid_operation_returns_400(self):
        response = self.client.post(
            self.endpoint,
            {"num1": 10, "num2": 5, "operation": "mod"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_get_method_not_allowed(self):
        response = self.client.get(self.endpoint)
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)
