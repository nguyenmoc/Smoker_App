import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Table {
  id: string;
  number: number;
  type: 'vip' | 'luxury' | 'thường';
  status: 'trống' | 'đang sử dụng' | 'đã đặt';
  capacity: number;
}

const tableTypes = [
  { value: 'thường', label: 'Bàn Thường', color: '#6b7280' },
  { value: 'vip', label: 'Bàn VIP', color: '#f59e0b' },
  { value: 'luxury', label: 'Bàn Luxury', color: '#8b5cf6' },
];

const initialTables: Table[] = [
  { id: '1', number: 1, type: 'thường', status: 'trống', capacity: 4 },
  { id: '2', number: 2, type: 'vip', status: 'đang sử dụng', capacity: 6 },
  { id: '3', number: 3, type: 'luxury', status: 'đã đặt', capacity: 8 },
];

export default function TableManagementScreen() {
  const router = useRouter();
  const [tables, setTables] = useState<Table[]>(initialTables);
  const [tableModalVisible, setTableModalVisible] = useState(false);
  const [newTable, setNewTable] = useState({
    number: '',
    type: 'thường' as 'vip' | 'luxury' | 'thường',
    capacity: '',
  });

  const createTable = () => {
    if (!newTable.number || !newTable.capacity) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin');
      return;
    }

    const tableExists = tables.find(table => table.number === parseInt(newTable.number));
    if (tableExists) {
      Alert.alert('Lỗi', 'Số bàn đã tồn tại');
      return;
    }

    const table: Table = {
      id: Date.now().toString(),
      number: parseInt(newTable.number),
      type: newTable.type,
      capacity: parseInt(newTable.capacity),
      status: 'trống',
    };

    setTables(prev => [...prev, table].sort((a, b) => a.number - b.number));
    setTableModalVisible(false);
    Alert.alert('Thành công', 'Đã tạo bàn mới');
  };

  const TableItem = ({ table }: { table: Table }) => {
    const typeConfig = tableTypes.find(t => t.value === table.type);
    return (
      <View style={styles.tableItem}>
        <View style={styles.tableItemLeft}>
          <View style={[styles.tableTypeIndicator, { backgroundColor: typeConfig?.color }]} />
          <View>
            <Text style={styles.tableNumber}>Bàn {table.number}</Text>
            <Text style={styles.tableType}>{typeConfig?.label} - {table.capacity} người</Text>
            <Text style={[styles.tableStatus,
              table.status === 'trống' && { color: '#10b981' },
              table.status === 'đang sử dụng' && { color: '#ef4444' },
              table.status === 'đã đặt' && { color: '#f59e0b' }
            ]}>
              {table.status.charAt(0).toUpperCase() + table.status.slice(1)}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={{ paddingBottom: 120 }}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Quản lý bàn</Text>
          <TouchableOpacity style={styles.addButton} onPress={() => setTableModalVisible(true)}>
            <Ionicons name="add" size={20} color="#2563eb" />
            <Text style={styles.addButtonText}>Thêm bàn</Text>
          </TouchableOpacity>
        </View>

        {tables.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="restaurant-outline" size={48} color="#9ca3af" />
            <Text style={styles.emptyStateText}>Chưa có bàn nào</Text>
            <Text style={styles.emptyStateSubtext}>Nhấn "Thêm bàn" để thêm bàn mới</Text>
          </View>
        ) : (
          tables.map((table) => (
            <TableItem key={table.id} table={table} />
          ))
        )}

        {/* Modal để thêm bàn */}
        <Modal
          visible={tableModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setTableModalVisible(false)}
        >
          <KeyboardAvoidingView
            style={styles.modalOverlay}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => setTableModalVisible(false)}>
                  <Text style={styles.modalCancel}>Hủy</Text>
                </TouchableOpacity>
                <Text style={styles.modalTitle}>Thêm bàn mới</Text>
                <TouchableOpacity onPress={createTable}>
                  <Text style={styles.modalSave}>Tạo</Text>
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalScrollView} showsVerticalScrollIndicator={false}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Số bàn</Text>
                  <TextInput
                    style={styles.modalInput}
                    value={newTable.number}
                    onChangeText={(text) => setNewTable(prev => ({ ...prev, number: text }))}
                    placeholder="Nhập số bàn"
                    keyboardType="numeric"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Loại bàn</Text>
                  <View style={styles.typeSelector}>
                    {tableTypes.map((type) => (
                      <TouchableOpacity
                        key={type.value}
                        style={[
                          styles.typeOption,
                          newTable.type === type.value && styles.typeOptionSelected
                        ]}
                        onPress={() => setNewTable(prev => ({ ...prev, type: type.value as any }))}
                      >
                        <View style={[styles.typeIndicator, { backgroundColor: type.color }]} />
                        <Text style={[
                          styles.typeLabel,
                          newTable.type === type.value && styles.typeLabelSelected
                        ]}>
                          {type.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Sức chứa</Text>
                  <TextInput
                    style={styles.modalInput}
                    value={newTable.capacity}
                    onChangeText={(text) => setNewTable(prev => ({ ...prev, capacity: text }))}
                    placeholder="Nhập số người"
                    keyboardType="numeric"
                  />
                </View>
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    letterSpacing: 0.5,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#2563eb',
  },
  addButtonText: {
    color: '#2563eb',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  tableItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    backgroundColor: '#fff',
    borderRadius: 8,
    marginHorizontal: 8,
    marginVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tableItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  tableTypeIndicator: {
    width: 6,
    height: 40,
    borderRadius: 3,
    marginRight: 12,
  },
  tableNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  tableType: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  tableStatus: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
    textTransform: 'uppercase',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 16,
    opacity: 0.8,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    minHeight: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  modalCancel: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
    padding: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    letterSpacing: 0.3,
  },
  modalSave: {
    fontSize: 16,
    color: '#2563eb',
    fontWeight: '600',
    padding: 8,
  },
  modalScrollView: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
    marginBottom: 8,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    color: '#1f2937',
    backgroundColor: '#f9fafb',
  },
  typeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  typeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    backgroundColor: '#fff',
    marginRight: 8,
    marginBottom: 8,
    minWidth: 100,
  },
  typeOptionSelected: {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
  },
  typeIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  typeLabel: {
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '500',
  },
  typeLabelSelected: {
    color: '#2563eb',
    fontWeight: '600',
  },
});