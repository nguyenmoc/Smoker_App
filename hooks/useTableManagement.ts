import { Revenue, Table, mockRevenues, mockTables } from '@/constants/tableData';
import { useCallback, useState } from 'react';
import { Alert } from 'react-native';

export const useTableManagement = () => {
  const [tables, setTables] = useState<Table[]>(mockTables);
  const [revenues, setRevenues] = useState<Revenue[]>(mockRevenues);
  const [loading, setLoading] = useState(false);

  const createTable = useCallback((tableData: {
    number: string;
    type: 'vip' | 'luxury' | 'thường';
    capacity: string;
  }): boolean => {
    if (!tableData.number || !tableData.capacity) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin');
      return false;
    }

    const tableExists = tables.find(table => table.number === parseInt(tableData.number));
    if (tableExists) {
      Alert.alert('Lỗi', 'Số bàn đã tồn tại');
      return false;
    }

    const newTable: Table = {
      id: Date.now().toString(),
      number: parseInt(tableData.number),
      type: tableData.type,
      capacity: parseInt(tableData.capacity),
      status: 'trống',
    };

    setTables(prev => [...prev, newTable].sort((a, b) => a.number - b.number));
    Alert.alert('Thành công', 'Đã tạo bàn mới');
    return true;
  }, [tables]);

  const updateTableStatus = useCallback((tableId: string, status: Table['status']) => {
    setTables(prev => 
      prev.map(table => 
        table.id === tableId ? { ...table, status } : table
      )
    );
  }, []);

  const deleteTable = useCallback((tableId: string) => {
    Alert.alert(
      'Xác nhận',
      'Bạn có chắc muốn xóa bàn này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: () => {
            setTables(prev => prev.filter(table => table.id !== tableId));
            Alert.alert('Thành công', 'Đã xóa bàn');
          },
        },
      ]
    );
  }, []);

  // Revenue functions
  const getTodayRevenue = useCallback((): number => {
    const today = new Date().toDateString();
    return revenues
      .filter(rev => new Date(rev.date).toDateString() === today)
      .reduce((sum, rev) => sum + rev.amount, 0);
  }, [revenues]);

  const getMonthRevenue = useCallback((): number => {
    const now = new Date();
    return revenues
      .filter(rev => {
        const revDate = new Date(rev.date);
        return revDate.getMonth() === now.getMonth() && 
               revDate.getFullYear() === now.getFullYear();
      })
      .reduce((sum, rev) => sum + rev.amount, 0);
  }, [revenues]);

  const getRevenueByDate = useCallback((days: number = 7): Revenue[] => {
    const now = new Date();
    const pastDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    
    return revenues.filter(rev => new Date(rev.date) >= pastDate);
  }, [revenues]);

  const refresh = useCallback(async () => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoading(false);
  }, []);

  return {
    tables,
    revenues,
    loading,
    createTable,
    updateTableStatus,
    deleteTable,
    getTodayRevenue,
    getMonthRevenue,
    getRevenueByDate,
    refresh,
  };
};