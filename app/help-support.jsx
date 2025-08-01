"use client"

import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import { useRouter } from "expo-router"
import { useState } from "react"
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

const HelpSupport = () => {
  const router = useRouter()
  const [activeAccordion, setActiveAccordion] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  // FAQ Data
  const faqData = [
    {
      id: 1,
      question: "How do I schedule a scrap pickup?",
      answer: "You can schedule a scrap pickup by navigating to the Services tab and selecting 'Schedule Pickup'. Fill in your details, select your preferred time slot, and we'll confirm your appointment."
    },
    {
      id: 2,
      question: "What types of scrap do you accept?",
      answer: "We accept various types of scrap including paper, cardboard, plastic, metal, electronics, and other recyclable materials. Please ensure items are clean and properly sorted for better service."
    },
    {
      id: 3,
      question: "How much do you pay for scrap?",
      answer: "Our pricing varies based on the type and quantity of scrap. We offer competitive rates and provide transparent pricing. Contact us for a detailed quote based on your specific items."
    },
    {
      id: 4,
      question: "What areas do you serve?",
      answer: "We currently serve Delhi, Noida, Greater Noida, Gurugram, Faridabad, Ghaziabad, and surrounding areas. We're constantly expanding our service areas."
    },
    {
      id: 5,
      question: "How do I track my pickup status?",
      answer: "You can track your pickup status in the Services tab under 'My Pickups'. You'll receive real-time updates about your scheduled pickup."
    },
    {
      id: 6,
      question: "What if I need to cancel or reschedule?",
      answer: "You can cancel or reschedule your pickup up to 2 hours before the scheduled time. Go to 'My Pickups' in the Services tab and select the option to modify your appointment."
    }
  ]

  const toggleAccordion = (id) => {
    setActiveAccordion(activeAccordion === id ? null : id)
  }



  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient 
        colors={["#f8fafc", "#e8f5e8", "#ffffff"]} 
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Header */}
        {/* <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#2E7D32" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Help & Support</Text>
          <View style={styles.placeholder} />
        </View> */}

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* FAQ Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
            <View style={styles.faqContainer}>
              {faqData.map((faq) => (
                <View key={faq.id} style={styles.accordionItem}>
                  <TouchableOpacity 
                    style={styles.accordionHeader} 
                    onPress={() => toggleAccordion(faq.id)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.accordionQuestion}>{faq.question}</Text>
                    <Ionicons 
                      name={activeAccordion === faq.id ? "chevron-up" : "chevron-down"} 
                      size={20} 
                      color="#4CAF50" 
                    />
                  </TouchableOpacity>
                  {activeAccordion === faq.id && (
                    <View style={styles.accordionContent}>
                      <Text style={styles.accordionAnswer}>{faq.answer}</Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          </View>

          {/* Contact Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Still Need Help?</Text>
            <View style={styles.contactOptions}>
              <TouchableOpacity 
                style={styles.contactOption}
                onPress={() => router.push('/contact-form')}
              >
                <View style={styles.contactIconContainer}>
                  <Ionicons name="mail-outline" size={24} color="#4CAF50" />
                </View>
                <View style={styles.contactTextContainer}>
                  <Text style={styles.contactOptionTitle}>Send us a message</Text>
                  <Text style={styles.contactOptionSubtitle}>Get in touch with our support team</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#4CAF50" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.contactOption}>
                <View style={styles.contactIconContainer}>
                  <Ionicons name="call-outline" size={24} color="#4CAF50" />
                </View>
                <View style={styles.contactTextContainer}>
                  <Text style={styles.contactOptionTitle}>Call us directly</Text>
                  <Text style={styles.contactOptionSubtitle}>+91 9599196875</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#4CAF50" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.contactOption}>
                <View style={styles.contactIconContainer}>
                  <Ionicons name="chatbubble-outline" size={24} color="#4CAF50" />
                </View>
                <View style={styles.contactTextContainer}>
                  <Text style={styles.contactOptionTitle}>Live chat</Text>
                  <Text style={styles.contactOptionSubtitle}>Available 9 AM - 6 PM</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#4CAF50" />
              </TouchableOpacity>
            </View>
          </View>


        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  )
}

export default HelpSupport

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
    marginTop: -50
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    marginHorizontal: 16,
    marginTop: 10,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: "Poppins-Bold",
    color: "#2E7D32",
  },
  placeholder: {
    width: 34,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Poppins-Bold",
    color: "#2E7D32",
    marginBottom: 16,
    marginLeft: 4,
  },
  faqContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  accordionItem: {
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  accordionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "transparent",
  },
  accordionQuestion: {
    flex: 1,
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
    color: "#333",
    marginRight: 12,
  },
  accordionContent: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: "#F8F9FA",
  },
  accordionAnswer: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: "#666",
    lineHeight: 20,
  },
  contactOptions: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  contactOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  contactIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E8F5E8",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  contactTextContainer: {
    flex: 1,
  },
  contactOptionTitle: {
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
    color: "#333",
  },
  contactOptionSubtitle: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: "#666",
    marginTop: 2,
  },

}) 