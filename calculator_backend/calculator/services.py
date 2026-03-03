from dataclasses import dataclass
from typing import Callable


OperationHandler = Callable[[float, float], float]


@dataclass(frozen=True)
class CalculatorService:
    operation_map: dict[str, OperationHandler]

    def calculate(self, num1: float, num2: float, operation: str) -> float | int:
        handler = self.operation_map.get(operation)
        if handler is None:
            raise ValueError("Unsupported operation.")
        result = handler(num1, num2)
        return int(result) if float(result).is_integer() else result


def _divide(a: float, b: float) -> float:
    if b == 0:
        raise ValueError("Division by zero is not allowed.")
    return a / b


calculator_service = CalculatorService(
    operation_map={
        "add": lambda a, b: a + b,
        "subtract": lambda a, b: a - b,
        "multiply": lambda a, b: a * b,
        "divide": _divide,
    }
)
