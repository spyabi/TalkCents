import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Keyboard,
  InputAccessoryView,
  Platform,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../navigation/AppStack';
import { useTransactions, Transaction } from '../utils/TransactionsContext';
import Icon from 'react-native-vector-icons/Ionicons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

type Props = NativeStackScreenProps<AuthStackParamList, 'ManualEntry'>;

const FIXED_CATEGORIES = ['Food & Drinks', 'Shopping', 'Transport', 'Others'];

export default function ManualEntryPage({ navigation, route }: Props) {
  const { addTransaction, editTransaction } = useTransactions();

  // UI state
  const [type, setType] = useState<'Income' | 'Expense'>('Expense');
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [date, setDate] = useState('');

  // Category state (string only)
  const [category, setCategory] = useState<string | null>(null);

  const [note, setNote] = useState('');
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const [lastSavedId, setLastSavedId] = useState<string | null>(null);

  const itemToEdit = route.params?.item ?? null;
  const isEditing = !!itemToEdit;

  useEffect(() => {
    if (itemToEdit) {
      setType(itemToEdit.type);
      setName(itemToEdit.name);
      setCategory(itemToEdit.category);
      setAmount(String(itemToEdit.amount));
      setSelectedDate(new Date(itemToEdit.date));

      const formatted = new Date(itemToEdit.date).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      });
      setDate(formatted);
      setNote(itemToEdit.note ?? '');
    }
  }, [itemToEdit]);

  const [errors, setErrors] = useState({
    name: false,
    date: false,
    amount: false,
    category: false,
  });

  const closeAllInputs = () => {
    setShowDatePicker(false);
    setShowCategoryPicker(false);
  };

  const validateFields = () => {
    const newErrors = {
      name: name.trim() === '',
      date: date.trim() === '',
      amount: amount.trim() === '' || amount === '$0' || amount === '$0.00',
      category: category === null,
    };

    setErrors(newErrors);
    return !Object.values(newErrors).includes(true);
  };

  return (
    <>
      <KeyboardAwareScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 80 }}
        keyboardShouldPersistTaps="handled"
        extraScrollHeight={10}
        enableOnAndroid={true}
        enableAutomaticScroll={Platform.OS === 'ios'}
      >
        {/* Back button */}
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Icon name="chevron-back" size={26} />
        </TouchableOpacity>

        {/* Page Title */}
        <Text style={styles.title}>Manual Entry</Text>

        {/* Toggle Income / Expense */}
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[styles.toggleBtn, type === 'Income' && styles.activeToggle]}
            onPress={() => setType('Income')}
          >
            <Text style={styles.toggleText}>Income</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.toggleBtn,
              type === 'Expense' && styles.activeToggle,
            ]}
            onPress={() => setType('Expense')}
          >
            <Text style={styles.toggleText}>Expense</Text>
          </TouchableOpacity>
        </View>

        {/* NAME */}
        <View style={styles.inputGroup}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>Name</Text>
            <Text style={styles.required}>*</Text>
          </View>
          <TextInput
            style={[styles.input, errors.name && { borderColor: 'red' }]}
            placeholder="Enter name"
            value={name}
            onFocus={() => closeAllInputs()}
            onChangeText={setName}
          />
        </View>

        {/* DATE */}
        <View style={styles.inputGroup}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>Date</Text>
            <Text style={styles.required}>*</Text>
          </View>
          <TouchableOpacity
            style={[styles.input, errors.date && { borderColor: 'red' }]}
            onPress={() => {
              closeAllInputs();
              Keyboard.dismiss();
              if (!date) {
                const formatted = selectedDate.toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                });
                setDate(formatted);
              }
              // Slight delay to allow keyboard to dismiss first
              setTimeout(() => setShowDatePicker(true), 50);
            }}
          >
            <Text style={{ color: date ? '#000' : '#999', fontSize: 16 }}>
              {date || 'Select date'}
            </Text>
          </TouchableOpacity>

          {/* DATE PICKER LOGIC */}
          {showDatePicker && (
            <View>
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'inline' : 'default'}
                maximumDate={new Date()}
                onChange={(event, pickedDate) => {
                  // 1. ANDROID: Close modal immediately on interaction
                  if (Platform.OS === 'android') {
                    setShowDatePicker(false);
                  }

                  if (event.type === 'dismissed') return;

                  if (pickedDate) {
                    setSelectedDate(pickedDate);
                    const formatted = pickedDate.toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                    });
                    setDate(formatted);
                  }
                }}
              />

              {/* iOS ONLY: Custom Done Button */}
              {Platform.OS === 'ios' && (
                <TouchableOpacity
                  style={styles.doneBtn}
                  onPress={() => setShowDatePicker(false)}
                >
                  <Text style={styles.doneText}>Done</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        {/* AMOUNT */}
        <View style={styles.inputGroup}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>Amount</Text>
            <Text style={styles.required}>*</Text>
          </View>
          <TextInput
            style={[styles.input, errors.amount && { borderColor: 'red' }]}
            placeholder="$0.00"
            keyboardType="numeric"
            value={amount}
            onFocus={() => closeAllInputs()}
            onChangeText={value => {
              const cleaned = value.replace(/[^0-9.]/g, '');
              setAmount(cleaned ? cleaned : '');
            }}
            onBlur={() => {
              if (!amount) return;
              const num = Number(amount);
              if (!isNaN(num)) {
                const formatted = num.toFixed(2);
                setAmount(`$${formatted}`);
              }
            }}
          />
        </View>

        {/* CATEGORY */}
        <View
          style={[styles.inputGroup, errors.category && { borderColor: 'red' }]}
        >
          <View style={styles.labelRow}>
            <Text style={styles.label}>Category</Text>
            <Text style={styles.required}>*</Text>
          </View>

          <TouchableOpacity
            style={[styles.dropdown, errors.category && { borderColor: 'red' }]}
            onPress={() => {
              Keyboard.dismiss();
              closeAllInputs();
              setShowCategoryPicker(true);
            }}
          >
            <Text style={{ color: category ? '#000' : '#999' }}>
              {category ? category : 'Select category'}
            </Text>
            <Icon name="chevron-down" size={20} color="#999" />
          </TouchableOpacity>
        </View>

        {/* NOTE */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Note:</Text>
          <TextInput
            style={[styles.input, styles.noteBox]}
            placeholder="Optional note"
            value={note}
            onChangeText={setNote}
            multiline
            onFocus={() => closeAllInputs()}
            inputAccessoryViewID="noteAccessory"
          />
        </View>

        {/* ADD BUTTON */}
        <TouchableOpacity
          style={styles.addBtn}
          onPress={async () => {
            if (!validateFields()) return;

            const tx: Transaction = {
              id: isEditing ? itemToEdit.id : Date.now().toString(),
              name,
              amount: Number(amount.replace('$', '')),
              type,
              date: selectedDate.toISOString().split('T')[0],
              // Handle category object requirement if necessary
              category: category ? category : '',
              note,
              status: itemToEdit?.status ?? 'Pending',
            };

            if (isEditing) {
              await editTransaction(tx);
            } else {
              await addTransaction(tx);
            }

            setLastSavedId(tx.id);
            setShowSuccess(true);
          }}
        >
          <Text style={styles.addBtnText}>{isEditing ? 'Save' : 'Add'}</Text>
        </TouchableOpacity>
      </KeyboardAwareScrollView>

      {/* Category Picker Sheet */}
      {showCategoryPicker && (
        <View style={styles.categorySheet}>
          <View style={styles.categoryBox}>
            {FIXED_CATEGORIES.map((cat, index) => (
              <TouchableOpacity
                key={index}
                style={styles.categoryOption}
                onPress={() => {
                  setCategory(cat);
                  setShowCategoryPicker(false);
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={styles.categoryText}>{cat}</Text>
                </View>
                {category === cat && (
                  <Icon name="checkmark" size={20} color="#BAE7EC" />
                )}
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={styles.categoryDoneBtn}
            onPress={() => setShowCategoryPicker(false)}
          >
            <Text style={styles.categoryDoneText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Keyboard accessory bar (iOS Only) */}
      {Platform.OS === 'ios' && (
        <InputAccessoryView nativeID="noteAccessory">
          <View style={styles.doneBtn}>
            <TouchableOpacity onPress={() => Keyboard.dismiss()}>
              <Text style={styles.doneText}>Done</Text>
            </TouchableOpacity>
          </View>
        </InputAccessoryView>
      )}

      {/* Success Modal */}
      {showSuccess && (
        <View style={styles.successBackdrop}>
          <View style={styles.successModal}>
            <Text style={styles.successText}>
              {type === 'Expense'
                ? 'Expense Logged Successfully!'
                : 'Income Logged Successfully!'}
            </Text>

            <TouchableOpacity
              style={styles.successDoneBtn}
              onPress={() => {
                setShowSuccess(false);
                navigation.goBack();
                // navigation.navigate('HomeTabs', {
                //   screen: 'LogScreen',
                //   params: {
                //     recentDate: selectedDate.toISOString(),
                //     justAddedId: lastSavedId ?? undefined,
                //   },
                // });
              }}
            >
              <Text style={styles.successDoneText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
    backgroundColor: '#fff',
    width: '100%',
  },
  backBtn: {
    position: 'absolute',
    top: 20,
    padding: 5,
    zIndex: 50,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    marginVertical: 20,
    marginTop: 60,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
    gap: 12,
  },
  toggleBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderRadius: 12,
    borderColor: '#c0c0c0',
  },
  activeToggle: {
    backgroundColor: '#BAE7EC',
  },
  toggleText: {
    fontSize: 16,
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  required: {
    color: 'red',
    marginLeft: 4,
    fontSize: 16,
  },
  dropdown: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  noteBox: {
    height: 100,
    textAlignVertical: 'top',
  },
  addBtn: {
    marginTop: 10,
    alignSelf: 'flex-end',
    backgroundColor: '#BAE7EC',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  addBtnText: {
    fontWeight: '600',
    fontSize: 16,
  },
  doneBtn: {
    backgroundColor: 'white',
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'flex-end',
  },
  doneText: {
    color: '#007AFF',
    fontSize: 17,
    fontWeight: '600',
  },
  categorySheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingBottom: 30,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -4 },
    elevation: 5,
  },
  categoryBox: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  categoryOption: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderColor: '#ECECEC',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryText: {
    fontSize: 16,
    color: '#333',
  },
  categoryDoneBtn: {
    alignSelf: 'center',
    marginTop: 20,
  },
  categoryDoneText: {
    color: '#FF3B30',
    fontWeight: '600',
    fontSize: 16,
  },
  successBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  successModal: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 22,
    paddingVertical: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  successText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    color: '#333',
    marginBottom: 22,
  },
  successDoneBtn: {
    backgroundColor: '#BAE7EC',
    paddingVertical: 10,
    paddingHorizontal: 28,
    borderRadius: 10,
  },
  successDoneText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
});
