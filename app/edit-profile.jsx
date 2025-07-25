"use client"

import AsyncStorage from '@react-native-async-storage/async-storage'
import axios from 'axios'
import { useRouter } from "expo-router"
import { useEffect, useState } from "react"
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

const EditProfile = () => {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true)
      try {
        const token = await AsyncStorage.getItem('userToken')
        if (!token) {
          router.replace('/(auth)/login')
          return
        }
        const response = await axios.get(`${process.env.EXPO_PUBLIC_API_URL}/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        setUser(response.data.user)
        setName(response.data.user.name)
        setPhone(response.data.user.phone)
      } catch (err) {
        Alert.alert('Error', 'Failed to fetch profile info. Please login again.')
        router.replace('/(auth)/login')
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      const token = await AsyncStorage.getItem('userToken')
      const payload = { name, phone }
      if (password) payload.password = password
      const response = await axios.put(`${process.env.EXPO_PUBLIC_API_URL}/profile`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (response.data.success) {
        Alert.alert('Success', 'Profile updated successfully!', [
          { text: 'OK', onPress: () => router.back() }
        ])
      } else {
        Alert.alert('Error', response.data.error || 'Failed to update profile.')
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to update profile.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </SafeAreaView>
    )
  }

  if (!user) return null

  return (
    <SafeAreaView style={styles.container}>
  
      <View style={styles.form}>
        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          className='rounded-3xl'
        />
        <Text style={styles.label}>Phone</Text>
        <TextInput
          style={styles.input}
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          returnKeyType="done"
        />
        <Text style={styles.label}>Email (cannot be changed)</Text>
        <TextInput
          style={[styles.input, { backgroundColor: '#eee' }]}
          value={user.email}
          editable={false}
        />
        <Text style={styles.label}>New Password</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="Leave blank to keep current password"
        />
        <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={saving}>
          <Text style={styles.saveButtonText}>{saving ? "Saving..." : "Save Changes"}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

export default EditProfile

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff",paddingTop:0 },

  form: { paddingHorizontal: 20,paddingTop:0,marginTop:'-30' },
  label: { fontSize: 16, color: "#333", marginTop: 15, marginBottom: 5,marginLeft:6,fontWeight:'600' },
  input: {
    borderWidth: 1, borderColor: "#ccc", borderRadius: 14, paddingHorizontal: 10, fontSize: 16, backgroundColor: "#fff",paddingVertical:18
  },
  saveButton: {
    backgroundColor: "#4CAF50", padding: 18, borderRadius: 14, marginTop: 30, alignItems: "center"
  },
  saveButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16 }
})