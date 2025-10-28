import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      // Home Page
      home: {
        title: "Welcome to",
        marketplace: "MarketSpace",
        subtitle: "Your trusted marketplace for buying and selling quality products",
        signIn: "Sign In",
        signUp: "Sign Up"
      },
      // Sign In Page
      signIn: {
        title: "Sign In",
        subtitle: "Welcome back to MarketSpace",
        email: "Email Address",
        password: "Password",
        rememberMe: "Remember me",
        forgotPassword: "Forgot password?",
        signInButton: "Sign In",
        noAccount: "Don't have an account?",
        signUpLink: "Sign Up",
        backHome: "Back to Home",
        signingIn: "Signing in..."
      },
      // Sign Up Page
      signUp: {
        title: "Create Account",
        subtitle: "Join the MarketSpace community today",
        firstName: "First Name",
        lastName: "Last Name",
        firstNamePlaceholder: "Your first name",
        lastNamePlaceholder: "Your last name",
        email: "Email Address",
        password: "Password",
        confirmPassword: "Confirm Password",
        role: "Role",
        selectRole: "Select your role",
        vendeur: "Seller",
        confirmateur: "Validator",
        passwordHint: "Must be at least 8 characters long",
        createButton: "Create Account",
        creating: "Creating Account...",
        haveAccount: "Already have an account?",
        signInLink: "Sign In",
        terms: "By creating an account, you agree to our Terms of Service and Privacy Policy",
        backHome: "Back to Home"
      },
      // Forgot Password Page
      forgotPassword: {
        title: "Reset Password",
        subtitle: "Enter your email to receive reset instructions",
        email: "Email Address",
        sendButton: "Send Reset Link",
        sending: "Sending...",
        backToSignIn: "Back to Sign In",
        backHome: "Back to Home"
      },
      // Toast messages
      toast: {
        error: "Error",
        success: "Success",
        passwordMismatch: "Passwords do not match",
        passwordLength: "Password must be at least 8 characters long",
        fillAllFields: "Please fill in all fields",
        accountCreated: "Account created successfully! You can now sign in.",
        accountFailed: "Failed to create account. Please try again.",
        signInSuccess: "Signed in successfully!",
        signInFailed: "Invalid email or password",
        resetLinkSent: "Password reset link sent to your email!",
        resetLinkFailed: "Failed to send reset link. Please try again."
      }
    }
  },
  fr: {
    translation: {
      // Page d'accueil
      home: {
        title: "Bienvenue sur",
        marketplace: "MarketSpace",
        subtitle: "Votre marketplace de confiance pour acheter et vendre des produits de qualité",
        signIn: "Se connecter",
        signUp: "S'inscrire"
      },
      // Page de connexion
      signIn: {
        title: "Connexion",
        subtitle: "Bon retour sur MarketSpace",
        email: "Adresse e-mail",
        password: "Mot de passe",
        rememberMe: "Se souvenir de moi",
        forgotPassword: "Mot de passe oublié ?",
        signInButton: "Se connecter",
        noAccount: "Vous n'avez pas de compte ?",
        signUpLink: "S'inscrire",
        backHome: "Retour à l'accueil",
        signingIn: "Connexion..."
      },
      // Page d'inscription
      signUp: {
        title: "Créer un compte",
        subtitle: "Rejoignez la communauté MarketSpace aujourd'hui",
        firstName: "Prénom",
        lastName: "Nom",
        firstNamePlaceholder: "Votre prénom",
        lastNamePlaceholder: "Votre nom",
        email: "Adresse e-mail",
        password: "Mot de passe",
        confirmPassword: "Confirmer le mot de passe",
        role: "Rôle",
        selectRole: "Sélectionnez votre rôle",
        vendeur: "Vendeur",
        confirmateur: "Confirmateur",
        passwordHint: "Doit contenir au moins 8 caractères",
        createButton: "Créer un compte",
        creating: "Création du compte...",
        haveAccount: "Vous avez déjà un compte ?",
        signInLink: "Se connecter",
        terms: "En créant un compte, vous acceptez nos Conditions d'utilisation et notre Politique de confidentialité",
        backHome: "Retour à l'accueil"
      },
      // Page de mot de passe oublié
      forgotPassword: {
        title: "Réinitialiser le mot de passe",
        subtitle: "Entrez votre e-mail pour recevoir les instructions",
        email: "Adresse e-mail",
        sendButton: "Envoyer le lien",
        sending: "Envoi...",
        backToSignIn: "Retour à la connexion",
        backHome: "Retour à l'accueil"
      },
      // Messages toast
      toast: {
        error: "Erreur",
        success: "Succès",
        passwordMismatch: "Les mots de passe ne correspondent pas",
        passwordLength: "Le mot de passe doit contenir au moins 8 caractères",
        fillAllFields: "Veuillez remplir tous les champs",
        accountCreated: "Compte créé avec succès ! Vous pouvez maintenant vous connecter.",
        accountFailed: "Échec de la création du compte. Veuillez réessayer.",
        signInSuccess: "Connexion réussie !",
        signInFailed: "E-mail ou mot de passe invalide",
        resetLinkSent: "Lien de réinitialisation envoyé à votre e-mail !",
        resetLinkFailed: "Échec de l'envoi du lien. Veuillez réessayer."
      }
    }
  }
};

// Check if we're on the server side
const isServer = typeof window === 'undefined';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: isServer ? 'en' : undefined, // Force English on server, detect on client
    fallbackLng: 'en',
    detection: {
      // Disable automatic detection during SSR
      caches: isServer ? [] : ['localStorage', 'cookie'],
    },
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
