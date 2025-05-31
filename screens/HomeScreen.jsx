import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
  ImageBackground,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const HEADER_GRADIENT = ['#1E1E1E', '#00796B'];
const BUTTON_GRADIENT = ['#00796B', '#1E1E1E'];

export default function HomeScreen({ navigation }) {
  const menuItems = [
    {
      title: 'View Expenses',
      icon: 'account-balance-wallet',
      screen: 'ViewExpenses',
      description: 'See your spending',
    },
    {
      title: 'Add Expense',
      icon: 'add-circle',
      screen: 'AddExpense',
      description: 'Add new spending',
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={HEADER_GRADIENT}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Expense Tracker</Text>
          <Text style={styles.headerSubtitle}>Manage your expenses wisely</Text>
        </View>
      </LinearGradient>

      <View style={styles.descriptionContainer}>
        <Text style={styles.appDescription}>
          Easily track and manage your daily expenses to stay on top of your finances.
        </Text>
      </View>

      <View style={styles.menuContainer}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={item.screen}
            style={[
              styles.menuItem,
              { marginTop: index === 0 ? 20 : 16 }
            ]}
            onPress={() => navigation.navigate(item.screen)}
          >
            <LinearGradient
              colors={BUTTON_GRADIENT}
              style={styles.menuGradient}
            >
              <MaterialIcons name={item.icon} size={32} color="#4DB6AC" />
              <View style={styles.menuTextContainer}>
                <Text style={styles.menuTitle}>{item.title}</Text>
                <Text style={styles.menuDescription}>{item.description}</Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color="#4DB6AC" />
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.aboutContainer}>
        <Text style={styles.aboutTitle}>Why Track Expenses?</Text>
        <Text style={styles.aboutText}>
          Using an expense tracker helps you understand where your money goes, identify saving opportunities, stick to a budget, and achieve your financial goals.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1E1E',
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
  },
  headerTitle: {
    fontSize: 32,
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
  descriptionContainer: {
    paddingHorizontal: 20,
    marginTop: 24,
    marginBottom: 12,
  },
  appDescription: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
  menuContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  menuItem: {
    borderRadius: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    overflow: 'hidden',
    marginBottom: 16,
  },
  menuGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 20,
  },
  menuTextContainer: {
    flex: 1,
    marginLeft: 16,
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  menuDescription: {
    fontSize: 14,
    color: '#4DB6AC',
    marginTop: 4,
  },
  aboutContainer: {
    paddingHorizontal: 20,
    marginTop: 24,
    marginBottom: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
  },
  aboutTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4DB6AC',
    marginBottom: 8,
    textAlign: 'center',
  },
  aboutText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 20,
  },
});