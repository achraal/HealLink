import React, { useEffect, useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import {
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  View,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { getAllCagnottes, addContribution, Cagnotte } from '@/database/database';
import { Ionicons } from '@expo/vector-icons';

export default function CagnottesListScreen() {
  const [cagnottes, setCagnottes] = useState<Cagnotte[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [contributionModalVisible, setContributionModalVisible] = useState(false);
  const [selectedCagnotte, setSelectedCagnotte] = useState<Cagnotte | null>(null);
  const [montant, setMontant] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const loadCagnottes = useCallback(async () => {
    try {
      console.log('Chargement des cagnottes...');
      const data = await getAllCagnottes();
      console.log('Cagnottes chargées:', data.length, data);
      setCagnottes(data);
    } catch (error: any) {
      console.error('Erreur chargement cagnottes:', error);
      console.error('Message:', error?.message);
      console.error('Stack:', error?.stack);
      Alert.alert('Erreur', `Impossible de charger les cagnottes: ${error?.message || 'Erreur inconnue'}`);
    }
  }, []);

  useEffect(() => {
    loadCagnottes();
  }, [loadCagnottes]);

  // Recharger les données quand l'écran reçoit le focus
  useFocusEffect(
    useCallback(() => {
      loadCagnottes();
    }, [loadCagnottes])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCagnottes();
    setRefreshing(false);
  };


  const handleOpenContribution = (cagnotte: Cagnotte) => {
    setSelectedCagnotte(cagnotte);
    setMontant('');
    setContributionModalVisible(true);
  };

  const handleCloseContribution = () => {
    setContributionModalVisible(false);
    setSelectedCagnotte(null);
    setMontant('');
  };

  const handleAddContribution = async () => {
    if (!selectedCagnotte || !montant) return;

    const montantNum = parseFloat(montant);
    if (isNaN(montantNum) || montantNum <= 0) {
      Alert.alert('Erreur', 'Veuillez entrer un montant valide');
      return;
    }

    setLoading(true);
    try {
      await addContribution(selectedCagnotte.id, montantNum);
      await loadCagnottes();
      Alert.alert('Succès', `Contribution de ${montantNum.toFixed(2)} € ajoutée avec succès !`);
      handleCloseContribution();
    } catch (error) {
      console.error('Erreur contribution:', error);
      Alert.alert('Erreur', 'Impossible d\'ajouter la contribution');
    } finally {
      setLoading(false);
    }
  };

  const getProgressPercentage = (sommeCollectee: number, objectif: number) => {
    return Math.min((sommeCollectee / objectif) * 100, 100);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const renderCagnotte = ({ item }: { item: Cagnotte }) => {
    const percentage = getProgressPercentage(item.sommeCollectee, item.objectif);

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push(`/cagnotte-detail?id=${item.id}`)}
        activeOpacity={0.7}>
        <View style={styles.cardHeader}>
          <ThemedText type="subtitle" style={styles.cardTitle}>
            {item.titre}
          </ThemedText>
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              router.push(`/cagnotte-options?id=${item.id}`);
            }}
            style={styles.optionsButton}>
            <Ionicons name="ellipsis-horizontal" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        <ThemedText style={styles.description} numberOfLines={2}>
          {item.description}
        </ThemedText>

        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${percentage}%` },
                percentage >= 100 && styles.progressComplete,
              ]}
            />
          </View>
          <ThemedText style={styles.progressText}>
            {percentage.toFixed(1)}%
          </ThemedText>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.stat}>
            <ThemedText style={styles.statLabel}>Collecté</ThemedText>
            <ThemedText style={[styles.statValue, styles.collectedAmount]}>
              {item.sommeCollectee.toFixed(2)} €
            </ThemedText>
          </View>
          <View style={styles.stat}>
            <ThemedText style={styles.statLabel}>Objectif</ThemedText>
            <ThemedText style={[styles.statValue, styles.objectiveAmount]}>
              {item.objectif.toFixed(2)} €
            </ThemedText>
          </View>
          <View style={styles.stat}>
            <ThemedText style={styles.statLabel}>Créée le</ThemedText>
            <ThemedText style={[styles.statValue, styles.dateValue]}>
              {formatDate(item.dateCreation)}
            </ThemedText>
          </View>
        </View>

        <TouchableOpacity
          style={styles.contributeButton}
          onPress={(e) => {
            e.stopPropagation();
            handleOpenContribution(item);
          }}>
          <Ionicons name="add-circle-outline" size={20} color="#fff" />
          <ThemedText style={styles.contributeButtonText}>Contribuer</ThemedText>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title" style={styles.title}>
          Cagnottes
        </ThemedText>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/cagnotte-edit')}>
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {cagnottes.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="wallet-outline" size={64} color="#999" />
          <ThemedText style={styles.emptyText}>
            Aucune cagnotte pour le moment
          </ThemedText>
          <ThemedText style={styles.emptySubtext}>
            Appuyez sur le bouton + pour créer une nouvelle cagnotte
          </ThemedText>
        </View>
      ) : (
        <FlatList
          data={cagnottes}
          renderItem={renderCagnotte}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}

      {/* Modal de contribution */}
      <Modal
        visible={contributionModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={handleCloseContribution}>
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText type="subtitle" style={styles.modalTitle}>
                Contribuer à "{selectedCagnotte?.titre}"
              </ThemedText>
              <TouchableOpacity onPress={handleCloseContribution} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <ThemedText style={styles.modalDescription}>
                {selectedCagnotte?.description}
              </ThemedText>

              <View style={styles.modalStats}>
                <View style={styles.modalStat}>
                  <ThemedText style={styles.modalStatLabel}>Collecté</ThemedText>
                  <ThemedText style={styles.modalStatValue}>
                    {selectedCagnotte?.sommeCollectee.toFixed(2)} €
                  </ThemedText>
                </View>
                <View style={styles.modalStat}>
                  <ThemedText style={styles.modalStatLabel}>Objectif</ThemedText>
                  <ThemedText style={styles.modalStatValue}>
                    {selectedCagnotte?.objectif.toFixed(2)} €
                  </ThemedText>
                </View>
              </View>

              <View style={styles.modalInputContainer}>
                <ThemedText style={styles.modalInputLabel}>Montant (€)</ThemedText>
                <TextInput
                  style={styles.modalInput}
                  placeholder="0.00"
                  placeholderTextColor="#999"
                  value={montant}
                  onChangeText={setMontant}
                  keyboardType="decimal-pad"
                  editable={!loading}
                  autoFocus
                />
              </View>

              <TouchableOpacity
                style={[styles.modalSubmitButton, loading && styles.modalSubmitButtonDisabled]}
                onPress={handleAddContribution}
                disabled={loading}>
                <ThemedText style={styles.modalSubmitButtonText}>
                  {loading ? 'Ajout...' : 'Ajouter la contribution'}
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  list: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  cardTitle: {
    flex: 1,
    fontSize: 21,
    fontWeight: 'bold',
    marginRight: 8,
    color: '#1a1a1a',
    letterSpacing: 0.3,
  },
  optionsButton: {
    padding: 4,
    marginLeft: 8,
  },
  description: {
    fontSize: 14,
    color: '#333',
    marginBottom: 12,
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E5E5',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#34C759',
    borderRadius: 4,
  },
  progressComplete: {
    backgroundColor: '#007AFF',
  },
  progressText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#007AFF',
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  stat: {
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    fontWeight: '500',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  collectedAmount: {
    color: '#34C759',
    fontSize: 17,
    fontWeight: 'bold',
  },
  objectiveAmount: {
    color: '#007AFF',
    fontSize: 17,
    fontWeight: 'bold',
  },
  dateValue: {
    color: '#666',
    fontSize: 15,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  contributeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#34C759',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
    gap: 8,
  },
  contributeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    gap: 20,
  },
  modalDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  modalStats: {
    flexDirection: 'row',
    gap: 16,
  },
  modalStat: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  modalStatLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  modalStatValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalInputContainer: {
    gap: 8,
  },
  modalInputLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 16,
    fontSize: 18,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  modalSubmitButton: {
    backgroundColor: '#34C759',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  modalSubmitButtonDisabled: {
    backgroundColor: '#999',
  },
  modalSubmitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
