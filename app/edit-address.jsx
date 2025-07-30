"use client"

import { Ionicons } from "@expo/vector-icons"
import AsyncStorage from '@react-native-async-storage/async-storage'
import axios from 'axios'
import { LinearGradient } from "expo-linear-gradient"
import { useRouter } from "expo-router"
import { useEffect, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { ActivityIndicator, Alert, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

const EditAddress = () => {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showCityPicker, setShowCityPicker] = useState(false)
  
  // City options
  const cityOptions = [
    { label: 'Select Location', value: '' },
    { label: 'Delhi', value: 'Delhi' },
    { label: 'Noida', value: 'Noida' },
    { label: 'Greater Noida', value: 'Greater Noida' },
    { label: 'Gurugram', value: 'Gurugram' },
    { label: 'Faridabad', value: 'Faridabad' },
    { label: 'Ghaziabad', value: 'Ghaziabad' },
    { label: 'Others', value: 'Others' }
  ]

  const { control, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    defaultValues: {
      street: '',
      area: '',
      city: '',
      pincode: ''
    }
  })

  const watchedCity = watch('city')

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true)
      try {
        const token = await AsyncStorage.getItem('userToken')
        if (!token) {
          router.replace('/(auth)/login')
          return
        }
        
        // Fetch user profile with address data
        const response = await axios.get(`${process.env.EXPO_PUBLIC_API_URL}/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        setUser(response.data.user)
        
        // Set address fields from the response
        if (response.data.user.addressData) {
          const addressData = response.data.user.addressData
          setValue('street', addressData.street || '')
          setValue('area', addressData.area || '')
          setValue('city', addressData.city || '')
          setValue('pincode', addressData.pincode || '')
        } else {
          // Fallback to parsing the address string if addressData is not available
          const existingAddress = response.data.user.address || ''
          if (existingAddress) {
            const addressParts = existingAddress.split(',').map(part => part.trim())
            if (addressParts.length >= 3) {
              setValue('street', addressParts[0] || '')
              setValue('area', addressParts[1] || '')
              setValue('city', addressParts[2] || '')
              setValue('pincode', addressParts[3] || '')
            } else {
              setValue('street', existingAddress)
            }
          }
        }
      } catch (err) {
        Alert.alert('Error', 'Failed to fetch profile info. Please login again.')
        router.replace('/(auth)/login')
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [setValue])

  const onSubmit = async (data) => {
    setSaving(true)
    try {
      const token = await AsyncStorage.getItem('userToken')
      
      // Use the new address API endpoint
      const response = await axios.post(`${process.env.EXPO_PUBLIC_API_URL}/address`, 
        {
          street: data.street.trim(),
          area: data.area.trim(),
          city: data.city.trim(),
          pincode: data.pincode.trim()
        }, 
        { headers: { Authorization: `Bearer ${token}` } }
      )
      
      if (response.data.success) {
        Alert.alert('Success', response.data.message, [
          { 
            text: 'OK', 
            onPress: () => {
              router.back()
            }
          }
        ])
      } else {
        Alert.alert('Error', response.data.error || 'Failed to update address.')
      }
    } catch (err) {
      console.error('Error updating address:', err)
      if (err.response && err.response.data && err.response.data.error) {
        Alert.alert('Error', err.response.data.error)
      } else {
        Alert.alert('Error', 'Failed to update address. Please try again.')
      }
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient 
          colors={["#f8fafc", "#e8f5e8", "#ffffff"]} 
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4CAF50" />
            <Text style={styles.loadingText}>Loading address information...</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    )
  }

  if (!user) return null

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient 
        colors={["#f8fafc", "#e8f5e8", "#ffffff"]} 
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
    

        {/* Form Container */}
        <ScrollView 
          style={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.formContainer}>
            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Street Address *</Text>
                <Controller
                  control={control}
                  rules={{
                    required: 'Street address is required',
                    minLength: {
                      value: 3,
                      message: 'Street address must be at least 3 characters'
                    }
                  }}
                  name="street"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <View style={[styles.inputContainer, errors.street && styles.inputError]}>
                      <Ionicons name="home-outline" size={20} color="#4CAF50" style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                        placeholder="Enter street address"
                        placeholderTextColor="#999"
                      />
                    </View>
                  )}
                />
                {errors.street && <Text style={styles.errorText}>{errors.street.message}</Text>}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Area/Locality *</Text>
                <Controller
                  control={control}
                  rules={{
                    required: 'Area/Locality is required',
                    minLength: {
                      value: 2,
                      message: 'Area/Locality must be at least 2 characters'
                    }
                  }}
                  name="area"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <View style={[styles.inputContainer, errors.area && styles.inputError]}>
                      <Ionicons name="location-outline" size={20} color="#4CAF50" style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                        placeholder="Enter area or locality"
                        placeholderTextColor="#999"
                      />
                    </View>
                  )}
                />
                {errors.area && <Text style={styles.errorText}>{errors.area.message}</Text>}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Location *</Text>
                <Controller
                  control={control}
                  rules={{
                    required: 'Please select a location'
                  }}
                  name="city"
                  render={({ field: { onChange, value } }) => (
                    <TouchableOpacity 
                      style={[styles.pickerButton, errors.city && styles.inputError]} 
                      onPress={() => setShowCityPicker(true)}
                    >
                      <Ionicons name="map-outline" size={20} color="#4CAF50" style={styles.inputIcon} />
                      <Text style={[styles.pickerButtonText, !value && styles.placeholderText]}>
                        {value || 'Select Location'}
                      </Text>
                      <Ionicons name="chevron-down" size={20} color="#4CAF50" />
                    </TouchableOpacity>
                  )}
                />
                {errors.city && <Text style={styles.errorText}>{errors.city.message}</Text>}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Pincode *</Text>
                <Controller
                  control={control}
                  rules={{
                    required: 'Pincode is required',
                    pattern: {
                      value: /^\d{6}$/,
                      message: 'Please enter a valid 6-digit pincode'
                    }
                  }}
                  name="pincode"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <View style={[styles.inputContainer, errors.pincode && styles.inputError]}>
                      <Ionicons name="mail-outline" size={20} color="#4CAF50" style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                        placeholder="Enter 6-digit pincode"
                        placeholderTextColor="#999"
                        keyboardType="numeric"
                        maxLength={6}
                        returnKeyType='done'
                      />
                    </View>
                  )}
                />
                {errors.pincode && <Text style={styles.errorText}>{errors.pincode.message}</Text>}
              </View>
              
              <View style={styles.helpSection}>
                <Ionicons name="information-circle-outline" size={20} color="#4CAF50" />
                <Text style={styles.helpText}>
                  All fields are required. Please provide accurate information for proper service delivery.
                </Text>
              </View>

              <TouchableOpacity 
                style={[styles.saveButton, saving && styles.saveButtonDisabled]} 
                onPress={handleSubmit(onSubmit)} 
                disabled={saving}
              >
                {saving ? (
                  <View style={styles.saveButtonContent}>
                    <ActivityIndicator size="small" color="white" />
                    <Text style={styles.saveButtonText}>Saving...</Text>
                  </View>
                ) : (
                  <View style={styles.saveButtonContent}>
                    <Ionicons name="checkmark" size={20} color="white" />
                    <Text style={styles.saveButtonText}>Save Address</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        {/* City Picker Modal */}
        <Modal
          visible={showCityPicker}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowCityPicker(false)}
        >
          <View style={styles.pickerModal}>
            <View style={styles.pickerContainer}>
              <View style={styles.pickerHeader}>
                <Text style={styles.pickerTitle}>Select Location</Text>
                <TouchableOpacity onPress={() => setShowCityPicker(false)}>
                  <Text style={styles.pickerDoneText}>Done</Text>
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.pickerScrollView}>
                {cityOptions.map((option, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.pickerOption,
                      watchedCity === option.value && styles.pickerOptionSelected
                    ]}
                    onPress={() => {
                      setValue('city', option.value)
                      setShowCityPicker(false)
                    }}
                  >
                    <Text style={[
                      styles.pickerOptionText,
                      watchedCity === option.value && styles.pickerOptionTextSelected,
                      option.value === '' && styles.placeholderText
                    ]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>
      </LinearGradient>
    </SafeAreaView>
  )
}

export default EditAddress

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
    marginTop:-50

  },
  gradient: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    fontFamily: "Poppins-Regular",
    color: '#666',
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    marginHorizontal: 16,
    marginTop: 10,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: "Poppins-Bold",
    color: "#2E7D32",
  },
  placeholder: {
    width: 34,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  formContainer: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  form: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontFamily: "Poppins-Bold",
    color: "#2E7D32",
    marginBottom: 8,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 16,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  inputError: {
    borderColor: '#F44336',
    borderWidth: 2,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: "Poppins-Regular",
    color: "#333",
  },
  errorText: {
    color: '#F44336',
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    marginTop: 6,
    marginLeft: 4,
  },
  pickerButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 16,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  pickerButtonText: {
    flex: 1,
    fontSize: 16,
    fontFamily: "Poppins-Regular",
    color: '#333',
    marginLeft: 12,
  },
  placeholderText: {
    color: '#999',
  },
  helpSection: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "rgba(76, 175, 80, 0.1)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  helpText: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: '#4CAF50',
    marginLeft: 8,
    lineHeight: 20,
  },
  saveButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 16,
    paddingVertical: 18,
    marginTop: 10,
    shadowColor: "#4CAF50",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  saveButtonDisabled: {
    backgroundColor: "#A5D6A7",
  },
  saveButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  saveButtonText: {
    color: "white",
    fontSize: 16,
    fontFamily: "Poppins-Bold",
    marginLeft: 8,
  },
  pickerModal: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '50%',
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  pickerTitle: {
    fontSize: 18,
    fontFamily: "Poppins-Bold",
    color: '#333',
  },
  pickerDoneText: {
    fontSize: 16,
    fontFamily: "Poppins-Bold",
    color: '#4CAF50',
  },
  pickerScrollView: {
    maxHeight: 300,
  },
  pickerOption: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  pickerOptionSelected: {
    backgroundColor: '#e8f5e8',
  },
  pickerOptionText: {
    fontSize: 16,
    fontFamily: "Poppins-Regular",
    color: '#333',
  },
  pickerOptionTextSelected: {
    color: '#4CAF50',
    fontFamily: "Poppins-Bold",
  },
}) 