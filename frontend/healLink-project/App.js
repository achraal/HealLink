import React, { useEffect, useState } from "react";
import { View } from "react-native";
import CampagneMap from "./components/Campagne/CampagneMap";
import CampagneList from "./components/Campagne/CampagneList";
import axios from "axios";

export default function App() {
  const [campagnes, setCampagnes] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:8000/campagnes")
      .then(response => setCampagnes(response.data))
      .catch(error => console.error(error));
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <CampagneMap campagnes={campagnes} />
      <CampagneList campagnes={campagnes} />
    </View>
  );
}
