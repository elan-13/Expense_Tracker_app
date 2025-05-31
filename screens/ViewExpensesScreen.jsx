import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  StatusBar,
  Platform,
  BackHandler,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { PieChart } from 'react-native-chart-kit';
import { Picker } from '@react-native-picker/picker';
import { FloatingAction } from 'react-native-floating-action';

const screenWidth = Dimensions.get('window').width;

const HEADER_GRADIENT = ['#1E1E1E', '#00796B'];
const BUTTON_GRADIENT = ['#00796B', '#1E1E1E'];

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

const monthNames = [
  'January', 'February', 'March', 'April',
  'May', 'June', 'July', 'August',
  'September', 'October', 'November', 'December'
];

const chartConfig = {
  backgroundGradientFrom: '#2D1B69',
  backgroundGradientTo: '#1E1E1E',
  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`, // Changed to black
  strokeWidth: 2,
  barPercentage: 0.5,
  useShadowColorFromDataset: false,
  decimalPlaces: 0,
  style: {
    borderRadius: 16,
  },
  propsForLabels: {
    fontSize: 20, // Increased size
    fontWeight: 'bold',
    fill: '#000', // Changed to black
  },
};

export default function ViewExpensesScreen({ navigation }) {
  const [expenses, setExpenses] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);
  const [monthlyTotal, setMonthlyTotal] = useState(0);
  const [isAlertVisible, setIsAlertVisible] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [years, setYears] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    const currentYear = new Date().getFullYear();
    setYears(Array.from({ length: 5 }, (_, i) => currentYear - i));
  }, []);

  const loadExpenses = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('expenses');
      const loadedExpenses = jsonValue != null ? JSON.parse(jsonValue) : [];
      const sorted = loadedExpenses.sort((a, b) => new Date(b.date) - new Date(a.date));
      setExpenses(sorted);
      calculateTotals(sorted);
    } catch (e) {
      console.error('Error loading expenses', e);
      Alert.alert('Error', 'Failed to load expenses');
    }
  };

  const calculateTotals = (expenseList) => {
    const total = expenseList.reduce((sum, expense) => sum + expense.amount, 0);
    setTotalAmount(total);

    const monthlyExpenses = expenseList.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getMonth() === selectedMonth && 
             expenseDate.getFullYear() === selectedYear;
    });
    
    const monthTotal = monthlyExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    setMonthlyTotal(monthTotal);
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', loadExpenses);
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    loadExpenses();
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (isAlertVisible) {
        setIsAlertVisible(false);
        return true;
      }
      return false;
    });
    return () => backHandler.remove();
  }, [isAlertVisible]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadExpenses();
    setRefreshing(false);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const handleEditExpense = (expense) => {
    navigation.navigate('AddExpense', { expense, isEditing: true });
  };

  const handleDeleteExpense = async (expense) => {
    Alert.alert(
      'Delete Expense',
      'Are you sure you want to delete this expense?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const updatedExpenses = expenses.filter(e => e.id !== expense.id);
              await AsyncStorage.setItem('expenses', JSON.stringify(updatedExpenses));
              loadExpenses();
              Alert.alert('Success', 'Expense deleted successfully');
            } catch (e) {
              console.error('Error deleting expense', e);
              Alert.alert('Error', 'Failed to delete expense');
            }
          },
        },
      ]
    );
  };

  const filteredExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    return expenseDate.getMonth() === selectedMonth && 
           expenseDate.getFullYear() === selectedYear;
  });

  // Update the createPieData function
  const createPieData = (expenses) => {
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    return Object.entries(categoryColors)
      .map(([category, color]) => {
        const total = expenses
          .filter(expense => expense.category === category)
          .reduce((sum, expense) => sum + expense.amount, 0);
        
        const percentage = totalExpenses > 0 ? ((total / totalExpenses) * 100).toFixed(0) : 0;
        
        return {
          name: `${category} (${percentage}%)`, // Add percentage to name
          population: total,
          color,
          legendFontColor: '#fff',
          legendFontSize: 12,
        };
      })
      .filter(item => item.population > 0);
  };

  const handleCategoryPress = (category) => {
    const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const categoryExpenses = filteredExpenses
      .filter(expense => expense.category === category)
      .reduce((sum, expense) => sum + expense.amount, 0);
    
    const percentage = ((categoryExpenses / totalExpenses) * 100).toFixed(0);
    
    Alert.alert(
      category,
      `${category} represents ${percentage}% of your expenses\nTotal: ₹${categoryExpenses.toFixed(2)}`,
      [{ text: 'OK', onPress: () => setSelectedCategory(null) }]
    );
  };

  const renderHeader = () => (
    <View>
      <LinearGradient 
        colors={HEADER_GRADIENT} 
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>View Expenses</Text>
          <Text style={styles.headerSubtitle}>Manage your expenses wisely</Text>
        </View>
        <View style={styles.headerContent}>
          <View style={styles.totalContainer}>
            <View>
              <Text style={styles.totalLabel}>Monthly Total</Text>
              <Text style={styles.monthlyAmount}>₹{monthlyTotal.toFixed(2)}</Text>
            </View>
            <View>
              <Text style={styles.totalLabel}>All Time</Text>
              <Text style={styles.totalAmount}>₹{totalAmount.toFixed(2)}</Text>
            </View>
          </View>

          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedMonth}
              style={styles.picker}
              dropdownIconColor="#000"
              onValueChange={setSelectedMonth}
            >
              {monthNames.map((month, index) => (
                <Picker.Item 
                  key={month} 
                  label={month} 
                  value={index} 
                  color="#000"  // Changed to black
                  style={{backgroundColor: '#fff'}}  // Added white background
                />
              ))}
            </Picker>
            <Picker
              selectedValue={selectedYear}
              style={styles.picker}
              dropdownIconColor="#000"
              onValueChange={setSelectedYear}
            >
              {years.map(year => (
                <Picker.Item 
                  key={year} 
                  label={year.toString()} 
                  value={year}
                  color="#000"  // Changed to black
                  style={{backgroundColor: '#fff'}}  // Added white background
                />
              ))}
            </Picker>
          </View>

          <View style={styles.chartContainer}>
            {filteredExpenses.length > 0 ? (
              <PieChart
                data={createPieData(filteredExpenses)}
                width={screenWidth - 32}
                height={220}
                chartConfig={{
                  ...chartConfig,
                  formatLabel: (value, name) => name, // Show the full name with percentage
                }}
                accessor="population"
                backgroundColor="transparent"
                paddingLeft="15"
                center={[10, 0]}
                absolute
                hasLegend={true}
                formatLabel={() => ''} // Hide labels inside pie segments
                labelStyle={{
                  display: 'none' // This ensures no labels are shown inside the chart
                }}
                onPress={(index) => {
                  const data = createPieData(filteredExpenses);
                  if (data[index]) {
                    handleCategoryPress(data[index].name);
                  }
                }}
              />
            ) : (
              <Text style={styles.noDataText}>
                No expenses for this period
              </Text>
            )}
          </View>
        </View>
      </LinearGradient>
    </View>
  );

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.expenseItem,
        { borderLeftColor: categoryColors[item.category] }
      ]}
      onPress={() => handleEditExpense(item)}
      onLongPress={() => {
        setIsAlertVisible(true);
        Alert.alert(
          'Expense Options',
          'What would you like to do?',
          [
            {
              text: 'Edit',
              onPress: () => {
                setIsAlertVisible(false);
                handleEditExpense(item);
              },
            },
            {
              text: 'Delete',
              style: 'destructive',
              onPress: () => {
                setIsAlertVisible(false);
                handleDeleteExpense(item);
              },
            },
            {
              text: 'Cancel',
              style: 'cancel',
              onPress: () => setIsAlertVisible(false),
            },
          ],
          { onDismiss: () => setIsAlertVisible(false) }
        );
      }}
    >
      <View style={styles.expenseMain}>
        <View style={styles.categoryContainer}>
          <View 
            style={[
              styles.iconContainer,
              { backgroundColor: categoryColors[item.category] }
            ]}
          >
            <MaterialIcons
              name={categoryIcons[item.category] || 'help-outline'}
              size={24}
              color="white"
            />
          </View>
          <View>
            <Text style={styles.category}>{item.category}</Text>
            <Text style={styles.date}>{formatDate(item.date)}</Text>
          </View>
        </View>
        <Text style={styles.amount}>₹{item.amount.toFixed(2)}</Text>
      </View>
      {item.description && (
        <Text style={styles.description}>{item.description}</Text>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={{ flex: 1 }}>
        <FlatList
          ListHeaderComponent={renderHeader}
          data={filteredExpenses}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh}
              tintColor="#4DB6AC"
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialIcons 
                name="receipt-long" 
                size={64} 
                color="#4DB6AC"
              />
              <Text style={styles.emptyText}>
                No expenses found
              </Text>
              <Text style={styles.emptySubText}>
                Tap + to add
              </Text>
            </View>
          }
        />

        <FloatingAction
          actions={[]}
          onPressMain={() => navigation.navigate('AddExpense')}
          position="right"
          distanceToEdge={{
            vertical: 32,
            horizontal: 24,
          }}
          floatingIcon={<MaterialIcons name="add" size={32} color="#FFFFFF" />}
          buttonSize={72}
          color="#00796B"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  headerGradient: {
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  headerContent: {
    paddingHorizontal: 20,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    padding: 16,
    marginTop: 16,
  },
  totalLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
    fontWeight: '500',
  },
  totalAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  monthlyAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  pickerContainer: {
    flexDirection: 'row',
    marginTop: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
  },
  picker: {
    flex: 1,
    height: 48,
    color: '#000',
    backgroundColor: '#fff',
  },
  chartContainer: {
    height: 250,
    marginTop: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  expenseItem: {
    backgroundColor: 'rgba(30, 30, 30, 0.8)', // Changed to a semi-transparent dark gray
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    borderLeftWidth: 4,
  },
  expenseMain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  category: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  date: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  amount: {
    fontSize: 20,
    fontWeight: '700',
    color: '#4DB6AC',
  },
  description: {
    marginTop: 8,
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    paddingLeft: 64,
  },
  emptyContainer: {
    flex: 1,
    marginTop: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 20,
    fontSize: 22,
    color: '#4DB6AC',
    fontWeight: '700',
  },
  emptySubText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 4,
  },
  noDataText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 80,
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
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 4,
  },
  header: {
    paddingBottom: 20,
  },
});
