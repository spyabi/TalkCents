import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type PendingItem = { id: string; label: string };

/** ---- Adjust this to your actual navigator route names ---- */
type RootStackParamList = {
  Home: undefined;
  Log: undefined;        // ← if your route is 'LogScreen', change this to 'LogScreen'
};

const PENDING: PendingItem[] = [
  { id: '1', label: 'macdonalds' },
  { id: '2', label: 'grab' },
  { id: '3', label: 'cotton on' },
];

export default function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const goToLog = () => {
    navigation.navigate('Log'); // ← change to 'LogScreen' if that is the route name
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Title */}
        <Text style={styles.title}>TalkCents</Text>

        {/* Chart + Total */}
        <View style={styles.topRow}>
          <View style={styles.pieWrap}>
            <View style={styles.pie} />
            <Text style={styles.pieLabel}>Pie Chart</Text>
          </View>

          <View style={styles.totalCard}>
            <Text style={styles.totalTitle}>total expenditure</Text>
            <Text style={styles.totalValue}>$100</Text>
          </View>
        </View>

        {/* Legend */}
        <View style={styles.legend}>
          <LegendDot color="#7aa8ab" label="Food & Beverage" />
          <LegendDot color="#bfe7ee" label="Shopping" />
          <LegendDot color="#d8f3f7" label="Transport" />
        </View>

        {/* Pending list */}
        <View style={styles.pendingCard}>
          <Text style={styles.pendingTitle}>Pending</Text>
          <FlatList
            data={PENDING}
            keyExtractor={(i) => i.id}
            renderItem={({ item }) => (
              <PendingRow
                label={item.label}
                onEdit={goToLog}
                onConfirm={goToLog}
              />
            )}
            ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          />
        </View>
      </ScrollView>

      {/* Floating action button */}
      <TouchableOpacity style={styles.fab} activeOpacity={0.8} onPress={goToLog}>
        <Text style={styles.fabText}>＋</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

/** --- Small presentational components --- */
function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={styles.legendText}>{label}</Text>
    </View>
  );
}

function PendingRow({
  label,
  onEdit,
  onConfirm,
}: {
  label: string;
  onEdit: () => void;
  onConfirm: () => void;
}) {
  return (
    <View style={styles.pendingRow}>
      <Text style={styles.pendingLabel}>{label}</Text>
      <View style={styles.pendingActions}>
        <TouchableOpacity style={styles.iconBtn} onPress={onEdit}>
          <Text style={styles.iconText}>✎</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconBtn} onPress={onConfirm}>
          <Text style={styles.iconText}>✔︎</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

/** --- Styles --- */
const c = {
  bg: '#FFFFFF',
  tint: '#cfe8ee',
  tintDark: '#9ecad2',
  text: '#0f172a',
  muted: '#475569',
  card: '#e9f5f7',
  shadow: '#00000033',
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: c.bg },
  container: { paddingHorizontal: 20, paddingBottom: 140 },

  title: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 10,
    color: c.text,
  },

  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  pieWrap: { alignItems: 'center', justifyContent: 'center', flex: 1 },
  pie: {
    width: 170, height: 170, borderRadius: 85, backgroundColor: c.tint,
    shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 6, shadowOffset: { width: 0, height: 3 },
  },
  pieLabel: { marginTop: 6, color: c.muted, fontSize: 12 },

  totalCard: {
    marginLeft: 16, paddingVertical: 18, paddingHorizontal: 18,
    backgroundColor: c.tintDark, borderRadius: 16, minWidth: 130,
    alignItems: 'center', justifyContent: 'center',
  },
  totalTitle: { fontSize: 14, fontWeight: '700', color: c.text, marginBottom: 6 },
  totalValue: { fontSize: 22, fontWeight: '800' },

  legend: { flexDirection: 'column', marginTop: 10, gap: 8, paddingHorizontal: 8 },
  legendItem: { flexDirection: 'row', alignItems: 'center' },
  dot: { width: 14, height: 14, borderRadius: 7, marginRight: 10 },
  legendText: { color: c.muted },

  pendingCard: { marginTop: 16, padding: 14, backgroundColor: c.card, borderRadius: 18 },
  pendingTitle: { fontSize: 16, fontWeight: '700', marginBottom: 10 },

  pendingRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: c.tint, borderRadius: 10, paddingVertical: 10, paddingHorizontal: 12,
  },
  pendingLabel: { flex: 1, color: c.text },
  pendingActions: { flexDirection: 'row', gap: 12 },
  iconBtn: {
    width: 28, height: 28, borderRadius: 6, backgroundColor: '#000',
    alignItems: 'center', justifyContent: 'center',
  },
  iconText: { color: '#fff', fontSize: 14, fontWeight: '700' },

  fab: {
    position: 'absolute', right: 24, bottom: 96, width: 64, height: 64, borderRadius: 32,
    backgroundColor: '#000', alignItems: 'center', justifyContent: 'center',
    shadowColor: c.shadow, shadowOpacity: 0.3, shadowRadius: 8, shadowOffset: { width: 0, height: 6 },
  },
  fabText: { color: '#fff', fontSize: 32, lineHeight: 34, fontWeight: '800' },
});
