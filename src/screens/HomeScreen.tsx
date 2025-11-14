import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
import { getPending, getApproved, Expenditure } from '../utils/expenditure';
import Svg, { Path } from 'react-native-svg';

type PendingItem = { id: string; label: string };
type LegendItem = { label: string; amount: number; percent: number; color: string };

type RootStackParamList = {
  HomeTabs: undefined;
  Login: undefined;
  Log: undefined;
};

/* ---------- stable helpers OUTSIDE the component ---------- */
const COLORS = ['#7aa8ab', '#bfe7ee', '#d8f3f7', '#a3c7d3', '#6e9fa8', '#cfe8ee'];
const rad = (deg: number) => (deg * Math.PI) / 180;
function arcPath(cx: number, cy: number, r: number, startDeg: number, endDeg: number) {
  const start = { x: cx + r * Math.cos(rad(startDeg)), y: cy + r * Math.sin(rad(startDeg)) };
  const end   = { x: cx + r * Math.cos(rad(endDeg)),   y: cy + r * Math.sin(rad(endDeg)) };
  const largeArc = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y} Z`;
}
/* --------------------------------------------------------- */

export default function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [items, setItems] = useState<PendingItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [legendData, setLegendData] = useState<LegendItem[]>([]);
  const [totalSpent, setTotalSpent] = useState(0);

  const goToLog = () => navigation.navigate('Log');

  // /expenditure/pending -> pending list
  const loadItems = useCallback(async () => {
    try {
      const pending = await getPending();
      const mapped: PendingItem[] = (pending ?? []).map((e) => ({
        id: String(e.id),
        label: e.name,
      }));
      setItems(mapped);
    } catch (e) {
      console.warn('Failed to fetch pending expenditures:', e);
      setItems([]);
    }
  }, []);

  // /expenditure/approved -> totals by category + grand total
  const loadSpending = useCallback(async () => {
    try {
      const approved: Expenditure[] = await getApproved();
      const byCat = approved.reduce<Record<string, number>>((acc, e) => {
        const k = e.category || 'Uncategorized';
        acc[k] = (acc[k] || 0) + (Number(e.price) || 0);
        return acc;
      }, {});
      const total = Object.values(byCat).reduce((s, v) => s + v, 0);
      setTotalSpent(total);

      const entries = Object.entries(byCat).sort((a, b) => b[1] - a[1]);
      const legend: LegendItem[] = entries.map(([label, amount], i) => ({
        label,
        amount,
        percent: total > 0 ? (amount / total) * 100 : 0,
        color: COLORS[i % COLORS.length],
      }));
      setLegendData(legend);
    } catch (e) {
      console.warn('Failed to load approved expenditures:', e);
      setLegendData([]);
      setTotalSpent(0);
    }
  }, []);

  // memoize SVG slices to keep render stable
  const pieSlices = useMemo(() => {
    const r = 85;
    const cx = 85, cy = 85;
    let angle = -90;
    return legendData.map((seg, idx) => {
      const sweep = (seg.percent / 100) * 360;
      const d = arcPath(cx, cy, r, angle, angle + sweep);
      angle += sweep;
      return <Path key={`${seg.label}-${idx}`} d={d} fill={seg.color} />;
    });
  }, [legendData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([loadItems(), loadSpending()]);
    setRefreshing(false);
  }, [loadItems, loadSpending]);

  useEffect(() => {
    loadItems();
    loadSpending();
  }, [loadItems, loadSpending]);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>TalkCents</Text>

        {/* Pie */}
        <View style={styles.pieWrap}>
          {legendData.length ? (
            <Svg width={170} height={170}>
              {pieSlices}
            </Svg>
          ) : (
            // fallback: plain circle using a base color
            <View
              // eslint-disable-next-line react-native/no-inline-styles
              style={{
                width: 170,
                height: 170,
                borderRadius: 85,
                backgroundColor: COLORS[0], // pick any color from COLORS
              }}
            />
          )}

          <Text style={styles.pieLabel}>
            {legendData.length ? 'Spending by category' : 'No data'}
          </Text>
        </View>


        {/* Total from backend */}
        <View style={{ alignItems: 'center', marginTop: 6 }}>
          <Text style={styles.totalTitle}>total expenditure</Text>
          <Text style={styles.totalValue}>${totalSpent.toFixed(2)}</Text>
        </View>

        {/* Legend */}
        <View style={styles.legend}>
          {legendData.map((it) => (
            <View key={it.label} style={styles.legendItem}>
              <View style={[styles.dot, { backgroundColor: it.color }]} />
              <Text style={styles.legendText}>
                {it.label} — ${it.amount.toFixed(2)} ({it.percent.toFixed(1)}%)
              </Text>
            </View>
          ))}
          {!legendData.length && (
            <Text style={styles.legendText}>No categories yet.</Text>
          )}
        </View>

        {/* Pending list */}
        <View style={styles.pendingCard}>
          <Text style={styles.pendingTitle}>Pending</Text>
          <FlatList
            data={items}
            keyExtractor={(i) => i.id}
            renderItem={({ item }) => (
              <PendingRow
                label={item.label}
                onEdit={goToLog}
                onConfirm={goToLog}
              />
            )}
            ListEmptyComponent={
              <Text style={{ color: '#64748b', paddingVertical: 8 }}>
                No pending items.
              </Text>
            }
            ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
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

/* ---------------- styles ---------------- */
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
  pieWrap: { alignItems: 'center', justifyContent: 'center', flex: 1 },
  pieLabel: { marginTop: 6, color: c.muted, fontSize: 12 },
  totalTitle: { fontSize: 14, fontWeight: '700', color: c.text, marginTop: 8 },
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
});
