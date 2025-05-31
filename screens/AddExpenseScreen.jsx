import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Text,
  Platform,
  Alert,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const HEADER_GRADIENT = ['#1E1E1E', '#00796B'];
const BUTTON_GRADIENT = ['#00796B', '#1E1E1E'];

const categories = ['Food', 'Transport', 'Entertainment', 'Shopping', 'Other'];

const categoryIcons = {
  Food: 'restaurant',
  Transport: 'directions-car',
  Entertainment: 'local-movies',
  Shopping: 'shopping-cart',
  Other: 'category',
};

const categoryColors = {
  Food: '#E57373',       // Light Red
  Transport: '#81C784',  // Light Green
  Entertainment: '#FFB74D', // Light Orange
  Shopping: '#BA68C8',   // Light Purple
  Other: '#64B5F6',      // Light Blue
};

export default function AddExpenseScreen({ navigation, route }) {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [paymentMode, setPaymentMode] = useState('cash');
  const [isRecurring, setIsRecurring] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [expenseId, setExpenseId] = useState(null);

  useEffect(() => {
    if (route.params?.expense) {
      const expense = route.params.expense;
      setAmount(expense.amount.toString());
      setCategory(expense.category);
      setDescription(expense.description || '');
      setDate(new Date(expense.date));
      setPaymentMode(expense.paymentMode || 'cash');
      setIsRecurring(expense.isRecurring || false);
      setExpenseId(expense.id);
      setIsEditing(true);
    }
  }, [route.params]);

  const saveExpense = async () => {
    if (!amount || !category) {
      Alert.alert('Missing Fields', 'Please fill in all required fields.');
      return;
    }

    try {
      const jsonValue = await AsyncStorage.getItem('expenses');
      const expenses = jsonValue != null ? JSON.parse(jsonValue) : [];

      const expenseData = {
        id: expenseId || Date.now().toString(),
        amount: parseFloat(amount),
        category,
        description,
        date: date.toISOString(),
        paymentMode,
        isRecurring,
        createdAt: isEditing ? expenses.find(e => e.id === expenseId)?.createdAt : new Date().toISOString(),
      };

      const updatedExpenses = isEditing
        ? expenses.map(e => (e.id === expenseId ? expenseData : e))
        : [...expenses, expenseData];

      await AsyncStorage.setItem('expenses', JSON.stringify(updatedExpenses));

      Alert.alert(
        'Success! 🎉',
        `Expense ${isEditing ? 'updated' : 'added'} successfully`,
        [
          {
            text: 'OK',
            onPress: () => {
              setAmount('');
              setCategory('');
              setDescription('');
              setPaymentMode('cash');
              setIsRecurring(false);
              setDate(new Date());
              setIsEditing(false);
              setExpenseId(null);
              navigation.goBack();
            },
          },
        ],
        { cancelable: false }
      );
    } catch (e) {
      console.error('Error saving expense', e);
      Alert.alert('Error', 'Failed to save expense. Please try again.', [{ text: 'OK' }], { cancelable: false });
    }
  };

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={HEADER_GRADIENT} style={styles.headerGradient}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{isEditing ? 'Edit Expense' : 'Add New Expense'}</Text>
          <Text style={styles.headerSubtitle}>Enter expense details below</Text>
        </View>
      </LinearGradient>
      <ScrollView style={styles.scrollView}>
        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Amount (₹)</Text>
            <View style={styles.amountContainer}>
              <Text style={styles.rupeeSymbol}>₹</Text>
              <TextInput
                style={[styles.input, styles.amountInput, !amount && styles.inputError]}
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
                placeholder="0.00"
                placeholderTextColor="#666"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Category</Text>
            <View style={styles.categoryContainer}>
              {categories.map(cat => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryButton,
                    category === cat && styles.categoryButtonActive,
                    { borderColor: categoryColors[cat] },
                  ]}
                  onPress={() => setCategory(cat)}
                >
                  <MaterialIcons name={categoryIcons[cat]} size={24} color="#fff" />
                  <Text style={[styles.categoryText, category === cat && styles.categoryTextActive]}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description (Optional)</Text>
            <TextInput
              style={[styles.input, styles.descriptionInput]}
              value={description}
              onChangeText={setDescription}
              placeholder="Add note"
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Date</Text>
            <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
              <MaterialIcons name="calendar-today" size={24} color="#6C5CE7" />
              <Text style={styles.dateText}>{date.toDateString()}</Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker value={date} mode="date" display="default" onChange={onDateChange} maximumDate={new Date()} />
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Payment Mode</Text>
            <View style={styles.paymentButtons}>
              {['cash', 'card', 'upi'].map(mode => (
                <TouchableOpacity
                  key={mode}
                  style={[styles.paymentButton, paymentMode === mode && styles.paymentButtonActive]}
                  onPress={() => setPaymentMode(mode)}
                >
                  <MaterialIcons
                    name={mode === 'cash' ? 'payments' : mode === 'card' ? 'credit-card' : 'account-balance-wallet'}
                    size={24}
                    color={paymentMode === mode ? '#fff' : '#6C5CE7'}
                  />
                  <Text style={[styles.paymentText, paymentMode === mode && styles.paymentTextActive]}>
                    {mode.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity style={styles.recurringButton} onPress={() => setIsRecurring(!isRecurring)}>
            <MaterialIcons
              name={isRecurring ? 'check-box' : 'check-box-outline-blank'}
              size={24}
              color="#6C5CE7"
            />
            <Text style={styles.recurringText}>Recurring Expense</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.saveButton} onPress={saveExpense}>
            <LinearGradient colors={BUTTON_GRADIENT} style={styles.saveButtonGradient}>
              <MaterialIcons name="save" size={24} color="#FFFFFF" />
              <Text style={styles.saveButtonText}>{isEditing ? 'Update Expense' : 'Save Expense'}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  headerGradient: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 40,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 8,
  },
  scrollView: {
    flex: 1,
  },
  formContainer: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#fff',
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  rupeeSymbol: {
    fontSize: 24,
    color: '#4DB6AC',
    marginRight: 8,
    fontWeight: '600',
  },
  input: {
    fontSize: 16,
    color: '#fff',
    flex: 1,
    paddingVertical: 0,
  },
  amountInput: {
    fontSize: 24,
    fontWeight: '600',
  },
  inputError: {
    borderColor: '#FF6B6B',
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    minWidth: '48%',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  categoryButtonActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  categoryText: {
    marginLeft: 8,
    fontSize: 15,
    fontWeight: '500',
    color: '#ffffff',
  },
  descriptionInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    padding: 16,
    textAlignVertical: 'top',
    minHeight: 100,
    fontSize: 16,
    color: '#fff',
    placeholderTextColor: 'rgba(255, 255, 255, 0.5)',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  dateText: {
    color: '#fff',
    fontSize: 16,
  },
  paymentButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  paymentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    borderWidth: 1,
    borderColor: '#4DB6AC',
    borderRadius: 12,
    padding: 12,
    justifyContent: 'center',
    backgroundColor: 'rgba(77, 182, 172, 0.2)',
  },
  paymentButtonActive: {
    backgroundColor: '#4DB6AC',
    borderColor: '#4DB6AC',
  },
  paymentText: {
    marginLeft: 8,
    fontWeight: '600',
    color: '#fff',
  },
  paymentTextActive: {
    color: '#fff',
  },
  recurringButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  recurringText: {
    marginLeft: 12,
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    marginTop: 30,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  saveButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
    color: '#FFFFFF',
  },
});
