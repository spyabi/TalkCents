import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Keyboard, InputAccessoryView, Platform, Alert } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AuthStackParamList } from "../navigation/AppStack";
import { useTransactions, Transaction } from "../context/TransactionsContext";
import Icon from "react-native-vector-icons/Ionicons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
// import LogScreen from "./LogScreen";

type Props = NativeStackScreenProps<AuthStackParamList, "ManualEntry">;

export default function ManualEntryPage({ navigation, route }: Props) {
  const { categories, addTransaction, addCategory, editTransaction } = useTransactions();

  // UI state
  const [type, setType] = useState<"Income" | "Expense">("Expense"); 
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [date, setDate] = useState("");
  const [category, setCategory] = useState<{ name: string; icon: string } | null>(null);
  const [note, setNote] = useState("");
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
 
  // top of component
  const [lastSavedId, setLastSavedId] = useState<string | null>(null);

// Create-category form fields
const [newCategoryName, setNewCategoryName] = useState("");
const [newCategoryIcon, setNewCategoryIcon] = useState("");
const itemToEdit = route.params?.item ?? null;
const isEditing = !!itemToEdit;

useEffect(() => {
  if (itemToEdit) {
    setType(itemToEdit.type);
    setName(itemToEdit.name);
    setAmount(String(itemToEdit.amount));
    setSelectedDate(new Date(itemToEdit.date));
   setCategory(itemToEdit.category);
   const formatted = new Date(itemToEdit.date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
    setDate(formatted);
    setNote(itemToEdit.note ?? "");
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
  setShowCreateModal(false);
};
const validateFields = () => {
  const newErrors = {
    name: name.trim() === "",
    date: date.trim() === "",
    amount: amount.trim() === "" || amount === "$0" || amount === "$0.00",
    category: category === null,
  };

  setErrors(newErrors);

  // If ANY field true = invalid
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
    enableAutomaticScroll={Platform.OS === "ios"} 
    >

      {/* Back button */}
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
  <Icon name="chevron-back" size={26} />
</TouchableOpacity>


      {/* Page Title */}
      <Text style={styles.title}>Manual Entry</Text>

      {/* Toggle Income / Expense */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[styles.toggleBtn, type === "Income" && styles.activeToggle]}
          onPress={() => setType("Income")}
        >
          <Text style={styles.toggleText}>Income</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.toggleBtn, type === "Expense" && styles.activeToggle]}
          onPress={() => setType("Expense")}
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
          style={[styles.input, errors.name && {borderColor: "red"}]}
          placeholder="Enter name"
          value={name}
          onFocus={() => {
            closeAllInputs();
          }}
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
        style={[styles.input, errors.date && { borderColor: "red" }]}
        onPress={() => {
        closeAllInputs();
        Keyboard.dismiss();
        if (!date) {
          const formatted = selectedDate.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
      setDate(formatted);
    }
      setTimeout(() => setShowDatePicker(true), 50);
      }}

>
  <Text style={{ color: date ? "#000" : "#999", fontSize: 16 }}>
    {date || "Select date"}
  </Text>
</TouchableOpacity>
 {showDatePicker && (
  <View>
    <DateTimePicker
  value={selectedDate}
  mode="date"
  display={Platform.OS === "ios" ? "inline" : "default"}
  maximumDate={new Date()}
  onChange={(event, pickedDate) => {
    if (event.type === "dismissed") return;

    if (pickedDate) {
      setSelectedDate(pickedDate);  // always update selectedDate

      const formatted = pickedDate.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });

      setDate(formatted);
    }
  }}
/>

    {/* DONE BUTTON */}
    <TouchableOpacity
      style={styles.doneBtn}
      onPress={() => setShowDatePicker(false)}
    >
      <Text style={styles.doneText}>Done</Text>
    </TouchableOpacity>
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
  style={[styles.input, errors.amount && { borderColor: "red" }]}
  placeholder="$0.00"
  keyboardType="numeric"
  value={amount}
  onFocus={() => closeAllInputs()}
  onChangeText={(value) => {
    // Allow user to type anything numeric
    const cleaned = value.replace(/[^0-9.]/g, ""); 
    setAmount(cleaned ? cleaned : "");
  }}
  onBlur={() => {
    if (!amount) return;

    // Convert string to number
    const num = Number(amount);

    // Apply 2 decimals
    if (!isNaN(num)) {
      const formatted = num.toFixed(2);
      setAmount(`$${formatted}`);
    }
  }}
/>


      </View>
      {/* CATEGORY */}
<View style={[styles.inputGroup, errors.category && { borderColor: "red" }]}>
  <View style={styles.labelRow}>
    <Text style={styles.label}>Category</Text>
    <Text style={styles.required}>*</Text>
  </View>

  <TouchableOpacity
    style={[styles.dropdown, errors.category && { borderColor: "red" }]}
    onPress={() => {
      Keyboard.dismiss();
      closeAllInputs();
      setShowCategoryPicker(true)
    }}
  >
    <Text style={{ color: category ? "#000" : "#999" }}>
      {category ? `${category.name} ${category.icon}` : "Select category"}
    </Text>
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
    amount: Number(amount.replace("$", "")),
    type,
    date: selectedDate.toISOString().split("T")[0],
    category: category!,
    note,
  };

  if (isEditing) {
    await editTransaction(tx);
  } else {
    await addTransaction(tx);
  }

  // Show modal instead of navigating
  setLastSavedId(tx.id);   
  setShowSuccess(true);

}}



      >
        <Text style={styles.addBtnText}>Add</Text>
      </TouchableOpacity>
    </KeyboardAwareScrollView>
    {/* category picker */}
{showCategoryPicker && (
  <View style={styles.categorySheet}>
    <View style={styles.categoryBox}>

      {/* CATEGORY OPTIONS */}
      {categories.map((cat, index) => (
        <TouchableOpacity
          key={index}
          style={styles.categoryOption}
          onPress={() => {
            setCategory({ name: cat.name, icon: cat.icon ?? "" });
            setShowCategoryPicker(false);
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={styles.categoryText}>{cat.name}</Text>
            <Text style={styles.categoryEmoji}>{cat.icon}</Text>
          </View>
        </TouchableOpacity>
      ))}

      {/* ADD NEW CATEGORY */}
      <TouchableOpacity
        style={[styles.categoryOption, { borderBottomWidth: 0 }]}
        onPress={() => {
          setShowCategoryPicker(false);
          setShowCreateModal(true);
        }}
      >
        <Text style={styles.addCategoryText}>+ Add New Category</Text>
      </TouchableOpacity>
    </View>

    {/* DONE BUTTON — FLOATING */}
    <TouchableOpacity
      style={styles.categoryDoneBtn}
      onPress={() => setShowCategoryPicker(false)}
    >
      <Text style={styles.categoryDoneText}>Done</Text>
    </TouchableOpacity>
  </View>
)}
{/* category modal */}
{showCreateModal && (
  <View style={styles.modalBackdrop}>
    <View style={styles.modalBox}>
      <Text style={styles.modalTitle}>New Category</Text>

      <TextInput
        style={styles.modalInput}
        placeholder="Category name"
        value={newCategoryName}
        onChangeText={setNewCategoryName}
      />

      <TextInput
        style={styles.modalInput}
        placeholder="Icon (Ionicon name, e.g., fast-food)"
        value={newCategoryIcon}
        onChangeText={setNewCategoryIcon}
      />

      {/* Category Button */}
      <View style={styles.modalButtons}>
        <TouchableOpacity
          style={styles.modalCancel}
          onPress={() => {
            setShowCreateModal(false);
            setShowDatePicker(false);
            Keyboard.dismiss();
          }}
        >
          <Text>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.modalAdd}
          onPress={() => {
  const trimmed = newCategoryName.trim();

  if (!trimmed) return;

  // Check duplicate
  const exists = categories.some(
    (c) => c.name.toLowerCase() === trimmed.toLowerCase()
  );

  if (exists) {
    Alert.alert("Category already exists!");
    return;
  }

  // Add new category
  addCategory(trimmed, newCategoryIcon);

  setCategory({name: trimmed, icon: newCategoryIcon});

  // Reset
  setNewCategoryName("");
  setNewCategoryIcon("");

  setShowCreateModal(false);
}}

        >
          <Text style={{ color: "white", fontWeight: "600" }}>Add</Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
)}
    {/* Keyboard accessory bar */}
    <InputAccessoryView nativeID="noteAccessory">
  <View style={styles.doneBtn}>
    <TouchableOpacity onPress={() => Keyboard.dismiss()}>
      <Text style={styles.doneText}>Done</Text>
    </TouchableOpacity>
  </View>
</InputAccessoryView>
{showSuccess && (
  <View style={styles.successBackdrop}>
    <View style={styles.successModal}>
      <Text style={styles.successText}>
        {type === "Expense"
          ? "Expense Logged Successfully!"
          : "Income Logged Successfully!"}
      </Text>

      <TouchableOpacity
        style={styles.successDoneBtn}
        onPress={() => {
          setShowSuccess(false);

          // Go to correct month on LogScreen
          navigation.navigate("LogScreen", {
            recentDate: selectedDate.toISOString(),
            justAddedId: lastSavedId ?? undefined,
          });
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
    backgroundColor: "#fff",
    width: "100%",
  },
  backBtn: {
    position: "absolute",
    top: 20,
    padding: 5,
    zIndex: 50,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    marginVertical: 20,
    marginTop: 60,
  },
  toggleContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
    gap: 12,
  },
  toggleBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderRadius: 12,
    borderColor: "#c0c0c0",
  },
  activeToggle: {
    backgroundColor: "#BAE7EC",
  },
  toggleText: {
    fontSize: 16,
    fontWeight: "600",
  },
  inputGroup: {
    marginBottom: 18,
  },

  label: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 6,
  },

  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  labelRow:{
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  required:{
    color:"red",
    marginLeft: 4,
    fontSize: 16,
  },

  dropdown: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  noteBox: {
    height: 100,
    textAlignVertical: "top",
  },

  addBtn: {
    marginTop: 10,
    alignSelf: "flex-end",
    backgroundColor: "#BAE7EC",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },

  addBtnText: {
    fontWeight: "600",
    fontSize: 16,
  },
accessoryContainer: {
  backgroundColor: "#f7f7f7",
  paddingVertical: 10,
  paddingHorizontal: 20,     // makes it not touch edges hard
  borderTopWidth: 0,
  alignItems: "flex-end",

  // make it blend with rounded keyboard
  borderTopLeftRadius: 16,
  borderTopRightRadius: 16,

  // smooth shadow like iOS modal sheet
  shadowColor: "#000",
  shadowOpacity: 0.05,
  shadowRadius: 4,
  shadowOffset: { width: 0, height: -2 },
},
doneBtn: {
  backgroundColor: "white",
  paddingVertical: 10,
  paddingHorizontal: 16,
  alignItems: "flex-end",
},

doneText: {
  color: "#007AFF",
  fontSize: 17,
  fontWeight: "600",
},
datePickerSheet: {
  position: "absolute",
  bottom: 0,
  left: 0,
  right: 0,
  backgroundColor: "white",
  borderTopLeftRadius: 16,
  borderTopRightRadius: 16,
  paddingBottom: 10,
  shadowColor: "#000",
  shadowOpacity: 0.1,
  shadowRadius: 10,
  shadowOffset: { width: 0, height: -3 },
  zIndex: 999,
},
categorySheet: {
  position: "absolute",
  bottom: 0,
  left: 0,
  right: 0,
  backgroundColor: "white",
  borderTopLeftRadius: 18,
  borderTopRightRadius: 18,
  paddingBottom: 20,
  shadowColor: "#000",
  shadowOpacity: 0.1,
  shadowRadius: 10,
  shadowOffset: { width: 0, height: -4 },
},

categoryBox: {
  maxHeight: 280,
  paddingHorizontal: 20,
},

categoryOption: {
  paddingVertical: 14,
  borderBottomWidth: 1,
  borderColor: "#ECECEC",
},

categoryText: {
  fontSize: 16,
},

categoryEmoji: {
  fontSize: 18,
  marginLeft: 8,
},

addCategoryText: {
  fontSize: 16,
  fontWeight: "600",
  color: "#007AFF",
},

categoryDoneBtn: {
  alignSelf: "flex-end",
  backgroundColor: "#E2F7F9",
  paddingVertical: 10,
  paddingHorizontal: 20,
  borderRadius: 10,
  marginTop: 10,
  marginRight: 20,
},


categoryDoneText: {
  color: "#007AFF",
  fontWeight: "600",
  fontSize: 16,
},



modalBackdrop: {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0,0,0,0.3)",
  justifyContent: "center",
  alignItems: "center",
},

modalBox: {
  width: "85%",
  backgroundColor: "white",
  padding: 20,
  borderRadius: 12,
},

modalTitle: {
  fontSize: 20,
  fontWeight: "700",
  marginBottom: 12,
},

modalInput: {
  borderWidth: 1,
  borderColor: "#ccc",
  borderRadius: 8,
  padding: 10,
  marginBottom: 12,
},

modalButtons: {
  flexDirection: "row",
  justifyContent: "space-between",
  marginTop: 10,
},

modalCancel: {
  padding: 10,
},

modalAdd: {
  backgroundColor: "#007AFF",
  paddingVertical: 10,
  paddingHorizontal: 16,
  borderRadius: 6,
},
successBackdrop: {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0,0,0,0.25)", // softer dim
  justifyContent: "center",
  alignItems: "center",
  zIndex: 999,
},

successModal: {
  width: "80%",
  backgroundColor: "white",
  borderRadius: 22,           // more rounded like iOS popup
  paddingVertical: 30,
  paddingHorizontal: 20,
  alignItems: "center",

  // SOFT shadow
  shadowColor: "#000",
  shadowOpacity: 0.15,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 6 },

  elevation: 8,              // Android shadow
},

successText: {
  fontSize: 18,
  fontWeight: "600",
  textAlign: "center",
  color: "#333",
  marginBottom: 22,
},

successDoneBtn: {
  backgroundColor: "#BAE7EC",
  paddingVertical: 10,
  paddingHorizontal: 28,
  borderRadius: 10,
},

successDoneText: {
  fontSize: 16,
  fontWeight: "700",
  color: "#000",
},






});
