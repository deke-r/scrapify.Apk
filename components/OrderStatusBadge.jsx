import { Ionicons } from "@expo/vector-icons"
import { StyleSheet, Text, View } from "react-native"

const OrderStatusBadge = ({ status, size = "medium" }) => {
  const getStatusConfig = (status) => {
    switch (status) {
      case 'pending':
        return {
          color: '#FF9800',
          icon: 'time-outline',
          label: 'PENDING'
        }
      case 'confirmed':
        return {
          color: '#2196F3',
          icon: 'checkmark-circle-outline',
          label: 'CONFIRMED'
        }
      case 'in_progress':
        return {
          color: '#9C27B0',
          icon: 'construct-outline',
          label: 'IN PROGRESS'
        }
      case 'completed':
        return {
          color: '#4CAF50',
          icon: 'checkmark-done-circle-outline',
          label: 'COMPLETED'
        }
      case 'cancelled':
        return {
          color: '#F44336',
          icon: 'close-circle-outline',
          label: 'CANCELLED'
        }
      default:
        return {
          color: '#666',
          icon: 'help-circle-outline',
          label: 'UNKNOWN'
        }
    }
  }

  const config = getStatusConfig(status)
  const iconSize = size === "small" ? 16 : size === "large" ? 24 : 20
  const textSize = size === "small" ? 10 : size === "large" ? 14 : 12
  const padding = size === "small" ? 6 : size === "large" ? 12 : 8

  return (
    <View style={[
      styles.container,
      { 
        backgroundColor: `${config.color}15`,
        paddingHorizontal: padding,
        paddingVertical: padding,
        borderRadius: size === "small" ? 8 : 12
      }
    ]}>
      <Ionicons 
        name={config.icon} 
        size={iconSize} 
        color={config.color} 
      />
      <Text style={[
        styles.text,
        { 
          color: config.color,
          fontSize: textSize,
          marginLeft: size === "small" ? 3 : 4
        }
      ]}>
        {config.label}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  text: {
    fontWeight: '600',
  },
})

export default OrderStatusBadge 