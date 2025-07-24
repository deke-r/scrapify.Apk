"use client"

import axios from "axios"
import { BlurView } from "expo-blur"
import { LinearGradient } from "expo-linear-gradient"
import { useRouter } from "expo-router"
import { useRef, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { Alert, Image, Keyboard, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

export default function Signup() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [otp, setOtp] = useState(["", "", "", ""])
  const [loading, setLoading] = useState(false)
  const [userData, setUserData] = useState(null);

  // Refs for OTP inputs
  const otpRefs = [useRef(null), useRef(null), useRef(null), useRef(null)]

  const {
    control,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm({
    defaultValues: { name: "", email: "", phone: "", password: "" },
  })

const onSubmitSignup = async (data) => {
  setLoading(true);
  try {
    await axios.post(`${process.env.EXPO_PUBLIC_API_URL}/send-otp`, { email: data.email });
    setUserData(data);
    setStep(2);
    Alert.alert('OTP Sent', 'Check your email for the OTP.');
  } catch (err) {
    console.log('Send OTP error:', err, err.response?.data);
    Alert.alert('Error', err.response?.data?.error || 'Failed to send OTP');
  } finally {
    setLoading(false);
  }
};



  const handleOtpChange = (value, index) => {
    const newOtp = [...otp]
    newOtp[index] = value

    setOtp(newOtp)
    if (value && index < 3) {
      otpRefs[index + 1].current?.focus()
    }
  }

  const handleOtpKeyPress = (e, index) => {
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs[index - 1].current?.focus()
    }
  }

const handleVerifyOtp = async () => {
  const enteredOtp = otp.join('');
  try {
    await axios.post(`${process.env.EXPO_PUBLIC_API_URL}/verify-otp`, {
      email: userData.email,
      otp: enteredOtp
    });
    await axios.post(`${process.env.EXPO_PUBLIC_API_URL}/signup`, userData);
    Alert.alert('Success', 'Account created!');
    router.push('/login');
  } catch (err) {
    Alert.alert('Error', err.response?.data?.error || 'OTP invalid or signup failed');
  }
};


  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <LinearGradient colors={["#a8e6cf", "#ffffff"]} style={styles.container}>
          <SafeAreaView style={styles.safeArea}>
            <View style={styles.formContainer}>
              <BlurView intensity={20} style={styles.glassContainer}>
                <View style={styles.form}>
                  {/* Logo Section */}
                  <View style={styles.logoContainer}>
                    <Image source={require("../../assets/images/logo2.png")} style={styles.logoPlaceholder} />
                  </View>

                  {step === 1 ? (
                    <>
                      <Text style={styles.title}>Create Account</Text>
                      <Text style={styles.subtitle}>Join us today</Text>

                      <Controller
                        control={control}
                        name="name"
                        rules={{ required: "Name is required" }}
                        render={({ field: { onChange, value } }) => (
                          <View style={styles.inputContainer}>
                            <TextInput
                              style={[styles.input, errors.name && styles.inputError]}
                              placeholder="Full Name"
                              placeholderTextColor="rgba(6, 95, 70, 0.6)"
                              value={value}
                              onChangeText={onChange}
                            />
                          </View>
                        )}
                      />
                      {errors.name && <Text style={styles.errorText}>{errors.name.message}</Text>}

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
                        name="phone"
                        rules={{
                          required: "Phone is required",
                          pattern: {
                            value: /^\d{10}$/,
                            message: "Phone must be 10 digits",
                          },
                        }}
                        render={({ field: { onChange, value } }) => (
                          <View style={styles.inputContainer}>
                            <TextInput
                              style={[styles.input, errors.phone && styles.inputError]}
                              placeholder="Phone (10 digits)"
                              placeholderTextColor="rgba(6, 95, 70, 0.6)"
                              value={value}
                              onChangeText={onChange}
                              keyboardType="phone-pad"
                              maxLength={10}
                              returnKeyType="done"
                              onSubmitEditing={Keyboard.dismiss}
                            />
                          </View>
                        )}
                      />
                      {errors.phone && <Text style={styles.errorText}>{errors.phone.message}</Text>}

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
                        onPress={handleSubmit(onSubmitSignup)}
                        disabled={loading}
                      >
                        <LinearGradient
                          colors={loading ? ["#cccccc", "#999999"] : ["#4ade80", "#22c55e"]}
                          style={styles.buttonGradient}
                        >
                          <Text style={styles.buttonText}>{loading ? "Sending OTP..." : "Sign Up"}</Text>
                        </LinearGradient>
                      </TouchableOpacity>

                      <TouchableOpacity onPress={() => router.push("/login")}>
                        <Text style={styles.linkText}>
                          Already have an account? <Text style={styles.linkTextBold}>Login</Text>
                        </Text>
                      </TouchableOpacity>
                    </>
                  ) : (
                    <>
                      <Text style={styles.title}>Verify OTP</Text>
                      <Text style={styles.subtitle}>Enter the 4-digit OTP sent to your phone/email</Text>

                      <View style={styles.otpContainer}>
                        {otp.map((digit, index) => (
                          <TextInput
                            key={index}
                            ref={otpRefs[index]}
                            style={styles.otpInput}
                            value={digit}
                            onChangeText={(value) => handleOtpChange(value, index)}
                            onKeyPress={(e) => handleOtpKeyPress(e, index)}
                            keyboardType="number-pad"
                            maxLength={1}
                            textAlign="center"
                            selectTextOnFocus
                            returnKeyType="done"
                            onSubmitEditing={Keyboard.dismiss}
                          />
                        ))}
                      </View>

                      <TouchableOpacity
                        style={[styles.button, otp.join("").length !== 4 && styles.buttonDisabled]}
                        onPress={handleVerifyOtp}
                        disabled={otp.join("").length !== 4}
                      >
                        <LinearGradient colors={["#4ade80", "#22c55e"]} style={styles.buttonGradient}>
                          <Text style={styles.buttonText}>Verify & Continue</Text>
                        </LinearGradient>
                      </TouchableOpacity>

                      <TouchableOpacity onPress={() => setStep(1)}>
                        <Text style={styles.linkText}>
                          <Text style={styles.linkTextBold}>← Back to Signup</Text>
                        </Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              </BlurView>
            </View>
          </SafeAreaView>
        </LinearGradient>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
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
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    borderRadius: 24,
    padding: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  logoPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(6, 95, 70, 0.1)",
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
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    color: "#065f46",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  inputError: {
    borderColor: "rgba(239, 68, 68, 0.6)",
    backgroundColor: "rgba(239, 68, 68, 0.1)",
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
  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  otpInput: {
    width: 60,
    height: 60,
    borderWidth: 2,
    borderColor: "rgba(6, 95, 70, 0.3)",
    borderRadius: 16,
    fontSize: 24,
    fontWeight: "600",
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    color: "#065f46",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
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
})
