import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { logoutUser } from '../utils/auth';

export default function SettingScreen() {
  const navigation = useNavigation();
  const [notify, setNotify] = useState(true);

  const handleLogout = async () => {
    try {
      await logoutUser();
      navigation.reset({ index: 0, routes: [{ name: 'Login' as never }] });
    } catch (e) {
      console.error('Logout failed', e);
      Alert.alert('Error', 'Logout failed. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Main scrollable content */}
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>Settings</Text>
        </View>

        <Text style={styles.sectionHeader}>Customise</Text>
        <View style={styles.card}>
          <ListItem label="Income Category Setting" onPress={() =>
        // @ts-ignore – if your SettingScreen nav type is untyped
        navigation.navigate('CategoryEditor', { type: 'income' })
      } />
      <ListItem label="Expenses Category Setting" onPress={() =>
        // @ts-ignore
        navigation.navigate('CategoryEditor', { type: 'expense' })
      } />
      <ListItem label="Budget Setting" />

        </View>

        <View style={styles.notifyRow}>
          <Text style={styles.notifyLabel}>Notifications</Text>
          <Switch value={notify} onValueChange={setNotify} />
        </View>
      </ScrollView>

      {/* Footer fixed at bottom */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function ListItem({ label, isLast, onPress }: { label: string; isLast?: boolean; onPress?: () => void }) {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      style={[styles.itemRow, isLast && { borderBottomWidth: 0 }]}
      onPress={onPress}
    >
      <Text style={styles.itemText}>{label}</Text>
      <Text style={styles.chevron}>›</Text>
    </TouchableOpacity>
  );
}

const c = {
  bg: '#f7fbff',          // soft blue background (like login)
  text: '#111827',
  muted: '#6b7280',
  card: '#e6eefc',        // pale blue card (same feel as total card)
  accent: '#9DB7FF',      // app primary blue
  danger: '#000000ff',
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: c.bg },
  content: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 140, // leave space above footer
  },

  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  gear: { fontSize: 26 },
  title: { fontSize: 28, fontWeight: '700', color: c.text },

  sectionHeader: {
    fontSize: 20,
    fontWeight: '700',
    color: c.text,
    marginBottom: 10,
  },

  card: {
    backgroundColor: c.card,
    borderRadius: 18,
    paddingVertical: 6,
    marginBottom: 24,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#cbd5e1',
  },
  itemText: { flex: 1, fontSize: 16, color: c.text },
  chevron: { fontSize: 22, color: c.muted },

  notifyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: 8,
    marginTop: 4,
  },
  notifyLabel: { fontSize: 20, fontWeight: '700', color: c.text },

  footer: {
    padding: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#e5e7eb',
    backgroundColor: c.bg,
    marginBottom: 120,
  },
  logoutButton: {
    alignSelf: 'stretch',
    backgroundColor: c.danger,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  logoutText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
