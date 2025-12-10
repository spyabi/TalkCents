import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { BarChart, LineChart } from 'react-native-gifted-charts';
import { fetchCategoryExpenses, fetchDailyExpenses } from '../utils/insightsAPI';
import { Dimensions } from 'react-native';

const screenWidth = Dimensions.get('window').width - 32;

export default function InsightScreen() {
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const [fromDate, setFromDate] = useState(firstDayOfMonth);
  const [toDate, setToDate] = useState(today);
  const [categoryData, setCategoryData] = useState<{ [key: string]: number }>({});
  const [dailyData, setDailyData] = useState<{ [key: string]: number }>({});
  const [loading, setLoading] = useState(false);

  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);

  useEffect(() => {
    loadData();
  }, [fromDate, toDate]);

  const loadData = async () => {
    try {
      setLoading(true);
      const cat = await fetchCategoryExpenses(fromDate, toDate);
      const daily = await fetchDailyExpenses(fromDate, toDate);
      setCategoryData(cat);
      setDailyData(daily);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  const barChartData = Object.entries(categoryData).map(([label, value]) => ({
    label,
    value,
    frontColor: "#4a90e2",
  }));

  const lineChartData = Object.keys(dailyData).map(key => {
    const date = new Date(
      parseInt(key.slice(0, 4)),
      parseInt(key.slice(4, 6)) - 1,
      parseInt(key.slice(6, 8))
    );

    return {
      value: dailyData[key],
      label: formatDate(date),
      dataPointText: `${dailyData[key]}`,
    };
  });

  return (
    <ScrollView contentContainerStyle={[styles.container, { flexGrow: 1 }]}>
      <Text style={styles.title}>
        Insights {loading && '— Loading...'}
      </Text>

      <View style={styles.dateRow}>
        <TouchableOpacity style={styles.dateButton} onPress={() => setShowFromPicker(true)}>
          <Text style={styles.dateButtonText}>From: {formatDate(fromDate)}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.dateButton} onPress={() => setShowToPicker(true)}>
          <Text style={styles.dateButtonText}>To: {formatDate(toDate)}</Text>
        </TouchableOpacity>
      </View>

      {showFromPicker && (
        <DateTimePicker
          value={fromDate}
          mode="date"
          display="default"
          onChange={(e, d) => { setShowFromPicker(false); if (d) setFromDate(d); }}
        />
      )}

      {showToPicker && (
        <DateTimePicker
          value={toDate}
          mode="date"
          display="default"
          onChange={(e, d) => { setShowToPicker(false); if (d) setToDate(d); }}
        />
      )}

      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" style={{ marginTop: 50 }} />
      ) : (
        <View style={{ width: screenWidth }}>
          <Text style={styles.chartTitle}>Expenses by Category</Text>
          <BarChart
            data={barChartData}
            barWidth={40}
            spacing={20}
            roundedTop
            isAnimated
            yAxisThickness={0}
            xAxisLabelTextStyle={{ fontSize: 12 }}
            width={ screenWidth}
            onPress={(item) => {
              console.log("Pressed category:", item.label, item.value);
            }}
          />

          <Text style={styles.chartTitle}>Daily Expenses</Text>
          <LineChart
            data={lineChartData}
            thickness={3}
            color="#ff4d4d"
            hideDataPoints={false}
            areaChart
            startFillOpacity={0.2}
            endFillOpacity={0.05}
            curved
            width={screenWidth}
            onPointPress={(point) => {
              console.log("Pressed date:", point.label, point.value);
            }}
          />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 50 // allow scrolling to bottom
  },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 16 },
  dateRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 16 },
  dateButton: {
    backgroundColor: '#9DB7FF',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  dateButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  chartTitle: { fontSize: 18, fontWeight: '600', marginTop: 24, marginBottom: 10 },
});
