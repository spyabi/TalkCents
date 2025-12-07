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
  date?: string;
  note?: string;
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
  '#214971',
  '#7fa7d9',
  '#c7ddff',
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

   // /expenditure
  function isInCurrentMonth(dateStr: string) {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return false;

  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth()
  );
}
 
const loadSpending = useCallback(async () => {
  try {
    const approved: Expenditure[] = await getApproved();

    // ✅ keep ONLY expenses from the current month & year
    const currentMonthApproved = approved.filter(e =>
      isInCurrentMonth(e.date_of_expense)
    );

    const byCat = currentMonthApproved.reduce<Record<string, number>>(
      (acc, e) => {
        const k = e.category || 'Uncategorized';
        acc[k] = (acc[k] || 0) + (Number(e.amount) || 0);
        return acc;
      },
      {},
    );

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
    const cx = 85;
    const cy = 85;
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
        {/* <View style={styles.pieWrap}>
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
        </View> */}

        {/* Total from backend */}
        {/* <View style={{ alignItems: 'center', marginTop: 6 }}>
          <Text style={styles.totalTitle}>Total expenditure</Text>
          <Text style={styles.totalValue}>${totalSpent.toFixed(2)}</Text>
        </View> */} 
        {/* Pie alone on top */}
<View style={styles.pieWrapper}>
  <View style={styles.pieCard}>
    {legendData.length ? (
      <Svg width={170} height={170}>
        {pieSlices}
      </Svg>
    ) : (
      <View style={styles.pieFallback} />
    )}
  </View>
</View>

{/* Row: legend on the left, total card on the right */}
<View style={styles.legendRow}>
  <View style={styles.legend}>
    {legendData.length ? (
      legendData.map(it => (
        <View key={it.label} style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: it.color }]} />
          <Text style={styles.legendText}>{it.label}</Text>
        </View>
      ))
    ) : (
      <Text style={styles.legendEmpty}>No categories yet.</Text>
    )}
  </View>

  <View style={styles.totalCard}>
    <Text style={styles.totalCardTitle}>Total Expenditure</Text>
    <Text style={styles.totalCardValue}>${totalSpent.toFixed(2)}</Text>
  </View>
</View>

        {/* Top: pie + total card
          <View style={styles.topRow}>
            <View style={styles.pieCard}>
              {legendData.length ? (
                <Svg width={170} height={170}>
                  {pieSlices}
                </Svg>
              ) : (
                <View style={styles.pieFallback} />
              )}
            </View>

            <View style={styles.totalCard}>
              <Text style={styles.totalCardTitle}>Total Expenditure</Text>
              <Text style={styles.totalCardValue}>
                ${totalSpent.toFixed(2)}
              </Text>
            </View>
          </View> */}

        {/* Legend */}
        {/* <View style={styles.legend}>
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
        </View> */}

        {/* <View style={styles.legend}>
            {legendData.length ? (
              legendData.map(it => (
                <View key={it.label} style={styles.legendItem}>
                  <View
                    style={[styles.dot, { backgroundColor: it.color }]}
                  />
                  <Text style={styles.legendText}>{it.label}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.legendEmpty}>No categories yet.</Text>
            )}
          </View> */}

        {/* Pending list */}
        <View style={styles.pendingCard}>
            <View style={styles.pendingHeaderRow}>
              <Text style={styles.pendingTitle}>Pending</Text>
              {items.length > 0 && (
                <TouchableOpacity
                  style={styles.approveAllBtn}
                  onPress={handleApproveAll}
                >
                  <Text style={styles.approveAllText}>Approve All</Text>
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
                  date={item.date}
                  onEdit={() => goToLog(item)}
                  onConfirm={() => handleApprove(item.id)}
                  onDelete={() => handleDelete(item.id)}
                />
              )}
              ListEmptyComponent={
                <Text style={styles.emptyText}>No pending items.</Text>
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
  date,
  onEdit,
  onConfirm,
  onDelete,
}: {
  label: string;
  amount: number;
  category: string;
  date?: string;
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
        <Text style={styles.pendingSub}>{date ? date : category}</Text>
        {/* <Text style={styles.pendingCategory}>{category}</Text> */}
      </View>

      <View style={styles.pendingAmountContainer}>
        <Text style={[styles.pendingAmount, { color: amountColor }]}>
          ${amount.toFixed(2)}
        </Text>
      </View>

      <View style={styles.pendingActions}>
        {/* Edit */}
        <TouchableOpacity style={styles.iconBtn} onPress={onEdit}>
          <Icon name="pencil" size={16} color="#00000" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconBtn} onPress={onDelete}>
          <Icon name="trash" size={16} color="#00000" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconBtn} onPress={onConfirm}>
          <Icon name="checkmark-circle" size={18} color="00000" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

/* ---------------- styles ---------------- */
const c = {
  bg: '#ffffff',
  pageBg: '#f5f7fb',
  primary: '#7b8cf9',
  accent: '#3EB6C5',
  text: '#111827',
  muted: '#6b7280',
  card: '#ffffff',
  shadow: '#00000020',
  pendingChip: '#f1f5f9',
  amountRed: '#e11d48',
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: c.bg,
  },
  pageBg: {
    flex: 1,
    backgroundColor: c.pageBg,
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 32, // no need for big padding since fab is removed
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 18,
    color: c.text,
  },

  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pieCard: {
    width: 180,
    height: 180,
    borderRadius: 90,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pieFallback: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: COLORS[1],
  },

  totalCard: {
    flex: 1,  
    marginLeft: 10,
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#e6eefc',
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: c.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 4,
  },
  totalCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: c.text,
    marginBottom: 8,
  },
  totalCardValue: {
    fontSize: 26,
    fontWeight: '800',
    color: c.text,
  },

  legend: {
    marginTop: 14,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    color: c.muted,
    fontSize: 13,
  },
  legendEmpty: {
    color: c.muted,
    fontSize: 13,
  },

  pendingCard: {
    marginTop: 18,
    padding: 14,
    backgroundColor: c.card,
    borderRadius: 5,
    shadowColor: c.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 5,
  },
  pendingHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  pendingTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: c.text,
  },
  approveAllBtn: {
    backgroundColor: c.primary,
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 5,
  },
  approveAllText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 13,
  },
  emptyText: {
    color: c.muted,
    marginTop: 4,
  },

  pendingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: c.pendingChip,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  pendingDetails: {
    flex: 2,
    paddingRight: 10,
  },
  pendingLabel: {
    color: c.text,
    fontSize: 14,
    fontWeight: '600',
  },
  pendingSub: {
    fontSize: 11,
    color: c.muted,
    marginTop: 2,
  },
  pendingAmountContainer: {
    flex: 1.1,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  pendingAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: c.amountRed,
  },
  pendingActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  iconBtn: {
    width: 28,
    height: 28,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pieWrapper: {
    alignItems: 'center',
    marginBottom: 8,
  },
   legendRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: 8,
  },
  iconText: {},
});

// const styles = StyleSheet.create({
//   safe: { flex: 1, backgroundColor: c.bg },
//   container: { paddingHorizontal: 20, paddingBottom: 140 },
//   title: {
//     fontSize: 28,
//     fontWeight: '700',
//     textAlign: 'center',
//     marginTop: 8,
//     marginBottom: 10,
//     color: c.text,
//   },
//   pieWrap: { alignItems: 'center', justifyContent: 'center', flex: 1 },
//   pieLabel: { marginTop: 6, color: c.muted, fontSize: 12 },
//   totalTitle: { fontSize: 14, fontWeight: '700', color: c.text, marginTop: 8 },
//   totalValue: { fontSize: 22, fontWeight: '800' },
//   legend: {
//     flexDirection: 'column',
//     marginTop: 10,
//     gap: 8,
//     paddingHorizontal: 8,
//   },
//   legendItem: { flexDirection: 'row', alignItems: 'center' },
//   dot: { width: 14, height: 14, borderRadius: 7, marginRight: 10 },
//   legendText: { color: c.muted },
//   pendingCard: {
//     marginTop: 16,
//     padding: 14,
//     backgroundColor: c.card,
//     borderRadius: 18,
//   },
//   pendingHeaderRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 10,
//   },
//   approveAllBtn: {
//     backgroundColor: '#3EB6C5',
//     paddingVertical: 5,
//     paddingHorizontal: 10,
//     borderRadius: 8,
//   },
//   approveAllText: {
//     color: 'white',
//     fontWeight: '600',
//     fontSize: 14,
//   },

//   pendingTitle: {
//     fontSize: 16,
//     fontWeight: '700',
//   },

//   pendingRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     backgroundColor: c.tint,
//     borderRadius: 10,
//     paddingVertical: 10,
//     paddingHorizontal: 12,
//   },
//   pendingAmountContainer: {
//     flex: 3.0,
//     alignItems: 'flex-start',
//     justifyContent: 'center',
//     marginRight: 10,
//   },
//   pendingAmount: {
//     fontSize: 16,
//     fontWeight: '700',
//   },
//   pendingDetails: {
//     flex: 1.5,
//     paddingRight: 10,
//   },
//   pendingLabel: { color: c.text },
//   pendingCategory: {
//     fontSize: 12,
//     color: c.muted,
//     marginTop: 2,
//   },
//   pendingActions: {
//     flexDirection: 'row',
//     gap: 8,
//   },
//   iconBtn: {
//     width: 28,
//     height: 28,
//     borderRadius: 6,
//     backgroundColor: c.text,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   iconText: {},

//   deleteIcon: {},
//   editIcon: {},
// });

// import React, { useMemo } from 'react';
// import Icon from 'react-native-vector-icons/Ionicons';
// import {
//   View,
//   Text,
//   StyleSheet,
//   FlatList,
//   TouchableOpacity,
//   ScrollView,
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { useNavigation } from '@react-navigation/native';
// import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
// import Svg, { Path } from 'react-native-svg';

// type PendingItem = {
//   id: string;
//   name: string;
//   amount: number;
//   category: string;
//   date?: string;
//   note?: string;
// };

// type RootStackParamList = {
//   HomeTabs: undefined;
//   ManualEntry: { item: any | null };
//   Login: undefined;
//   Log: undefined;
// };

// // ---------- PURE STATIC MOCK DATA ----------
// const MOCK_LEGEND = [
//   { label: 'Food',          amount: 230, percent: 45, color: '#214971' },
//   { label: 'Transport',     amount: 120, percent: 24, color: '#7fa7d9' },
//   { label: 'Groceries',     amount: 95,  percent: 19, color: '#c7ddff' },
//   { label: 'Entertainment', amount: 60,  percent: 12, color: '#a3c7d3' },
// ];

// const MOCK_TOTAL = 32.3;

// const MOCK_PENDING: PendingItem[] = [
//   {
//     id: '1',
//     name: 'Bubble Tea',
//     amount: 5.2,
//     category: 'Food',
//     date: '03 Dec',
//   },
//   {
//     id: '2',
//     name: 'Grab Ride',
//     amount: 18.9,
//     category: 'Transport',
//     date: '02 Dec',
//   },
//   {
//     id: '3',
//     name: 'NTUC Groceries',
//     amount: 42.3,
//     category: 'Groceries',
//     date: '01 Dec',
//   },
// ];

// // helpers for pie chart
// const rad = (deg: number) => (deg * Math.PI) / 180;
// function arcPath(
//   cx: number,
//   cy: number,
//   r: number,
//   startDeg: number,
//   endDeg: number,
// ) {
//   const start = {
//     x: cx + r * Math.cos(rad(startDeg)),
//     y: cy + r * Math.sin(rad(startDeg)),
//   };
//   const end = {
//     x: cx + r * Math.cos(rad(endDeg)),
//     y: cy + r * Math.sin(rad(endDeg)),
//   };
//   const largeArc = endDeg - startDeg > 180 ? 1 : 0;
//   return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y} Z`;
// }

// /* ----------------- COMPONENT ----------------- */

// export default function HomeScreen() {
//   const navigation =
//     useNavigation<NativeStackNavigationProp<RootStackParamList>>();

//   const legendData = MOCK_LEGEND;
//   const totalSpent = MOCK_TOTAL;
//   const items = MOCK_PENDING;

//   const goToLog = (item: PendingItem) =>
//     navigation.navigate('ManualEntry', { item });

//   // mock-only handlers
//   const handleApprove = (id: string) => {
//     console.log('Approve one (mock):', id);
//   };

//   const handleDelete = (id: string) => {
//     console.log('Delete (mock):', id);
//   };

//   const handleApproveAll = () => {
//     console.log('Approve ALL (mock)');
//   };

//   const pieSlices = useMemo(() => {
//     const r = 85;
//     const cx = 85;
//     const cy = 85;
//     let angle = -90;
//     return legendData.map((seg, idx) => {
//       const sweep = (seg.percent / 100) * 360;
//       const d = arcPath(cx, cy, r, angle, angle + sweep);
//       angle += sweep;
//       return <Path key={`${seg.label}-${idx}`} d={d} fill={seg.color} />;
//     });
//   }, [legendData]);

//   return (
//     <SafeAreaView style={styles.safe}>
//       <ScrollView contentContainerStyle={styles.container}>
//         <Text style={styles.title}>TalkCents</Text>

//         {/* PIE — standalone row */}
// <View style={styles.pieWrapper}>
//   <Svg width={200} height={200}>
//     {pieSlices}
//   </Svg>
// </View>

// {/* LEGEND + TOTAL — second row */}
// <View style={styles.legendTotalRow}>
//   {/* Legend */}
//   <View style={styles.legend}>
//     {legendData.map(it => (
//       <View key={it.label} style={styles.legendItem}>
//         <View style={[styles.dot, { backgroundColor: it.color }]} />
//         <Text style={styles.legendText}>{it.label}</Text>
//       </View>
//     ))}
//   </View>

//   {/* Total */}
//   <View style={styles.totalCard}>
//     <Text style={styles.totalCardTitle}>Total Expenditure</Text>
//     <Text style={styles.totalCardValue}>
//       ${totalSpent.toFixed(2)}
//     </Text>
//   </View>
// </View>

//         {/* Pending list */}
//         <View style={styles.pendingCard}>
//           <View style={styles.pendingHeaderRow}>
//             <Text style={styles.pendingTitle}>Pending</Text>
//             {items.length > 0 && (
//               <TouchableOpacity
//                 style={styles.approveAllBtn}
//                 onPress={handleApproveAll}
//               >
//                 <Text style={styles.approveAllText}>Approve All</Text>
//               </TouchableOpacity>
//             )}
//           </View>

//           <FlatList
//             data={items}
//             keyExtractor={i => i.id}
//             renderItem={({ item }) => (
//               <PendingRow
//                 label={item.name}
//                 amount={item.amount}
//                 category={item.category}
//                 date={item.date}
//                 onEdit={() => goToLog(item)}
//                 onConfirm={() => handleApprove(item.id)}
//                 onDelete={() => handleDelete(item.id)}
//               />
//             )}
//             ListEmptyComponent={
//               <Text style={styles.emptyText}>No pending items.</Text>
//             }
//             ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
//           />
//         </View>
//       </ScrollView>
//     </SafeAreaView>
//   );
// }

// /* ----------------- ROW COMPONENT ----------------- */

// function PendingRow({
//   label,
//   amount,
//   category,
//   date,
//   onEdit,
//   onConfirm,
//   onDelete,
// }: {
//   label: string;
//   amount: number;
//   category: string;
//   date?: string;
//   onEdit: () => void;
//   onConfirm: () => void;
//   onDelete: () => void;
// }) {
//   const isExpense = true;
//   const amountColor = isExpense ? 'red' : 'green';

//   return (
//     <View style={styles.pendingRow}>
//       <View style={styles.pendingDetails}>
//         <Text style={styles.pendingLabel}>{label}</Text>
//         <Text style={styles.pendingSub}>{date ? date : category}</Text>
//       </View>

//       <View style={styles.pendingAmountContainer}>
//         <Text style={[styles.pendingAmount, { color: amountColor }]}>
//           ${amount.toFixed(2)}
//         </Text>
//       </View>

//       <View style={styles.pendingActions}>
//         <TouchableOpacity style={styles.iconBtn} onPress={onEdit}>
//           <Icon name="pencil" size={16} color="#fff" />
//         </TouchableOpacity>

//         <TouchableOpacity style={styles.iconBtn} onPress={onDelete}>
//           <Icon name="trash" size={16} color="#fff" />
//         </TouchableOpacity>

//         <TouchableOpacity style={styles.iconBtn} onPress={onConfirm}>
//           <Icon name="checkmark-circle" size={18} color="green" />
//         </TouchableOpacity>
//       </View>
//     </View>
//   );
// }

// /* ---------------- styles ---------------- */
// const c = {
//   bg: '#ffffff',
//   pageBg: '#f5f7fb',
//   primary: '#7b8cf9',
//   accent: '#3EB6C5',
//   text: '#111827',
//   muted: '#6b7280',
//   card: '#ffffff',
//   shadow: '#00000020',
//   pendingChip: '#f1f5f9',
//   amountRed: '#e11d48',
// };

// const styles = StyleSheet.create({
//   safe: {
//     flex: 1,
//     backgroundColor: c.bg,
//   },
//   pieWrapper: {
//   alignItems: 'center',
//   marginBottom: 16,
// },

// legendTotalRow: {
//   flexDirection: 'row',
//   justifyContent: 'space-between',
//   alignItems: 'flex-start',
//   marginBottom: 20,
// },
//   bottomRow: {
//   flexDirection: 'row',
//   alignItems: 'flex-start',
//   justifyContent: 'space-between',
//   marginTop: 12,
// },
//   pageBg: {
//     flex: 1,
//     backgroundColor: c.pageBg,
//   },
//   container: {
//     paddingHorizontal: 20,
//     paddingTop: 8,
//     paddingBottom: 32,
//   },
//   title: {
//     fontSize: 28,
//     fontWeight: '700',
//     textAlign: 'center',
//     marginTop: 4,
//     marginBottom: 18,
//     color: c.text,
//   },

//   topRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//   },
//   pieCard: {
//     width: 180,
//     height: 180,
//     borderRadius: 90,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   pieFallback: {
//     width: 150,
//     height: 150,
//     borderRadius: 75,
//     backgroundColor: '#7fa7d9',
//   },

//   totalCard: {
//     flex: 1,
//     marginLeft: 10,
//     paddingVertical: 12,
//     paddingHorizontal: 10,
//     backgroundColor: '#e6eefc',
//     borderRadius: 5,
//     alignItems: 'center',
//     justifyContent: 'center',
//     shadowColor: c.shadow,
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.5,
//     shadowRadius: 8,
//     elevation: 4,
//   },
//   totalCardTitle: {
//     fontSize: 13,
//     fontWeight: '600',
//     color: c.text,
//     marginBottom: 8,
//   },
//   totalCardValue: {
//     fontSize: 22,
//     fontWeight: '800',
//     color: c.text,
//   },

//   legend: {
//     marginTop: 14,
//     marginBottom: 8,
//     paddingHorizontal: 4,
//   },
//   legendItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 6,
//   },
//   dot: {
//     width: 12,
//     height: 12,
//     borderRadius: 6,
//     marginRight: 8,
//   },
//   legendText: {
//     color: c.muted,
//     fontSize: 13,
//   },
//   legendEmpty: {
//     color: c.muted,
//     fontSize: 13,
//   },

//   pendingCard: {
//     marginTop: 18,
//     padding: 14,
//     backgroundColor: c.card,
//     borderRadius: 5,
//     shadowColor: c.shadow,
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.35,
//     shadowRadius: 10,
//     elevation: 5,
//   },
//   pendingHeaderRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 10,
//   },
//   pendingTitle: {
//     fontSize: 16,
//     fontWeight: '700',
//     color: c.text,
//   },
//   approveAllBtn: {
//     backgroundColor: c.primary,
//     paddingVertical: 6,
//     paddingHorizontal: 16,
//     borderRadius: 10,
//   },
//   approveAllText: {
//     color: '#ffffff',
//     fontWeight: '600',
//     fontSize: 13,
//   },
//   emptyText: {
//     color: c.muted,
//     marginTop: 4,
//   },

//   pendingRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     backgroundColor: c.pendingChip,
//     borderRadius: 12,
//     paddingVertical: 10,
//     paddingHorizontal: 12,
//   },
//   pendingDetails: {
//     flex: 2,
//     paddingRight: 10,
//   },
//   pendingLabel: {
//     color: c.text,
//     fontSize: 14,
//     fontWeight: '600',
//   },
//   pendingSub: {
//     fontSize: 11,
//     color: c.muted,
//     marginTop: 2,
//   },
//   pendingAmountContainer: {
//     flex: 1.1,
//     alignItems: 'flex-start',
//     justifyContent: 'center',
//   },
//   pendingAmount: {
//     fontSize: 16,
//     fontWeight: '700',
//     color: c.amountRed,
//   },
//   pendingActions: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 6,
//   },
//   iconBtn: {
//     width: 28,
//     height: 28,
//     borderRadius: 6,
//     backgroundColor: c.text,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   iconText: {},
// });


