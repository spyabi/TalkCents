import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function SettingScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Setting Screen</Text>
    </View>
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
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 20, fontWeight: '600' },
});