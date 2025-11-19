import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  getPending,
  getApproved,
  Expenditure,
  approveOne,
  deleteExpenditure,
  approveAll,
} from '../utils/expenditure';
import Svg, { Path } from 'react-native-svg';

type PendingItem = {
  id: string;
  name: string;
  amount: number;
  category: string;
};
type LegendItem = {
  label: string;
  amount: number;
  percent: number;
  color: string;
};

type RootStackParamList = {
  HomeTabs: undefined;
  ManualEntry: { item: any | null };
  Login: undefined;
  Log: undefined;
};

/* ---------- stable helpers OUTSIDE the component ---------- */
const COLORS = [
  '#7aa8ab',
  '#bfe7ee',
  '#d8f3f7',
  '#a3c7d3',
  '#6e9fa8',
  '#cfe8ee',
];
const rad = (deg: number) => (deg * Math.PI) / 180;
function arcPath(
  cx: number,
  cy: number,
  r: number,
  startDeg: number,
  endDeg: number,
) {
  const start = {
    x: cx + r * Math.cos(rad(startDeg)),
    y: cy + r * Math.sin(rad(startDeg)),
  };
  const end = {
    x: cx + r * Math.cos(rad(endDeg)),
    y: cy + r * Math.sin(rad(endDeg)),
  };
  const largeArc = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y} Z`;
}
/* --------------------------------------------------------- */

export default function HomeScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [items, setItems] = useState<PendingItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [legendData, setLegendData] = useState<LegendItem[]>([]);
  const [totalSpent, setTotalSpent] = useState(0);

  const goToLog = (item: any) => navigation.navigate('ManualEntry', { item });

  const handleApprove = async (id: any) => {
    await approveOne(id);
    loadItems();
    loadSpending();
  };

  const handleDelete = async (id: any) => {
    await deleteExpenditure(id);
    loadItems();
    loadSpending();
  };

  const handleApproveAll = async () => {
    await approveAll();
    loadItems();
    loadSpending();
  };

  // /expenditure/pending -> pending list
  const loadItems = useCallback(async () => {
    try {
      const pending = await getPending();
      const mapped: PendingItem[] = (pending ?? []).map(e => ({
        id: String(e.uuid),
        name: String(e.name),
        date: String(e.date_of_expense),
        amount: Number(e.amount),
        category: String(e.category),
        note: String(e.notes),
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
        acc[k] = (acc[k] || 0) + (Number(e.amount) || 0);
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

  useFocusEffect(
    React.useCallback(() => {
      loadItems();
      loadSpending();
    }, [loadItems, loadSpending]),
  );

  // memoize SVG slices to keep render stable
  const pieSlices = useMemo(() => {
    const r = 85;
    const cx = 85,
      cy = 85;
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
          {legendData.map(it => (
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
          <View style={styles.pendingHeaderRow}>
            <Text style={styles.pendingTitle}>Pending</Text>

            {/* 🟢 NEW APPROVE ALL BUTTON */}
            {items.length > 0 && (
              <TouchableOpacity
                style={styles.approveAllBtn}
                onPress={handleApproveAll}
              >
                <Text style={styles.approveAllText}>
                  Approve All ({items.length})
                </Text>
              </TouchableOpacity>
            )}
          </View>
          <FlatList
            data={items}
            keyExtractor={i => i.id}
            renderItem={({ item }) => (
              <PendingRow
                label={item.name}
                amount={item.amount}
                category={item.category}
                onEdit={() => goToLog(item)}
                onConfirm={() => handleApprove(item.id)}
                onDelete={() => handleDelete(item.id)}
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
  amount,
  category,
  onEdit,
  onConfirm,
  onDelete,
}: {
  label: string;
  amount: number;
  category: string;
  onEdit: () => void;
  onConfirm: () => void;
  onDelete: () => void;
}) {
  const isExpense = true;
  const amountColor = isExpense ? 'red' : 'green';

  return (
    <View style={styles.pendingRow}>
      <View style={styles.pendingDetails}>
        <Text style={styles.pendingLabel}>{label}</Text>
        <Text style={styles.pendingCategory}>{category}</Text>
      </View>

      <View style={styles.pendingAmountContainer}>
        <Text style={[styles.pendingAmount, { color: amountColor }]}>
          ${amount.toFixed(2)}
        </Text>
      </View>

      <View style={styles.pendingActions}>
        {/* Edit */}
        <TouchableOpacity style={styles.iconBtn} onPress={onEdit}>
          <Icon name="pencil" size={16} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconBtn} onPress={onDelete}>
          <Icon name="trash" size={16} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconBtn} onPress={onConfirm}>
          <Icon name="checkmark-circle" size={18} color="green" />
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
  legend: {
    flexDirection: 'column',
    marginTop: 10,
    gap: 8,
    paddingHorizontal: 8,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center' },
  dot: { width: 14, height: 14, borderRadius: 7, marginRight: 10 },
  legendText: { color: c.muted },
  pendingCard: {
    marginTop: 16,
    padding: 14,
    backgroundColor: c.card,
    borderRadius: 18,
  },
  pendingHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  approveAllBtn: {
    backgroundColor: '#3EB6C5',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  approveAllText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },

  pendingTitle: {
    fontSize: 16,
    fontWeight: '700',
  },

  pendingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: c.tint,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  pendingAmountContainer: {
    flex: 3.0,
    alignItems: 'flex-start',
    justifyContent: 'center',
    marginRight: 10,
  },
  pendingAmount: {
    fontSize: 16,
    fontWeight: '700',
  },
  pendingDetails: {
    flex: 1.5,
    paddingRight: 10,
  },
  pendingLabel: { color: c.text },
  pendingCategory: {
    fontSize: 12,
    color: c.muted,
    marginTop: 2,
  },
  pendingActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconBtn: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: c.text,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {},

  deleteIcon: {},
  editIcon: {},
});
