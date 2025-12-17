import React, { useEffect, useState } from "react";
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, 
  Alert, SafeAreaView, ActivityIndicator, RefreshControl 
} from "react-native";

export default function CagnotteScreen() {
  const [cagnottes, setCagnottes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchCagnottes = async () => {
    try {
      const response = await fetch("http://192.168.11.112:8000/cagnottes");
      const data = await response.json();
      setCagnottes(data);
    } catch (error) {
      Alert.alert("Erreur", "Impossible de charger les cagnottes");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCagnottes();
  }, []);

  const faireDon = (cagnotte) => {
  Alert.alert(
    "💰 Faire un don",
    `${cagnotte.titre}\n\nCollecte actuelle: ${cagnotte.collecte.toLocaleString()} / ${cagnotte.objectif.toLocaleString()} DH\nProgression: ${cagnotte.pourcentage.toFixed(1)}%`,
    [
      { text: "Annuler", style: "cancel" },
      { text: "50 DH", onPress: () => processDon(cagnotte, 50) },
      { text: "100 DH", onPress: () => processDon(cagnotte, 100) },
      { text: "250 DH", onPress: () => processDon(cagnotte, 250) },
      { text: "Montant personnalisé", onPress: () => showCustomDon(cagnotte) }
    ]
  );
};


  const showCustomDon = (cagnotte) => {
  Alert.prompt(
    "Montant personnalisé",
    "Entrez le montant en DH:",
    (montantText) => {
      const montant = parseFloat(montantText);
      if (montant && montant > 0) {
        processDon(cagnotte, montant);
      } else {
        Alert.alert("Erreur", "Montant invalide");
      }
    },
    "plain-text",
    "",
    "numeric"
  );
};


  const processDon = async (cagnotte, montant) => {
  const don = {
    id: "",                    // laissé vide, Mongo va créer _id
    montant: montant,
    message: null,             // ou une chaîne si tu veux ajouter un message
    date_don: null,            // le backend mettra datetime.utcnow()
    cagnotte_id: cagnotte.id   // important pour matcher le modèle
  };

  try {
    const response = await fetch(`http://192.168.11.112:8000/cagnottes/${cagnotte.id}/don`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(don)
    });

    const text = await response.text();

    if (response.ok) {
      Alert.alert("✅ Merci !", `Votre don de ${montant} DH a été enregistré !`);
      fetchCagnottes(); // Refresh
    } else {
      console.log('DON ERROR STATUS', response.status);
      console.log('DON ERROR BODY', text);
      Alert.alert("❌ Erreur", `Problème lors du traitement du don (code ${response.status})`);
    }
  } catch (error) {
    console.log('DON FETCH ERROR', error);
    Alert.alert("❌ Erreur", "Connexion impossible");
  }
};


  const onRefresh = () => {
    setRefreshing(true);
    fetchCagnottes();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0c5460" />
        <Text style={styles.loadingText}>Chargement des cagnottes...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Text style={styles.title}>💰 Cagnottes Solidaires</Text>
        <Text style={styles.subtitle}>{cagnottes.length} cagnotte(s) active(s)</Text>

        {cagnottes.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>Aucune cagnotte active</Text>
            <Text style={styles.emptyText}>Revenez bientôt pour aider !</Text>
          </View>
        ) : (
          cagnottes.map((cagnotte) => (
            <TouchableOpacity 
              key={cagnotte.id} 
              style={styles.cagnotteCard}
              onPress={() => faireDon(cagnotte)}
              activeOpacity={0.9}
            >
              <Text style={styles.titre}>{cagnotte.titre}</Text>
              {cagnotte.description && (
                <Text style={styles.description}>{cagnotte.description}</Text>
              )}
              
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { 
                    width: `${Math.min(100, cagnotte.pourcentage)}%`,
                    backgroundColor: cagnotte.pourcentage >= 90 ? '#059669' : '#10b981'
                  }]} />
                </View>
                <Text style={styles.pourcentage}>{cagnotte.pourcentage.toFixed(1)}%</Text>
              </View>
              
              <Text style={styles.montants}>
                {cagnotte.collecte.toLocaleString()} / {cagnotte.objectif.toLocaleString()} DH
              </Text>
              
              <View style={styles.statsRow}>
                <Text style={styles.statText}>
                  Restant: {(cagnotte.objectif - cagnotte.collecte).toLocaleString()} DH
                </Text>
                <Text style={styles.statText}>
                  Jours restants: {Math.max(0, Math.ceil((new Date(cagnotte.date_fin) - Date.now()) / (1000 * 60 * 60 * 24)))} 
                </Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  scrollView: { flex: 1, padding: 20 },
  centerContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: '#f8fafc',
    padding: 20
  },
  title: { 
    fontSize: 32, 
    fontWeight: 'bold', 
    color: '#0c5460', 
    textAlign: 'center', 
    marginBottom: 10,
    marginTop: 10
  },
  subtitle: { 
    fontSize: 18, 
    color: '#64748b', 
    textAlign: 'center', 
    marginBottom: 30,
    fontWeight: '500'
  },
  cagnotteCard: {
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#f1f5f9'
  },
  titre: { 
    fontSize: 22, 
    fontWeight: 'bold', 
    color: '#1e293b', 
    marginBottom: 8 
  },
  description: { 
    color: '#64748b', 
    fontSize: 16, 
    lineHeight: 22,
    marginBottom: 20 
  },
  progressContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 16 
  },
  progressBar: { 
    flex: 1, 
    height: 14, 
    backgroundColor: '#f1f5f9', 
    borderRadius: 7, 
    overflow: 'hidden', 
    marginRight: 16 
  },
  progressFill: { 
    height: '100%', 
    borderRadius: 7 
  },
  pourcentage: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    color: '#10b981',
    minWidth: 60,
    textAlign: 'right'
  },
  montants: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    color: '#0c5460', 
    textAlign: 'center',
    marginBottom: 12 
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  statText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500'
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40
  },
  emptyTitle: {
    fontSize: 22,
    color: '#64748b',
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center'
  },
  emptyText: {
    fontSize: 16,
    color: '#94a3b8',
    textAlign: 'center'
  },
  loadingText: {
    fontSize: 18,
    color: '#64748b',
    marginTop: 16
  }
});
