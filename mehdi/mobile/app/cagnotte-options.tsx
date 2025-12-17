import { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { getCagnotteById, deleteCagnotte, Cagnotte } from '@/database/database';
import { Ionicons } from '@expo/vector-icons';

export default function CagnotteOptionsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [cagnotte, setCagnotte] = useState<Cagnotte | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCagnotte();
  }, [id]);

  const loadCagnotte = async () => {
    if (!id) return;
    try {
      const data = await getCagnotteById(parseInt(id));
      if (data) {
        setCagnotte(data);
      } else {
        Alert.alert('Erreur', 'Cagnotte introuvable');
        router.back();
      }
    } catch (error) {
      console.error('Erreur chargement cagnotte:', error);
      Alert.alert('Erreur', 'Impossible de charger la cagnotte');
    }
  };

  const handleDelete = () => {
    if (!cagnotte) return;

    Alert.alert(
      'Supprimer la cagnotte',
      `Êtes-vous sûr de vouloir supprimer "${cagnotte.titre}" ?\n\nCette action est irréversible et supprimera également toutes les contributions associées.`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await deleteCagnotte(cagnotte.id);
              Alert.alert('Succès', 'Cagnotte supprimée avec succès', [
                { text: 'OK', onPress: () => router.back() },
              ]);
            } catch (error) {
              console.error('Erreur suppression:', error);
              Alert.alert('Erreur', 'Impossible de supprimer la cagnotte');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleEdit = () => {
    if (!cagnotte) return;
    router.push(`/cagnotte-edit?id=${cagnotte.id}`);
  };

  if (!cagnotte) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#007AFF" />
          </TouchableOpacity>
          <ThemedText type="title" style={styles.title}>
            Options
          </ThemedText>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ThemedText>Chargement...</ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <ThemedText type="title" style={styles.title}>
          Options
        </ThemedText>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.cagnotteInfo}>
          <ThemedText type="subtitle" style={styles.cagnotteTitle}>
            {cagnotte.titre}
          </ThemedText>
          <ThemedText style={styles.cagnotteDescription}>
            {cagnotte.description}
          </ThemedText>
        </View>

        <View style={styles.optionsContainer}>
          <TouchableOpacity
            style={[styles.optionButton, styles.editButton]}
            onPress={handleEdit}
            disabled={loading}>
            <View style={styles.optionContent}>
              <View style={[styles.iconContainer, styles.editIconContainer]}>
                <Ionicons name="create-outline" size={24} color="#007AFF" />
              </View>
              <View style={styles.optionTextContainer}>
                <ThemedText style={styles.optionTitle}>Modifier la cagnotte</ThemedText>
                <ThemedText style={styles.optionDescription}>
                  Modifier le titre, la description ou l'objectif
                </ThemedText>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.optionButton, styles.deleteButton]}
            onPress={handleDelete}
            disabled={loading}>
            <View style={styles.optionContent}>
              <View style={[styles.iconContainer, styles.deleteIconContainer]}>
                <Ionicons name="trash-outline" size={24} color="#FF3B30" />
              </View>
              <View style={styles.optionTextContainer}>
                <ThemedText style={[styles.optionTitle, styles.deleteTitle]}>
                  Supprimer la cagnotte
                </ThemedText>
                <ThemedText style={styles.optionDescription}>
                  Supprimer définitivement cette cagnotte et toutes ses contributions
                </ThemedText>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ThemedView>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  cagnotteInfo: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    margin: 16,
    marginBottom: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cagnotteTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1a1a1a',
  },
  cagnotteDescription: {
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
  },
  optionsContainer: {
    padding: 16,
    gap: 12,
  },
  optionButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  editButton: {
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  deleteButton: {
    borderLeftWidth: 4,
    borderLeftColor: '#FF3B30',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editIconContainer: {
    backgroundColor: '#E3F2FD',
  },
  deleteIconContainer: {
    backgroundColor: '#FFEBEE',
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#1a1a1a',
  },
  deleteTitle: {
    color: '#FF3B30',
  },
  optionDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});


