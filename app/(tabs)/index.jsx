"use client"

import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import { useRouter } from "expo-router"
import { Dimensions, Image, Platform, ScrollView, StatusBar, Text, TouchableOpacity, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

const { width } = Dimensions.get("window")

export default function Index() {
  const router = useRouter()

  const features = [
    {
      icon: "recycle",
      title: "Scrap Dealing",
      description: "Sell your scrap materials at best prices",
      color: "#4CAF50",
    },
    {
      icon: "phone-portrait",
      title: "E-Waste Services",
      description: "Safe disposal of electronic waste",
      color: "#2196F3",
    },
    {
      icon: "hammer",
      title: "Demolition",
      description: "Professional demolition services",
      color: "#FF9800",
    },
    {
      icon: "business",
      title: "Facility Decommissioning",
      description: "Complete facility shutdown solutions",
      color: "#9C27B0",
    },
    {
      icon: "leaf",
      title: "Recycling Services",
      description: "Transform waste into valuable resources",
      color: "#8BC34A",
    },
  ]

  const stats = [
    { number: "10M+", label: "Items Processed" },
    { number: "50K+", label: "Happy Customers" },
    { number: "99.9%", label: "Satisfaction Rate" },
    { number: "24/7", label: "Support" },
  ]

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#a8e6cf",paddingBottom:-50 }}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={Platform.OS === "android" ? "#a8e6cf" : "transparent"}
        translucent={Platform.OS !== "android"}
      />
      <LinearGradient colors={["#a8e6cf", "#ffffff"]} style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false}>
       
          <View
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.6)",
              borderColor: "rgba(255, 255, 255, 0.9)",
              borderWidth: 1,
              marginHorizontal: 16,
              borderRadius: 24,
              marginVertical: 5,
              alignItems: "center",
              justifyContent: "center",
              paddingVertical: 20,
            }}
          >
            <Image
              source={require("../../assets/images/logo.png")}
              style={{ width: 180, height: 150, resizeMode: "contain" }}
            />
            <Text
              style={{
                fontSize: 28,
                fontWeight: "bold",
                color: "#2E7D32",
                marginTop: 10,
                textAlign: "center",
              }}
            >
              Welcome to Scrapify
            </Text>
            <Text
              style={{
                fontSize: 16,
                color: "#666",
                textAlign: "center",
                marginTop: 5,
                paddingHorizontal: 20,
              }}
            >
              Your trusted partner for sustainable waste management
            </Text>
          </View>

          {/* Quick Stats */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginHorizontal: 16,
              marginVertical: 20,
            }}
          >
            {stats.map((stat, index) => (
              <View
                key={index}
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.8)",
                  borderRadius: 16,
                  padding: 15,
                  alignItems: "center",
                  flex: 1,
                  marginHorizontal: 4,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 3,
                }}
              >
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: "bold",
                    color: "#2E7D32",
                  }}
                >
                  {stat.number}
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    color: "#666",
                    textAlign: "center",
                    marginTop: 4,
                  }}
                >
                  {stat.label}
                </Text>
              </View>
            ))}
          </View>

          {/* Services Section */}
          <View
            style={{
              marginHorizontal: 16,
              marginVertical: 10,
            }}
          >
            <Text
              style={{
                fontSize: 24,
                fontWeight: "bold",
                color: "#2E7D32",
                marginBottom: 20,
                textAlign: "center",
              }}
            >
              Our Services
            </Text>

            {features.map((feature, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => router.push("/services")}
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.9)",
                  borderRadius: 20,
                  padding: 20,
                  marginBottom: 15,
                  flexDirection: "row",
                  alignItems: "center",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 3,
                }}
              >
                <View
                  style={{
                    backgroundColor: feature.color,
                    borderRadius: 50,
                    width: 60,
                    height: 60,
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 15,
                  }}
                >
                  <Ionicons name={feature.icon} size={28} color="white" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: "bold",
                      color: "#333",
                      marginBottom: 5,
                    }}
                  >
                    {feature.title}
                  </Text>
                  <Text
                    style={{
                      fontSize: 14,
                      color: "#666",
                      lineHeight: 20,
                    }}
                  >
                    {feature.description}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#ccc" />
              </TouchableOpacity>
            ))}
          </View>

          {/* Quick Actions */}
          <View
            style={{
              marginHorizontal: 16,
              marginVertical: 20,
            }}
          >
            <Text
              style={{
                fontSize: 20,
                fontWeight: "bold",
                color: "#2E7D32",
                marginBottom: 15,
                textAlign: "center",
              }}
            >
              Quick Actions
            </Text>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <TouchableOpacity
                onPress={() => router.push("/services")}
                style={{
                  backgroundColor: "#4CAF50",
                  borderRadius: 16,
                  padding: 20,
                  alignItems: "center",
                  flex: 1,
                  marginRight: 8,
                }}
              >
                <Ionicons name="add-circle" size={32} color="white" />
                <Text
                  style={{
                    color: "white",
                    fontWeight: "bold",
                    marginTop: 8,
                    textAlign: "center",
                  }}
                >
                  Book Service
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => router.push("/profile")}
                style={{
                  backgroundColor: "#2196F3",
                  borderRadius: 16,
                  padding: 20,
                  alignItems: "center",
                  flex: 1,
                  marginLeft: 8,
                }}
              >
                <Ionicons name="person-circle" size={32} color="white" />
                <Text
                  style={{
                    color: "white",
                    fontWeight: "bold",
                    marginTop: 8,
                    textAlign: "center",
                  }}
                >
                  My Profile
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Bottom Spacing */}
          <View style={{ height: 30 }} />
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  )
}
