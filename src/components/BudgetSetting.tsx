import React, { useState, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useTransactions } from '../utils/TransactionsContext';

export default function BudgetSetting() {
  const { budget, updateBudget, refreshBudget } = useTransactions();
  const [localBudget, setLocalBudget] = useState<string>('');
  const [loading, setLoading] = useState(false);

  // Fetch the latest budget on mount
  useEffect(() => {
    const loadBudget = async () => {
      await refreshBudget();
    };
    loadBudget();
  }, [refreshBudget]);

  // Sync local input if context budget changes
  useEffect(() => {
    setLocalBudget(budget?.toString() || '');
    console.log('permissions MY LOCAL BUDGET', localBudget)
  }, [budget]);

  useFocusEffect(
    React.useCallback(() => {
      // Reset localBudget to the current budget whenever screen comes into focus
      setLocalBudget(budget?.toString() || '');
    }, [budget])
  );

  const handleSave = async () => {
    const numeric = parseFloat(localBudget);
    if (isNaN(numeric) || numeric < 0) {
      alert('Please enter a valid budget amount.');
      return;
    }

    try {
      setLoading(true);
      await updateBudget(numeric);
      setLoading(false);
      Alert.alert('Budget updated successfully.');
    } catch (err) {
      setLoading(false);
      console.error('Error updating budget', err);
      Alert.alert('Failed to update budget.');
    }
  };


  return (
    <View style={styles.container}>
      <Text style={styles.label}>Budget Setting</Text>
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder={budget === 0 ? 'No budget set yet' : ''}
          keyboardType="numeric"
          value={localBudget === '' ? '' : localBudget}
          onChangeText={setLocalBudget}
          editable={!loading}
        />
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          disabled={loading}
        >
          <Text style={styles.saveButtonText}>{loading ? '...' : 'Save'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}


const styles = StyleSheet.create({
  container: { paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#cbd5e1' },
  label: { fontSize: 16, marginBottom: 8 },
  inputRow: { flexDirection: 'row', alignItems: 'center' },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
  },
  saveButton: { backgroundColor: '#000', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
  saveButtonText: { color: '#fff', fontWeight: '700' },
});
