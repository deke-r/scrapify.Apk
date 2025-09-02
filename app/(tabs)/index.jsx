"use client"

import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import { useRouter } from "expo-router"
import { useEffect, useRef, useState } from "react"
import { Dimensions, Image, Platform, ScrollView, StatusBar, Text, TouchableOpacity, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

const { width } = Dimensions.get("window")

export default function Index() {
  const router = useRouter()
  const [currentSlide, setCurrentSlide] = useState(0)
  const scrollViewRef = useRef(null)

  const stats = [
    { number: "500+", label: "Records Extracted" },
    { number: "50+", label: "Active Users" },
    { number: "100%", label: "System Up-Time" },
    { number: "24/7", label: "Support" },
  ]

  const carouselData = [
    {
      id: 1,
      title: "Scrap Dealing",
      description: "Sell your scrap materials at best prices",
      icon: "refresh",
      color: "#4CAF50",
      image: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=200&fit=crop"
    },
    {
      id: 2,
      title: "E-Waste Services",
      description: "Safe disposal of electronic waste",
      icon: "phone-portrait",
      color: "#2196F3",
      image: "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=400&h=200&fit=crop"
    },
    {
      id: 3,
      title: "Demolition Services",
      description: "Professional demolition services",
      icon: "hammer",
      color: "#FF9800",
      image: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=400&h=200&fit=crop"
    },
    {
      id: 4,
      title: "Recycling Services",
      description: "Transform waste into valuable resources",
      icon: "leaf",
      color: "#8BC34A",
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=200&fit=crop"
    }
  ]

  // Auto-scroll carousel
  useEffect(() => {
    const interval = setInterval(() => {
      const nextSlide = (currentSlide + 1) % carouselData.length
      setCurrentSlide(nextSlide)
      scrollViewRef.current?.scrollTo({
        x: nextSlide * (width - 32),
        animated: true
      })
    }, 3000) // Change slide every 3 seconds

    return () => clearInterval(interval)
  }, [currentSlide, carouselData.length])

  const handleScroll = (event) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width
    const index = event.nativeEvent.contentOffset.x / slideSize
    setCurrentSlide(Math.round(index))
  }

  const scrollToSlide = (index) => {
    setCurrentSlide(index)
    scrollViewRef.current?.scrollTo({
      x: index * (width - 32),
      animated: true
    })
  }

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
              backgroundColor: "#ffffff",
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

          {/* Carousel Section */}
          <View style={{ marginTop: 20 }}>
           
            
            <ScrollView
              ref={scrollViewRef}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={handleScroll}
              scrollEventThrottle={16}
              style={{ height: 250 }}
              contentContainerStyle={{ paddingHorizontal: 16 }}
            >
              {carouselData.map((item, index) => (
                <View key={item.id} style={{ width: width - 32 }}>
                  <View style={{
                    backgroundColor: "rgba(255, 255, 255, 0.9)",
                    borderRadius: 20,
                    height: 230,
                    overflow: "hidden",
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 3,
                    marginRight: 16,
                  }}>
                    {/* Background Image */}
                    <Image
                      source={{ uri: item.image }}
                      style={{
                        width: "100%",
                        height: 140,
                        resizeMode: "cover",
                      }}
                    />
                    
                    {/* Overlay with service info */}
                    <View style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: "rgba(0, 0, 0, 0.3)",
                      justifyContent: "flex-end",
                      padding: 20,
                    }}>
                      <View style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginBottom: 10,
                      }}>
                        <View style={[{
                          width: 40,
                          height: 40,
                          borderRadius: 20,
                          alignItems: "center",
                          justifyContent: "center",
                          marginRight: 10,
                        }, { backgroundColor: item.color }]}>
                          <Ionicons name={item.icon} size={20} color="white" />
                        </View>
                        <Text style={{
                          fontSize: 18,
                          fontWeight: "bold",
                          color: "white",
                          flex: 1,
                        }}>
                          {item.title}
                        </Text>
                      </View>
                      
                      <Text style={{
                        fontSize: 14,
                        color: "rgba(255, 255, 255, 0.9)",
                        marginBottom: 15,
                        lineHeight: 20,
                      }}>
                        {item.description}
                      </Text>
                      
                      <TouchableOpacity
                        onPress={() => router.push("/(tabs)/services")}
                        style={{
                          backgroundColor: item.color,
                          borderRadius: 12,
                          paddingHorizontal: 20,
                          paddingVertical: 10,
                          alignSelf: "flex-start",
                        }}
                      >
                        <Text style={{
                          color: "white",
                          fontWeight: "600",
                          fontSize: 14,
                        }}>
                          Book Now
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))}
            </ScrollView>

            {/* Carousel Indicators */}
            <View style={{
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              marginTop: 15,
            }}>
              {carouselData.map((_, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => scrollToSlide(index)}
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: currentSlide === index ? "#4CAF50" : "#ccc",
                    marginHorizontal: 4,
                  }}
                />
              ))}
            </View>
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
                    backgroundColor: "#ffffff",
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
                    backgroundColor: "#ffffff",
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

          {/* Book Order Button */}
          <View
            style={{
              marginHorizontal: 16,
              marginVertical: 20,
            }}
          >
            <TouchableOpacity
              onPress={() => router.push("/(tabs)/services")}
              style={{
                backgroundColor: "#1E7A1E",
                borderRadius: 20,
                paddingVertical: 18,
                paddingHorizontal: 30,
                alignItems: "center",
                justifyContent: "center",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 8,
                elevation: 5,
                flexDirection: "row",
              }}
            >
              <Ionicons name="add-circle" size={24} color="white" style={{ marginRight: 10 }} />
              <Text
                style={{
                  color: "white",
                  fontWeight: "bold",
                  fontSize: 18,
                  textAlign: "center",
                }}
              >
                Book Order
              </Text>
            </TouchableOpacity>
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
                onPress={() => router.push("/profile")}
                style={{
                  backgroundColor: "#2196F3",
                  borderRadius: 16,
                  padding: 20,
                  alignItems: "center",
                  flex: 1,
                  marginRight: 8,
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
              <TouchableOpacity
                onPress={() => router.push("/orders")}
                style={{
                  backgroundColor: "#4CAF50",
                  borderRadius: 16,
                  padding: 20,
                  alignItems: "center",
                  flex: 1,
                  marginLeft: 8,
                }}
              >
                <Ionicons name="list-circle" size={32} color="white" />
                <Text
                  style={{
                    color: "white",
                    fontWeight: "bold",
                    marginTop: 8,
                    textAlign: "center",
                  }}
                >
                  My Orders
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
