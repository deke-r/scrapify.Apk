import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { API_URL, getConfigDebugInfo } from './config';

const DebugScreen = () => {
  const [backendStatus, setBackendStatus] = useState('Checking...');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkBackendHealth = async () => {
      if (!API_URL) {
        setBackendStatus('❌ API URL not found');
        setIsLoading(false);
        return;
      }

      try {
        // Try multiple endpoints that might exist on your backend
        let response;
        let endpoint = '';
        
        // Try common endpoints that might exist, including the /testing endpoint
        const endpoints = [
          '/testing', // User confirmed this endpoint exists
          '/health',
          '/api/health', 
          '/status',
          '/ping',
          '/', // Root endpoint
        ];

        for (const ep of endpoints) {
          try {
            console.log(`🔍 Trying endpoint: ${API_URL}${ep}`);
            response = await axios.get(`${API_URL}${ep}`, { 
              timeout: 5000,
              validateStatus: (status) => status < 500 // Accept any status < 500
            });
            endpoint = ep;
            break;
          } catch (error) {
            if (error.response && error.response.status < 500) {
              // Server responded but with an error status (like 404, 401, etc.)
              response = error.response;
              endpoint = ep;
              break;
            }
            // Continue to next endpoint if this one failed completely
            continue;
          }
        }

        if (response) {
          if (response.status === 200) {
            setBackendStatus(`✅ API reachable (${endpoint}) - Status: ${response.status}`);
          } else if (response.status < 500) {
            setBackendStatus(`✅ API reachable (${endpoint}) - Status: ${response.status} - Server responded`);
          } else {
            setBackendStatus(`❌ API error (${endpoint}): ${response.status}`);
          }
        } else {
          setBackendStatus('❌ API not reachable - All endpoints failed');
        }
      } catch (error) {
        console.log('Backend health check error:', error);
        if (error.code === 'ECONNABORTED') {
          setBackendStatus('❌ API timeout');
        } else if (error.response) {
          setBackendStatus(`❌ API error: ${error.response.status}`);
        } else if (error.request) {
          setBackendStatus('❌ API not reachable (network error)');
        } else {
          setBackendStatus('❌ API check failed');
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkBackendHealth();
  }, []);

  // Get comprehensive debug information
  const debugInfo = getConfigDebugInfo();

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>🔍 Debug Information</Text>
      
      <Text style={styles.label}>API URL:</Text>
      <Text style={styles.value}>{API_URL || 'Not found'}</Text>
      
      <Text style={styles.label}>Backend Status:</Text>
      <Text style={styles.value}>
        {isLoading ? 'Checking...' : backendStatus}
      </Text>

      <Text style={styles.sectionTitle}>📋 Configuration Debug Info:</Text>
      {Object.entries(debugInfo).map(([key, value]) => (
        <View key={key} style={styles.debugRow}>
          <Text style={styles.debugLabel}>{key}:</Text>
          <Text style={styles.debugValue}>
            {typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
          </Text>
        </View>
      ))}

      <TouchableOpacity 
        style={{
          backgroundColor: '#28a745',
          padding: 10,
          borderRadius: 8,
          marginTop: 16,
          alignSelf: 'center'
        }}
        onPress={async () => {
          try {
            console.log('🧪 Testing /book-service endpoint (no auth)...');
            const response = await axios.get(`${API_URL}/book-service`);
            console.log('✅ /book-service response:', response.data);
            Alert.alert('Success', 'Endpoint is working!');
          } catch (error) {
            if (error.response?.status === 401) {
              console.log('✅ /book-service exists but requires authentication');
              Alert.alert('Auth Required', 'Endpoint exists but needs authentication');
            } else {
              console.log('❌ /book-service error:', error.response?.status, error.response?.data);
              Alert.alert('Error', `Status: ${error.response?.status}\nData: ${JSON.stringify(error.response?.data)}`);
            }
          }
        }}
      >
        <Text style={{ color: 'white', fontWeight: 'bold' }}>
          🧪 Test /book-service Endpoint
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    margin: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
    maxHeight: 400,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#212529',
    marginBottom: 16,
    textAlign: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    fontWeight: '700',
    color: '#212529',
    marginBottom: 16,
    fontFamily: 'monospace',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#495057',
    marginTop: 16,
    marginBottom: 12,
    borderTopWidth: 1,
    borderTopColor: '#dee2e6',
    paddingTop: 16,
  },
  debugRow: {
    marginBottom: 8,
  },
  debugLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6c757d',
    marginBottom: 2,
  },
  debugValue: {
    fontSize: 11,
    color: '#495057',
    fontFamily: 'monospace',
    backgroundColor: '#e9ecef',
    padding: 4,
    borderRadius: 4,
  },
});

export default DebugScreen; 