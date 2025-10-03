import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  ActivityIndicator,
  Image,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { styles } from './styles';

interface CommentInputProps {
  value: string;
  onChange: (text: string) => void;
  onSubmit: () => void;
  submitting: boolean;
}

export const CommentInput: React.FC<CommentInputProps> = ({
  value,
  onChange,
  onSubmit,
  submitting,
}) => {
  return (
    <View style={styles.commentInputContainer}>
      <Image
        source={{ uri: 'https://i.pravatar.cc/100?img=10' }}
        style={styles.commentInputAvatar}
      />
      <TextInput
        style={styles.commentInput}
        placeholder="Viết bình luận..."
        value={value}
        onChangeText={onChange}
        multiline
        maxLength={500}
      />
      <TouchableOpacity
        style={[
          styles.sendButton,
          (!value.trim() || submitting) && styles.sendButtonDisabled
        ]}
        onPress={onSubmit}
        disabled={!value.trim() || submitting}
      >
        {submitting ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Ionicons name="send" size={20} color="#fff" />
        )}
      </TouchableOpacity>
    </View>
  );
};