import AnimatedHeader from "@/components/ui/AnimatedHeader";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';
import React, { useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  FlatList,
  Image,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get("window");
const COMBO_WIDTH = width * 0.42;
const COMBO_HEIGHT = COMBO_WIDTH * 0.8;

// Data banner quảng cáo các combo hot
const bannerData = [
  {
    id: "1",
    title: "Happy Hour 50% OFF",
    subtitle: "Mọi đồ uống từ 17h-19h",
    image: "https://picsum.photos/400/250?random=1",
    discount: "50%",
  },
  {
    id: "2",
    title: "Combo Sinh Nhật VIP",
    subtitle: "Miễn phí bánh kem + trang trí",
    image: "https://picsum.photos/400/250?random=2",
    discount: "FREE",
  },
  {
    id: "3",
    title: "Weekend Party",
    subtitle: "DJ live + Cocktail đặc biệt",
    image: "https://picsum.photos/400/250?random=3",
    discount: "30%",
  },
];

// Data các combo đồ uống và món ăn
const combosData = [
  {
    id: "1",
    title: "COMBO ROMANTIC",
    image: "https://picsum.photos/300/240?random=10",
    originalPrice: "850.000đ",
    salePrice: "650.000đ",
    category: "couple",
    items: ["2 Cocktail đặc biệt", "Bánh ngọt", "Nến thơm"],
    suitable: "2-3 người",
    rating: 4.8,
    reviews: 124,
    isHot: true,
  },
  {
    id: "2",
    title: "COMBO FRIENDS",
    image: "https://picsum.photos/300/240?random=11",
    originalPrice: "1.200.000đ",
    salePrice: "950.000đ",
    category: "group",
    items: ["6 Bia craft", "Mix snack", "Karaoke 2h"],
    suitable: "4-6 người",
    rating: 4.6,
    reviews: 89,
    isHot: false,
  },
  {
    id: "3",
    title: "COMBO PREMIUM",
    image: "https://picsum.photos/300/240?random=12",
    originalPrice: "2.500.000đ",
    salePrice: "2.000.000đ",
    category: "vip",
    items: ["Whisky premium", "Hải sản", "Phòng VIP"],
    suitable: "6-10 người",
    rating: 4.9,
    reviews: 67,
    isHot: true,
  },
  {
    id: "4",
    title: "COMBO BIRTHDAY",
    image: "https://picsum.photos/300/240?random=13",
    originalPrice: "1.500.000đ",
    salePrice: "1.200.000đ",
    category: "party",
    items: ["Bánh kem", "Trang trí", "6 đồ uống"],
    suitable: "5-8 người",
    rating: 4.7,
    reviews: 156,
    isHot: false,
  },
  {
    id: "5",
    title: "COMBO BUSINESS",
    image: "https://picsum.photos/300/240?random=14",
    originalPrice: "1.800.000đ",
    salePrice: "1.500.000đ",
    category: "business",
    items: ["Wine premium", "Món Âu", "Không gian riêng"],
    suitable: "4-6 người",
    rating: 4.5,
    reviews: 43,
    isHot: false,
  },
];

// Categories cho phân loại combo
const categories = [
  { id: 'all', name: 'Tất cả', icon: 'apps-outline' },
  { id: 'couple', name: 'Hẹn hò', icon: 'heart-outline' },
  { id: 'group', name: 'Nhóm bạn', icon: 'people-outline' },
  { id: 'vip', name: 'VIP', icon: 'diamond-outline' },
  { id: 'party', name: 'Tiệc tùng', icon: 'balloon-outline' },
  { id: 'business', name: 'Công việc', icon: 'briefcase-outline' },
];

export default function NewFeedScreen() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const carouselRef = useRef<ScrollView>(null);
  const scrollY = useRef(new Animated.Value(0)).current;

  const handleScrollEnd = (e: any) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / width);
    setActiveIndex(index);
  };

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 2000);
  };

  const getFilteredCombos = () => {
    if (selectedCategory === 'all') {
      return combosData;
    }
    return combosData.filter(combo => combo.category === selectedCategory);
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      couple: '#ef4444',
      group: '#3b82f6',
      vip: '#f59e0b',
      party: '#8b5cf6',
      business: '#10b981',
    };
    return colors[category] || '#6b7280';
  };

  const BannerItem = ({ item, index }: any) => (
    <View style={styles.bannerSlide}>
      <Image source={{ uri: item.image }} style={styles.bannerImage} />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.8)']}
        style={styles.bannerOverlay}
      >
        <View style={styles.bannerContent}>
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>{item.discount}</Text>
          </View>
          <Text style={styles.bannerTitle}>{item.title}</Text>
          <Text style={styles.bannerSubtitle}>{item.subtitle}</Text>
        </View>
      </LinearGradient>
    </View>
  );

  const ComboCard = ({ item }: any) => (
    <TouchableOpacity style={styles.comboCard} activeOpacity={0.8}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: item.image }} style={styles.comboImage} />
        {item.isHot && (
          <View style={styles.hotBadge}>
            <Ionicons name="flame" size={12} color="#fff" />
            <Text style={styles.hotText}>HOT</Text>
          </View>
        )}
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={12} color="#fbbf24" />
          <Text style={styles.ratingText}>{item.rating}</Text>
        </View>
      </View>

      <View style={styles.comboInfo}>
        <Text style={styles.comboTitle} numberOfLines={1}>{item.title}</Text>
        
        <View style={styles.itemsList}>
          {item.items.map((itemName, index) => (
            <Text key={index} style={styles.itemText} numberOfLines={1}>
              • {itemName}
            </Text>
          ))}
        </View>

        <View style={styles.suitableContainer}>
          <Ionicons name="people-outline" size={14} color="#6b7280" />
          <Text style={styles.suitableText}>{item.suitable}</Text>
        </View>

        <View style={styles.priceContainer}>
          <Text style={styles.originalPrice}>{item.originalPrice}</Text>
          <Text style={styles.salePrice}>{item.salePrice}</Text>
        </View>

        <View style={styles.reviewContainer}>
          <Text style={styles.reviewText}>({item.reviews} đánh giá)</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const CategoryTab = ({ item, isSelected, onPress }: any) => (
    <TouchableOpacity
      style={[styles.categoryTab, isSelected && styles.activeCategoryTab]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Ionicons 
        name={item.icon} 
        size={18} 
        color={isSelected ? '#fff' : '#6b7280'} 
      />
      <Text style={[styles.categoryText, isSelected && styles.activeCategoryText]}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, -100],
    extrapolate: 'clamp',
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#1f2937" />

      <AnimatedHeader
        title="Combo Hot"
        headerTranslateY={headerTranslateY}
      />

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        {/* Banner Carousel */}
        <View style={styles.carouselContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            ref={carouselRef}
            onMomentumScrollEnd={handleScrollEnd}
          >
            {bannerData.map((item, index) => (
              <BannerItem key={item.id} item={item} index={index} />
            ))}
          </ScrollView>

          {/* Pagination Dots */}
          <View style={styles.pagination}>
            {bannerData.map((_, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.dot, index === activeIndex && styles.activeDot]}
                onPress={() => {
                  carouselRef.current?.scrollTo({ x: index * width, animated: true });
                  setActiveIndex(index);
                }}
              />
            ))}
          </View>
        </View>

        {/* Category Tabs */}
        <View style={styles.categoriesContainer}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesList}
          >
            {categories.map((category) => (
              <CategoryTab
                key={category.id}
                item={category}
                isSelected={selectedCategory === category.id}
                onPress={() => setSelectedCategory(category.id)}
              />
            ))}
          </ScrollView>
        </View>

        {/* Combos Section */}
        <View style={styles.combosSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Combo Đặc Biệt {selectedCategory !== 'all' && `- ${categories.find(c => c.id === selectedCategory)?.name}`}
            </Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={getFilteredCombos()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.combosList}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <ComboCard item={item} />}
          />
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.actionCard}>
            <LinearGradient colors={['#3b82f6', '#1d4ed8']} style={styles.actionGradient}>
              <Ionicons name="calendar-outline" size={28} color="#fff" />
              <Text style={styles.actionText}>Đặt bàn</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard}>
            <LinearGradient colors={['#10b981', '#059669']} style={styles.actionGradient}>
              <Ionicons name="gift-outline" size={28} color="#fff" />
              <Text style={styles.actionText}>Ưu đãi</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard}>
            <LinearGradient colors={['#f59e0b', '#d97706']} style={styles.actionGradient}>
              <Ionicons name="location-outline" size={28} color="#fff" />
              <Text style={styles.actionText}>Chi nhánh</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </Animated.ScrollView>

      {/* Floating Book Button */}
      <TouchableOpacity style={styles.floatingButton} activeOpacity={0.8}>
        <LinearGradient colors={['#ef4444', '#dc2626']} style={styles.floatingGradient}>
          <Ionicons name="calendar" size={20} color="#fff" />
          <Text style={styles.floatingText}>Đặt bàn ngay</Text>
        </LinearGradient>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  
  // Banner Styles
  carouselContainer: {
    height: 280,
    marginTop: 24,
  },
  bannerSlide: {
    width,
    height: 280,
    position: 'relative',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    borderRadius: 0,
  },
  bannerOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  bannerContent: {
    alignItems: 'flex-start',
  },
  discountBadge: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 12,
  },
  discountText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  bannerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  bannerSubtitle: {
    fontSize: 16,
    color: '#e5e7eb',
    marginTop: 4,
  },

  // Pagination
  pagination: {
    position: 'absolute',
    bottom: 15,
    alignSelf: 'center',
    flexDirection: 'row',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.4)',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#fff',
    width: 20,
  },

  // Categories
  categoriesContainer: {
    marginVertical: 20,
  },
  categoriesList: {
    paddingHorizontal: 20,
    paddingRight: 40,
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 12,
    backgroundColor: '#fff',
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  activeCategoryTab: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    marginLeft: 6,
  },
  activeCategoryText: {
    color: '#fff',
  },

  // Combos Section
  combosSection: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    flex: 1,
  },
  seeAll: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '600',
  },
  combosList: {
    paddingHorizontal: 20,
  },

  // Combo Card
  comboCard: {
    width: COMBO_WIDTH,
    marginRight: 15,
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
  },
  comboImage: {
    width: '100%',
    height: COMBO_HEIGHT,
  },
  hotBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ef4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  hotText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 2,
  },
  ratingContainer: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ratingText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 2,
  },
  comboInfo: {
    padding: 12,
  },
  comboTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 6,
  },
  itemsList: {
    marginBottom: 8,
  },
  itemText: {
    fontSize: 11,
    color: '#6b7280',
    marginBottom: 2,
  },
  suitableContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  suitableText: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 4,
    fontWeight: '500',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  originalPrice: {
    fontSize: 12,
    color: '#9ca3af',
    textDecorationLine: 'line-through',
    marginRight: 8,
  },
  salePrice: {
    fontSize: 16,
    color: '#ef4444',
    fontWeight: 'bold',
  },
  reviewContainer: {
    alignItems: 'flex-end',
  },
  reviewText: {
    fontSize: 10,
    color: '#9ca3af',
  },

  // Quick Actions
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  actionCard: {
    flex: 1,
    marginHorizontal: 5,
    borderRadius: 12,
    overflow: 'hidden',
  },
  actionGradient: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  actionText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 6,
  },

  // Floating Button
  floatingButton: {
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
    borderRadius: 25,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  floatingGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  floatingText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});