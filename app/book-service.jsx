"use client"

import { Ionicons } from "@expo/vector-icons"
import AsyncStorage from '@react-native-async-storage/async-storage'
import axios from 'axios'
import * as ImagePicker from 'expo-image-picker'
import { LinearGradient } from "expo-linear-gradient"
import { useLocalSearchParams, useRouter } from "expo-router"
import { useEffect, useState } from "react"
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

const BookService = () => {
  const router = useRouter()
  const params = useLocalSearchParams()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [images, setImages] = useState([])
  const [hasAddress, setHasAddress] = useState(false)
  const [description, setDescription] = useState("")
  
  // Parse selected items from params
  const selectedItems = params.selectedItems ? JSON.parse(params.selectedItems) : []
  const selectedService = params.selectedService ? JSON.parse(params.selectedService) : null

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
        
        // Check if user has address
        const hasAddressData = response.data.user.addressData && 
          response.data.user.addressData.street && 
          response.data.user.addressData.area && 
          response.data.user.addressData.city && 
          response.data.user.addressData.pincode
        
        setHasAddress(!!hasAddressData)
        
        // Set address fields from the response if available
        if (response.data.user.addressData) {
          const addressData = response.data.user.addressData
          // setValue('street', addressData.street || '') // Removed as per edit hint
          // setValue('area', addressData.area || '') // Removed as per edit hint
          // setValue('city', addressData.city || '') // Removed as per edit hint
          // setValue('pincode', addressData.pincode || '') // Removed as per edit hint
        }
      } catch (err) {
        Alert.alert('Error', 'Failed to fetch profile info. Please login again.')
        router.replace('/(auth)/login')
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, []) // Removed setValue from dependency array

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant camera roll permissions to upload images.')
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      aspect: [4, 3],
      quality: 0.8,
    })

    if (!result.canceled) {
      const newImages = result.assets.map(asset => ({
        uri: asset.uri,
        id: Date.now() + Math.random(),
      }))
      setImages([...images, ...newImages])
    }
  }

  const removeImage = (imageId) => {
    setImages(images.filter(img => img.id !== imageId))
  }

  const saveAddress = async (data) => {
    setSaving(true)
    try {
      const token = await AsyncStorage.getItem('userToken')
      
      const response = await axios.post(`${process.env.EXPO_PUBLIC_API_URL}/address`, 
        {
          street: data.street.trim(),
          area: data.area.trim(),
          city: data.city,
          pincode: data.pincode.trim()
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      
      if (response.data.success) {
        setHasAddress(true)
        Alert.alert('Success', 'Address saved successfully!')
      }
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to save address')
    } finally {
      setSaving(false)
    }
  }

  const submitBooking = async (data) => {
    if (!hasAddress) {
      Alert.alert('Address Required', 'Please add your address to continue with the booking.', [
        {
          text: 'Add Address',
          onPress: () => router.push('/edit-address')
        },
        {
          text: 'Cancel',
          style: 'cancel'
        }
      ])
      return
    }

    if (images.length === 0) {
      Alert.alert('Images Required', 'Please upload at least one image of your items.')
      return
    }

    setSaving(true)
    try {
      const token = await AsyncStorage.getItem('userToken')
      
      // Create form data for multipart upload
      const formData = new FormData()
      formData.append('serviceId', selectedService.id)
      formData.append('serviceTitle', selectedService.title)
      formData.append('selectedItems', JSON.stringify(selectedItems))
      formData.append('description', data.description || '')
      
      // Add images to form data
      images.forEach((image, index) => {
        const imageFile = {
          uri: image.uri,
          type: 'image/jpeg',
          name: `image_${index}.jpg`
        }
        formData.append('images', imageFile)
      })

      // Add address data
      formData.append('street', data.street.trim())
      formData.append('area', data.area.trim())
      formData.append('city', data.city)
      formData.append('pincode', data.pincode.trim())

      const response = await axios.post(`${process.env.EXPO_PUBLIC_API_URL}/book-service`, 
        formData,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      )
      
      if (response.data.success) {
        Alert.alert(
          'Booking Successful!', 
          'Your service has been booked. Our team will contact you shortly.',
          [
            {
              text: 'OK',
              onPress: () => router.replace('/(tabs)/index')
            }
          ]
        )
      }
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to submit booking')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={["#a8e6cf", "#ffffff"]} style={styles.gradient}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4CAF50" />
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={["#a8e6cf", "#ffffff"]} style={styles.gradient}>
        <ScrollView style={styles.scrollView}>
       

          {/* Service Summary */}
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Service Summary</Text>
            <View style={styles.serviceInfo}>
              <Text style={styles.serviceName}>{selectedService?.title}</Text>
              <Text style={styles.itemCount}>{selectedItems.length} items selected</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {selectedItems.map((item, index) => (
                <View key={index} style={styles.selectedItem}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemPrice}>{item.price}</Text>
                </View>
              ))}
            </ScrollView>
          </View>

          {/* Address Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pickup Address</Text>
            {hasAddress ? (
              <View style={styles.addressCard}>
                <View style={styles.addressInfo}>
                  <Text style={styles.addressText}>
                    {user?.addressData?.street}, {user?.addressData?.area}
                  </Text>
                  <Text style={styles.addressText}>
                    {user?.addressData?.city} - {user?.addressData?.pincode}
                  </Text>
                </View>
                <TouchableOpacity 
                  style={styles.editButton}
                  onPress={() => router.push('/edit-address')}
                >
                  <Ionicons name="create-outline" size={20} color="#4CAF50" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity 
                style={styles.addAddressButton}
                onPress={() => router.push('/edit-address')}
              >
                <Ionicons name="add-circle-outline" size={24} color="#4CAF50" />
                <Text style={styles.addAddressText}>Add Pickup Address</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Image Upload Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Upload Images</Text>
            <Text style={styles.sectionSubtitle}>Upload photos of your items for better service</Text>
            
            <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
              <Ionicons name="camera-outline" size={32} color="#4CAF50" />
              <Text style={styles.uploadText}>Add Photos</Text>
            </TouchableOpacity>

            {images.length > 0 && (
              <View style={styles.imagesContainer}>
                <Text style={styles.imagesTitle}>Selected Images ({images.length})</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {images.map((image) => (
                    <View key={image.id} style={styles.imageContainer}>
                      <Image source={{ uri: image.uri }} style={styles.image} />
                      <TouchableOpacity 
                        style={styles.removeImageButton}
                        onPress={() => removeImage(image.id)}
                      >
                        <Ionicons name="close-circle" size={24} color="#F44336" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>

          {/* Description Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Additional Details</Text>
            <TextInput
              style={styles.descriptionInput}
              placeholder="Add any additional details about your items or special requirements..."
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity 
            style={[styles.submitButton, saving && styles.submitButtonDisabled]}
            onPress={() => submitBooking({ description })}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text style={styles.submitButtonText}>Book Service</Text>
            )}
          </TouchableOpacity>

          <View style={{ height: 30 }} />
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  )
}

export default BookService

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#a8e6cf",
    marginTop: -40,
  },
  gradient: {
    flex: 1,
  },
  scrollView: {
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
    color: '#666',
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 15,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    marginHorizontal: 16,
    marginTop: 10,
    borderRadius: 16,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2E7D32",
  },
  placeholder: {
    width: 34,
  },
  summaryCard: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    marginHorizontal: 16,
    marginTop: 20,
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2E7D32",
    marginBottom: 15,
  },
  serviceInfo: {
    marginBottom: 15,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  itemCount: {
    fontSize: 14,
    color: "#666",
  },
  selectedItem: {
    backgroundColor: "#4CAF50",
    borderRadius: 12,
    padding: 12,
    marginRight: 10,
    minWidth: 120,
  },
  itemName: {
    color: "white",
    fontWeight: "bold",
    fontSize: 12,
    marginBottom: 3,
  },
  itemPrice: {
    color: "white",
    fontSize: 11,
    opacity: 0.9,
  },
  section: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    marginHorizontal: 16,
    marginTop: 20,
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2E7D32",
    marginBottom: 10,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 15,
  },
  addressCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 15,
  },
  addressInfo: {
    flex: 1,
  },
  addressText: {
    fontSize: 14,
    color: "#333",
    marginBottom: 2,
  },
  editButton: {
    padding: 5,
  },
  addAddressButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 20,
    borderWidth: 2,
    borderColor: "#4CAF50",
    borderStyle: "dashed",
  },
  addAddressText: {
    marginLeft: 10,
    fontSize: 16,
    color: "#4CAF50",
    fontWeight: "600",
  },
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 20,
    borderWidth: 2,
    borderColor: "#4CAF50",
    borderStyle: "dashed",
  },
  uploadText: {
    marginLeft: 10,
    fontSize: 16,
    color: "#4CAF50",
    fontWeight: "600",
  },
  imagesContainer: {
    marginTop: 15,
  },
  imagesTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  imageContainer: {
    position: "relative",
    marginRight: 10,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  removeImageButton: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "white",
    borderRadius: 12,
  },
  descriptionInput: {
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    color: "#333",
    minHeight: 100,
    textAlignVertical: "top",
  },
  submitButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    marginHorizontal: 16,
    marginTop: 20,
  },
  submitButtonDisabled: {
    backgroundColor: "#ccc",
  },
  submitButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
}) 