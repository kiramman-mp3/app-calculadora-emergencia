import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

interface CalculatorProps {
  onPinCorrect: () => void;
  onLongPressC: () => void;
}

const Calculator: React.FC<CalculatorProps> = ({ onPinCorrect, onLongPressC }) => {
  const [display, setDisplay] = useState<string>('0');
  const [currentValue, setCurrentValue] = useState<string>('');
  const [operator, setOperator] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);

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

  const handlePress = (value: string) => {
    if (value === 'C') {
      setDisplay('0');
      setCurrentValue('');
      setOperator(null);
      setResult(null);
    } else if (['+', '-', 'x', '÷'].includes(value)) {
      if (currentValue === '') return;
      if (operator && currentValue) {
        const res = calculate(result || '0', currentValue, operator);
        setResult(String(res));
        setDisplay(String(res));
      } else {
        setResult(currentValue);
      }
      setOperator(value);
      setCurrentValue('');
    } else if (value === '=') {
      if (display === '1234') {
        onPinCorrect();
        setDisplay('0');
        setCurrentValue('');
        return;
      }
      if (operator && currentValue) {
        const res = calculate(result || '0', currentValue, operator);
        const resStr = String(res);
        setDisplay(resStr);
        setResult(resStr);
        setOperator(null);
        setCurrentValue(resStr);
      }
    } else if (value === '.') {
      if (!currentValue.includes('.')) {
        const newValue = (currentValue === '' ? '0' : currentValue) + '.';
        setCurrentValue(newValue);
        setDisplay(newValue);
      }
    } else {
      const newValue = currentValue === '0' ? value : currentValue + value;
      setCurrentValue(newValue);
      setDisplay(newValue);
    }
  };

  const buttons: string[][] = [
    ['C', '±', '%', '÷'],
    ['7', '8', '9', 'x'],
    ['4', '5', '6', '-'],
    ['1', '2', '3', '+'],
    ['0', '.', '=']
  ];

  return (
    <View style={styles.container}>
      <View style={styles.displayContainer}>
        <Text style={styles.display} numberOfLines={1} adjustsFontSizeToFit>{display}</Text>
      </View>
      <View style={styles.buttonsContainer}>
        {buttons.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            {row.map((btn) => (
              <TouchableOpacity
                key={btn}
                style={[
                    styles.button, 
                    ['+', '-', 'x', '÷', '='].includes(btn) ? styles.operatorButton : styles.numberButton,
                    ['C', '±', '%'].includes(btn) ? styles.specialButton : null,
                    btn === '0' ? styles.zeroButton : null
                ]}
                onPress={() => handlePress(btn)}
                onLongPress={btn === 'C' ? onLongPressC : undefined}
                delayLongPress={2000}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.buttonText,
                  ['C', '±', '%'].includes(btn) ? styles.specialButtonText : null
                ]}>{btn}</Text>
              </TouchableOpacity>
            ))}
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
