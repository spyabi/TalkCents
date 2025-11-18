import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { getPending, getApproved, getExpenditures, approveOne } from "../utils/expenditure";
import Svg, { Path } from "react-native-svg";
import { useTransactions, Transaction } from "../utils/TransactionsContext";

type LegendItem = {
  label: string;
  amount: number;
  percent: number;
  color: string;
};

/* ---------- helpers ---------- */
const COLORS = ["#7aa8ab", "#bfe7ee", "#d8f3f7", "#a3c7d3", "#6e9fa8", "#cfe8ee"];
const rad = (deg: number) => (deg * Math.PI) / 180;

function arcPath(
  cx: number,
  cy: number,
  r: number,
  startDeg: number,
  endDeg: number
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
/* ------------------------------ */

export default function HomeScreen() {
  const navigation = useNavigation<any>(); // keep this simple

  const [items, setItems] = useState<Transaction[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [legendData, setLegendData] = useState<LegendItem[]>([]);
  const [totalSpent, setTotalSpent] = useState(0);

  const hasPieData = legendData.some(seg => seg.amount > 0);

  // categories for icons
  const { categories, reloadTransactions } = useTransactions();

  const pickIcon = useCallback(
    (name: string) =>
      categories.find(
        (c) => c.name.toLowerCase() === String(name).toLowerCase()
      )?.icon ?? "",
    [categories]
  );

  // pending list
  const loadItems = useCallback(async () => {
  try {
    console.log("Fetching pending transactions...");  // Log the action
    const pending = await getPending();
    console.log("Fetched pending transactions:", pending);  // Log the response from backend

    // Only include pending transactions
    const mapped: Transaction[] = (pending ?? [])
      .filter((e) => e.status === "PENDING")  // Ensure status is 'PENDING'
      .map((e: any) => {
        const backendId =
          e.id ?? e.expenditure_id ?? e.expenditureId ?? e.uuid ?? e.pk;

        return {
          id: String(backendId),
          type: "Expense",
          name: e.name,
          amount: Number(e.amount) || 0,
          date: new Date().toISOString(),
          category: {
            name: e.category || "Others",
            icon: pickIcon(e.category || "Others"),
          },
          note: "",
          status: e.status,  // Ensure status is set correctly
        };
      });

    setItems(mapped);
  } catch (e) {
    console.warn("Failed to fetch pending expenditures:", e);
    setItems([]);
  }
}, [pickIcon]);

  // totals / pie
//   const loadSpending = useCallback(async () => {
//   try {
//     // Fetch both approved and pending expenditures
//     const [approved, pending]: [Expenditure[], Expenditure[]] = await Promise.all([
//       getApproved(),
//       getPending(),
//     ]);

//     console.log("Approved expenditures:", approved);  // Log the response
//     console.log("Pending expenditures:", pending);  // Log the response

//     // Combine approved and pending expenditures
//     const allExpenditures = [...approved, ...pending];

//     const byCat = allExpenditures.reduce<Record<string, number>>((acc, e) => {
//       const k = e.category || "Uncategorized";
//       // Ensure the amount is being correctly parsed as a number
//       const amount = Number(e.amount);
//       console.log(`Processing expenditure for ${e.category}: ${amount}`);  // Debugging log

//       if (isNaN(amount)) {
//         console.warn(`Invalid amount detected for ${e.name}: ${e.amount}`);
//       }

//       acc[k] = (acc[k] || 0) + amount;  // Add to the existing category
//       return acc;
//     }, {});

//     console.log("Spending by category:", byCat);  // Verify this data

//     const total = Object.values(byCat).reduce((s, v) => s + v, 0);
//     setTotalSpent(total);

//     if (total <= 0) {
//       setLegendData([]);
//       return;
//     }

//     const entries = Object.entries(byCat).sort((a, b) => b[1] - a[1]);
//     const legend: LegendItem[] = entries.map(([label, amount], i) => ({
//       label,
//       amount,
//       percent: total > 0 ? (amount / total) * 100 : 0,
//       color: COLORS[i % COLORS.length],
//     }));
//     setLegendData(legend);

//   } catch (e) {
//     console.warn("Failed to load expenditures:", e);
//     setLegendData([]);
//     setTotalSpent(0);
//   }
// }, []);

const loadSpending = useCallback(async () => {
  try {
    // Fetch all expenditures and approved ones separately
    const [allExpenditures, approvedExpenditures] = await Promise.all([
      getExpenditures(), // Get all expenditures (approved and pending)
      getApproved()      // Get only approved expenditures
    ]);

    console.log("All expenditures:", allExpenditures);  // Log all expenditures
    console.log("Approved expenditures:", approvedExpenditures);  // Log approved expenditures

    // Process all expenditures but exclude pending ones for the total calculation
    const byCat = allExpenditures.reduce<Record<string, number>>((acc, e) => {
      // Skip pending expenditures in the total calculation
      if (e.status !== 'PENDING') {
        const k = e.category || "Uncategorized";
        const amount = Number(e.amount);  // Ensure amount is parsed as a number

        console.log(`Processing expenditure for ${e.category}: ${amount}`);  // Debugging log

        if (isNaN(amount)) {
          console.warn(`Invalid amount detected for ${e.name}: ${e.amount}`);
        }

        acc[k] = (acc[k] || 0) + amount;  // Add to the existing category
      }
      return acc;
    }, {});

    console.log("Spending by category:", byCat);  // Verify this data

    const total = Object.values(byCat).reduce((s, v) => s + v, 0);
    setTotalSpent(total);

    if (total <= 0) {
      setLegendData([]);
      return;
    }

    const entries = Object.entries(byCat).sort((a, b) => b[1] - a[1]);
    const legend: LegendItem[] = entries.map(([label, amount], i) => ({
      label,
      amount,
      percent: total > 0 ? (amount / total) * 100 : 0,
      color: COLORS[i % COLORS.length],
    }));
    setLegendData(legend);

  } catch (e) {
    console.warn("Failed to load expenditures:", e);
    setLegendData([]);
    setTotalSpent(0);
  }
}, []);


  // // go to Log screen (tab)
  // const goToLog = useCallback(() => {
  //   // same pattern as ManualEntryPage uses
  //   navigation.navigate("HomeTabs", {
  //     screen: "LogScreen",
  //   });
  // }, [navigation]);

  // ✅ declare handleConfirm AFTER loadSpending + goToLog
  const handleConfirm = useCallback(
  async (tx: Transaction) => {
    try {
      console.log("Approving tx", tx.id);

      // Approve the transaction in the backend
      await approveOne(tx.id);

      // Update the UI after the approval
      await Promise.all([
        loadItems(),          // reload pending list
        loadSpending(),       // update spending data (pie chart, total)
        reloadTransactions(), // update global context
      ]);

      navigation.navigate("HomeTabs", {
        screen: "LogScreen",
        params: { recentDate: tx.date },
      });
    } catch (e) {
      console.warn("Failed to approve expenditure:", e);
    }
  },
  [loadItems, loadSpending, reloadTransactions, navigation]
);

  // pie slices
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
  {hasPieData ? (
    <Svg width={170} height={170}>
      {pieSlices}
    </Svg>
  ) : (
    <View
      style={{
          width: 170,
          height: 170,
          borderRadius: 85,
          backgroundColor: "#e0e0e0", // Lighter color when no data is available
      }}
    />
  )}

  <Text style={styles.pieLabel}>
    {hasPieData ? "Spending by category" : "No data"}
  </Text>
</View>

        {/* Total from backend */}
        <View style={{ alignItems: "center", marginTop: 6 }}>
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
            keyExtractor={(item) => item.id} 
            renderItem={({ item }) => (
              <PendingRow
                tx={item}
                onEdit={(tx) => navigation.navigate("ManualEntry", { item: tx })}
                onConfirm={handleConfirm}
              />
            )}
            ListEmptyComponent={
              <Text style={{ color: "#64748b", paddingVertical: 8 }}>
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
  tx,
  onEdit,
  onConfirm,
}: {
  tx: Transaction;
  onEdit: (tx: Transaction) => void;
  onConfirm: (tx: Transaction) => void;
}) {
  return (
    <View style={styles.pendingRow}>
      <Text style={styles.pendingLabel}>{tx.name}</Text>

      {/* NEW: amount text, right before icons */}
      <Text style={styles.pendingAmount}>${tx.amount.toFixed(2)}</Text>

      <View style={styles.pendingActions}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => onEdit(tx)}>
          <Text style={styles.iconText}>✎</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconBtn} onPress={() => onConfirm(tx)}>
          <Text style={styles.iconText}>✔︎</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

/* ---------------- styles ---------------- */
const c = {
  bg: "#FFFFFF",
  tint: "#cfe8ee",
  tintDark: "#9ecad2",
  text: "#0f172a",
  muted: "#475569",
  card: "#e9f5f7",
  shadow: "#00000033",
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: c.bg },
  container: { paddingHorizontal: 20, paddingBottom: 140 },
  title: {
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 10,
    color: c.text,
  },
  pieWrap: { alignItems: "center", justifyContent: "center", flex: 1 },
  pieLabel: { marginTop: 6, color: c.muted, fontSize: 12 },
  totalTitle: { fontSize: 14, fontWeight: "700", color: c.text, marginTop: 8 },
  totalValue: { fontSize: 22, fontWeight: "800" },
  legend: {
    flexDirection: "column",
    marginTop: 10,
    gap: 8,
    paddingHorizontal: 8,
  },
  legendItem: { flexDirection: "row", alignItems: "center" },
  dot: { width: 14, height: 14, borderRadius: 7, marginRight: 10 },
  legendText: { color: c.muted },
  pendingCard: {
    marginTop: 16,
    padding: 14,
    backgroundColor: c.card,
    borderRadius: 18,
  },
  pendingTitle: { fontSize: 16, fontWeight: "700", marginBottom: 10 },
  pendingRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: c.tint,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  pendingLabel: { flex: 1, color: c.text },
  pendingAmount: {
    marginRight: 10,
    fontWeight: "600",
    color: c.text,
  },
  pendingActions: { flexDirection: "row", gap: 12 },
  iconBtn: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
  },
  iconText: { color: "#fff", fontSize: 14, fontWeight: "700" },
});
