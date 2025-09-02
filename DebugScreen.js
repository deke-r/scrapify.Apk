import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { API_URL, getConfigDebugInfo } from './config';

// Global log storage
let debugLogs = [];
let logListeners = [];

export const addDebugLog = (level, message, data = null) => {
  const timestamp = new Date().toISOString();
  const logEntry = {
    id: Date.now() + Math.random(),
    timestamp,
    level, // 'info', 'success', 'error', 'warning'
    message,
    data
  };
  
  debugLogs.push(logEntry);
  
  // Keep only last 100 logs
  if (debugLogs.length > 100) {
    debugLogs = debugLogs.slice(-100);
  }
  
  // Notify listeners
  logListeners.forEach(listener => listener(debugLogs));
  
  // Also log to console for development
  if (__DEV__) {
    const emoji = {
      info: '🔍',
      success: '✅',
      error: '❌',
      warning: '⚠️'
    };
    console.log(`${emoji[level]} ${message}`, data || '');
  }
};

export const clearDebugLogs = () => {
  debugLogs = [];
  logListeners.forEach(listener => listener(debugLogs));
};

export const subscribeToLogs = (listener) => {
  logListeners.push(listener);
  return () => {
    logListeners = logListeners.filter(l => l !== listener);
  };
};

const DebugScreen = () => {
  const [debugInfo, setDebugInfo] = useState({});
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState([]);
  const router = useRouter();

  useEffect(() => {
    gatherDebugInfo();
    
    // Subscribe to log updates
    const unsubscribe = subscribeToLogs(setLogs);
    
    return unsubscribe;
  }, []);

  const gatherDebugInfo = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const bookingParams = await AsyncStorage.getItem('bookingParams');
      
      const info = {
        ...getConfigDebugInfo(),
        'AsyncStorage userToken': token ? 'Present' : 'Missing',
        'AsyncStorage bookingParams': bookingParams ? 'Present' : 'Missing',
        'Current API_URL': API_URL,
        'Platform': Platform.OS,
        'App Version': '1.0.0',
        'Timestamp': new Date().toISOString(),
      };

      setDebugInfo(info);
      addDebugLog('info', 'Debug info gathered successfully', info);
    } catch (error) {
      setDebugInfo({
        'Error gathering debug info': error.message,
        'Timestamp': new Date().toISOString(),
      });
      addDebugLog('error', 'Failed to gather debug info', error.message);
    } finally {
      setLoading(false);
    }
  };

  const testNavigation = () => {
    addDebugLog('info', 'Testing navigation to book-service...');
    router.push('/book-service');
  };

  const testAsyncStorage = async () => {
    try {
      const testData = { test: 'data', timestamp: Date.now() };
      await AsyncStorage.setItem('debugTest', JSON.stringify(testData));
      const retrieved = await AsyncStorage.getItem('debugTest');
      const parsed = JSON.parse(retrieved);
      
      const success = JSON.stringify(testData) === JSON.stringify(parsed);
      addDebugLog(success ? 'success' : 'error', 'AsyncStorage test completed', {
        write: testData,
        read: parsed,
        success
      });
      
      Alert.alert(
        'AsyncStorage Test',
        `Write: ${JSON.stringify(testData)}\nRead: ${JSON.stringify(parsed)}\nSuccess: ${success}`
      );
    } catch (error) {
      addDebugLog('error', 'AsyncStorage test failed', error.message);
      Alert.alert('AsyncStorage Test Failed', error.message);
    }
  };

  const clearBookingParams = async () => {
    try {
      await AsyncStorage.removeItem('bookingParams');
      addDebugLog('success', 'Booking params cleared');
      Alert.alert('Success', 'Booking params cleared');
      gatherDebugInfo();
    } catch (error) {
      addDebugLog('error', 'Failed to clear booking params', error.message);
      Alert.alert('Error', error.message);
    }
  };

  const clearAllLogs = () => {
    clearDebugLogs();
    addDebugLog('info', 'All logs cleared');
  };

  const getLogEmoji = (level) => {
    switch (level) {
      case 'info': return '🔍';
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      default: return '📝';
    }
  };

  const getLogColor = (level) => {
    switch (level) {
      case 'info': return '#2196F3';
      case 'success': return '#4CAF50';
      case 'error': return '#F44336';
      case 'warning': return '#FF9800';
      default: return '#666';
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Loading Debug Info...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Debug Information</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Configuration</Text>
        {Object.entries(debugInfo).map(([key, value]) => (
          <View key={key} style={styles.infoRow}>
            <Text style={styles.infoKey}>{key}:</Text>
            <Text style={styles.infoValue}>{String(value)}</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Test Actions</Text>
        
        <TouchableOpacity style={styles.testButton} onPress={testNavigation}>
          <Text style={styles.testButtonText}>Test Navigation to Book Service</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.testButton} onPress={testAsyncStorage}>
          <Text style={styles.testButtonText}>Test AsyncStorage</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.testButton} onPress={clearBookingParams}>
          <Text style={styles.testButtonText}>Clear Booking Params</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.testButton} onPress={gatherDebugInfo}>
          <Text style={styles.testButtonText}>Refresh Debug Info</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <View style={styles.logsHeader}>
          <Text style={styles.sectionTitle}>Debug Logs ({logs.length})</Text>
          <TouchableOpacity style={styles.clearButton} onPress={clearAllLogs}>
            <Text style={styles.clearButtonText}>Clear</Text>
          </TouchableOpacity>
        </View>
        
        {logs.length === 0 ? (
          <Text style={styles.noLogsText}>No logs yet. Try some actions to see debug information.</Text>
        ) : (
          logs.slice().reverse().map((log) => (
            <View key={log.id} style={styles.logEntry}>
              <View style={styles.logHeader}>
                <Text style={styles.logEmoji}>{getLogEmoji(log.level)}</Text>
                <Text style={[styles.logLevel, { color: getLogColor(log.level) }]}>
                  {log.level.toUpperCase()}
                </Text>
                <Text style={styles.logTimestamp}>
                  {new Date(log.timestamp).toLocaleTimeString()}
                </Text>
              </View>
              <Text style={styles.logMessage}>{log.message}</Text>
              {log.data && (
                <Text style={styles.logData}>
                  {typeof log.data === 'object' ? JSON.stringify(log.data, null, 2) : String(log.data)}
                </Text>
              )}
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  infoKey: {
    fontWeight: 'bold',
    flex: 1,
  },
  infoValue: {
    flex: 2,
  },
  testButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  testButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  logsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  clearButton: {
    backgroundColor: '#F44336',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
  },
  clearButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  noLogsText: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
    padding: 20,
  },
  logEntry: {
    backgroundColor: '#f8f9fa',
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  logHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  logEmoji: {
    fontSize: 16,
    marginRight: 8,
  },
  logLevel: {
    fontWeight: 'bold',
    fontSize: 12,
    marginRight: 8,
  },
  logTimestamp: {
    fontSize: 10,
    color: '#666',
  },
  logMessage: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 5,
  },
  logData: {
    fontSize: 12,
    color: '#666',
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 4,
    fontFamily: 'monospace',
  },
});

export default DebugScreen; 