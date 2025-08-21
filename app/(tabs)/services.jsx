"use client"

import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import { useLocalSearchParams, useRouter } from "expo-router"
import { useEffect, useState } from "react"
import { Alert, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

const Services = () => {
  const router = useRouter()
  const params = useLocalSearchParams()
  const [selectedService, setSelectedService] = useState(null)
  const [selectedItems, setSelectedItems] = useState([])
  const [showItemModal, setShowItemModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")

  // Auto-open modal for specific service if passed as parameter
  useEffect(() => {
    if (params.selectedService) {
      const serviceToOpen = services.find(service => service.title === params.selectedService)
      if (serviceToOpen) {
        setSelectedService(serviceToOpen)
        setShowItemModal(true)
      }
    }
  }, [params.selectedService])

  const services = [
    {
      id: 1,
      title: "Scrap Dealing",
      description: "Sell your scrap materials at best prices",
      icon: "refresh",
      color: "#4CAF50",
      items: [
        { id: 1, name: "Iron & Steel", price: "₹25-30/kg", category: "Metal" },
        { id: 2, name: "Aluminum", price: "₹120-140/kg", category: "Metal" },
        { id: 3, name: "Copper", price: "₹450-500/kg", category: "Metal" },
        { id: 4, name: "Brass", price: "₹280-320/kg", category: "Metal" },
        { id: 5, name: "Newspaper", price: "₹8-12/kg", category: "Paper" },
        { id: 6, name: "Cardboard", price: "₹6-10/kg", category: "Paper" },
        { id: 7, name: "Plastic Bottles", price: "₹15-20/kg", category: "Plastic" },
        { id: 8, name: "Car Battery", price: "₹80-120/piece", category: "Battery" },
      ],
    },
    {
      id: 2,
      title: "E-Waste Services",
      description: "Safe disposal of electronic waste",
      icon: "phone-portrait",
      color: "#2196F3",
      items: [
        { id: 9, name: "Desktop Computer", price: "₹500-800/piece", category: "Computer" },
        { id: 10, name: "Laptop", price: "₹300-600/piece", category: "Computer" },
        { id: 11, name: "Smartphone", price: "₹100-300/piece", category: "Mobile" },
        { id: 12, name: "Tablet", price: "₹200-400/piece", category: "Mobile" },
        { id: 13, name: "LED TV", price: "₹800-1500/piece", category: "Appliance" },
        { id: 14, name: "Refrigerator", price: "₹1000-2000/piece", category: "Appliance" },
        { id: 15, name: "Printer", price: "₹200-500/piece", category: "Office" },
        { id: 16, name: "UPS Battery", price: "₹50-100/piece", category: "Battery" },
      ],
    },
    {
      id: 3,
      title: "Demolition Services",
      description: "Professional demolition services",
      icon: "hammer",
      color: "#FF9800",
      items: [
        { id: 17, name: "Residential Demolition", price: "Quote on Request", category: "Residential" },
        { id: 18, name: "Commercial Demolition", price: "Quote on Request", category: "Commercial" },
        { id: 19, name: "Industrial Demolition", price: "Quote on Request", category: "Industrial" },
        { id: 20, name: "Selective Demolition", price: "Quote on Request", category: "Selective" },
        { id: 21, name: "Concrete Breaking", price: "₹50-80/sq ft", category: "Concrete" },
        { id: 22, name: "Wall Removal", price: "₹30-50/sq ft", category: "Wall" },
      ],
    },
    {
      id: 4,
      title: "Facility Decommissioning",
      description: "Complete facility shutdown solutions",
      icon: "business",
      color: "#9C27B0",
      items: [
        { id: 23, name: "Asset Inventory", price: "Quote on Request", category: "Assessment" },
        { id: 24, name: "Equipment Removal", price: "Quote on Request", category: "Removal" },
        { id: 25, name: "Environmental Cleanup", price: "Quote on Request", category: "Cleanup" },
        { id: 26, name: "Site Restoration", price: "Quote on Request", category: "Restoration" },
      ],
    },
    {
      id: 5,
      title: "Recycling Services",
      description: "Transform waste into valuable resources",
      icon: "leaf",
      color: "#8BC34A",
      items: [
        { id: 27, name: "Paper Recycling", price: "₹8-15/kg", category: "Paper" },
        { id: 28, name: "Plastic Recycling", price: "₹12-25/kg", category: "Plastic" },
        { id: 29, name: "Glass Recycling", price: "₹5-10/kg", category: "Glass" },
        { id: 30, name: "Metal Recycling", price: "₹20-500/kg", category: "Metal" },
        { id: 31, name: "Organic Waste", price: "₹2-5/kg", category: "Organic" },
        { id: 32, name: "Textile Recycling", price: "₹8-15/kg", category: "Textile" },
      ],
    },
  ]

  // Category icons mapping
  const categoryIcons = {
    "All": "grid-outline",
    "Metal": "hardware-chip-outline",
    "Paper": "document-text-outline",
    "Plastic": "water-outline",
    "Battery": "battery-charging-outline",
    "Computer": "laptop-outline",
    "Mobile": "phone-portrait-outline",
    "Appliance": "tv-outline",
    "Office": "business-outline",
    "Residential": "home-outline",
    "Commercial": "business-outline",
    "Industrial": "factory-outline",
    "Selective": "cut-outline",
    "Concrete": "construct-outline",
    "Wall": "square-outline",
    "Assessment": "analytics-outline",
    "Removal": "trash-outline",
    "Cleanup": "brush-outline",
    "Restoration": "refresh-outline",
    "Glass": "wine-outline",
    "Organic": "leaf-outline",
    "Textile": "shirt-outline",
  }

  const handleServiceSelect = (service) => {
    setSelectedService(service)
    setShowItemModal(true)
  }

  const handleItemToggle = (item) => {
    const isSelected = selectedItems.find((selected) => selected.id === item.id)
    if (isSelected) {
      setSelectedItems(selectedItems.filter((selected) => selected.id !== item.id))
    } else {
      setSelectedItems([...selectedItems, { ...item, quantity: 1 }])
    }
  }

  const handleBookService = () => {
    if (selectedItems.length === 0) {
      Alert.alert("No Items Selected", "Please select at least one item to proceed.")
      return
    }

    // Navigate to booking page with selected items and service data
    router.push({
      pathname: '/book-service',
      params: {
        selectedItems: JSON.stringify(selectedItems),
        selectedService: JSON.stringify(selectedService)
      }
    })
  }

  const filteredItems =
    selectedService?.items.filter(
      (item) => {
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            item.category.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesCategory = selectedCategory === "All" || item.category === selectedCategory
        return matchesSearch && matchesCategory
      }
    ) || []

  const categories = selectedService ? ["All", ...new Set(selectedService.items.map((item) => item.category))] : []

  const handleCategorySelect = (category) => {
    setSelectedCategory(category)
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={["#a8e6cf", "#ffffff"]} style={styles.gradient}>
        <ScrollView >
          {/* Header */}
          {/* <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#2E7D32" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Our Services</Text>
            <View style={styles.cartButton}>
              {selectedItems.length > 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>{selectedItems.length}</Text>
                </View>
              )}
              <Ionicons name="bag-outline" size={24} color="#2E7D32" />
            </View>
          </View> */}

          {/* Services Grid */}
          <View style={styles.servicesContainer}>
            <Text style={styles.sectionTitle}>Choose a Service to Book</Text>
            <Text style={styles.sectionSubtitle}>Select items from any service and book your pickup</Text>
            {services.map((service) => (
              <TouchableOpacity
                key={service.id}
                style={styles.serviceCard}
                onPress={() => handleServiceSelect(service)}
              >
                <View style={[styles.serviceIcon, { backgroundColor: service.color }]}>
                  <Ionicons name={service.icon} size={28} color="white" />
                </View>
                <View style={styles.serviceContent}>
                  <Text style={styles.serviceTitle}>{service.title}</Text>
                  <Text style={styles.serviceDescription}>{service.description}</Text>
                  <Text style={styles.itemCount}>{service.items.length} items available</Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#ccc" />
              </TouchableOpacity>
            ))}
          </View>

          {/* Selected Items Summary */}
          {selectedItems.length > 0 && (
            <View style={styles.summaryContainer}>
              <Text style={styles.summaryTitle}>Selected Items ({selectedItems.length})</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {selectedItems.map((item, index) => (
                  <View key={index} style={styles.summaryItem}>
                    <Text style={styles.summaryItemName}>{item.name}</Text>
                    <Text style={styles.summaryItemPrice}>{item.price}</Text>
                  </View>
                ))}
              </ScrollView>
              <TouchableOpacity style={styles.proceedButton} onPress={handleBookService}>
                <Text style={styles.proceedButtonText}>Book Selected Services</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={{ height: 30 }} />
        </ScrollView>

        {/* Item Selection Modal */}
        <Modal visible={showItemModal} animationType="slide" presentationStyle="pageSheet">
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => {
                setShowItemModal(false)
                setSelectedItems([]) // Discard selection
                setSelectedService(null)
              }}>
                <Ionicons name="close" size={24} color="#2E7D32" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>{selectedService?.title}</Text>
              <TouchableOpacity onPress={() => {
                setShowItemModal(false)
                // Keep selection and go back to services list
              }}>
                <Text style={styles.doneButton}>Done</Text>
              </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color="#666" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search items..."
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            {/* Categories */}
            <View style={styles.categoriesSection}>
              <Text style={styles.categoriesTitle}>Filter by Category</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false} 
                style={styles.categoriesContainer}
                contentContainerStyle={styles.categoriesContent}
              >
                {categories.map((category, index) => {
                  const isSelected = selectedCategory === category
                  return (
                    <TouchableOpacity 
                      key={index} 
                      style={[
                        styles.categoryChip,
                        isSelected && styles.selectedCategoryChip
                      ]}
                      onPress={() => handleCategorySelect(category)}
                    >
                      <View style={styles.categoryIconContainer}>
                        <Ionicons 
                          name={categoryIcons[category] || "pricetag-outline"} 
                          size={16} 
                          color={isSelected ? "white" : "#4CAF50"} 
                        />
                      </View>
                      <Text style={[
                        styles.categoryText,
                        isSelected && styles.selectedCategoryText
                      ]}>
                        {category}
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

            {/* Items List */}
            <ScrollView style={styles.itemsList}>
              {filteredItems.map((item) => {
                const isSelected = selectedItems.find((selected) => selected.id === item.id)
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.itemCard, isSelected && styles.selectedItemCard]}
                    onPress={() => handleItemToggle(item)}
                  >
                    <View style={styles.itemInfo}>
                      <Text style={styles.itemName}>{item.name}</Text>
                      <Text style={styles.itemCategory}>{item.category}</Text>
                      <Text style={styles.itemPrice}>{item.price}</Text>
                    </View>
                    <View style={[styles.checkbox, isSelected && styles.checkedBox]}>
                      {isSelected && <Ionicons name="checkmark" size={16} color="white" />}
                    </View>
                  </TouchableOpacity>
                )
              })}
            </ScrollView>

            {/* Selected Count */}
            {selectedItems.length > 0 && (
              <View style={styles.selectedCount}>
                <Text style={styles.selectedCountText}>{selectedItems.length} items selected</Text>
              </View>
            )}
          </SafeAreaView>
        </Modal>
      </LinearGradient>
    </SafeAreaView>
  )
}

export default Services

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#a8e6cf",
    paddingBottom:-50
  },
  gradient: {
    flex: 1,
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
  cartButton: {
    position: "relative",
    padding: 5,
  },
  cartBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: "#F44336",
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  cartBadgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  servicesContainer: {
    marginHorizontal: 16,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2E7D32",
    marginBottom: 20,
    textAlign: "center",
  },
  sectionSubtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 10,
    textAlign: "center",
  },
  serviceCard: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 20,
    padding: 20,
    marginBottom: 15,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  serviceIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 15,
  },
  serviceContent: {
    flex: 1,
  },
  serviceTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  serviceDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  itemCount: {
    fontSize: 12,
    color: "#4CAF50",
    fontWeight: "600",
  },
  summaryContainer: {
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
  summaryItem: {
    backgroundColor: "#4CAF50",
    borderRadius: 12,
    padding: 12,
    marginRight: 10,
    minWidth: 120,
  },
  summaryItemName: {
    color: "white",
    fontWeight: "bold",
    fontSize: 12,
    marginBottom: 3,
  },
  summaryItemPrice: {
    color: "white",
    fontSize: 11,
    opacity: 0.9,
  },
  proceedButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    marginTop: 15,
  },
  proceedButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2E7D32",
  },
  doneButton: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#4CAF50",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: "#333",
  },
  categoriesSection: {
    marginTop: 20,
    marginBottom: 10,
    paddingTop: 10, // Add padding to prevent clipping
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
    paddingTop: 10, // Add top padding to prevent clipping
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
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
    position: "relative", // Ensure proper positioning context
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
    top: -8, // Adjusted from -5 to -8 for better positioning
    right: -8, // Adjusted from -5 to -8 for better positioning
    backgroundColor: "#FF6B6B",
    borderRadius: 12, // Increased from 10 to 12
    width: 24, // Increased from 20 to 24
    height: 24, // Increased from 20 to 24
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
  itemsList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  itemCard: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  selectedItemCard: {
    borderWidth: 2,
    borderColor: "#4CAF50",
    backgroundColor: "rgba(76, 175, 80, 0.05)",
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 3,
  },
  itemCategory: {
    fontSize: 12,
    color: "#4CAF50",
    marginBottom: 5,
    fontWeight: "600",
  },
  itemPrice: {
    fontSize: 14,
    color: "#666",
    fontWeight: "600",
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#ddd",
    alignItems: "center",
    justifyContent: "center",
  },
  checkedBox: {
    backgroundColor: "#4CAF50",
    borderColor: "#4CAF50",
  },
  selectedCount: {
    backgroundColor: "#4CAF50",
    paddingVertical: 12,
    alignItems: "center",
  },
  selectedCountText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
})
