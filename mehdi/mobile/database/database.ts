import * as SQLite from 'expo-sqlite';

export interface Cagnotte {
  id: number;
  titre: string;
  description: string;
  objectif: number;
  sommeCollectee: number;
  dateCreation: string;
}

export interface Contribution {
  id: number;
  cagnotteId: number;
  montant: number;
  dateContribution: string;
}

// Utiliser openDatabaseSync pour la nouvelle API
const db = SQLite.openDatabaseSync('cagnottes.db');

export const initDatabase = () => {
  return new Promise<void>((resolve, reject) => {
    try {
      db.execSync(`
        CREATE TABLE IF NOT EXISTS cagnottes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          titre TEXT NOT NULL,
          description TEXT NOT NULL,
          objectif REAL NOT NULL,
          sommeCollectee REAL DEFAULT 0,
          dateCreation TEXT NOT NULL
        );
      `);

      db.execSync(`
        CREATE TABLE IF NOT EXISTS contributions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          cagnotteId INTEGER NOT NULL,
          montant REAL NOT NULL,
          dateContribution TEXT NOT NULL,
          FOREIGN KEY (cagnotteId) REFERENCES cagnottes(id)
        );
      `);

      console.log('Tables créées avec succès');
      resolve();
    } catch (error) {
      console.error('Erreur initialisation base de données:', error);
      reject(error);
    }
  });
};

export const getAllCagnottes = (): Promise<Cagnotte[]> => {
  return new Promise((resolve, reject) => {
    try {
      console.log('Début récupération cagnottes...');
      // Essayer getAllSync directement
      const rows = db.getAllSync('SELECT * FROM cagnottes ORDER BY dateCreation DESC;');
      console.log('Lignes récupérées:', rows);
      
      if (!rows || !Array.isArray(rows)) {
        console.warn('Aucune donnée ou format incorrect, retour tableau vide');
        resolve([]);
        return;
      }
      
      const cagnottes: Cagnotte[] = rows.map((row: any) => {
        console.log('Ligne:', row);
        return {
          id: Number(row.id),
          titre: String(row.titre || ''),
          description: String(row.description || ''),
          objectif: Number(row.objectif || 0),
          sommeCollectee: Number(row.sommeCollectee || 0),
          dateCreation: String(row.dateCreation || ''),
        };
      });
      
      console.log(`Récupération réussie: ${cagnottes.length} cagnotte(s)`);
      resolve(cagnottes);
    } catch (error: any) {
      console.error('Erreur récupération cagnottes:', error);
      console.error('Message:', error?.message);
      console.error('Stack:', error?.stack);
      reject(error);
    }
  });
};

export const getCagnotteById = (id: number): Promise<Cagnotte | null> => {
  return new Promise((resolve, reject) => {
    try {
      const rows = db.getAllSync('SELECT * FROM cagnottes WHERE id = ?;', [id]);
      
      if (rows.length > 0) {
        const row = rows[0] as any;
        const cagnotte: Cagnotte = {
          id: Number(row.id),
          titre: String(row.titre),
          description: String(row.description),
          objectif: Number(row.objectif),
          sommeCollectee: Number(row.sommeCollectee || 0),
          dateCreation: String(row.dateCreation),
        };
        resolve(cagnotte);
      } else {
        resolve(null);
      }
    } catch (error) {
      console.error('Erreur récupération cagnotte:', error);
      reject(error);
    }
  });
};

export const createCagnotte = (
  titre: string,
  description: string,
  objectif: number
): Promise<number> => {
  return new Promise((resolve, reject) => {
    try {
      const dateCreation = new Date().toISOString();
      const result = db.runSync(
        'INSERT INTO cagnottes (titre, description, objectif, sommeCollectee, dateCreation) VALUES (?, ?, ?, 0, ?);',
        [titre, description, objectif, dateCreation]
      );
      resolve(result.lastInsertRowId);
    } catch (error) {
      console.error('Erreur création cagnotte:', error);
      reject(error);
    }
  });
};

export const updateCagnotte = (
  id: number,
  titre: string,
  description: string,
  objectif: number
): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      db.runSync(
        'UPDATE cagnottes SET titre = ?, description = ?, objectif = ? WHERE id = ?;',
        [titre, description, objectif, id]
      );
      resolve();
    } catch (error) {
      console.error('Erreur mise à jour cagnotte:', error);
      reject(error);
    }
  });
};

export const deleteCagnotte = (id: number): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      // Supprimer d'abord les contributions associées
      db.runSync('DELETE FROM contributions WHERE cagnotteId = ?;', [id]);
      // Ensuite supprimer la cagnotte
      db.runSync('DELETE FROM cagnottes WHERE id = ?;', [id]);
      resolve();
    } catch (error) {
      console.error('Erreur suppression cagnotte:', error);
      reject(error);
    }
  });
};

export const addContribution = (
  cagnotteId: number,
  montant: number
): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      const dateContribution = new Date().toISOString();
      // Ajouter la contribution
      db.runSync(
        'INSERT INTO contributions (cagnotteId, montant, dateContribution) VALUES (?, ?, ?);',
        [cagnotteId, montant, dateContribution]
      );
      // Mettre à jour la somme collectée
      db.runSync(
        'UPDATE cagnottes SET sommeCollectee = sommeCollectee + ? WHERE id = ?;',
        [montant, cagnotteId]
      );
      resolve();
    } catch (error) {
      console.error('Erreur ajout contribution:', error);
      reject(error);
    }
  });
};

export const getContributionsByCagnotteId = (
  cagnotteId: number
): Promise<Contribution[]> => {
  return new Promise((resolve, reject) => {
    try {
      const rows = db.getAllSync(
        'SELECT * FROM contributions WHERE cagnotteId = ? ORDER BY dateContribution DESC;',
        [cagnotteId]
      );
      const contributions: Contribution[] = rows.map((row: any) => ({
        id: Number(row.id),
        cagnotteId: Number(row.cagnotteId),
        montant: Number(row.montant),
        dateContribution: String(row.dateContribution),
      }));
      
      resolve(contributions);
    } catch (error) {
      console.error('Erreur récupération contributions:', error);
      reject(error);
    }
  });
};
