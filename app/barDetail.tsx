import { useBar } from "@/hooks/useBar";
import { BarTable } from "@/types/tableType";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  FlatList,
  Image,
  Linking,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

// Table Card Component
const TableCard: React.FC<{
  item: BarTable;
  index: number;
  isSelected: boolean;
  isBooked: boolean;
  onSelect: (table: BarTable) => void;
}> = ({ item, index, isSelected, isBooked, onSelect }) => {
  const animValue = useRef(new Animated.Value(0)).current;
  const scaleValue = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(animValue, {
      toValue: 1,
      delay: index * 100,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    Animated.spring(scaleValue, {
      toValue: isSelected ? 1.05 : 1,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();
  }, [isSelected]);

  const handlePress = () => {
    if (!isBooked) {
      onSelect(item);
    }
  };

  return (
    <Animated.View
      style={[
        styles.tableCard,
        isBooked && styles.tableCardBooked,
        isSelected && styles.tableCardSelected,
        { borderColor: item.color || 'transparent' },
        {
          opacity: animValue,
          transform: [
            {
              translateY: animValue.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0],
              }),
            },
            { scale: scaleValue },
          ],
        },
      ]}
    >
      <Pressable
        onPress={handlePress}
        disabled={isBooked}
        style={styles.tableCardPressable}
      >
        <View style={styles.tableHeader}>
          <View
            style={[
              styles.tableIconContainer,
              isBooked && styles.tableIconBooked,
              isSelected && styles.tableIconSelected,
              { backgroundColor: isSelected ? item.color : `${item.color}20` },
            ]}
          >
            <Ionicons
              name={isBooked ? "lock-closed" : "restaurant-outline"}
              size={24}
              color={isBooked ? "#94a3b8" : isSelected ? "#fff" : item.color}
            />
          </View>
          {isSelected && (
            <View style={styles.selectedBadge}>
              <Ionicons name="checkmark-circle" size={20} color="#10b981" />
            </View>
          )}
        </View>
        <Text
          style={[
            styles.tableName,
            isBooked && styles.tableNameBooked,
            isSelected && styles.tableNameSelected,
          ]}
          numberOfLines={1}
        >
          {item.tableName}
        </Text>
        <View style={styles.tableTypeContainer}>
          <Text
            style={[styles.tableType, isBooked && styles.tableTextBooked]}
          >
            {item.tableTypeName}
          </Text>
        </View>
        <View style={styles.tableInfo}>
          <Ionicons
            name="people-outline"
            size={16}
            color={isBooked ? "#94a3b8" : "#64748b"}
          />
          <Text
            style={[styles.tableCapacity, isBooked && styles.tableTextBooked]}
          >
            {item.capacity} người
          </Text>
        </View>
        <Text
          style={[
            styles.tablePrice,
            isBooked && styles.tablePriceBooked,
            isSelected && styles.tablePriceSelected,
          ]}
        >
          {item.depositPrice.toLocaleString()}₫
        </Text>
        {isBooked && (
          <View style={styles.bookedBadge}>
            <Text style={styles.bookedText}>Đã đặt</Text>
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
};

// Skeleton Loading Component
const SkeletonCard = () => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />
      <Animated.View style={[styles.skeletonHeader, { opacity }]} />
      <View style={styles.skeletonInfoCard}>
        <Animated.View
          style={[styles.skeletonText, { width: "70%", height: 28, opacity }]}
        />
        <Animated.View
          style={[
            styles.skeletonText,
            { width: "90%", height: 16, marginTop: 16, opacity },
          ]}
        />
        <Animated.View
          style={[
            styles.skeletonText,
            { width: "60%", height: 16, marginTop: 8, opacity },
          ]}
        />
        <View style={styles.skeletonStatsContainer}>
          {[1, 2, 3].map((i) => (
            <Animated.View key={i} style={[styles.skeletonStat, { opacity }]} />
          ))}
        </View>
      </View>
      <View style={styles.section}>
        <Animated.View
          style={[styles.skeletonText, { width: 150, height: 24, opacity }]}
        />
        <View style={styles.skeletonTableList}>
          {[1, 2, 3, 4].map((i) => (
            <Animated.View key={i} style={[styles.skeletonTable, { opacity }]} />
          ))}
        </View>
      </View>
    </View>
  );
};

const BarDetail: React.FC<any> = ({}) => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const {
    barDetail,
    tables,
    bookedTables,
    loadingDetail,
    loadingTables,
    loadingBooking,
    fetchBarDetail,
    fetchTables,
    fetchBookedTables,
    createBooking,
    createPaymentLink,
  } = useBar();

  const [selectedTables, setSelectedTables] = useState<BarTable[]>([]);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    fetchBarDetail(id);
    fetchTables(id);
  }, [id]);

  useEffect(() => {
    if (barDetail?.entityAccountId) {
      fetchBookedTables(barDetail.entityAccountId, selectedDate);
    }
  }, [barDetail?.entityAccountId, selectedDate]);

  useEffect(() => {
    if (!loadingDetail && barDetail) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [loadingDetail, barDetail]);

  const handleBackPress = () => {
    router.back();
  };

  const handleTableSelect = (table: BarTable) => {
    setSelectedTables((prev) => {
      const isSelected = prev.some((t) => t.tableId === table.tableId);
      if (isSelected) {
        return prev.filter((t) => t.tableId !== table.tableId);
      } else {
        return [...prev, table];
      }
    });
  };

  const isTableBooked = (tableId: string): boolean => {
    if (!bookedTables || bookedTables.length === 0) return false;
    
    return bookedTables.some((booking) => {
      if (booking.ScheduleStatus === "Canceled") return false;
      return Object.keys(booking.detailSchedule?.Table || {}).includes(tableId);
    });
  };

  const calculateTotalAmount = (): number => {
    if (!selectedTables || selectedTables.length === 0) return 0;
    return selectedTables.reduce((sum, table) => sum + table.depositPrice, 0);
  };

  const handleBookingPress = () => {
    if (selectedTables.length === 0) {
      Alert.alert("Thông báo", "Vui lòng chọn ít nhất một bàn!");
      return;
    }

    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    handleBookTable();
  };

const handleBookTable = async () => {
  try {
    const totalAmount = calculateTotalAmount();
    const depositAmount = Math.round(totalAmount * 0.3); // 30% deposit

    Alert.alert(
      "Xác nhận đặt bàn",
      `Bàn: ${selectedTables.map((t) => t.tableName).join(", ")}\n` +
        `Tổng tiền cọc: ${totalAmount.toLocaleString()}₫\n` +
        `Thanh toán trước (30%): ${depositAmount.toLocaleString()}₫\n\n` +
        `Xác nhận đặt bàn?`,
      [
        {
          text: "Hủy",
          style: "cancel",
        },
        {
          text: "Đặt bàn",
          onPress: async () => {
            try {
              const bookingData = {
                receiverId: barDetail!.entityAccountId,
                tables: selectedTables.map((t) => ({
                  id: t.tableId,
                  tableName: t.tableName,
                  price: t.depositPrice,
                })),
                note: `Đặt bàn - ${new Date().toLocaleString()}`,
                totalAmount,
                bookingDate: selectedDate,
                startTime: `${selectedDate}T00:00:00.000Z`,
                endTime: `${selectedDate}T23:59:59.999Z`,
                paymentStatus: "Pending",
                scheduleStatus: "Confirmed",
              };

              console.log('bookingData>>>>', bookingData);
              const bookingResult = await createBooking(bookingData);
              console.log('bookingResult>>>>', bookingResult);

              // Sửa đây: bookingResult đã là data rồi, không cần .data nữa
              if (!bookingResult || !bookingResult.BookedScheduleId) {
                Alert.alert("Lỗi", "Không thể tạo booking!");
                return;
              }

              // Create payment link - sửa tham số
              const paymentResult = await createPaymentLink(
                bookingResult.BookedScheduleId, // Sửa đây
                depositAmount
              );

              console.log('paymentResult>>>>', paymentResult);

              if (paymentResult?.paymentUrl) { // Sửa đây
                Alert.alert(
                  "Thành công",
                  "Chuyển đến trang thanh toán...",
                  [
                    {
                      text: "OK",
                      onPress: () => {
                        Linking.openURL(paymentResult.paymentUrl); // Sửa đây
                        router.back();
                      },
                    },
                  ]
                );
              } else {
                Alert.alert(
                  "Thành công",
                  "Đặt bàn thành công! Vui lòng thanh toán sau."
                );
                router.back();
              }
            } catch (error) {
              console.error('Booking error:', error);
              Alert.alert("Lỗi", "Có lỗi xảy ra. Vui lòng thử lại!");
            }
          },
        },
      ]
    );
  } catch (error) {
    console.error('handleBookTable error:', error);
    Alert.alert("Lỗi", "Không thể đặt bàn. Vui lòng thử lại!");
  }
};

  const renderTableItem = ({
    item,
    index,
  }: {
    item: BarTable;
    index: number;
  }) => {
    const isBooked = isTableBooked(item.tableId);
    const isSelected = selectedTables.some((t) => t.tableId === item.tableId);

    return (
      <TableCard
        item={item}
        index={index}
        isSelected={isSelected}
        isBooked={isBooked}
        onSelect={handleTableSelect}
      />
    );
  };

  if (loadingDetail) {
    return <SkeletonCard />;
  }

  if (!barDetail) {
    return (
      <SafeAreaView style={styles.emptyContainer}>
        <Ionicons name="sad-outline" size={64} color="#cbd5e1" />
        <Text style={styles.emptyText}>Không tìm thấy quán bar</Text>
        <Pressable style={styles.backButton} onPress={handleBackPress}>
          <Text style={styles.backButtonText}>Quay lại</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      {/* Header */}
      <SafeAreaView style={styles.headerSafeArea} edges={["top"]}>
        <View style={styles.headerOverlay}>
          <Pressable
            style={styles.backButtonCircle}
            onPress={handleBackPress}
            android_ripple={{ color: "rgba(255,255,255,0.3)", borderless: true }}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </Pressable>
          <Pressable style={styles.favoriteButton}>
            <Ionicons name="heart-outline" size={24} color="#fff" />
          </Pressable>
        </View>
      </SafeAreaView>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Bar Image */}
        <Animated.View
          style={[
            styles.imageContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <Image
            source={{ uri: barDetail.background || barDetail.avatar }}
            style={styles.barImage}
            resizeMode="cover"
          />
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.7)"]}
            style={styles.imageGradient}
          />
          {barDetail.role && (
            <View style={styles.roleBadge}>
              <Ionicons
                name="checkmark-circle"
                size={14}
                color="#fff"
                style={{ marginRight: 4 }}
              />
              <Text style={styles.roleText}>{barDetail.role}</Text>
            </View>
          )}
        </Animated.View>

        {/* Bar Info */}
        <Animated.View
          style={[
            styles.barInfoCard,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={styles.barName}>{barDetail.barName}</Text>

          <View style={styles.infoRow}>
            <View style={styles.infoIconContainer}>
              <Ionicons name="location" size={18} color="#3b82f6" />
            </View>
            <Text style={styles.infoText}>
              {barDetail.address ||
                barDetail.addressData?.fullAddress ||
                "Chưa cập nhật địa chỉ"}
            </Text>
          </View>

          {barDetail.phoneNumber && (
            <View style={styles.infoRow}>
              <View style={styles.infoIconContainer}>
                <Ionicons name="call" size={18} color="#10b981" />
              </View>
              <Text style={styles.infoText}>{barDetail.phoneNumber}</Text>
            </View>
          )}

          {barDetail.email && (
            <View style={styles.infoRow}>
              <View style={styles.infoIconContainer}>
                <Ionicons name="mail" size={18} color="#f59e0b" />
              </View>
              <Text style={styles.infoText}>{barDetail.email}</Text>
            </View>
          )}

          {/* Quick Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Ionicons name="time-outline" size={20} color="#64748b" />
              <Text style={styles.statText}>18:00 - 02:00</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Ionicons name="star" size={20} color="#fbbf24" />
              <Text style={styles.statText}>4.5</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Ionicons name="people-outline" size={20} color="#64748b" />
              <Text style={styles.statText}>250+</Text>
            </View>
          </View>
        </Animated.View>

        {/* Tables Section */}
        <Animated.View
          style={[
            styles.section,
            {
              opacity: fadeAnim,
            },
          ]}
        >
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Chọn bàn</Text>
            <Ionicons name="calendar-outline" size={20} color="#3b82f6" />
          </View>

          {selectedTables.length > 0 && (
            <View style={styles.selectedInfo}>
              <Text style={styles.selectedInfoText}>
                Đã chọn {selectedTables.length} bàn •{" "}
                {calculateTotalAmount().toLocaleString()}₫
              </Text>
            </View>
          )}

          {loadingTables ? (
            <View style={styles.loadingTableContainer}>
              <ActivityIndicator size="small" color="#3b82f6" />
            </View>
          ) : !tables || tables.length === 0 ? (
            <View style={styles.emptyTableContainer}>
              <Ionicons name="restaurant-outline" size={48} color="#cbd5e1" />
              <Text style={styles.emptyTableText}>Chưa có bàn nào</Text>
            </View>
          ) : (
            <FlatList
              data={tables}
              renderItem={renderTableItem}
              keyExtractor={(item) => item.tableId}
              numColumns={2}
              columnWrapperStyle={styles.tableRow}
              contentContainerStyle={styles.tableList}
            />
          )}
        </Animated.View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Floating Book Button */}
      {selectedTables.length > 0 && (
        <Animated.View
          style={[
            styles.bookingButtonContainer,
            {
              transform: [{ scale: buttonScale }],
            },
          ]}
        >
          <Pressable
            style={styles.bookingButton}
            onPress={handleBookingPress}
            android_ripple={{ color: "rgba(255,255,255,0.3)" }}
            disabled={loadingBooking}
          >
            <LinearGradient
              colors={["#3b82f6", "#2563eb"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.bookingButtonGradient}
            >
              {loadingBooking ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons name="calendar" size={24} color="#fff" />
                  <Text style={styles.bookingButtonText}>
                    Đặt bàn ({selectedTables.length})
                  </Text>
                </>
              )}
            </LinearGradient>
          </Pressable>
        </Animated.View>
      )}
    </View>
  );
};

export default BarDetail;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    backgroundColor: "#f8fafc",
  },
  emptyText: {
    fontSize: 18,
    color: "#64748b",
    marginTop: 16,
    fontWeight: "600",
  },
  backButton: {
    marginTop: 24,
    paddingHorizontal: 32,
    paddingVertical: 12,
    backgroundColor: "#3b82f6",
    borderRadius: 24,
  },
  backButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  headerSafeArea: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: "transparent",
  },
  headerOverlay: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButtonCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  favoriteButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  imageContainer: {
    position: "relative",
    height: 300,
  },
  barImage: {
    width: "100%",
    height: "100%",
    backgroundColor: "#e2e8f0",
  },
  imageGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 150,
  },
  roleBadge: {
    position: "absolute",
    top: 70,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 24,
    backgroundColor: "#10b981",
    shadowColor: "#10b981",
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 6,
  },
  roleText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
  },
  barInfoCard: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: -40,
    borderRadius: 24,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 16,
    elevation: 8,
  },
  barName: {
    fontSize: 26,
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  infoIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  infoText: {
    fontSize: 15,
    color: "#475569",
    flex: 1,
    fontWeight: "500",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },
  statItem: {
    alignItems: "center",
    gap: 6,
  },
  statText: {
    fontSize: 14,
    color: "#64748b",
    fontWeight: "600",
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: "#e2e8f0",
  },
  section: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0f172a",
  },
  selectedInfo: {
    backgroundColor: "#eff6ff",
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#3b82f6",
  },
  selectedInfoText: {
    fontSize: 14,
    color: "#1e40af",
    fontWeight: "600",
    textAlign: "center",
  },
  loadingTableContainer: {
    paddingVertical: 40,
    alignItems: "center",
  },
  emptyTableContainer: {
    paddingVertical: 40,
    alignItems: "center",
  },
  emptyTableText: {
    fontSize: 15,
    color: "#94a3b8",
    marginTop: 12,
    fontWeight: "500",
  },
  tableList: {
    paddingVertical: 8,
  },
  tableRow: {
    justifyContent: "space-between",
    marginBottom: 14,
  },
  tableCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
    width: (width - 48) / 2,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 2,
    borderColor: "transparent",
  },
  tableCardBooked: {
    backgroundColor: "#f1f5f9",
    opacity: 0.6,
  },
  tableCardSelected: {
    borderColor: "#3b82f6",
    backgroundColor: "#eff6ff",
  },
  tableCardPressable: {
    flex: 1,
  },
  tableHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  tableIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#eff6ff",
    justifyContent: "center",
    alignItems: "center",
  },
  tableIconBooked: {
    backgroundColor: "#f1f5f9",
  },
  tableIconSelected: {
    backgroundColor: "#3b82f6",
  },
  selectedBadge: {
    position: "absolute",
    right: 0,
    top: 0,
  },
  tableName: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 6,
  },
  tableTypeContainer: {
    marginBottom: 8,
  },
  tableType: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: "500",
    fontStyle: "italic",
  },
  tableNameBooked: {
    color: "#94a3b8",
  },
  tableNameSelected: {
    color: "#1e40af",
  },
  tableInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 6,
  },
  tableCapacity: {
    fontSize: 13,
    color: "#64748b",
    fontWeight: "500",
  },
  tableTextBooked: {
    color: "#94a3b8",
  },
  tablePrice: {
    fontSize: 16,
    fontWeight: "800",
    color: "#3b82f6",
  },
  tablePriceBooked: {
    color: "#94a3b8",
  },
  tablePriceSelected: {
    color: "#1e40af",
  },
  bookedBadge: {
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: "#94a3b8",
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  bookedText: {
    fontSize: 11,
    color: "#fff",
    fontWeight: "600",
  },
  bookingButtonContainer: {
    position: "absolute",
    bottom: 20,
    left: 16,
    right: 16,
  },
  bookingButton: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#3b82f6",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 10,
  },
  bookingButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    gap: 10,
  },
  bookingButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  // Skeleton Styles
  skeletonHeader: {
    width: "100%",
    height: 300,
    backgroundColor: "#e2e8f0",
  },
  skeletonInfoCard: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: -40,
    borderRadius: 24,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 16,
    elevation: 8,
  },
  skeletonText: {
    backgroundColor: "#e2e8f0",
    borderRadius: 8,
  },
  skeletonStatsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },
  skeletonStat: {
    width: 60,
    height: 40,
    backgroundColor: "#e2e8f0",
    borderRadius: 12,
  },
  skeletonTableList: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 16,
    gap: 14,
  },
  skeletonTable: {
    width: (width - 48) / 2,
    height: 160,
    backgroundColor: "#e2e8f0",
    borderRadius: 16,
  },
});