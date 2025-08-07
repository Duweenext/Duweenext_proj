import React, { useEffect, useState } from 'react';
import { Modal, View, Text, TouchableOpacity, TextInput, Alert } from 'react-native';
import { z } from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/srcs/auth/context/auth_context'; // Adjust path if needed
import { jwtDecode } from 'jwt-decode';
import axiosInstance from '@/srcs/api/apiManager'; // Adjust path if needed
// import * as SecureStore from 'expo-secure-store'; // No longer needed here if session is the token

// Zod schema for validation
const schema = z.object({
  user_id: z.number().positive('User ID must be a positive number.').optional().nullable(), // Allow undefined/null initially
  board_id: z.string().min(1, 'Board ID is required'),
});

type FormData = z.infer<typeof schema>;

// Define the expected structure of your JWT payload
interface MyJwtPayload {
  user_id: number; // Assuming user_id in your JWT is a number
  exp?: number;
  iat?: number;
}

const ManualConfigModal = ({ visible, onClose }: { visible: boolean; onClose: () => void }) => {
  // 'session' from useAuth() IS the JWT token string.
  const { session } = useAuth(); 

  const [derivedUserId, setDerivedUserId] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (session) { // 'session' is the JWT token string
      try {
        const decodedPayload = jwtDecode<MyJwtPayload>(session);
        if (decodedPayload && typeof decodedPayload.user_id === 'number') {
          setDerivedUserId(decodedPayload.user_id);
        } else {
          console.warn("User ID not found or not a number in JWT payload from session.");
          setDerivedUserId(undefined);
        }
      } catch (error) {
        console.error("Failed to decode JWT session:", error);
        setDerivedUserId(undefined);
      }
    } else {
      setDerivedUserId(undefined);
    }
  }, [session]);


  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      user_id: undefined,
      board_id: '',
    },
  });

  useEffect(() => {
    // This updates the form field when derivedUserId (from the session token) changes.
    setValue('user_id', derivedUserId, {
      shouldValidate: true,
      shouldDirty: true,
    });
  }, [derivedUserId, setValue]);


  const onSubmit = async (data: FormData) => {
    if (data.user_id === undefined || data.user_id === null) {
        Alert.alert("Error", "User ID is missing. Please ensure you are logged in.");
        console.error('Submit Error: User ID is undefined or null.', data);
        return;
    }
    console.log('Submitting Data (frontend):', data);

    try {
      const token = session;
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
        console.log("Authorization header added using session token.");
      } else {
        console.warn("Auth token (session) not found. Request will be sent without Authorization header.");
        Alert.alert("Authentication Error", "You are not logged in. Please log in to submit.");
        return; 
      }

      const apiResponse = await axiosInstance.post("/v1/board/manual", data, {
        headers: headers,
      });

      if (apiResponse.status === 201 || apiResponse.status === 200 ) {
        Alert.alert("Success", apiResponse.data.message || "Configuration submitted successfully!");
        onClose();
      } else {
        Alert.alert("Submission Failed", apiResponse.data.message || "Could not submit configuration.");
      }
    } catch (error: any) {
      console.error("API submission error:", error);
      let errorMessage = "An error occurred while submitting the configuration.";
      if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      } else if (error.response && error.response.status === 401) { 
        errorMessage = "Authentication failed. Please log in again.";
      }
      else if (error.message) {
        errorMessage = error.message;
      }
      Alert.alert("Error", errorMessage);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View className="flex-1 justify-center items-center bg-black/50 p-4">
        <View className="bg-white p-6 rounded-lg w-full max-w-sm shadow-lg">
          <Text className="text-xl font-bold mb-6 text-center text-gray-800">Board Configuration</Text>

          {errors.user_id && (derivedUserId === undefined || derivedUserId === null) && (
             <Text className="text-red-600 text-sm mb-2.5 -mt-2 text-center">
                {errors.user_id.message} (Please ensure you are logged in)
            </Text>
          )}

          <Text className="text-base text-gray-700 mb-1.5 mt-2.5">Board ID</Text>
          <Controller
            control={control}
            name="board_id"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                className={`border px-4 py-3 rounded-md text-base mb-1 w-full ${errors.board_id ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Enter Board ID"
                placeholderTextColor="#9ca3af"
              />
            )}
          />
          {errors.board_id && <Text className="text-red-600 text-sm mb-2.5">{errors.board_id.message}</Text>}

          <View className="flex-row justify-between mt-8 gap-6">
            <TouchableOpacity
              onPress={onClose}
              className="bg-gray-500 hover:bg-gray-600 py-3 px-5 rounded-md items-center flex-1 active:opacity-80"
            >
              <Text className="text-white font-bold text-base">Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSubmit(onSubmit)}
              disabled={isSubmitting || derivedUserId === undefined}
              className={`py-3 px-5 rounded-md items-center flex-1 active:opacity-80 ${
                (isSubmitting || derivedUserId === undefined) ? 'bg-green-300' : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              <Text className="text-white font-bold text-base">
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ManualConfigModal;
