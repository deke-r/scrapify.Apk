"use client"

import AsyncStorage from "@react-native-async-storage/async-storage"
import axios from "axios"
import { BlurView } from "expo-blur"
import Constants from "expo-constants"
import { LinearGradient } from "expo-linear-gradient"
import { useRouter } from "expo-router"
import { useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { Alert, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

const API_URL = Constants.expoConfig.extra.apiUrl;

// Debug logging for production builds
console.log('Constants.expoConfig:', Constants.expoConfig);
console.log('Constants.expoConfig.extra:', Constants.expoConfig?.extra);
console.log('API_URL:', API_URL);

export default function Login() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm()

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const response = await axios.post(`${API_URL}/login`, {
        email: data.email,
        password: data.password
      });
      console.log(response.data)
      await AsyncStorage.setItem("userToken", response.data.token);
      router.replace("/(tabs)/");
    } catch (err) {
      console.log('Login error:', err, err.response?.data);
      Alert.alert("Login Failed", err.response?.data?.error || "Invalid email or password");
    } finally {
      setLoading(false)
    }
  }

  return (
    <LinearGradient colors={["#a8e6cf", "#ffffff"]} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.formContainer}>
          <BlurView intensity={20} style={styles.glassContainer}>
            <View style={styles.form}>
              {/* Logo Section */}
              <View style={styles.logoContainer}>
                <Image source={require("../../assets/images/logo2.png")} style={styles.logoPlaceholder} />
              </View>

              <Text style={styles.title}>Welcome Back</Text>
              <Text style={styles.subtitle}>Sign in to your account</Text>

              <Controller
                control={control}
                name="email"
                rules={{
                  required: "Email is required",
                  pattern: {
                    value: /^[^@\s]+@[^@\s]+\.[^@\s]+$/,
                    message: "Invalid email format",
                  },
                }}
                render={({ field: { onChange, value } }) => (
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={[styles.input, errors.email && styles.inputError]}
                      placeholder="Email"
                      placeholderTextColor="rgba(6, 95, 70, 0.6)"
                      value={value}
                      onChangeText={onChange}
                      autoCapitalize="none"
                      keyboardType="email-address"
                    />
                  </View>
                )}
              />
              {errors.email && <Text style={styles.errorText}>{errors.email.message}</Text>}

              <Controller
                control={control}
                name="password"
                rules={{
                  required: "Password is required",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters",
                  },
                }}
                render={({ field: { onChange, value } }) => (
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={[styles.input, errors.password && styles.inputError]}
                      placeholder="Password"
                      placeholderTextColor="rgba(6, 95, 70, 0.6)"
                      value={value}
                      onChangeText={onChange}
                      secureTextEntry
                    />
                  </View>
                )}
              />
              {errors.password && <Text style={styles.errorText}>{errors.password.message}</Text>}

              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleSubmit(onSubmit)}
                disabled={loading}
              >
                <LinearGradient
                  colors={loading ? ["#cccccc", "#999999"] : ["#4ade80", "#22c55e"]}
                  style={styles.buttonGradient}
                >
                  <Text style={styles.buttonText}>{loading ? "Signing in..." : "Sign In"}</Text>
                </LinearGradient>
              </TouchableOpacity>

              {/* Forgot password link */}
              <TouchableOpacity
                style={{ alignSelf: 'flex-end', marginBottom: 16 }}
                onPress={() => router.push('/forgot-password')}
              >
                <Text style={styles.forgotText}>Forgot password?</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => router.push("/signup")}>
                <Text style={styles.linkText}>
                  Don't have an account? <Text style={styles.linkTextBold}>Sign up</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </BlurView>
        </View>
      </SafeAreaView>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    justifyContent: "center",
  },
  formContainer: {
    marginHorizontal: 24,
  },
  glassContainer: {
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  form: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    padding: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    // elevation: 8,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  logoPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#ffffff",
    borderWidth: 2,
    borderColor: "rgba(6, 95, 70, 0.3)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    padding: 20,
  },
  logoText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#065f46",
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#065f46",
    marginBottom: 8,
    textAlign: "center",
    textShadowColor: "rgba(255, 255, 255, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  subtitle: {
    fontSize: 16,
    color: "#047857",
    marginBottom: 32,
    textAlign: "center",
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "rgba(6, 95, 70, 0.3)",
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    backgroundColor: "#ffffff",
    color: "#065f46",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  inputError: {
    borderColor: "rgba(239, 68, 68, 0.6)",
    backgroundColor: "#ffffff",
  },
  errorText: {
    color: "#dc2626",
    marginBottom: 8,
    fontSize: 13,
    marginLeft: 4,
    textShadowColor: "rgba(255, 255, 255, 0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  button: {
    borderRadius: 16,
    marginTop: 8,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonGradient: {
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  buttonText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 18,
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  linkText: {
    color: "#047857",
    textAlign: "center",
    fontSize: 15,
    textShadowColor: "rgba(255, 255, 255, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  linkTextBold: {
    fontWeight: "600",
    color: "#065f46",
  },
  forgotText: {
    color: '#047857',
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'right',
    marginBottom: 0,
  },
})
