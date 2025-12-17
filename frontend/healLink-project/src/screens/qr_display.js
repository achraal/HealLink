import React from 'react';
import { View, Text, TextInput } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { useWebSocket } from '../utils/websocketProvider';


export default function QRCodeScreen() {
  const { ws, userId } = useWebSocket();
  const [text, setText] = React.useState(userId);

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: 20, marginBottom: 20 }}>My ID : {userId}</Text>


      <QRCode
        value={String(userId)}
        size={200}
        color="green"
        backgroundColor="white"
      />
    </View>
  );
}

