import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/HomeScreen';
import AddExpenseScreen from '../screens/AddExpenseScreen';
import ViewExpensesScreen from '../screens/ViewExpensesScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
      <Stack.Navigator 
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#2E7D32',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ 
            title: 'Expense Tracker',
            headerShown: false 
          }}
        />
        <Stack.Screen
          name="ViewExpenses"
          component={ViewExpensesScreen}
          options={{ 
            title: 'Expenses',
            headerStyle: {
              backgroundColor: '#000000',
            },
            headerTintColor: '#FFFFFF',
          }}
        />
        <Stack.Screen
          name="AddExpense"
          component={AddExpenseScreen}
          options={({ route }) => ({
            title: route.params?.isEditing ? 'Edit Expense' : 'Add Expense',
            headerStyle: {
              backgroundColor: '#000000',
            },
            headerTintColor: '#FFFFFF',
          })}
        />
      </Stack.Navigator>
  );
}
