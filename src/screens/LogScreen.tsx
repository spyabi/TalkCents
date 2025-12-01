import React, { useState, useCallback } from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useRoute, RouteProp } from '@react-navigation/native';
import { AuthStackParamList } from '../navigation/AppStack';
import { useTransactions, Transaction } from '../utils/TransactionsContext';
import FloatingButton from '../components/FloatingButton';

type Props = NativeStackScreenProps<AuthStackParamList, 'Log'>;

export default function LogScreen({ navigation }: Props) {
  const today = new Date();

  const { transactions, deleteTransaction, refreshTransactions } =
    useTransactions();

  useFocusEffect(
    useCallback(() => {
      refreshTransactions();
    }, [refreshTransactions]),
  );

  const handleDelete = (id: string) => {
    Alert.alert(
      'Delete Entry',
      'Are you sure you want to delete this transaction?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteTransaction(id),
        },
      ],
    );
  };

  //  MONTH LOGIC
  const [selectedMonth, setSelectedMonth] = useState<number>(today.getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(today.getFullYear());

  const goPrevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(prev => prev - 1);
    } else {
      setSelectedMonth(prev => prev - 1);
    }
  };

  const goNextMonth = () => {
    const now = new Date();
    const isSameYear = selectedYear === now.getFullYear();
    const isLastMonth = selectedMonth >= now.getMonth();
    if (isSameYear && isLastMonth) return;
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(prev => prev + 1);
    } else {
      setSelectedMonth(prev => prev + 1);
    }
  };

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const formatMoney = (n: number) =>
  Number.isFinite(n) ? n.toFixed(2) : '0.00';

  const monthLabel = `${monthNames[selectedMonth]} ${selectedYear}`;

  type LogScreenRouteProp = RouteProp<AuthStackParamList, 'Log'>;
  const route = useRoute<LogScreenRouteProp>();
  React.useEffect(() => {
    const recent = route.params?.recentDate;

    if (recent) {
      const d = new Date(recent);
      setSelectedMonth(d.getMonth());
      setSelectedYear(d.getFullYear());
    }
  }, [route.params?.recentDate]);

  //  FILTER LOGIC
  const filtered = transactions.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
  });

 const rawExpense = filtered
  .filter(t => t.type === 'Expense')
  .reduce((sum, t) => sum + Number(t.amount), 0);

const rawIncome = filtered
  .filter(t => t.type === 'Income')
  .reduce((sum, t) => sum + Number(t.amount), 0);

// round to 2 dp to avoid 2971.6800000000003
const totalExpense = Math.round(rawExpense * 100) / 100;
const totalIncome = Math.round(rawIncome * 100) / 100;
const balance = Math.round((totalIncome - totalExpense) * 100) / 100;

  //  GROUPING
  const grouped = filtered.reduce((acc: Record<string, Transaction[]>, t) => {
    const d = new Date(t.date);
    const dateKey = d.toDateString();

    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(t);

    return acc;
  }, {});

  const sortedDates = Object.keys(grouped).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime(),
  );

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* TITLE */}
        <View style={styles.titleRow}>
          <Text style={styles.titleText}>Log</Text>
        </View>

        {/* MONTH SELECTOR */}
        <View style={styles.monthRow}>
          <TouchableOpacity onPress={goPrevMonth}>
            <Icon name="chevron-back" size={24} />
          </TouchableOpacity>

          <Text style={styles.monthText}>{monthLabel}</Text>

          <TouchableOpacity onPress={goNextMonth}>
            <Icon name="chevron-forward" size={24} />
          </TouchableOpacity>
        </View>

        {/* SUMMARY CARD */}
        <View style={styles.summaryCard}>
  <View style={styles.summaryRow}>
    <View>
      <Text style={styles.summaryLabel}>Expense</Text>
      <Text style={styles.expenseValue}>
        ${formatMoney(totalExpense)}
      </Text>
    </View>

    <View>
      <Text style={styles.summaryLabel}>Income</Text>
      <Text style={styles.incomeValue}>
        ${formatMoney(totalIncome)}
      </Text>
    </View>

    <View>
      <Text style={styles.summaryLabel}>Balance</Text>
      <Text style={styles.balanceValue}>
        ${formatMoney(balance)}
      </Text>
    </View>
  </View>
</View>

        {/* GROUPED LIST */}
        {filtered.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No transactions this month.</Text>
          </View>
        ) : (
          <View style={styles.monthContainer}>
            {sortedDates.map(date => {
              const items = grouped[date];
              const d = new Date(date);

              return (
                <View key={date} style={styles.groupContainer}>
                  <Text style={styles.groupHeader}>
                    {d.toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </Text>

                  {items.map(item => (
                    <View key={item.id} style={styles.card}>
                      <View style={styles.cardLeft}>
                        <Text style={styles.cardTitle}>{item.name}</Text>
                        <Text style={styles.cardCategory}>{item.category}</Text>
                      </View>

                      <View style={styles.cardRight}>
                        <Text
                          style={[
                            item.type === 'Income'
                              ? styles.incomeValue
                              : styles.expenseValue,
                          ]}
                        >
                          ${item.amount}
                        </Text>

                        <TouchableOpacity
                          onPress={() =>
                            navigation.navigate('ManualEntry', { item })
                          }
                        >
                          <Icon
                            name="pencil"
                            size={20}
                            style={styles.editIcon}
                          />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleDelete(item.id)}>
                          <Icon
                            name="trash"
                            size={20}
                            color="red"
                            style={styles.deleteIcon}
                          />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* ADD BUTTON */}
      {/* <TouchableOpacity
        onPress={() => navigation.navigate("ManualEntry", {item: null})}
        style={styles.addButton}
      >
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity> */}
      <FloatingButton />
    </View>
  );
}

//  STYLES
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },

  scrollContent: { padding: 20, paddingBottom: 120 },

  titleRow: {
    paddingTop: 50,
    marginBottom: 10,
  },

  titleText: {
    fontSize: 32,
    fontWeight: '700',
  },

  monthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    justifyContent: 'center',
    gap: 15,
  },

  monthText: {
    fontSize: 20,
    fontWeight: '700',
  },

  summaryCard: {
    backgroundColor: '#D4EFF3',
    padding: 25,
    borderRadius: 20,
    marginBottom: 25,
  },

  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },

  summaryLabel: { fontSize: 20, fontWeight: '700' },
  expenseValue: { color: 'red', fontSize: 22, fontWeight: '600' },
  incomeValue: { color: 'green', fontSize: 22, fontWeight: '600' },
  balanceValue: { color: 'black', fontSize: 22, fontWeight: '600' },

  groupContainer: {
    backgroundColor: '#D4EFF3',
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginBottom: 20,
    overflow: 'hidden',
  },

  groupHeader: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 10, // reduced from 15
  },

  card: {
    backgroundColor: 'white',
    padding: 14,
    borderRadius: 15,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    overflow: 'hidden',
  },

  cardTitle: { fontSize: 16, fontWeight: '600' },
  cardCategory: { color: 'gray', fontSize: 12 },

  cardRight: { flexDirection: 'row', alignItems: 'center' },
  cardLeft: { flex: 1 },
  editIcon: { marginLeft: 10 },
  deleteIcon: { marginLeft: 20 },

  addButton: {
    position: 'absolute',
    right: 25,
    bottom: 30,
    backgroundColor: 'black',
    borderRadius: 40,
    width: 70,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
  },

  addButtonText: {
    fontSize: 40,
    color: 'white',
    marginTop: -4,
  },
  monthContainer: {
    backgroundColor: '#D4EFF3',
    paddingVertical: 20,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginBottom: 30,
  },

  emptyContainer: {
    paddingTop: 40,
    paddingBottom: 120,
    alignItems: 'center',
  },

  emptyText: {
    fontSize: 16,
    color: '#777',
    fontStyle: 'italic',
  },
});
