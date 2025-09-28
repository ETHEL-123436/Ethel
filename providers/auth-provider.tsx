import { User } from '@/types';
import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

export const [AuthProvider, useAuth] = createContextHook(() => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Failed to load user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string, role: 'driver' | 'passenger' | 'admin' = 'passenger') => {
    setIsLoading(true);
    try {
      console.log('Attempting login with:', { email, role, password: '***' });
      const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;
      if (!API_BASE_URL) {
        throw new Error('API_BASE_URL is not configured. Please check your .env file.');
      }

      // Make sure email is trimmed to remove any accidental whitespace
      const trimmedEmail = email.trim();

      const response = await fetch(`${API_BASE_URL}/api/v1/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          email: trimmedEmail,
          password,
          role
        })
      });

      const responseData = await response.json();
      console.log('Login response status:', response.status);
      console.log('Login response data:', responseData);

      if (!response.ok) {
        throw new Error(responseData.message || `Login failed with status ${response.status}`);
      }

      // The backend sends the token and user data in the response
      const { token, user: userData } = responseData;

      if (!userData || !token) {
        console.error('Invalid response format:', responseData);
        throw new Error('Invalid server response format');
      }

      // Create user object with all required fields
      const user: User = {
        id: userData._id || userData.id,
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        role: userData.role,
        status: userData.status || 'active',
        kycStatus: userData.kycStatus || 'pending',
        rating: userData.rating || 0,
        totalRides: userData.totalRides || 0,
        walletBalance: userData.walletBalance || 0,
        token
      };

      console.log('Login successful, user data:', { id: user.id, email: user.email });
      await AsyncStorage.setItem('user', JSON.stringify(user));
      await AsyncStorage.setItem('token', token);
      setUser(user);
      return user;
    } catch (error) {
      console.error('Login error details:', {
        error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });

      const errorMessage = error instanceof Error
        ? error.message
        : 'Login failed. Please check your credentials and try again.';

      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    name: string,
    email: string,
    phone: string,
    password: string,
    role: 'driver' | 'passenger' = 'passenger' // Make role optional with default
  ): Promise<User> => {
    setIsLoading(true);
    try {
      console.log('Attempting registration with:', { name, email, phone, role });
      
      // Use the same API base URL as login
      const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;
      if (!API_BASE_URL) {
        throw new Error('API_BASE_URL is not configured. Please check your .env file.');
      }
      
      // Trim email to remove any whitespace
      const trimmedEmail = email.trim();
      
      const response = await fetch(`${API_BASE_URL}/api/v1/users/register`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ 
          name: name.trim(),
          email: trimmedEmail,
          phone: phone.trim(),
          password,
          role
        })
      });

      const responseData = await response.json();
      console.log('Registration response status:', response.status);
      console.log('Registration response data:', responseData);

      if (!response.ok) {
        const errorMessage = responseData.message || 
                           responseData.error?.message || 
                           responseData.error ||
                           `Registration failed with status ${response.status}`;
        console.error('Registration failed:', errorMessage);
        throw new Error(errorMessage);
      }

      if (!responseData.user || !responseData.token) {
        console.error('Invalid registration response format:', responseData);
        throw new Error('Invalid server response format: missing user or token');
      }

      // Create user data with all required fields
      const userData: User = {
        id: responseData.user._id || responseData.user.id,
        name: responseData.user.name,
        email: responseData.user.email,
        phone: responseData.user.phone,
        role: responseData.user.role,
        status: responseData.user.status || 'active',
        kycStatus: responseData.user.kycStatus || 'pending',
        rating: responseData.user.rating || 0,
        totalRides: responseData.user.totalRides || 0,
        walletBalance: responseData.user.walletBalance || 0,
        token: responseData.token
      };

      console.log('Registration successful, user data:', { 
        id: userData.id, 
        email: userData.email 
      });
      
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      await AsyncStorage.setItem('token', responseData.token);
      setUser(userData);
      return userData;
    } catch (error) {
      console.error('Registration error:', error);
      
      let errorMessage = 'Registration failed. Please try again.';
      if (error instanceof Error) {
        errorMessage = error.message;
        
        // Provide more user-friendly messages for common errors
        if (error.message.includes('E11000')) {
          errorMessage = 'This email is already registered. Please use a different email or log in.';
        } else if (error.message.includes('validation failed')) {
          errorMessage = 'Please check your input and try again.';
        } else if (error.message.includes('network')) {
          errorMessage = 'Network error. Please check your connection and try again.';
        }
      }
      
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('token');
      setUser(null);
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  const updateUser = async (updates: Partial<User>) => {
    if (!user) return;

    const updatedUser = { ...user, ...updates };
    await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  return {
    user,
    isLoading,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated: !!user
  };
});