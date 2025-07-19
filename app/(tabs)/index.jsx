"use client"

import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import { useRouter } from "expo-router"
import { Dimensions, Image, Platform, ScrollView, StatusBar, Text, TouchableOpacity, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import ServiceCard from "../../components/ServiceCard"
import { services } from "../../components/servicesData"

const { width } = Dimensions.get("window")

export default function Index() {
  const router = useRouter()

  const stats = [
    { number: "9999+", label: "Records Extracted" },
    { number: "1140+", label: "Active Users" },
    { number: "100%", label: "System Up-Time" },
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
            }}
          >
            <Image
              source={require("../../assets/images/logo.png")}
              style={{ width: 100, height: 100, resizeMode: "contain"}}
            />

          </View>

          {/* Quick Stats */}
          <View
            style={{
              marginHorizontal: 16,
              marginVertical: 20,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginBottom: 10,
              }}
            >
              {stats.slice(0, 2).map((stat, index) => (
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
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              {stats.slice(2, 4).map((stat, index) => (
                <View
                  key={index + 2}
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
          </View>

          <View
            style={{
              marginHorizontal: 16,
              marginVertical: 10,
            }}
          >

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

          {/* Services Section */}
          <View
            style={{
              marginHorizontal: 16,
              marginVertical: 10,
            }}
          >


            {services.map((service, index) => (
              <ServiceCard
                key={index}
                service={service}
              />
            ))}
          </View>

        
         

          {/* Bottom Spacing */}
          <View style={{ height: 30 }} />
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  )
}
