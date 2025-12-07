// screens/CategoryEditor.tsx
import React, { useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput,
  TouchableOpacity, Alert, KeyboardAvoidingView, Platform
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

type Mode = 'income' | 'expense';

/** Match your navigator’s route declaration:
 *  CategoryEditor: { type: 'income' | 'expense' }
 */
type RootStackParamList = {
  CategoryEditor: { type: Mode };
};

type Props = NativeStackScreenProps<RootStackParamList, 'CategoryEditor'>;

export default function CategoryEditor({ route }: Props) {
  const type = route.params?.type ?? 'expense';

  // In-memory state (NO AsyncStorage)
  const [income, setIncome] = useState<string[]>([]);
  const [expense, setExpense] = useState<string[]>([]);
  const [input, setInput] = useState('');

  const items = type === 'income' ? income : expense;
  const setItems = type === 'income' ? setIncome : setExpense;

  const title = useMemo(
    () => (type === 'income' ? 'Income Categories' : 'Expense Categories'),
    [type]
  );

  const add = () => {
    const name = input.trim();
    if (!name) return;
    if (items.some(i => i.toLowerCase() === name.toLowerCase())) {
      Alert.alert('Duplicate', `"${name}" already exists.`);
      return;
    }
    setItems([...items, name]);
    setInput('');
  };

  const remove = (name: string) => {
    Alert.alert('Delete', `Remove "${name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => {
          setItems(items.filter(i => i !== name));
        }
      }
    ]);
  };

  const Content = (
    <View style={styles.root}>
      <Text style={styles.title}>{title}</Text>

      <View style={styles.inputRow}>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Add a category..."
          placeholderTextColor="#94a3b8"
          style={styles.input}
          onSubmitEditing={add}
          returnKeyType="done"
        />
        <TouchableOpacity style={styles.addBtn} onPress={add} activeOpacity={0.8}>
          <Text style={styles.addTxt}>＋</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={items}
        keyExtractor={(name) => name}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={styles.rowLabel}>{item}</Text>
            <TouchableOpacity onPress={() => remove(item)} style={styles.delBtn}>
              <Text style={styles.delTxt}>−</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>No {type} categories yet. Add one above.</Text>
        }
        contentContainerStyle={{ paddingTop: 8, paddingBottom: 20 }}
      />
    </View>
  );

  // Keep the text field visible on iOS when keyboard opens
  if (Platform.OS === 'ios') {
    return <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>{Content}</KeyboardAvoidingView>;
  }
  return Content;
}

/* ---- styles ---- */
const c = {
  bg: '#f7fbff',        // soft blue background like Login/Chatbot
  card: '#e6f0ff',      // light blue card
  text: '#0f172a',
  muted: '#64748b',
  dark: '#0f172a',
  accent: '#9DB7FF',    // same accent as FAB / theme
  danger: '#FF3B30',
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: c.bg,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: c.dark,
    marginBottom: 16,
    textAlign: 'center',
  },

  inputRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  input: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: c.card,
    color: c.text,
  },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: c.accent,   // was #000
    alignItems: 'center',
    justifyContent: 'center',
  },
  addTxt: {
    color: '#fff',
    fontSize: 24,
    lineHeight: 24,
    fontWeight: '800',
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: c.card,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  rowLabel: { flex: 1, color: c.text, fontSize: 16 },
  delBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: c.danger,   // was #ef4444
    alignItems: 'center',
    justifyContent: 'center',
  },
  delTxt: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 18,
    lineHeight: 18,
  },

  empty: { color: c.muted, textAlign: 'center', marginTop: 16 },
});
