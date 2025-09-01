"use client"

import { Ionicons } from "@expo/vector-icons"
import AsyncStorage from '@react-native-async-storage/async-storage'
import axios from 'axios'
import Constants from "expo-constants"
import { LinearGradient } from "expo-linear-gradient"
import { useRouter } from "expo-router"
import { useEffect, useState } from "react"
import { ActivityIndicator, Alert, Image, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import OrderStatusBadge from "../components/OrderStatusBadge"

const API_URL = Constants.expoConfig.extra.apiUrl;

const Orders = () => {
  const router = useRouter()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [filteredOrders, setFilteredOrders] = useState([])

  const statusOptions = [
    { key: 'all', label: 'All Orders', color: '#666' },
    { key: 'pending', label: 'Pending', color: '#FF9800' },
    { key: 'confirmed', label: 'Confirmed', color: '#2196F3' },
    // { key: 'in_progress', label: 'In Progress', color: '#9C27B0' },
    // { key: 'completed', label: 'Completed', color: '#4CAF50' },
    // { key: 'cancelled', label: 'Cancelled', color: '#F44336' }
  ]

  useEffect(() => {
    fetchOrders()
  }, [])

  useEffect(() => {
    filterOrders()
  }, [selectedStatus, orders])

  const fetchOrders = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken')
      if (!token) {
        router.replace('/(auth)/login')
        return
      }

      const response = await axios.get(`${API_URL}/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.data.success) {
        setOrders(response.data.orders)
      }
    } catch (err) {
      console.error('Error fetching orders:', err)
      Alert.alert('Error', 'Failed to fetch orders. Please try again.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const filterOrders = () => {
    if (selectedStatus === 'all') {
      setFilteredOrders(orders)
    } else {
      setFilteredOrders(orders.filter(order => order.status === selectedStatus))
    }
  }

  const onRefresh = () => {
    setRefreshing(true)
    fetchOrders()
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatTime = (timeString) => {
    if (!timeString) return ''
    return timeString.substring(0, 5) // Extract HH:MM from HH:MM:SS
  }

  const getStatusIcon = (status) => {
    const iconMap = {
      'all': 'list-outline',
      'pending': 'time-outline',
      'confirmed': 'checkmark-circle-outline',
      'in_progress': 'sync-outline',
      'completed': 'checkmark-done-circle-outline',
      'cancelled': 'close-circle-outline'
    }
    return iconMap[status] || 'help-outline'
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={["#a8e6cf", "#ffffff"]} style={styles.gradient}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4CAF50" />
            <Text style={styles.loadingText}>Loading orders...</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={["#a8e6cf", "#ffffff"]} style={styles.gradient}>
     

        {/* Status Filter */}
        <View style={styles.categoriesSection}>
       
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.categoriesContainer}
            contentContainerStyle={styles.categoriesContent}
          >
            {statusOptions.map((option) => {
              const isSelected = selectedStatus === option.key
              return (
                <TouchableOpacity
                  key={option.key}
                  style={[
                    styles.categoryChip,
                    isSelected && styles.selectedCategoryChip
                  ]}
                  onPress={() => setSelectedStatus(option.key)}
                >
                  <View style={styles.categoryIconContainer}>
                    <Ionicons 
                      name={getStatusIcon(option.key)} 
                      size={16} 
                      color={isSelected ? "white" : "#4CAF50"} 
                    />
                  </View>
                  <Text style={[
                    styles.categoryText,
                    isSelected && styles.selectedCategoryText
                  ]}>
                    {option.label}
                  </Text>
                  {isSelected && (
                    <View style={styles.selectedIndicator}>
                      <Ionicons name="checkmark" size={12} color="white" />
                    </View>
                  )}
                </TouchableOpacity>
              )
            })}
          </ScrollView>
        </View>

        {/* Orders List */}
        <ScrollView 
          style={styles.ordersContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
        >
          {filteredOrders.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="document-outline" size={64} color="#ccc" />
              <Text style={styles.emptyText}>
                {selectedStatus === 'all' 
                  ? 'No orders found' 
                  : `No ${selectedStatus} orders`
                }
              </Text>
              <Text style={styles.emptySubtext}>
                {selectedStatus === 'all' 
                  ? 'Start by booking a service' 
                  : 'Orders with this status will appear here'
                }
              </Text>
            </View>
          ) : (
            filteredOrders.map((order) => (
              <View key={order.id} style={styles.orderCard}>
                {/* Order Header */}
                <View style={styles.orderHeader}>
                  <View style={styles.orderInfo}>
                    <Text style={styles.serviceTitle}>{order.serviceTitle}</Text>
                    <Text style={styles.orderDate}>
                      {formatDate(order.bookingDate)} at {formatTime(order.bookingTime)}
                    </Text>
                  </View>
                  <OrderStatusBadge status={order.status} size="medium" />
                </View>

                {/* Selected Items */}
                {order.selectedItems && order.selectedItems.length > 0 && (
                  <View style={styles.itemsContainer}>
                    <Text style={styles.itemsTitle}>Selected Items:</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      {order.selectedItems.map((item, index) => (
                        <View key={index} style={styles.itemTag}>
                          <Text style={styles.itemName}>{item.name}</Text>
                          <Text style={styles.itemPrice}>{item.price}</Text>
                        </View>
                      ))}
                    </ScrollView>
                  </View>
                )}

                {/* Description */}
                {order.description && (
                  <View style={styles.descriptionContainer}>
                    <Text style={styles.descriptionTitle}>Description:</Text>
                    <Text style={styles.descriptionText}>{order.description}</Text>
                  </View>
                )}

                {/* Address */}
                {order.address && order.address.street && (
                  <View style={styles.addressContainer}>
                    <Text style={styles.addressTitle}>Pickup Address:</Text>
                    <Text style={styles.addressText}>
                      {order.address.street}, {order.address.area}
                    </Text>
                    <Text style={styles.addressText}>
                      {order.address.city} - {order.address.pincode}
                    </Text>
                  </View>
                )}

                {/* Images */}
                {order.images && order.images.length > 0 && (
                  <View style={styles.imagesContainer}>
                    <Text style={styles.imagesTitle}>Images:</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      {order.images.map((image, index) => (
                        <Image 
                          key={index} 
                          source={{ uri: `${API_URL}/${image}` }} 
                          style={styles.orderImage}
                        />
                      ))}
                    </ScrollView>
                  </View>
                )}

                {/* Order Details */}
                <View style={styles.orderDetails}>
                  <Text style={styles.orderId}>Order ID: #{order.id}</Text>
                  <Text style={styles.createdAt}>
                    Created: {formatDate(order.createdAt)}
                  </Text>
                </View>
              </View>
            ))
          )}
          
          <View style={{ height: 30 }} />
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  )
}

export default Orders

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#a8e6cf",
    marginTop: -40,
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
    color: '#666',
  },

  categoriesSection: {
    marginTop: 0,
    marginBottom: 0,
    paddingTop: 10,
  },
  categoriesTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2E7D32",
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  categoriesContainer: {
    flexGrow: 0,
  },
  categoriesContent: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    paddingTop: 10,
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
    borderWidth: 2,
    borderColor: "rgba(76, 175, 80, 0.2)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minWidth: 100,
    justifyContent: "center",
    position: "relative",
  },
  selectedCategoryChip: {
    backgroundColor: "#4CAF50",
    borderColor: "#4CAF50",
    shadowColor: "#4CAF50",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    transform: [{ scale: 1.05 }],
  },
  categoryIconContainer: {
    marginRight: 8,
    width: 20,
    alignItems: "center",
  },
  categoryText: {
    color: "#4CAF50",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  selectedCategoryText: {
    color: "white",
    fontWeight: "bold",
  },
  selectedIndicator: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "#FF6B6B",
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  ordersContainer: {
    flex: 1,
    paddingHorizontal: 16,
    marginTop: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
  orderCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  orderInfo: {
    flex: 1,
  },
  serviceTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 14,
    color: "#666",
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 4,
  },
  itemsContainer: {
    marginBottom: 16,
  },
  itemsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  itemTag: {
    backgroundColor: "#4CAF50",
    borderRadius: 12,
    padding: 8,
    marginRight: 8,
    minWidth: 100,
  },
  itemName: {
    color: "white",
    fontWeight: "bold",
    fontSize: 12,
    marginBottom: 2,
  },
  itemPrice: {
    color: "white",
    fontSize: 11,
    opacity: 0.9,
  },
  descriptionContainer: {
    marginBottom: 16,
  },
  descriptionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  addressContainer: {
    marginBottom: 16,
  },
  addressTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  addressText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 2,
  },
  imagesContainer: {
    marginBottom: 16,
  },
  imagesTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  orderImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 8,
  },
  orderDetails: {
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    paddingTop: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  orderId: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  createdAt: {
    fontSize: 12,
    color: "#999",
  },
}) 