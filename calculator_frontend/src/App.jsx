import { useCallback, useEffect, useMemo, useState } from 'react'
import CalculatorButton from './components/CalculatorButton'
import { calculate } from './api/calculatorApi'
import { formatNumber } from './utils/formatters'

const operatorMap = {
  '+': 'add',
  '-': 'subtract',
  '*': 'multiply',
  '/': 'divide',
}

const operatorLabelMap = {
  add: '+',
  subtract: '-',
  multiply: '×',
  divide: '÷',
}

function App() {
  const [display, setDisplay] = useState('0')
  const [firstOperand, setFirstOperand] = useState(null)
  const [pendingOperation, setPendingOperation] = useState(null)
  const [isTypingSecondOperand, setIsTypingSecondOperand] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const topStatus = useMemo(() => {
    if (isLoading) {
      return 'Calculating...'
    }
    if (errorMessage) {
      return 'API Error'
    }
    if (pendingOperation && firstOperand !== null) {
      return `${formatNumber(firstOperand)} ${operatorLabelMap[pendingOperation]}`
    }
    return 'Ready'
  }, [errorMessage, firstOperand, isLoading, pendingOperation])

  const resetCalculator = useCallback(() => {
    setDisplay('0')
    setFirstOperand(null)
    setPendingOperation(null)
    setIsTypingSecondOperand(false)
    setErrorMessage('')
  }, [])

  const normalizeApiError = (error) => {
    const responseData = error?.response?.data
    if (!responseData) {
      return 'Service unavailable'
    }
    if (typeof responseData === 'string') {
      return responseData
    }
    if (responseData.detail) {
      return responseData.detail
    }
    const firstError = Object.values(responseData)[0]
    return Array.isArray(firstError) ? firstError[0] : 'Invalid request'
  }

  const runCalculation = useCallback(
    async (leftValue, rightValue, operationName) => {
      setErrorMessage('')
      setIsLoading(true)
      try {
        const response = await calculate({
          num1: leftValue,
          num2: rightValue,
          operation: operationName,
        })
        return Number(response.result)
      } catch (error) {
        const message = normalizeApiError(error)
        setErrorMessage(message)
        setDisplay(message)
        return null
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  const appendDigit = useCallback(
    (digit) => {
      if (isLoading) {
        return
      }

      if (errorMessage) {
        setErrorMessage('')
        setDisplay(digit === '.' ? '0.' : digit)
        setFirstOperand(null)
        setPendingOperation(null)
        setIsTypingSecondOperand(false)
        return
      }

      if (isTypingSecondOperand) {
        const nextValue = digit === '.' ? '0.' : digit
        setDisplay(nextValue)
        setIsTypingSecondOperand(false)
        return
      }

      if (digit === '.') {
        if (display.includes('.')) {
          return
        }
        setDisplay(`${display}.`)
        return
      }

      setDisplay(display === '0' ? digit : `${display}${digit}`)
    },
    [display, errorMessage, isLoading, isTypingSecondOperand]
  )

  const calculateAndApply = useCallback(
    async (nextOperation = null) => {
      if (pendingOperation === null || firstOperand === null || isTypingSecondOperand) {
        if (nextOperation) {
          setPendingOperation(nextOperation)
          setIsTypingSecondOperand(true)
        }
        return
      }

      const secondOperand = Number(display)
      const result = await runCalculation(firstOperand, secondOperand, pendingOperation)
      if (result === null) {
        return
      }

      const resultText = formatNumber(result)
      setDisplay(resultText)

      if (nextOperation) {
        setFirstOperand(result)
        setPendingOperation(nextOperation)
        setIsTypingSecondOperand(true)
      } else {
        setFirstOperand(null)
        setPendingOperation(null)
        setIsTypingSecondOperand(true)
      }
    },
    [display, firstOperand, isTypingSecondOperand, pendingOperation, runCalculation]
  )

  const setOperator = useCallback(
    async (operationName) => {
      if (isLoading) {
        return
      }

      if (errorMessage) {
        resetCalculator()
        return
      }

      const currentValue = Number(display)
      if (Number.isNaN(currentValue)) {
        return
      }

      if (firstOperand === null) {
        setFirstOperand(currentValue)
        setPendingOperation(operationName)
        setIsTypingSecondOperand(true)
        return
      }

      if (isTypingSecondOperand) {
        setPendingOperation(operationName)
        return
      }

      await calculateAndApply(operationName)
    },
    [
      calculateAndApply,
      display,
      errorMessage,
      firstOperand,
      isLoading,
      isTypingSecondOperand,
      resetCalculator,
    ]
  )

  const handleEquals = useCallback(async () => {
    if (isLoading) {
      return
    }
    await calculateAndApply()
  }, [calculateAndApply, isLoading])

  const handleBackspace = useCallback(() => {
    if (isLoading || isTypingSecondOperand || errorMessage) {
      return
    }
    if (display.length === 1) {
      setDisplay('0')
      return
    }
    setDisplay(display.slice(0, -1))
  }, [display, errorMessage, isLoading, isTypingSecondOperand])

  useEffect(() => {
    const handleKeyboardInput = (event) => {
      const { key } = event

      if ((key >= '0' && key <= '9') || key === '.') {
        event.preventDefault()
        appendDigit(key)
        return
      }

      if (key in operatorMap) {
        event.preventDefault()
        setOperator(operatorMap[key])
        return
      }

      if (key.toLowerCase() === 'x') {
        event.preventDefault()
        setOperator('multiply')
        return
      }

      if (key === 'Enter' || key === '=') {
        event.preventDefault()
        handleEquals()
        return
      }

      if (key === 'Backspace') {
        event.preventDefault()
        handleBackspace()
        return
      }

      if (key === 'Escape' || key.toLowerCase() === 'c') {
        event.preventDefault()
        resetCalculator()
      }
    }

    window.addEventListener('keydown', handleKeyboardInput)
    return () => window.removeEventListener('keydown', handleKeyboardInput)
  }, [appendDigit, handleBackspace, handleEquals, resetCalculator, setOperator])

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <section className="animate-reveal w-full max-w-sm rounded-3xl border border-slate-600/40 bg-panel/80 p-5 shadow-soft backdrop-blur md:p-6">
        <header className="mb-4">
          <h1 className="mb-2 text-center text-lg font-semibold tracking-wide text-cyan-300">
            Manikya
          </h1>
          <p className="mb-2 text-xs uppercase tracking-[0.2em] text-slate-400">
            {topStatus}
          </p>
          <div
            className={`min-h-24 rounded-2xl border border-slate-600/40 bg-screen px-4 py-5 text-right text-3xl font-bold md:text-4xl ${errorMessage ? 'text-rose-400' : 'text-slate-50'}`}
          >
            <span className="break-words">{isLoading ? 'Calculating...' : display}</span>
          </div>
        </header>

        <div className="grid grid-cols-4 gap-3">
          <CalculatorButton
            label="C"
            variant="action"
            onClick={resetCalculator}
            title="Clear"
          />
          <CalculatorButton
            label="⌫"
            variant="action"
            onClick={handleBackspace}
            title="Backspace"
          />
          <CalculatorButton
            label="÷"
            variant="operator"
            onClick={() => setOperator('divide')}
            title="Divide"
          />
          <CalculatorButton
            label="×"
            variant="operator"
            onClick={() => setOperator('multiply')}
            title="Multiply"
          />

          <CalculatorButton label="7" onClick={() => appendDigit('7')} />
          <CalculatorButton label="8" onClick={() => appendDigit('8')} />
          <CalculatorButton label="9" onClick={() => appendDigit('9')} />
          <CalculatorButton
            label="-"
            variant="operator"
            onClick={() => setOperator('subtract')}
            title="Subtract"
          />

          <CalculatorButton label="4" onClick={() => appendDigit('4')} />
          <CalculatorButton label="5" onClick={() => appendDigit('5')} />
          <CalculatorButton label="6" onClick={() => appendDigit('6')} />
          <CalculatorButton
            label="+"
            variant="operator"
            onClick={() => setOperator('add')}
            title="Add"
          />

          <CalculatorButton label="1" onClick={() => appendDigit('1')} />
          <CalculatorButton label="2" onClick={() => appendDigit('2')} />
          <CalculatorButton label="3" onClick={() => appendDigit('3')} />
          <CalculatorButton
            label="="
            variant="equals"
            className="row-span-2 h-full"
            onClick={handleEquals}
            title="Equals"
          />

          <CalculatorButton
            label="0"
            className="col-span-2"
            onClick={() => appendDigit('0')}
          />
          <CalculatorButton label="." onClick={() => appendDigit('.')} />
        </div>
      </section>
    </main>
  )
}

export default App
