import React from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, View } from 'react-native';
import { colors } from '../constants/theme';

export default function SplashScreen() {
  return (
    <View style={styles.root}>
      <Image
        source={require('../assets/login-asset.png')}
        style={styles.bg}
        resizeMode="cover"
      />
      <View style={styles.overlay} />
      <View style={styles.content}>
        <View style={styles.logoBox}>
          <Text style={styles.logoIcon}>🚜</Text>
        </View>
        <Text style={styles.brand}>
          <Text style={styles.brandAgri}>AGRI</Text>
          <Text style={styles.brandRent}>RENT</Text>
        </Text>
        <Text style={styles.tagline}>Smart Equipment Rental for Smarter Farming</Text>
        <ActivityIndicator color="#FFFFFF" size="large" style={styles.loader} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  bg: {
    ...StyleSheet.absoluteFill,
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(30, 60, 40, 0.65)',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  logoBox: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  logoIcon: {
    fontSize: 40,
  },
  brand: {
    fontSize: 38,
    fontWeight: '900',
    letterSpacing: 2,
  },
  brandAgri: {
    color: '#FFFFFF',
  },
  brandRent: {
    color: '#A8D5A2',
  },
  tagline: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 13,
    marginTop: 8,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  loader: {
    marginTop: 48,
  },
});
