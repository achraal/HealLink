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
  createCagnotte,
  updateCagnotte,
} from '@/database/database';
import { Ionicons } from '@expo/vector-icons';

export default function CagnotteEditScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();
  const isEdit = !!id;
  const [loading, setLoading] = useState(false);
  const [titre, setTitre] = useState('');
  const [description, setDescription] = useState('');
  const [objectif, setObjectif] = useState('');

  const loadCagnotte = useCallback(async () => {
    if (!id) return;
    try {
      const cagnotte = await getCagnotteById(parseInt(id));
      if (cagnotte) {
        setTitre(cagnotte.titre);
        setDescription(cagnotte.description);
        setObjectif(cagnotte.objectif.toString());
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
    if (isEdit && id) {
      loadCagnotte();
    }
  }, [isEdit, id, loadCagnotte]);

  const validateForm = () => {
    if (!titre.trim()) {
      Alert.alert('Erreur', 'Le titre est obligatoire');
      return false;
    }
    if (!description.trim()) {
      Alert.alert('Erreur', 'La description est obligatoire');
      return false;
    }
    const objectifNum = parseFloat(objectif);
    if (isNaN(objectifNum) || objectifNum <= 0) {
      Alert.alert('Erreur', 'L\'objectif doit être un nombre positif');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const objectifNum = parseFloat(objectif);
      if (isEdit && id) {
        await updateCagnotte(parseInt(id), titre.trim(), description.trim(), objectifNum);
        Alert.alert('Succès', 'Cagnotte modifiée avec succès', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      } else {
        const newId = await createCagnotte(titre.trim(), description.trim(), objectifNum);
        Alert.alert('Succès', 'Cagnotte créée avec succès', [
          {
            text: 'Voir',
            onPress: () => router.replace(`/cagnotte-detail?id=${newId}`),
          },
          { text: 'OK', onPress: () => router.back() },
        ]);
      }
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      Alert.alert('Erreur', 'Impossible de sauvegarder la cagnotte');
    } finally {
      setLoading(false);
    }
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
            {isEdit ? 'Modifier' : 'Nouvelle cagnotte'}
          </ThemedText>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>
                Titre <ThemedText style={styles.required}>*</ThemedText>
              </ThemedText>
              <TextInput
                style={styles.input}
                placeholder="Ex: Collecte pour l'association..."
                placeholderTextColor="#999"
                value={titre}
                onChangeText={setTitre}
                editable={!loading}
                maxLength={100}
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>
                Description <ThemedText style={styles.required}>*</ThemedText>
              </ThemedText>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Décrivez l'objectif de cette cagnotte..."
                placeholderTextColor="#999"
                value={description}
                onChangeText={setDescription}
                editable={!loading}
                multiline
                numberOfLines={5}
                textAlignVertical="top"
                maxLength={500}
              />
              <ThemedText style={styles.charCount}>
                {description.length}/500
              </ThemedText>
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>
                Objectif (€) <ThemedText style={styles.required}>*</ThemedText>
              </ThemedText>
              <TextInput
                style={styles.input}
                placeholder="0.00"
                placeholderTextColor="#999"
                value={objectif}
                onChangeText={setObjectif}
                keyboardType="decimal-pad"
                editable={!loading}
              />
              <ThemedText style={styles.hint}>
                Montant total à atteindre pour cette cagnotte
              </ThemedText>
            </View>

            <TouchableOpacity
              style={[styles.saveButton, loading && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={loading}>
              <ThemedText style={styles.saveButtonText}>
                {loading
                  ? isEdit
                    ? 'Modification...'
                    : 'Création...'
                  : isEdit
                    ? 'Modifier'
                    : 'Créer'}
              </ThemedText>
            </TouchableOpacity>
          </View>
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
  form: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  required: {
    color: '#FF3B30',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  textArea: {
    minHeight: 120,
    paddingTop: 16,
  },
  charCount: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginTop: 4,
  },
  hint: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  saveButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 32,
  },
  saveButtonDisabled: {
    backgroundColor: '#999',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

