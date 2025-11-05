import { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, Linking } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { StatusBar } from 'expo-status-bar';

export default function QrScanner() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [scannedData, setScannedData] = useState(null);

  // Check if permissions are still loading
  if (!permission) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Loading...</Text>
      </View>
    );
  }

  // If permission is not granted, show request button
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to use the camera</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Handle barcode scan
  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);
    setScannedData({ type, data });
    
    Alert.alert(
      'QR Code Scanned!',
      `Type: ${type}\nData: ${data}`,
      [
        {
          text: 'Open Link',
          onPress: () => {
            if (data.startsWith('http://') || data.startsWith('https://')) {
              Linking.openURL(data);
            } else {
              Alert.alert('Not a URL', 'The scanned code is not a web link');
            }
          },
        },
        {
          text: 'Scan Again',
          onPress: () => setScanned(false),
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <CameraView
        style={styles.camera}
        facing="back"
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ['qr', 'ean13', 'ean8', 'code128', 'code39'],
        }}
      >
        <View style={styles.overlay}>
          <View style={styles.header}>
            <Text style={styles.title}>QR Code Scanner</Text>
            <Text style={styles.subtitle}>
              {scanned ? 'Code scanned!' : 'Point camera at QR code'}
            </Text>
          </View>

          {/* Scanning frame */}
          <View style={styles.scanArea}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
          </View>

          {scannedData && (
            <View style={styles.resultContainer}>
              <Text style={styles.resultLabel}>Scanned Data:</Text>
              <Text style={styles.resultText} numberOfLines={3}>
                {scannedData.data}
              </Text>
            </View>
          )}

          <View style={styles.footer}>
            {scanned && (
              <TouchableOpacity
                style={styles.button}
                onPress={() => setScanned(false)}
              >
                <Text style={styles.buttonText}>Scan Again</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
    color: '#fff',
    fontSize: 16,
    marginHorizontal: 20,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  scanArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: '#00ff00',
  },
  topLeft: {
    top: '30%',
    left: '15%',
    borderTopWidth: 4,
    borderLeftWidth: 4,
  },
  topRight: {
    top: '30%',
    right: '15%',
    borderTopWidth: 4,
    borderRightWidth: 4,
  },
  bottomLeft: {
    bottom: '30%',
    left: '15%',
    borderBottomWidth: 4,
    borderLeftWidth: 4,
  },
  bottomRight: {
    bottom: '30%',
    right: '15%',
    borderBottomWidth: 4,
    borderRightWidth: 4,
  },
  resultContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 15,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 10,
  },
  resultLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  resultText: {
    fontSize: 14,
    color: '#666',
  },
  footer: {
    paddingBottom: 50,
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#00ff00',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
});