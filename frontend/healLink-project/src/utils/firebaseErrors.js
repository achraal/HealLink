export const getFirebaseErrorMessage = (errorCode) => {
  switch (errorCode) {
    // Erreurs de connexion
    case 'auth/invalid-email':
      return 'Adresse email invalide';
    case 'auth/user-disabled':
      return 'Ce compte a été désactivé';
    case 'auth/user-not-found':
      return 'Aucun compte trouvé avec cet email';
    case 'auth/wrong-password':
      return 'Mot de passe incorrect';
    case 'auth/invalid-credential':
      return 'Email ou mot de passe incorrect';
      
    // Erreurs d'inscription
    case 'auth/email-already-in-use':
      return 'Cet email est déjà utilisé';
    case 'auth/weak-password':
      return 'Le mot de passe doit contenir au moins 6 caractères';
      
    // Erreurs réseau
    case 'auth/network-request-failed':
      return 'Erreur de connexion. Vérifiez votre internet';
    case 'auth/too-many-requests':
      return 'Trop de tentatives. Réessayez plus tard';
      
    // Erreurs de réinitialisation
    case 'auth/invalid-action-code':
      return 'Le lien de réinitialisation est invalide ou expiré';
    case 'auth/expired-action-code':
      return 'Le lien de réinitialisation a expiré';
      
    // Erreur par défaut
    default:
      return 'Une erreur est survenue. Veuillez réessayer';
  }
};