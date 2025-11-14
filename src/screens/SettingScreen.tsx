import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
} from 'react-native';

export default function SettingScreen() {
  const [notify, setNotify] = useState(true);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Title */}
        <View style={styles.titleRow}>
          <Text style={styles.gear}>⚙️</Text>
          <Text style={styles.title}>Settings</Text>
        </View>

        {/* Section header */}
        <Text style={styles.sectionHeader}>Customise</Text>

        {/* Customise card */}
        <View style={styles.card}>
          <ListItem label="App Display" />
          <ListItem label="Income Category Setting" />
          <ListItem label="Expenses Category Setting" />
          <ListItem label="Budget Setting" isLast />
        </View>

        {/* Notifications */}
        <View style={styles.notifyRow}>
          <Text style={styles.notifyLabel}>Notifications</Text>
          <Switch value={notify} onValueChange={setNotify} />
        </View>
      </ScrollView>

      {/* Faux bottom tab bar (remove if using a navigator’s tab bar) */}
      {/* <View style={styles.tabBar}>
        <TabItem label="Insights" />
        <TabItem label="Log" />
        <TabItem label="Home" />
        <TabItem label="Settings" active />
      </View> */}
    </SafeAreaView>
  );
}

/* ----- Small presentational components ----- */
function ListItem({ label, isLast }: { label: string; isLast?: boolean }) {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      style={[styles.itemRow, isLast && { borderBottomWidth: 0 }]}
    >
      <Text style={styles.itemText}>{label}</Text>
      <Text style={styles.chevron}>›</Text>
    </TouchableOpacity>
  );
}

// function TabItem({ label, active }: { label: string; active?: boolean }) {
//   return (
//     <View style={[styles.tabItem, active && styles.tabItemActive]}>
//       <View style={styles.tabIcon} />
//       <Text style={[styles.tabText, active && styles.tabTextActive]}>
//         {label}
//       </Text>
//     </View>
//   );
// }

const c = {
  bg: '#FFFFFF',
  text: '#0f172a',
  muted: '#475569',
  tint: '#cfe8ee',
  card: '#e6f3f6',
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: c.bg },
  container: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },

  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
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
  itemText: {
    flex: 1,
    fontSize: 16,
    color: c.text,
  },
  chevron: { fontSize: 22, color: c.muted },

  notifyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: 8,
    marginTop: 4,
  },
  notifyLabel: { fontSize: 20, fontWeight: '700', color: c.text },

  /* Faux tab bar */
  tabBar: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 20,
    height: 72,
    borderRadius: 26,
    backgroundColor: '#f3f5f7',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 12,
  },
  tabItem: {
    width: 70,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabItemActive: { backgroundColor: c.tint },
  tabIcon: {
    width: 22,
    height: 22,
    borderRadius: 6,
    backgroundColor: '#000',
    marginBottom: 4,
  },
  tabText: { fontSize: 12, color: c.muted },
  tabTextActive: { color: c.text, fontWeight: '700' },
});

// export default function SettingScreen() {
//   return (
//     <View style={styles.container}>
//       <Text style={styles.text}>Setting Screen</Text>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
//   text: { fontSize: 20, fontWeight: '600' },
// });