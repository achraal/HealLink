import React, { useEffect, useState } from "react";
import {
  View, Text, StyleSheet, ActivityIndicator, Alert,
  TouchableOpacity, ScrollView, TextInput, Button
} from "react-native";
import * as Location from "expo-location";
import MapView, { Marker, Callout } from "react-native-maps";
import DateTimePicker from '@react-native-community/datetimepicker';

export default function HomeScreen() {
  const [location, setLocation] = useState(null);
  const [centresSanitaires, setCentresSanitaires] = useState([]);
  const [errorMsg, setErrorMsg] = useState(null);
  const [loading, setLoading] = useState(true);

  // États de filtre
  const [filterCategory, setFilterCategory] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [filterStartDate, setFilterStartDate] = useState(null);
  const [filterEndDate, setFilterEndDate] = useState(null);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  const [showWarningsBanner, setShowWarningsBanner] = useState(false);
  const [showWarningsDetails, setShowWarningsDetails] = useState(false);
  const [firstAlertDone, setFirstAlertDone] = useState(false);

  const STOCK_SEUIL = 50;
  const DISTANCE_SEUIL_KM = 5;
  const POCHES_SANG_SEUIL = 10;

  function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  function filterCentres(centres) {
    return centres.filter((centre) => {
      if (filterCategory && centre.categorie !== filterCategory) return false;
      if (filterStartDate && centre.dateFin && new Date(centre.dateFin) < filterStartDate) return false;
      if (filterEndDate && centre.dateDebut && new Date(centre.dateDebut) > filterEndDate) return false;
      if (
        searchText &&
        !centre.nom.toLowerCase().includes(searchText.toLowerCase()) &&
        !centre.centre.toLowerCase().includes(searchText.toLowerCase())
      )
        return false;
      return true;
    });
  }

  const filteredCentres = filterCentres(centresSanitaires);

  // Centres proches pour alertes
  const nearbyCentres = filteredCentres
    .map((centre) => {
      if (!location) return null;
      const dist = getDistanceFromLatLonInKm(
        location.latitude,
        location.longitude,
        centre.latitude,
        centre.longitude
      );
      return { ...centre, distance: dist };
    })
    .filter((centre) => centre !== null && centre.distance <= DISTANCE_SEUIL_KM);

  const lowStockNearbyCentres = nearbyCentres.filter(centre => centre.stockVaccins < STOCK_SEUIL);
  const lowBloodPouchesNearbyCentres = nearbyCentres.filter(centre => centre.pochesDeSang !== undefined && centre.pochesDeSang < POCHES_SANG_SEUIL);

  useEffect(() => {
    (async () => {
      const { status: locStatus } = await Location.requestForegroundPermissionsAsync();
      if (locStatus !== "granted") {
        setErrorMsg("Permission de localisation refusée.");
        setLoading(false);
        return;
      }

      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc.coords);

      try {
        const response = await fetch("http://192.168.11.134:8000/campagnes");
        if (!response.ok) throw new Error("Erreur API");
        const data = await response.json();
        setCentresSanitaires(data);

        if (!firstAlertDone) {
          data.forEach((centre) => {
            const dist = getDistanceFromLatLonInKm(
              loc.coords.latitude,
              loc.coords.longitude,
              centre.latitude,
              centre.longitude
            );

            if (centre.stockVaccins < STOCK_SEUIL && dist <= DISTANCE_SEUIL_KM) {
              Alert.alert(
                "Stock faible proche de vous",
                `Le stock des vaccins au centre ${centre.nom} est faible (${centre.stockVaccins}) à ${dist.toFixed(2)} km.`,
                [{ text: "Ok" }]
              );
            }

            if (
              centre.pochesDeSang !== undefined &&
              centre.pochesDeSang < POCHES_SANG_SEUIL &&
              dist <= DISTANCE_SEUIL_KM
            ) {
              Alert.alert(
                "Poches de sang faibles",
                `Le nombre de poches de sang au centre ${centre.nom} est faible (${centre.pochesDeSang}) à ${dist.toFixed(2)} km.`,
                [{ text: "Ok" }]
              );
            }
          });
          setFirstAlertDone(true);
          if (
            data.some(
              (centre) =>
                getDistanceFromLatLonInKm(
                  loc.coords.latitude,
                  loc.coords.longitude,
                  centre.latitude,
                  centre.longitude
                ) <= DISTANCE_SEUIL_KM
            )
          ) {
            setShowWarningsBanner(true);
          }
        }
      } catch (error) {
        setErrorMsg("Erreur lors de la récupération des campagnes");
        console.error(error);
      }
      setLoading(false);
    })();
  }, [firstAlertDone]);

  const onChangeStartDate = (event, selectedDate) => {
    setShowStartDatePicker(false);
    if (selectedDate) setFilterStartDate(selectedDate);
  };

  const onChangeEndDate = (event, selectedDate) => {
    setShowEndDatePicker(false);
    if (selectedDate) setFilterEndDate(selectedDate);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>Chargement...</Text>
      </View>
    );
  }

  if (errorMsg) {
    return (
      <View style={styles.center}>
        <Text>{errorMsg}</Text>
      </View>
    );
  }

  if (!location) {
    return (
      <View style={styles.center}>
        <Text>Localisation non disponible</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 10 }}>
      <Text style={styles.label}>Filtrer par catégorie :</Text>
      <View style={{ flexDirection: "row", marginBottom: 10 }}>
        {["Vaccination", "Dépistage", "Don de Sang"].map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[
              styles.filterButton,
              filterCategory === cat && styles.filterButtonActive,
            ]}
            onPress={() => setFilterCategory(filterCategory === cat ? null : cat)}
          >
            <Text style={[styles.filterText, filterCategory === cat && styles.filterTextActive]}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Recherche texte (nom ou centre) :</Text>
      <TextInput
        placeholder="Rechercher..."
        style={styles.input}
        value={searchText}
        onChangeText={setSearchText}
      />

      <View style={{ flexDirection: "row", justifyContent: "space-between", marginVertical: 10 }}>
        <View style={{ flex: 1, marginRight: 5 }}>
          <Button title={filterStartDate ? filterStartDate.toLocaleDateString() : "Date début"} onPress={() => setShowStartDatePicker(true)} />
          {showStartDatePicker && (
            <DateTimePicker
              value={filterStartDate || new Date()}
              mode="date"
              display="default"
              onChange={onChangeStartDate}
              maximumDate={filterEndDate || new Date(2100, 12, 31)}
            />
          )}
        </View>
        <View style={{ flex: 1, marginLeft: 5 }}>
          <Button title={filterEndDate ? filterEndDate.toLocaleDateString() : "Date fin"} onPress={() => setShowEndDatePicker(true)} />
          {showEndDatePicker && (
            <DateTimePicker
              value={filterEndDate || new Date()}
              mode="date"
              display="default"
              onChange={onChangeEndDate}
              minimumDate={filterStartDate || new Date(1900, 1, 1)}
            />
          )}
        </View>
      </View>

      {showWarningsBanner && !showWarningsDetails && (
        <TouchableOpacity style={styles.banner} onPress={() => setShowWarningsDetails(true)}>
          <Text style={styles.bannerText}>
            {`📍 ${nearbyCentres.length} centres proches de vous.`}
            {lowStockNearbyCentres.length > 0 ? ` ⚠️ ${lowStockNearbyCentres.length} ont un stock faible.` : ""}
            {lowBloodPouchesNearbyCentres.length > 0 ? ` 🩸 ${lowBloodPouchesNearbyCentres.length} ont un stock faible en poches de sang.` : ""}
            {" "}Cliquez pour voir.
          </Text>
        </TouchableOpacity>
      )}

      {showWarningsDetails && (
        <View style={styles.warningsContainer}>
          <Text style={styles.warningsTitle}>Centres proches :</Text>
          <ScrollView style={{ maxHeight: 150 }}>
            {nearbyCentres.map((centre, idx) => (
              <Text key={"nearby" + idx} style={styles.warningItem}>
                • {centre.nom} ({centre.stockVaccins} vaccins) - {centre.distance.toFixed(2)} km{"\n"}
                Catégorie : {centre.categorie || "N/A"}{"\n"}
                Dates : {centre.dateDebut ? new Date(centre.dateDebut).toLocaleDateString() : "?"}{" "}
                - {centre.dateFin ? new Date(centre.dateFin).toLocaleDateString() : "?"}{"\n"}
                Poches de sang : {centre.pochesDeSang ?? "N/A"}
              </Text>
            ))}
          </ScrollView>
          {lowStockNearbyCentres.length > 0 && (
            <>
              <Text style={[styles.warningsTitle, { marginTop: 10 }]}>Centres proches avec stock faible :</Text>
              <ScrollView style={{ maxHeight: 150 }}>
                {lowStockNearbyCentres.map((centre, idx) => (
                  <Text key={"lowstock" + idx} style={styles.warningItem}>
                    • {centre.nom} ({centre.stockVaccins} vaccins restants) - {centre.distance.toFixed(2)} km{"\n"}
                    Catégorie : {centre.categorie || "N/A"}{"\n"}
                    Dates : {centre.dateDebut ? new Date(centre.dateDebut).toLocaleDateString() : "?"}{" "}
                    - {centre.dateFin ? new Date(centre.dateFin).toLocaleDateString() : "?"}{"\n"}
                    Poches de sang : {centre.pochesDeSang ?? "N/A"}
                  </Text>
                ))}
              </ScrollView>
            </>
          )}
          {lowBloodPouchesNearbyCentres.length > 0 && (
            <>
              <Text style={[styles.warningsTitle, { marginTop: 10 }]}>Centres proches avec poches de sang faibles :</Text>
              <ScrollView style={{ maxHeight: 150 }}>
                {lowBloodPouchesNearbyCentres.map((centre, idx) => (
                  <Text key={"lowblood" + idx} style={styles.warningItem}>
                    • {centre.nom} ({centre.pochesDeSang} poches restantes) - {centre.distance.toFixed(2)} km{"\n"}
                    Catégorie : {centre.categorie || "N/A"}{"\n"}
                    Dates : {centre.dateDebut ? new Date(centre.dateDebut).toLocaleDateString() : "?"}{" "}
                    - {centre.dateFin ? new Date(centre.dateFin).toLocaleDateString() : "?"}
                  </Text>
                ))}
              </ScrollView>
            </>
          )}
          <TouchableOpacity onPress={() => setShowWarningsDetails(false)} style={styles.closeButton}>
            <Text style={styles.closeText}>Fermer</Text>
          </TouchableOpacity>
        </View>
      )}

      <MapView
        style={{ flex: 1 }}
        initialRegion={{
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        showsUserLocation={true}
      >
        {filteredCentres.map((centre, index) => {
          const dist = location
            ? getDistanceFromLatLonInKm(location.latitude, location.longitude, centre.latitude, centre.longitude)
            : null;
          return (
            <Marker
              key={centre.id ?? index.toString()}
              coordinate={{ latitude: centre.latitude, longitude: centre.longitude }}
              title={centre.nom}
            >
              <Callout>
                <View style={{ maxWidth: 250 }}>
                  <Text style={{ fontWeight: "bold", marginBottom: 5 }}>{centre.nom}</Text>
                  <Text>Stock vaccins : {centre.stockVaccins}</Text>
                  <Text>Distance : {dist !== null ? dist.toFixed(2) + " km" : "?"}</Text>
                  <Text>Catégorie : {centre.categorie || "N/A"}</Text>
                  <Text>
                    Dates : {centre.dateDebut ? new Date(centre.dateDebut).toLocaleDateString() : "?"} -{" "}
                    {centre.dateFin ? new Date(centre.dateFin).toLocaleDateString() : "?"}
                  </Text>
                  <Text>Poches de sang : {centre.pochesDeSang ?? "N/A"}</Text>
                </View>
              </Callout>
            </Marker>
          );
        })}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    borderRadius: 5,
    backgroundColor: "#f9f9f9",
  },
  filterButton: {
    marginRight: 10,
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#ccc",
  },
  filterButtonActive: {
    backgroundColor: "#0c5460",
  },
  filterText: {
    color: "#000",
  },
  filterTextActive: {
    color: "#fff",
  },
  banner: {
    backgroundColor: "#d1ecf1",
    padding: 10,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#bee5eb",
  },
  bannerText: {
    color: "#0c5460",
    fontWeight: "bold",
  },
  warningsContainer: {
    backgroundColor: "#fff3cd",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ffeeba",
  },
  warningsTitle: {
    fontWeight: "bold",
    marginBottom: 5,
  },
  warningItem: {
    marginLeft: 10,
    marginBottom: 10,
    lineHeight: 18,
  },
  closeButton: {
    marginTop: 10,
    alignSelf: "flex-end",
  },
  closeText: {
    color: "#007bff",
  },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});

// Tous le code ci-dessus est specialement pour la fonctionnaité campagnes d'achraf //