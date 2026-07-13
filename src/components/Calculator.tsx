import React, { useReducer } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Dimensions } from 'react-native';
import { CalculatorTheme } from '../utils/settings';

const { width } = Dimensions.get('window');

interface CalculatorProps {
  onPinCorrect: () => void;
  onLongPressC: () => void;
  alertPin?: string;
  theme?: CalculatorTheme;
}

interface CalculatorState {
  display: string;
  currentValue: string;
  operator: string | null;
  result: string | null;
}

type CalculatorAction =
  | { type: 'CLEAR' }
  | { type: 'SET_OPERATOR'; payload: string }
  | { type: 'EVALUATE'; pin: string; onPinCorrect: () => void }
  | { type: 'INPUT_DOT' }
  | { type: 'INPUT_NUMBER'; payload: string }
  | { type: 'TOGGLE_SIGN' }
  | { type: 'PERCENT' };

const initialState: CalculatorState = {
  display: '0',
  currentValue: '',
  operator: null,
  result: null,
};

const calculate = (a: string, b: string, op: string): number | string => {
  const num1 = parseFloat(a);
  const num2 = parseFloat(b);
  switch (op) {
    case '+': return num1 + num2;
    case '-': return num1 - num2;
    case 'x': return num1 * num2;
    case '÷': return num2 !== 0 ? num1 / num2 : 'Error';
    default: return num2;
  }
};

const calculatorReducer = (state: CalculatorState, action: CalculatorAction): CalculatorState => {
  switch (action.type) {
    case 'CLEAR':
      return initialState;

    case 'SET_OPERATOR': {
      const op = action.payload;
      if (state.currentValue === '') return state;
      if (state.operator && state.currentValue) {
        const res = calculate(state.result || '0', state.currentValue, state.operator);
        return {
          operator: op,
          result: String(res),
          display: String(res),
          currentValue: '',
        };
      }
      return {
        ...state,
        operator: op,
        result: state.currentValue,
        currentValue: '',
      };
    }

    case 'EVALUATE': {
      const { display, operator, result, currentValue } = state;
      if (display === action.pin) {
        action.onPinCorrect();
        return initialState;
      }
      if (operator && currentValue) {
        const res = calculate(result || '0', currentValue, operator);
        const resStr = String(res);
        return {
          display: resStr,
          result: resStr,
          operator: null,
          currentValue: resStr,
        };
      }
      return state;
    }

    case 'INPUT_DOT': {
      if (!state.currentValue.includes('.')) {
        const newValue = (state.currentValue === '' ? '0' : state.currentValue) + '.';
        return {
          ...state,
          currentValue: newValue,
          display: newValue,
        };
      }
      return state;
    }

    case 'INPUT_NUMBER': {
      const val = action.payload;
      const newValue = state.currentValue === '0' ? val : state.currentValue + val;
      return {
        ...state,
        currentValue: newValue,
        display: newValue,
      };
    }

    case 'TOGGLE_SIGN': {
      if (state.currentValue === '') return state;
      const num = parseFloat(state.currentValue);
      const newValue = String(num * -1);
      return {
        ...state,
        currentValue: newValue,
        display: newValue,
      };
    }

    case 'PERCENT': {
      if (state.currentValue === '') return state;
      const num = parseFloat(state.currentValue);
      const newValue = String(num / 100);
      return {
        ...state,
        currentValue: newValue,
        display: newValue,
      };
    }

    default:
      return state;
  }
};

const Calculator: React.FC<CalculatorProps> = ({ onPinCorrect, onLongPressC, alertPin = '1234', theme = 'ios' }) => {
  const [state, dispatch] = useReducer(calculatorReducer, initialState);

  const handlePress = (value: string) => {
    if (value === 'C') {
      dispatch({ type: 'CLEAR' });
    } else if (['+', '-', 'x', '÷'].includes(value)) {
      dispatch({ type: 'SET_OPERATOR', payload: value });
    } else if (value === '=') {
      dispatch({ type: 'EVALUATE', pin: alertPin, onPinCorrect });
    } else if (value === '.') {
      dispatch({ type: 'INPUT_DOT' });
    } else if (value === '±') {
      dispatch({ type: 'TOGGLE_SIGN' });
    } else if (value === '%') {
      dispatch({ type: 'PERCENT' });
    } else {
      dispatch({ type: 'INPUT_NUMBER', payload: value });
    }
  };

  const buttons: string[][] = [
    ['C', '±', '%', '÷'],
    ['7', '8', '9', 'x'],
    ['4', '5', '6', '-'],
    ['1', '2', '3', '+'],
    ['0', '.', '=']
  ];

  const getButtonStyles = (btn: string) => {
    const isOperator = ['+', '-', 'x', '÷', '='].includes(btn);
    const isSpecial = ['C', '±', '%'].includes(btn);
    
    let btnStyle: any = [styles.button];
    let txtStyle: any = [styles.buttonText];

    if (theme === 'samsung') {
      btnStyle.push({ borderRadius: 24, backgroundColor: '#171717' });
      txtStyle.push({ color: '#fff', fontWeight: '400' });
      
      if (isOperator) {
        if (btn === '=') {
          btnStyle.push({ backgroundColor: '#2ec150' });
          txtStyle.push({ color: '#fff' });
        } else {
          txtStyle.push({ color: '#2ec150' });
        }
      } else if (isSpecial) {
        txtStyle.push({ color: '#2ec150' });
      }
      
      if (btn === '0') {
        btnStyle.push(styles.zeroButton);
      }
    } 
    else if (theme === 'xiaomi') {
      btnStyle.push({ borderRadius: 12, backgroundColor: '#1c1c1e' });
      txtStyle.push({ color: '#fff', fontWeight: '300' });

      if (isOperator) {
        if (btn === '=') {
          btnStyle.push({ backgroundColor: '#ff6b00' });
          txtStyle.push({ color: '#fff' });
        } else {
          txtStyle.push({ color: '#ff6b00' });
        }
      } else if (isSpecial) {
        txtStyle.push({ color: '#a5a5a5' });
      }

      if (btn === '0') {
        btnStyle.push(styles.zeroButton);
      }
    } 
    else {
      // Default: iOS
      btnStyle.push(isOperator ? styles.operatorButton : styles.numberButton);
      if (isSpecial) {
        btnStyle.push(styles.specialButton);
        txtStyle.push(styles.specialButtonText);
      }
      if (btn === '0') {
        btnStyle.push(styles.zeroButton);
      }
    }

    return { btnStyle, txtStyle };
  };

  return (
    <View style={styles.container}>
      <View style={styles.displayContainer}>
        <Text style={styles.display} numberOfLines={1} adjustsFontSizeToFit>{state.display}</Text>
      </View>
      <View style={styles.buttonsContainer}>
        {buttons.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            {row.map((btn) => {
              const { btnStyle, txtStyle } = getButtonStyles(btn);
              return (
                <TouchableOpacity
                  key={btn}
                  style={btnStyle}
                  onPress={() => handlePress(btn)}
                  onLongPress={btn === 'C' ? onLongPressC : undefined}
                  delayLongPress={2000}
                  activeOpacity={0.7}
                >
                  <Text style={txtStyle}>{btn}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'flex-end',
    paddingBottom: 40,
  },
  displayContainer: {
    padding: 30,
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    minHeight: 150,
  },
  display: {
    color: '#fff',
    fontSize: 80,
    fontWeight: '200',
  },
  buttonsContainer: {
    paddingHorizontal: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  button: {
    width: width / 5,
    height: width / 5,
    borderRadius: width / 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#333',
  },
  numberButton: {
    backgroundColor: '#333',
  },
  operatorButton: {
    backgroundColor: '#f09a36',
  },
  specialButton: {
    backgroundColor: '#a5a5a5',
  },
  zeroButton: {
    width: width / 2.2,
    alignItems: 'flex-start',
    paddingLeft: 30,
  },
  buttonText: {
    fontSize: 32,
    color: '#fff',
    fontWeight: '400',
  },
  specialButtonText: {
    color: '#000',
  },
});

export default Calculator;
