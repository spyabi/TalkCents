import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

type BudgetSettingProps = {
  initialBudget: number; // start with number
  onSave: (newBudget: number) => void; // parent receives numeric value
  loading: boolean;
};

export default function BudgetSetting({
  initialBudget,
  onSave,
  loading,
}: BudgetSettingProps) {
  const [budget, setBudget] = useState<string>(initialBudget.toString());

  // If parent changes initialBudget, update local state
  useEffect(() => {
    setBudget(initialBudget.toString());
  }, [initialBudget]);

  const handleSave = () => {
    const numericBudget = parseFloat(budget);
    if (isNaN(numericBudget) || numericBudget < 0) {
      alert('Please enter a valid budget amount.');
      return;
    }
    onSave(numericBudget);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Budget Setting</Text>

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder={parseFloat(budget) === 0 || budget === '' ? 'No budget set yet' : ''}
          keyboardType="numeric"
          value={parseFloat(budget) === 0 ? '' : budget}
          onChangeText={setBudget}
          editable={!loading}
        />

        <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={loading}>
          <Text style={styles.saveButtonText}>{loading ? '...' : 'Save'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#cbd5e1',
  },
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
  saveButton: {
    backgroundColor: '#000',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  saveButtonText: { color: '#fff', fontWeight: '700' },
});
