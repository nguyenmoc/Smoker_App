import { Revenue } from '@/constants/tableData';
import { useTableManagement } from '@/hooks/useTableManagement';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
    Animated,
    Platform,
    RefreshControl,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

type TimePeriod = 'day' | 'week' | 'month';

export default function RevenueScreen() {
  const router = useRouter();
  const { revenues, getTodayRevenue, getMonthRevenue, getRevenueByDate, loading, refresh } = useTableManagement();
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('week');
  const scrollY = useRef(new Animated.Value(0)).current;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getDate()}/${date.getMonth() + 1}`;
  };

  const getChartData = () => {
    const days = selectedPeriod === 'day' ? 1 : selectedPeriod === 'week' ? 7 : 30;
    const data = getRevenueByDate(days);
    
    const grouped: { [key: string]: number } = {};
    data.forEach(rev => {
      const dateKey = formatDate(rev.date);
      grouped[dateKey] = (grouped[dateKey] || 0) + rev.amount;
    });

    return Object.entries(grouped).map(([date, amount]) => ({ date, amount }));
  };

  const chartData = getChartData();
  const maxAmount = Math.max(...chartData.map(d => d.amount), 1);
  const todayRevenue = getTodayRevenue();
  const monthRevenue = getMonthRevenue();

  const RevenueItem = ({ item }: { item: Revenue }) => (
    <View style={styles.revenueItem}>
      <View style={styles.revenueItemHeader}>
        <View style={styles.revenueItemLeft}>
          <View style={styles.tableNumberBadge}>
            <Text style={styles.tableNumberText}>Bàn {item.tableNumber}</Text>
          </View>
          <View>
            <Text style={styles.revenueAmount}>{formatCurrency(item.amount)}</Text>
            <Text style={styles.revenueDate}>
              {new Date(item.date).toLocaleString('vi-VN')}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.orderItems}>
        {item.items.map((orderItem, index) => (
          <View key={index} style={styles.orderItem}>
            <Text style={styles.orderItemName}>
              {orderItem.name} x{orderItem.quantity}
            </Text>
            <Text style={styles.orderItemPrice}>
              {formatCurrency(orderItem.price * orderItem.quantity)}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar 
        barStyle="dark-content" 
        backgroundColor="transparent" 
        translucent 
      />
      
      {/* Nút Back */}
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => router.back()}
        activeOpacity={0.7}
      >
        <Ionicons name="arrow-back" size={24} color="#111827" />
      </TouchableOpacity>

        {/* <AnimatedHeader
          title="Thu nhập"
          iconName="download-outline"
          onIconPress={() => {}}
          headerTranslateY={headerTranslateY}
        /> */}

        <Animated.ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40, paddingTop: 100 }}
          refreshControl={
            <RefreshControl 
              refreshing={loading} 
              onRefresh={refresh}
              colors={['#2563eb']}
              tintColor="#2563eb"
            />
          }
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: true }
          )}
          scrollEventThrottle={16}
        >
          <View style={styles.summaryContainer}>
            <View style={[styles.summaryCard, { backgroundColor: '#10b981' }]}>
              <Ionicons name="today-outline" size={32} color="#fff" />
              <Text style={styles.summaryLabel}>Hôm nay</Text>
              <Text style={styles.summaryAmount}>{formatCurrency(todayRevenue)}</Text>
            </View>

            <View style={[styles.summaryCard, { backgroundColor: '#2563eb' }]}>
              <Ionicons name="calendar-outline" size={32} color="#fff" />
              <Text style={styles.summaryLabel}>Tháng này</Text>
              <Text style={styles.summaryAmount}>{formatCurrency(monthRevenue)}</Text>
            </View>
          </View>

          <View style={styles.chartSection}>
            <View style={styles.chartHeader}>
              <Text style={styles.chartTitle}>Biểu đồ doanh thu</Text>
              
              <View style={styles.periodSelector}>
                {(['day', 'week', 'month'] as TimePeriod[]).map((period) => (
                  <TouchableOpacity
                    key={period}
                    style={[
                      styles.periodButton,
                      selectedPeriod === period && styles.periodButtonActive
                    ]}
                    onPress={() => setSelectedPeriod(period)}
                  >
                    <Text style={[
                      styles.periodButtonText,
                      selectedPeriod === period && styles.periodButtonTextActive
                    ]}>
                      {period === 'day' ? 'Ngày' : period === 'week' ? 'Tuần' : 'Tháng'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.chart}>
              {chartData.length > 0 ? (
                chartData.map((item, index) => {
                  const barHeight = (item.amount / maxAmount) * 150;
                  return (
                    <View key={index} style={styles.barContainer}>
                      <View style={[styles.bar, { height: barHeight }]}>
                        <Text style={styles.barAmount}>
                          {(item.amount / 1000000).toFixed(1)}M
                        </Text>
                      </View>
                      <Text style={styles.barLabel}>{item.date}</Text>
                    </View>
                  );
                })
              ) : (
                <View style={styles.emptyChart}>
                  <Ionicons name="bar-chart-outline" size={48} color="#d1d5db" />
                  <Text style={styles.emptyChartText}>Chưa có dữ liệu</Text>
                </View>
              )}
            </View>
          </View>

          <View style={styles.revenueList}>
            <Text style={styles.sectionTitle}>Lịch sử giao dịch</Text>
            
            {revenues.length > 0 ? (
              revenues.map((revenue) => (
                <RevenueItem key={revenue.id} item={revenue} />
              ))
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="receipt-outline" size={48} color="#9ca3af" />
                <Text style={styles.emptyStateText}>Chưa có giao dịch nào</Text>
              </View>
            )}
          </View>
        </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 44,
  },
  safeArea: {
    flex: 1,
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 8 : 52,
    left: 16,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 16,
  },
  summaryCard: {
    flex: 1,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  summaryLabel: {
    color: '#fff',
    fontSize: 14,
    marginTop: 8,
    opacity: 0.9,
  },
  summaryAmount: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginTop: 4,
  },
  chartSection: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 2,
  },
  periodButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  periodButtonActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  periodButtonText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  periodButtonTextActive: {
    color: '#2563eb',
    fontWeight: '600',
  },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    height: 200,
    paddingTop: 20,
  },
  barContainer: {
    alignItems: 'center',
    flex: 1,
  },
  bar: {
    width: 30,
    backgroundColor: '#2563eb',
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 4,
    minHeight: 20,
  },
  barAmount: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
  },
  barLabel: {
    fontSize: 11,
    color: '#6b7280',
    marginTop: 6,
  },
  emptyChart: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyChartText: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 8,
  },
  revenueList: {
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  revenueItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  revenueItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  revenueItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  tableNumberBadge: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  tableNumberText: {
    color: '#2563eb',
    fontSize: 14,
    fontWeight: '600',
  },
  revenueAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#10b981',
  },
  revenueDate: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  orderItems: {
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingTop: 12,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  orderItemName: {
    fontSize: 14,
    color: '#374151',
  },
  orderItemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 12,
  },
});