import { registerApi } from '@/services/authApi';
import { Ionicons } from '@expo/vector-icons';
import Checkbox from 'expo-checkbox';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function RegisterScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [agree, setAgree] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const onRegister = async () => {
    if (!agree) {
      Alert.alert("Lỗi", "Bạn phải đồng ý với điều khoản và điều kiện");
      return;
    }

    setIsLoading(true);
    try {
      const res = await registerApi(email, password, confirm);

      if (res.success === false) {
        Alert.alert("Lỗi", res.message ?? "Đăng ký thất bại");
        return;
      }

      Alert.alert("Thành công", "Đăng ký thành công!", [
        { text: "OK", onPress: () => router.push("/auth/login") },
      ]);
    } catch (error) {
      Alert.alert("Lỗi", "Không thể kết nối đến server");
    } finally {
      setIsLoading(false);
    }
  };

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
        disabled={isLoading}
      >
        <Ionicons name="arrow-back" size={24} color="#111827" />
      </TouchableOpacity>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={'padding'}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.logoContainer}>
            <Image
              source={require('@/assets/images/logo.jpeg')}
              style={styles.reactLogo}
              contentFit="contain"
            />
            <Text style={styles.brandText}>SMOKER</Text>
          </View>

          <View>
            <TextInput
              placeholder="Email"
              style={styles.input}
              placeholderTextColor="#9ca3af"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              editable={!isLoading}
            />

            <View style={styles.passwordContainer}>
              <TextInput
                placeholder="Mật khẩu"
                style={styles.passwordInput}
                placeholderTextColor="#9ca3af"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
                editable={!isLoading}
              />
              <TouchableOpacity 
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                <Ionicons 
                  name={showPassword ? "eye-off-outline" : "eye-outline"} 
                  size={22} 
                  color="#6b7280" 
                />
              </TouchableOpacity>
            </View>

            <View style={styles.passwordContainer}>
              <TextInput
                placeholder="Xác nhận mật khẩu"
                style={styles.passwordInput}
                placeholderTextColor="#9ca3af"
                secureTextEntry={!showConfirm}
                value={confirm}
                onChangeText={setConfirm}
                editable={!isLoading}
              />
              <TouchableOpacity 
                style={styles.eyeIcon}
                onPress={() => setShowConfirm(!showConfirm)}
                disabled={isLoading}
              >
                <Ionicons 
                  name={showConfirm ? "eye-off-outline" : "eye-outline"} 
                  size={22} 
                  color="#6b7280" 
                />
              </TouchableOpacity>
            </View>

            <View style={styles.checkboxContainer}>
              <Checkbox
                value={agree}
                onValueChange={setAgree}
                color={agree ? '#2563eb' : undefined}
                disabled={isLoading}
              />
              <Text style={styles.checkboxText}>
                Tôi đã đọc và đồng ý với các điều khoản và điều kiện
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.button, (!agree || isLoading) && styles.buttonDisabled]}
              onPress={onRegister}
              disabled={!agree || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Đăng ký</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.back()} disabled={isLoading}>
              <Text style={styles.loginText}>
                Bạn đã có tài khoản? <Text style={styles.loginLink}>Đăng nhập</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 44,
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
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    marginBottom: 16,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f9fafb',
    fontSize: 15,
  },
  passwordContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  passwordInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    padding: 12,
    paddingRight: 45,
    borderRadius: 8,
    backgroundColor: '#f9fafb',
    fontSize: 15,
  },
  eyeIcon: {
    position: 'absolute',
    right: 12,
    top: 12,
    padding: 4,
  },
  button: {
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    borderRadius: 8,
    marginBottom: 16,
  },
  buttonDisabled: {
    backgroundColor: '#93bbf5',
  },
  buttonText: {
    textAlign: 'center',
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  loginText: {
    textAlign: 'center',
    color: '#374151',
    marginBottom: 20,
  },
  loginLink: {
    color: '#2563eb',
    fontWeight: '600',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  reactLogo: {
    width: '100%',
    height: 180,
  },
  brandText: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 2,
    color: '#111827',
    textTransform: 'uppercase',
    marginTop: 20,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkboxText: {
    marginLeft: 8,
    color: '#374151',
    fontSize: 14,
    flex: 1,
  },
});