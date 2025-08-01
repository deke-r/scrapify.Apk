"use client"

import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { useState } from "react"
import { Alert, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

const ServiceCard = ({ service }) => {
  const router = useRouter()
  const [selectedItems, setSelectedItems] = useState([])
  const [showItemModal, setShowItemModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

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
        selectedService: JSON.stringify(service)
      }
    })
  }

  const filteredItems = service.items.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const categories = [...new Set(service.items.map((item) => item.category))]

  return (
    <>
      <TouchableOpacity
        style={styles.serviceCard}
        onPress={() => setShowItemModal(true)}
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

      {/* Item Selection Modal */}
      <Modal visible={showItemModal} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => {
              setShowItemModal(false)
              setSelectedItems([]) // Discard selection
            }}>
              <Ionicons name="close" size={24} color="#2E7D32" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{service.title}</Text>
            <TouchableOpacity onPress={() => {
              setShowItemModal(false)
              // Keep selection and go back
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
          {/* <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesContainer}>
            {categories.map((category, index) => (
              <TouchableOpacity key={index} style={styles.categoryChip}>
                <Text style={styles.categoryText}>{category}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView> */}

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
    </>
  )
}

export default ServiceCard

const styles = StyleSheet.create({
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
  categoriesContainer: {
    paddingHorizontal: 16,
    paddingVertical: 15,
  },
  categoryChip: {
    backgroundColor: "rgba(76, 175, 80, 0.1)",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "rgba(76, 175, 80, 0.3)",
  },
  categoryText: {
    color: "#4CAF50",
    fontSize: 14,
    fontWeight: "600",
  },
  itemsList: {
    flex: 1,
    paddingHorizontal: 16, 
    marginVertical:20
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