import { useEffect, useState, useCallback } from 'react';
import {
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  View,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import {
  getCagnotteById,
  addContribution,
  getContributionsByCagnotteId,
  Cagnotte,
  Contribution,
} from '@/database/database';
import { Ionicons } from '@expo/vector-icons';

export default function CagnotteDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [cagnotte, setCagnotte] = useState<Cagnotte | null>(null);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [montant, setMontant] = useState('');
  const [loading, setLoading] = useState(false);

  const loadCagnotte = useCallback(async () => {
    if (!id) return;
    try {
      const data = await getCagnotteById(parseInt(id));
      if (data) {
        setCagnotte(data);
        const contribs = await getContributionsByCagnotteId(data.id);
        setContributions(contribs);
      } else {
        Alert.alert('Erreur', 'Cagnotte introuvable');
        router.back();
      }
    } catch (error) {
      console.error('Erreur chargement cagnotte:', error);
      Alert.alert('Erreur', 'Impossible de charger la cagnotte');
    }
  }, [id, router]);

  useEffect(() => {
    loadCagnotte();
  }, [loadCagnotte]);

  const handleContribution = async () => {
    if (!montant || !cagnotte) return;

    const montantNum = parseFloat(montant);
    if (isNaN(montantNum) || montantNum <= 0) {
      Alert.alert('Erreur', 'Veuillez entrer un montant valide');
      return;
    }

    setLoading(true);
    try {
      await addContribution(cagnotte.id, montantNum);
      setMontant('');
      await loadCagnotte();
      Alert.alert('Succès', `Merci pour votre contribution de ${montantNum.toFixed(2)} € !`);
    } catch (error) {
      console.error('Erreur contribution:', error);
      Alert.alert('Erreur', 'Impossible d\'ajouter la contribution');
    } finally {
      setLoading(false);
    }
  };

  if (!cagnotte) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Chargement...</ThemedText>
      </ThemedView>
    );
  }

  const percentage = Math.min((cagnotte.sommeCollectee / cagnotte.objectif) * 100, 100);
  const reste = Math.max(cagnotte.objectif - cagnotte.sommeCollectee, 0);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ThemedView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#007AFF" />
          </TouchableOpacity>
          <ThemedText type="title" style={styles.title}>
            Détails
          </ThemedText>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.card}>
            <ThemedText type="subtitle" style={styles.cardTitle}>
              {cagnotte.titre}
            </ThemedText>
            <ThemedText style={styles.description}>{cagnotte.description}</ThemedText>

            <View style={styles.progressSection}>
              <View style={styles.progressHeader}>
                <ThemedText style={styles.progressLabel}>Progression</ThemedText>
                <ThemedText style={styles.progressPercentage}>
                  {percentage.toFixed(1)}%
                </ThemedText>
              </View>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${percentage}%` },
                    percentage >= 100 && styles.progressComplete,
                  ]}
                />
              </View>
            </View>

            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Ionicons name="cash-outline" size={24} color="#34C759" />
                <ThemedText style={styles.statValue}>
                  {cagnotte.sommeCollectee.toFixed(2)} €
                </ThemedText>
                <ThemedText style={styles.statLabel}>Collecté</ThemedText>
              </View>
              <View style={styles.statCard}>
                <Ionicons name="flag-outline" size={24} color="#007AFF" />
                <ThemedText style={styles.statValue}>
                  {cagnotte.objectif.toFixed(2)} €
                </ThemedText>
                <ThemedText style={styles.statLabel}>Objectif</ThemedText>
              </View>
              <View style={styles.statCard}>
                <Ionicons name="trending-up-outline" size={24} color="#FF9500" />
                <ThemedText style={styles.statValue}>{reste.toFixed(2)} €</ThemedText>
                <ThemedText style={styles.statLabel}>Reste</ThemedText>
              </View>
            </View>

            <View style={styles.dateSection}>
              <Ionicons name="calendar-outline" size={16} color="#666" />
              <ThemedText style={styles.dateText}>
                Créée le {formatDate(cagnotte.dateCreation)}
              </ThemedText>
            </View>
          </View>

          <View style={styles.contributionCard}>
            <ThemedText type="subtitle" style={styles.contributionTitle}>
              Contribuer
            </ThemedText>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Montant (€)"
                placeholderTextColor="#999"
                value={montant}
                onChangeText={setMontant}
                keyboardType="decimal-pad"
                editable={!loading}
              />
              <TouchableOpacity
                style={[styles.contributeButton, loading && styles.contributeButtonDisabled]}
                onPress={handleContribution}
                disabled={loading}>
                <ThemedText style={styles.contributeButtonText}>
                  {loading ? 'Ajout...' : 'Contribuer'}
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>

          {contributions.length > 0 && (
            <View style={styles.contributionsCard}>
              <ThemedText type="subtitle" style={styles.contributionsTitle}>
                Historique des contributions ({contributions.length})
              </ThemedText>
              {contributions.map((contrib) => (
                <View key={contrib.id} style={styles.contributionItem}>
                  <View style={styles.contributionInfo}>
                    <Ionicons name="gift-outline" size={20} color="#34C759" />
                    <ThemedText style={styles.contributionAmount}>
                      {contrib.montant.toFixed(2)} €
                    </ThemedText>
                  </View>
                  <ThemedText style={styles.contributionDate}>
                    {formatDate(contrib.dateContribution)}
                  </ThemedText>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </ThemedView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 60,
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 32,
  },
  scrollView: {
    flex: 1,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    margin: 16,
    marginBottom: 0,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    lineHeight: 22,
  },
  progressSection: {
    marginBottom: 20,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  progressPercentage: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  progressBar: {
    height: 12,
    backgroundColor: '#E5E5E5',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#34C759',
    borderRadius: 6,
  },
  progressComplete: {
    backgroundColor: '#007AFF',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  dateSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  dateText: {
    fontSize: 14,
    color: '#666',
  },
  contributionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    margin: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  contributionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  inputContainer: {
    gap: 12,
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  contributeButton: {
    backgroundColor: '#34C759',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  contributeButtonDisabled: {
    backgroundColor: '#999',
  },
  contributeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  contributionsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    margin: 16,
    marginBottom: 32,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  contributionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  contributionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  contributionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  contributionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#34C759',
  },
  contributionDate: {
    fontSize: 14,
    color: '#666',
  },
});

