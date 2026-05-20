import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet,
  TextInput,
  FlatList
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PhishGuardSDK from '../SDK/PhishGuardSDK';

/**
 * PhishGuard Mobile App Example
 * Complete React Native implementation
 */

const PhishGuardApp = () => {
  const [sdk, setSdk] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [riskProfile, setRiskProfile] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [screen, setScreen] = useState('login'); // login, dashboard, compose

  // Initialize SDK on app load
  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      setLoading(true);
      
      // Initialize SDK with API key
      const phishGuardSDK = new PhishGuardSDK(
        process.env.REACT_APP_SDK_KEY || 'demo_key',
        { baseURL: process.env.REACT_APP_API_URL || 'http://localhost:4000/api' }
      );
      
      const result = await phishGuardSDK.initialize();
      
      if (result.success) {
        setSdk(phishGuardSDK);
        
        // Check if user was previously logged in
        const savedEmail = await AsyncStorage.getItem('userEmail');
        const savedToken = await AsyncStorage.getItem('authToken');
        
        if (savedEmail && savedToken) {
          phishGuardSDK.token = savedToken;
          setUser({ email: savedEmail });
          setScreen('dashboard');
          await loadDashboard(phishGuardSDK);
        } else {
          setScreen('login');
        }
      } else {
        Alert.alert('Error', 'Failed to initialize SDK');
      }
    } catch (error) {
      console.error('App initialization error:', error);
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    try {
      setLoading(true);
      
      // In a real app, this would call your backend login endpoint
      // For now, we'll use the SDK directly
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:4000/api'}/auth/login`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        }
      );

      const data = await response.json();

      if (data.token) {
        // Save credentials
        await AsyncStorage.setItem('userEmail', email);
        await AsyncStorage.setItem('authToken', data.token);
        
        // Update SDK with token
        sdk.token = data.token;
        
        setUser({ email });
        setScreen('dashboard');
        await loadDashboard(sdk);
      } else {
        Alert.alert('Error', data.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadDashboard = async (phishGuardSDK) => {
    try {
      // Load risk profile
      const profile = await phishGuardSDK.getRiskProfile();
      setRiskProfile(profile);

      // Load recent alerts
      const recentAlerts = await phishGuardSDK.getAlerts(10);
      setAlerts(recentAlerts);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('userEmail');
      await AsyncStorage.removeItem('authToken');
      setUser(null);
      setEmail('');
      setPassword('');
      setScreen('login');
      setRiskProfile(null);
      setAlerts([]);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const scanEmail = async () => {
    try {
      setLoading(true);
      
      const emailData = {
        from: 'sender@example.com',
        subject: 'Sample Email',
        body: 'This is a test email with a suspicious link: http://malicious.com',
        links: ['http://malicious.com']
      };

      const result = await sdk.scanEmail(emailData);

      if (result.flagged) {
        Alert.alert(
          '⚠️ Warning',
          `Phishing Detected!\n\nReason: ${result.reasons[0]}\nRisk Score: ${result.score}/100`,
          [
            { text: 'OK', onPress: () => {} }
          ]
        );
      } else {
        Alert.alert('✅ Safe', 'This email appears to be safe');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to scan email: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const checkURL = async () => {
    try {
      setLoading(true);
      
      const testURL = 'https://malicious-site-example.com';
      const result = await sdk.checkURL(testURL);

      if (result.flagged) {
        Alert.alert(
          '⚠️ Dangerous Link',
          `This link appears to be malicious!\n\nReason: ${result.reason}\nRisk Score: ${result.score}/100`,
          [
            { text: 'OK', onPress: () => {} }
          ]
        );
      } else {
        Alert.alert('✅ Safe', 'This link appears to be safe');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to check URL: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const reportPhishing = async () => {
    try {
      setLoading(true);
      
      await sdk.reportThreat({
        type: 'phishing',
        email: 'attacker@phishing.com',
        reason: 'Fake login page'
      });

      Alert.alert('✅ Reported', 'Thank you for reporting this threat!');
    } catch (error) {
      Alert.alert('Error', 'Failed to report: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const refreshDashboard = async () => {
    try {
      setLoading(true);
      await loadDashboard(sdk);
      Alert.alert('✅ Refreshed', 'Dashboard data updated');
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // ===== LOGIN SCREEN =====
  if (screen === 'login') {
    return (
      <View style={styles.container}>
        <View style={styles.loginCard}>
          <Text style={styles.title}>PhishGuard</Text>
          <Text style={styles.subtitle}>AI-Powered Threat Detection</Text>

          <TextInput
            style={styles.input}
            placeholder="Email Address"
            value={email}
            onChangeText={setEmail}
            editable={!loading}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!loading}
          />

          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Sign In</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.demoText}>Demo: Use any email/password</Text>
        </View>
      </View>
    );
  }

  // ===== DASHBOARD SCREEN =====
  if (screen === 'dashboard') {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>PhishGuard Dashboard</Text>
            <Text style={styles.headerSubtitle}>{user?.email}</Text>
          </View>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* Risk Profile Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Your Risk Profile</Text>
          {riskProfile ? (
            <>
              <View style={styles.riskScore}>
                <Text style={styles.riskLabel}>Risk Score</Text>
                <Text style={[
                  styles.riskValue,
                  riskProfile.score > 70 ? styles.highRisk : 
                  riskProfile.score > 40 ? styles.mediumRisk : 
                  styles.lowRisk
                ]}>
                  {Math.round(riskProfile.score)}/100
                </Text>
              </View>
              <Text style={styles.riskDetails}>
                {riskProfile.incident_count || 0} Incidents Detected
              </Text>
            </>
          ) : (
            <ActivityIndicator color="#667eea" />
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={scanEmail}
            disabled={loading}
          >
            <Text style={styles.buttonText}>📧 Scan Email</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={checkURL}
            disabled={loading}
          >
            <Text style={styles.buttonText}>🔗 Check URL</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={reportPhishing}
            disabled={loading}
          >
            <Text style={styles.buttonText}>🚨 Report Threat</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={refreshDashboard}
            disabled={loading}
          >
            <Text style={styles.buttonText}>🔄 Refresh</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Alerts */}
        <View style={styles.card}>
          <View style={styles.alertsHeader}>
            <Text style={styles.cardTitle}>Recent Threats</Text>
            <Text style={styles.alertCount}>{alerts.length}</Text>
          </View>

          {alerts.length > 0 ? (
            <FlatList
              scrollEnabled={false}
              data={alerts}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <View style={styles.alertItem}>
                  <Text style={styles.alertSender}>📧 {item.sender || 'Unknown'}</Text>
                  <Text style={styles.alertReason}>{item.reason}</Text>
                  <Text style={styles.alertTime}>
                    {new Date(item.timestamp).toLocaleDateString()}
                  </Text>
                </View>
              )}
            />
          ) : (
            <Text style={styles.emptyState}>✅ No threats detected</Text>
          )}
        </View>
      </ScrollView>
    );
  }

  return <View style={styles.container}><Text>Unknown Screen</Text></View>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#667eea',
    padding: 20,
    paddingTop: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  logoutButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  logoutText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  loginCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    marginTop: 100,
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#667eea',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 14,
    fontFamily: 'Menlo',
  },
  button: {
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButton: {
    backgroundColor: '#667eea',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#667eea',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  demoText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
  card: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginVertical: 12,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  riskScore: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  riskLabel: {
    fontSize: 14,
    color: '#666',
  },
  riskValue: {
    fontSize: 20,
    fontWeight: 'bold',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  highRisk: {
    color: '#fff',
    backgroundColor: '#ff6b6b',
  },
  mediumRisk: {
    color: '#fff',
    backgroundColor: '#ffa500',
  },
  lowRisk: {
    color: '#fff',
    backgroundColor: '#52c41a',
  },
  riskDetails: {
    fontSize: 13,
    color: '#999',
    marginTop: 12,
  },
  actionsContainer: {
    marginHorizontal: 16,
    marginVertical: 12,
  },
  alertsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  alertCount: {
    backgroundColor: '#667eea',
    color: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: '600',
  },
  alertItem: {
    backgroundColor: '#fff5f5',
    borderLeftWidth: 4,
    borderLeftColor: '#ff6b6b',
    padding: 12,
    marginBottom: 10,
    borderRadius: 6,
  },
  alertSender: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  alertReason: {
    fontSize: 12,
    color: '#666',
    marginBottom: 6,
  },
  alertTime: {
    fontSize: 11,
    color: '#999',
  },
  emptyState: {
    textAlign: 'center',
    fontSize: 14,
    color: '#999',
    paddingVertical: 20,
  },
});

export default PhishGuardApp;
