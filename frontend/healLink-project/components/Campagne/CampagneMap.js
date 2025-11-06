import React from "react";
import MapView, { Marker } from "react-native-maps";

export default function CampagneMap({ campagnes }) {
  return (
    <MapView style={{ flex: 1 }}>
      {campagnes.map(campagne => (
        <Marker
          key={campagne.id}
          coordinate={{
            latitude: campagne.localisation.lat,
            longitude: campagne.localisation.lng,
          }}
          title={campagne.type}
          description={`${campagne.centre} - Stock: ${campagne.stock}`}
        />
      ))}
    </MapView>
  );
}
