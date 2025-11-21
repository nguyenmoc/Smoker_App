import { UpdateProfileRequestData, UserProfileData } from "@/types/profileType";
import { API_CONFIG } from "./apiConfig";

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message: string;
  error?: string;
}

interface UpdateProfileRequest {
  field: string;
  value: string;
}

export class ProfileApiService {
  private token: string;

  constructor(token: string) {
    this.token = token;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {

      const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`,
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async getUserProfile(): Promise<ApiResponse<UserProfileData>> {
    return this.makeRequest<UserProfileData>('/user/me');
  }

  // async updateProfile(
  //   userId: string,
  //   updates: UpdateProfileRequest
  // ): Promise<ApiResponse<UserProfileData>> {
  //   return this.makeRequest<UserProfileData>(`/profile/${userId}`, {
  //     method: 'PATCH',
  //     body: JSON.stringify(updates),
  //   });
  // }

  async updateProfile(updates: UpdateProfileRequestData): Promise<ApiResponse<UserProfileData>> {
  const formData = new FormData();

  if (updates.avatar) {
    formData.append("avatar", {
      uri: updates.avatar.uri,
      name: "avatar.jpg",
      type: "image/jpeg",
    } as any);
  }

  if (updates.background) {
    formData.append("background", {
      uri: updates.background.uri,
      name: "background.jpg",
      type: "image/jpeg",
    } as any);
  }

  if (updates.userName) formData.append("userName", updates.userName);
  if (updates.phone) formData.append("phone", updates.phone);
  if (updates.bio) formData.append("bio", updates.bio);

  return this.makeRequest<UserProfileData>(`/user/profile`, {
    method: "PUT",
    body: formData,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
}

  async updateProfileImage(
    userId: string,
    type: 'avatar' | 'cover',
    imageUri: string
  ): Promise<ApiResponse<{ imageUrl: string }>> {
    const formData = new FormData();

    // Convert image URI to blob for upload
    formData.append('image', {
      uri: imageUri,
      type: 'image/jpeg',
      name: `${type}_${Date.now()}.jpg`,
    } as any);

    formData.append('type', type);

    return this.makeRequest<{ imageUrl: string }>(`/profile/${userId}/image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      body: formData,
    });
  }

  async getUserBalance(userId: string): Promise<ApiResponse<{ balance: number }>> {
    return this.makeRequest<{ balance: number }>(`/profile/${userId}/balance`);
  }
}
