"use client"

import AsyncStorage from '@react-native-async-storage/async-storage'
import axios from 'axios'
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
          { text: 'OK', onPress: () => router.back() }
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
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Loading address information...</Text>
        </View>
      </SafeAreaView>
    )
  }

  if (!user) return null

  return (
    <SafeAreaView style={styles.container}>
      {/* Form */}
      <View style={styles.form}>
      
        
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
            <TextInput
              style={[styles.input, errors.street && styles.inputError]}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              placeholder="Enter street address"
              className='rounded-3xl'
            />
          )}
        />
        {errors.street && <Text style={styles.errorText}>{errors.street.message}</Text>}

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
            <TextInput
              style={[styles.input, errors.area && styles.inputError]}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              placeholder="Enter area or locality"
              className='rounded-3xl'
            />
          )}
        />
        {errors.area && <Text style={styles.errorText}>{errors.area.message}</Text>}

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
              <Text style={[styles.pickerButtonText, !value && styles.placeholderText]}>
                {value || 'Select Location'}
              </Text>
            </TouchableOpacity>
          )}
        />
        {errors.city && <Text style={styles.errorText}>{errors.city.message}</Text>}

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
            <TextInput
              style={[styles.input, errors.pincode && styles.inputError]}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              placeholder="Enter 6-digit pincode"
              keyboardType="numeric"
              maxLength={6}
              className='rounded-3xl'
              returnKeyType='done'
            />
          )}
        />
        {errors.pincode && <Text style={styles.errorText}>{errors.pincode.message}</Text>}
        
        <Text style={styles.helpText}>
          * All fields are required. Please provide accurate information for proper service delivery.
        </Text>

        <TouchableOpacity style={styles.saveButton} onPress={handleSubmit(onSubmit)} disabled={saving}>
          <Text style={styles.saveButtonText}>
            {saving ? "Saving..." : "Save Address"}
          </Text>
        </TouchableOpacity>
      </View>

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
    </SafeAreaView>
  )
}

export default EditAddress

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#fff",
    paddingTop: -40 
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  form: { 
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: { fontSize: 16, color: "#333", marginTop: 15, marginBottom: 5,marginLeft:6,fontWeight:'600' },
  input: {
    borderWidth: 1, 
    borderColor: "#ccc", 
    borderRadius: 14, 
    paddingHorizontal: 15, 
    fontSize: 16, 
    backgroundColor: "#fff",
    paddingVertical: 18,
    marginBottom: 5,
  },
  inputError: {
    borderColor: '#F44336',
    borderWidth: 2,
  },
  errorText: {
    color: '#F44336',
    fontSize: 12,
    marginBottom: 10,
    marginLeft: 6,
  },
  pickerButton: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 14,
    paddingHorizontal: 15,
    paddingVertical: 15,
    backgroundColor: "#fff",
    marginBottom: 5,
    justifyContent: 'center',
  },
  pickerButtonText: {
    fontSize: 16,
    color: '#333',
  },
  placeholderText: {
    color: '#999',
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
    fontWeight: 'bold',
    color: '#333',
  },
  pickerDoneText: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: 'bold',
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
    color: '#333',
  },
  pickerOptionTextSelected: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  helpText: {
    fontSize: 14,
    color: '#666',
    marginTop: 10,
    marginBottom: 20,
    lineHeight: 20,
    marginLeft: 6,
    fontStyle: 'italic',
  },
  saveButton: {
    backgroundColor: "#4CAF50", 
    padding: 18, 
    borderRadius: 14, 
    marginTop: 10, 
    alignItems: "center"
  },
  saveButtonText: { 
    color: "#fff", 
    fontWeight: "bold", 
    fontSize: 16 
  }
}) 