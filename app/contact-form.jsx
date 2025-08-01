"use client"

import { Ionicons } from "@expo/vector-icons"
import AsyncStorage from '@react-native-async-storage/async-storage'
import axios from 'axios'
import { LinearGradient } from "expo-linear-gradient"
import { useRouter } from "expo-router"
import { useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

const ContactForm = () => {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  
  const { control, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: {
      name: '',
      email: '',
      subject: '',
      message: ''
    }
  })

  const onSubmit = async (data) => {
    setSubmitting(true)
    try {
      const token = await AsyncStorage.getItem('userToken')
      const response = await axios.post(`${process.env.EXPO_PUBLIC_API_URL}/contact-support`, data, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (response.data.success) {
        Alert.alert('Success', 'Your message has been sent successfully! We\'ll get back to you soon.', [
          { 
            text: 'OK', 
            onPress: () => {
              reset()
              router.back()
            }
          }
        ])
      } else {
        Alert.alert('Error', response.data.error || 'Failed to send message.')
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to send message. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient 
        colors={["#f8fafc", "#e8f5e8", "#ffffff"]} 
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Form Container */}
          <View style={styles.formContainer}>
            <View style={styles.form}>
              <View style={styles.formHeader}>
                <Ionicons name="mail-outline" size={48} color="#4CAF50" />
                <Text style={styles.formTitle}>Get in Touch</Text>
                <Text style={styles.formSubtitle}>We're here to help! Send us a message and we'll respond within 24 hours.</Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Full Name</Text>
                <Controller
                  control={control}
                  rules={{
                    required: 'Full name is required',
                    minLength: {
                      value: 2,
                      message: 'Name must be at least 2 characters'
                    },
                    pattern: {
                      value: /^[a-zA-Z\s]+$/,
                      message: 'Name can only contain letters and spaces'
                    }
                  }}
                  name="name"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <View style={[styles.inputContainer, errors.name && styles.inputError]}>
                      <Ionicons name="person-outline" size={20} color="#4CAF50" style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        placeholder="Enter your full name"
                        placeholderTextColor="#999"
                      />
                    </View>
                  )}
                />
                {errors.name && <Text style={styles.errorText}>{errors.name.message}</Text>}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email Address</Text>
                <Controller
                  control={control}
                  rules={{
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Please enter a valid email address'
                    }
                  }}
                  name="email"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <View style={[styles.inputContainer, errors.email && styles.inputError]}>
                      <Ionicons name="mail-outline" size={20} color="#4CAF50" style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        placeholder="Enter your email address"
                        placeholderTextColor="#999"
                        keyboardType="email-address"
                        autoCapitalize="none"
                      />
                    </View>
                  )}
                />
                {errors.email && <Text style={styles.errorText}>{errors.email.message}</Text>}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Subject</Text>
                <Controller
                  control={control}
                  rules={{
                    required: 'Subject is required',
                    minLength: {
                      value: 5,
                      message: 'Subject must be at least 5 characters'
                    },
                    maxLength: {
                      value: 100,
                      message: 'Subject must be less than 100 characters'
                    }
                  }}
                  name="subject"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <View style={[styles.inputContainer, errors.subject && styles.inputError]}>
                      <Ionicons name="document-outline" size={20} color="#4CAF50" style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        placeholder="Brief description of your issue"
                        placeholderTextColor="#999"
                      />
                    </View>
                  )}
                />
                {errors.subject && <Text style={styles.errorText}>{errors.subject.message}</Text>}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Message</Text>
                <Controller
                  control={control}
                  rules={{
                    required: 'Message is required',
                    minLength: {
                      value: 10,
                      message: 'Message must be at least 10 characters'
                    },
                    maxLength: {
                      value: 1000,
                      message: 'Message must be less than 1000 characters'
                    }
                  }}
                  name="message"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <View style={[styles.inputContainer, errors.message && styles.inputError]}>
                      <Ionicons name="chatbubble-outline" size={20} color="#4CAF50" style={styles.inputIcon} />
                      <TextInput
                        style={[styles.input, styles.textArea]}
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        placeholder="Please describe your issue in detail..."
                        placeholderTextColor="#999"
                        multiline
                        numberOfLines={6}
                        textAlignVertical="top"
                        
                      />
                    </View>
                  )}
                />
                {errors.message && <Text style={styles.errorText}>{errors.message.message}</Text>}
                <Text style={styles.helpText}>Please provide as much detail as possible to help us assist you better</Text>
              </View>

              <TouchableOpacity 
                style={[styles.submitButton, submitting && styles.submitButtonDisabled]} 
                onPress={handleSubmit(onSubmit)} 
                disabled={submitting}
              >
                {submitting ? (
                  <View style={styles.submitButtonContent}>
                    <ActivityIndicator size="small" color="white" />
                    <Text style={styles.submitButtonText}>Sending...</Text>
                  </View>
                ) : (
                  <View style={styles.submitButtonContent}>
                    <Ionicons name="send" size={20} color="white" />
                    <Text style={styles.submitButtonText}>Send Message</Text>
                  </View>
                )}
              </TouchableOpacity>

              <View style={styles.contactInfo}>
                <Text style={styles.contactInfoTitle}>Other Ways to Reach Us</Text>
                <View style={styles.contactInfoItem}>
                  <Ionicons name="call-outline" size={20} color="#4CAF50" />
                  <Text style={styles.contactInfoText}>+91 9599196875</Text>
                </View>
                <View style={styles.contactInfoItem}>
                  <Ionicons name="time-outline" size={20} color="#4CAF50" />
                  <Text style={styles.contactInfoText}>Available 9 AM - 6 PM (IST)</Text>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  )
}

export default ContactForm

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
  formContainer: {
    flex: 1,
    paddingTop: 20,
  },
  form: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  formHeader: {
    alignItems: "center",
    marginBottom: 30,
  },
  formTitle: {
    fontSize: 24,
    fontFamily: "Poppins-Bold",
    color: "#2E7D32",
    marginTop: 12,
    marginBottom: 8,
  },
  formSubtitle: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontFamily: "Poppins-Bold",
    color: "#2E7D32",
    marginBottom: 8,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 16,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  inputError: {
    borderColor: "#EF4444",
    borderWidth: 2,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: "Poppins-Regular",
    color: "#333",
  },
  textArea: {
    minHeight: 100,
  },
  errorText: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: "#EF4444",
    marginTop: 4,
    marginLeft: 4,
  },
  helpText: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: "#666",
    marginTop: 6,
    marginLeft: 4,
    fontStyle: 'italic',
  },
  submitButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 16,
    paddingVertical: 18,
    marginTop: 20,
    shadowColor: "#4CAF50",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  submitButtonDisabled: {
    backgroundColor: "#A5D6A7",
  },
  submitButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  submitButtonText: {
    color: "white",
    fontSize: 16,
    fontFamily: "Poppins-Bold",
    marginLeft: 8,
  },
  contactInfo: {
    marginTop: 30,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },
  contactInfoTitle: {
    fontSize: 16,
    fontFamily: "Poppins-Bold",
    color: "#2E7D32",
    marginBottom: 12,
    textAlign: "center",
  },
  contactInfoItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  contactInfoText: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: "#666",
    marginLeft: 8,
  },
}) 