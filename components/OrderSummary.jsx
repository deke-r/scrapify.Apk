import { StyleSheet, Text, View } from "react-native"
import OrderStatusBadge from "./OrderStatusBadge"

const OrderSummary = ({ order, showDetails = false }) => {
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
    return timeString.substring(0, 5)
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.orderInfo}>
          <Text style={styles.serviceTitle}>{order.serviceTitle}</Text>
          <Text style={styles.orderDate}>
            {formatDate(order.bookingDate)} at {formatTime(order.bookingTime)}
          </Text>
        </View>
        <OrderStatusBadge status={order.status} size="small" />
      </View>

      {/* Selected Items Summary */}
      {order.selectedItems && order.selectedItems.length > 0 && (
        <View style={styles.itemsSummary}>
          <Text style={styles.itemsText}>
            {order.selectedItems.length} item{order.selectedItems.length > 1 ? 's' : ''} selected
          </Text>
        </View>
      )}

      {/* Order Details */}
      <View style={styles.orderDetails}>
        <Text style={styles.orderId}>Order #{order.id}</Text>
        <Text style={styles.createdAt}>{formatDate(order.createdAt)}</Text>
      </View>

      {/* Additional Details (if showDetails is true) */}
      {showDetails && (
        <>
          {order.description && (
            <View style={styles.descriptionContainer}>
              <Text style={styles.descriptionTitle}>Description:</Text>
              <Text style={styles.descriptionText} numberOfLines={2}>
                {order.description}
              </Text>
            </View>
          )}

          {order.address && order.address.street && (
            <View style={styles.addressContainer}>
              <Text style={styles.addressTitle}>Pickup Address:</Text>
              <Text style={styles.addressText} numberOfLines={2}>
                {order.address.street}, {order.address.area}, {order.address.city} - {order.address.pincode}
              </Text>
            </View>
          )}
        </>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  orderInfo: {
    flex: 1,
  },
  serviceTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 12,
    color: "#666",
  },
  itemsSummary: {
    marginBottom: 12,
  },
  itemsText: {
    fontSize: 14,
    color: "#666",
  },
  orderDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    paddingTop: 12,
  },
  orderId: {
    fontSize: 12,
    fontWeight: "600",
    color: "#333",
  },
  createdAt: {
    fontSize: 11,
    color: "#999",
  },
  descriptionContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  descriptionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  descriptionText: {
    fontSize: 12,
    color: "#666",
    lineHeight: 16,
  },
  addressContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  addressTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  addressText: {
    fontSize: 12,
    color: "#666",
    lineHeight: 16,
  },
})

export default OrderSummary 