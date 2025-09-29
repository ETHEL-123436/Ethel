import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

export type Theme = 'light' | 'dark' | 'auto';
export type Language = 'en' | 'es' | 'fr' | 'de' | 'pt';

interface ThemeSettings {
  theme: Theme;
  language: Language;
}

interface Translations {
  [key: string]: {
    [key in Language]: string;
  };
}

interface ThemeColors {
  background: string;
  surface: string;
  primary: string;
  secondary: string;
  text: string;
  textSecondary: string;
  border: string;
  error: string;
  success: string;
  warning: string;
}

const lightColors: ThemeColors = {
  background: '#f8f9fa',
  surface: '#ffffff',
  primary: '#667eea',
  secondary: '#764ba2',
  text: '#333333',
  textSecondary: '#666666',
  border: '#e0e0e0',
  error: '#f44336',
  success: '#4CAF50',
  warning: '#ff9800',
};

const darkColors: ThemeColors = {
  background: '#121212',
  surface: '#1e1e1e',
  primary: '#8b7cf8',
  secondary: '#a78bfa',
  text: '#ffffff',
  textSecondary: '#b3b3b3',
  border: '#333333',
  error: '#f87171',
  success: '#68d391',
  warning: '#fbbf24',
};

const translations: Translations = {
  // Common UI elements
  home: { en: 'Home', es: 'Inicio', fr: 'Accueil', de: 'Startseite', pt: 'Início' },
  search: { en: 'Search', es: 'Buscar', fr: 'Rechercher', de: 'Suchen', pt: 'Buscar' },
  bookings: { en: 'Bookings', es: 'Reservas', fr: 'Réservations', de: 'Buchungen', pt: 'Reservas' },
  messages: { en: 'Messages', es: 'Mensajes', fr: 'Messages', de: 'Nachrichten', pt: 'Mensagens' },
  profile: { en: 'Profile', es: 'Perfil', fr: 'Profil', de: 'Profil', pt: 'Perfil' },
  settings: { en: 'Settings', es: 'Configuración', fr: 'Paramètres', de: 'Einstellungen', pt: 'Configurações' },
  preferences: { en: 'Preferences', es: 'Preferencias', fr: 'Préférences', de: 'Einstellungen', pt: 'Preferências' },
  theme: { en: 'Theme', es: 'Tema', fr: 'Thème', de: 'Thema', pt: 'Tema' },
  language: { en: 'Language', es: 'Idioma', fr: 'Langue', de: 'Sprache', pt: 'Idioma' },
  light: { en: 'Light', es: 'Claro', fr: 'Clair', de: 'Hell', pt: 'Claro' },
  dark: { en: 'Dark', es: 'Oscuro', fr: 'Sombre', de: 'Dunkel', pt: 'Escuro' },
  auto: { en: 'Auto', es: 'Automático', fr: 'Auto', de: 'Auto', pt: 'Automático' },
  english: { en: 'English', es: 'Inglés', fr: 'Anglais', de: 'Englisch', pt: 'Inglês' },
  spanish: { en: 'Spanish', es: 'Español', fr: 'Espagnol', de: 'Spanisch', pt: 'Espanhol' },
  french: { en: 'French', es: 'Francés', fr: 'Français', de: 'Französisch', pt: 'Francês' },
  german: { en: 'German', es: 'Alemán', fr: 'Allemand', de: 'Deutsch', pt: 'Alemão' },
  portuguese: { en: 'Portuguese', es: 'Portugués', fr: 'Portugais', de: 'Portugiesisch', pt: 'Português' },
  // Home screen
  hello: { en: 'Hello', es: 'Hola', fr: 'Bonjour', de: 'Hallo', pt: 'Olá' },
  whereAreYouHeaded: { en: 'Where are you headed today?', es: '¿Adónde vas hoy?', fr: 'Où allez-vous aujourd\'hui ?', de: 'Wohin geht es heute?', pt: 'Para onde você vai hoje?' },
  quickActions: { en: 'Quick Actions', es: 'Acciones rápidas', fr: 'Actions rapides', de: 'Schnellaktionen', pt: 'Ações rápidas' },
  findRides: { en: 'Find Rides', es: 'Buscar viajes', fr: 'Trouver des trajets', de: 'Fahrten finden', pt: 'Encontrar caronas' },
  offerRide: { en: 'Offer Ride', es: 'Ofrecer viaje', fr: 'Proposer un trajet', de: 'Fahrt anbieten', pt: 'Oferecer carona' },
  yourUpcomingRides: { en: 'Your Upcoming Rides', es: 'Tus próximos viajes', fr: 'Vos trajets à venir', de: 'Ihre kommenden Fahrten', pt: 'Suas próximas caronas' },
  noUpcomingRides: { en: 'No upcoming rides', es: 'No hay viajes próximos', fr: 'Aucun trajet à venir', de: 'Keine kommenden Fahrten', pt: 'Nenhuma carona próxima' },
  searchForRides: { en: 'Search for rides to get started', es: 'Busca viajes para comenzar', fr: 'Recherchez des trajets pour commencer', de: 'Suchen Sie nach Fahrten, um zu beginnen', pt: 'Procure por caronas para começar' },
  // Admin dashboard
  adminDashboard: { en: 'Admin Dashboard', es: 'Panel de Administración', fr: 'Tableau de bord Admin', de: 'Admin-Dashboard', pt: 'Painel de Administração' },
  managePlatform: { en: 'Manage your ride-sharing platform', es: 'Gestiona tu plataforma de compartir viajes', fr: 'Gérez votre plateforme de covoiturage', de: 'Verwalten Sie Ihre Mitfahrplattform', pt: 'Gerencie sua plataforma de caronas' },
  today: { en: 'Today', es: 'Hoy', fr: 'Aujourd\'hui', de: 'Heute', pt: 'Hoje' },
  thisWeek: { en: 'This Week', es: 'Esta semana', fr: 'Cette semaine', de: 'Diese Woche', pt: 'Esta semana' },
  thisMonth: { en: 'This Month', es: 'Este mes', fr: 'Ce mois', de: 'Dieser Monat', pt: 'Este mês' },
  totalUsers: { en: 'Total Users', es: 'Total de usuarios', fr: 'Utilisateurs totaux', de: 'Gesamtbenutzer', pt: 'Total de usuários' },
  totalRides: { en: 'Total Rides', es: 'Total de viajes', fr: 'Trajets totaux', de: 'Gesamtfahrten', pt: 'Total de caronas' },
  totalRevenue: { en: 'Total Revenue', es: 'Ingresos totales', fr: 'Revenus totaux', de: 'Gesamteinnahmen', pt: 'Receita total' },
  activeDisputes: { en: 'Active Disputes', es: 'Disputas activas', fr: 'Litiges actifs', de: 'Aktive Streitfälle', pt: 'Disputas ativas' },
  userManagement: { en: 'User Management', es: 'Gestión de usuarios', fr: 'Gestion des utilisateurs', de: 'Benutzerverwaltung', pt: 'Gerenciamento de usuários' },
  viewAllUsers: { en: 'View All Users', es: 'Ver todos los usuarios', fr: 'Voir tous les utilisateurs', de: 'Alle Benutzer anzeigen', pt: 'Ver todos os usuários' },
  registeredUsers: { en: 'registered users', es: 'usuarios registrados', fr: 'utilisateurs inscrits', de: 'registrierte Benutzer', pt: 'usuários registrados' },
  liveRidesMap: { en: 'Live Rides Map', es: 'Mapa de viajes en vivo', fr: 'Carte des trajets en direct', de: 'Live-Fahrtenkarte', pt: 'Mapa de caronas ao vivo' },
  interactiveMap: { en: 'Interactive map showing active rides', es: 'Mapa interactivo mostrando viajes activos', fr: 'Carte interactive montrant les trajets actifs', de: 'Interaktive Karte mit aktiven Fahrten', pt: 'Mapa interativo mostrando caronas ativas' },
  ridesCurrentlyActive: { en: 'rides currently active', es: 'viajes actualmente activos', fr: 'trajets actuellement actifs', de: 'Fahrten derzeit aktiv', pt: 'caronas atualmente ativas' },
  recentActivity: { en: 'Recent Activity', es: 'Actividad reciente', fr: 'Activité récente', de: 'Kürzliche Aktivität', pt: 'Atividade recente' },
  manageUsers: { en: 'Manage Users', es: 'Gestionar usuarios', fr: 'Gérer les utilisateurs', de: 'Benutzer verwalten', pt: 'Gerenciar usuários' },
  reviewDisputes: { en: 'Review Disputes', es: 'Revisar disputas', fr: 'Examiner les litiges', de: 'Streitfälle überprüfen', pt: 'Revisar disputas' },
  processRefunds: { en: 'Process Refunds', es: 'Procesar reembolsos', fr: 'Traiter les remboursements', de: 'Rückerstattungen bearbeiten', pt: 'Processar reembolsos' },
  // Preferences screen
  loading: { en: 'Loading', es: 'Cargando', fr: 'Chargement', de: 'Laden', pt: 'Carregando' },
  customizeApp: { en: 'Customize your app experience', es: 'Personaliza tu experiencia en la app', fr: 'Personnalisez votre expérience d\'application', de: 'Passen Sie Ihre App-Erfahrung an', pt: 'Personalize sua experiência no app' },
  appSettings: { en: 'App Settings', es: 'Configuración de la app', fr: 'Paramètres de l\'application', de: 'App-Einstellungen', pt: 'Configurações do app' },
  ridePreferences: { en: 'Ride Preferences', es: 'Preferencias de viaje', fr: 'Préférences de trajet', de: 'Fahrtpräferenzen', pt: 'Preferências de viagem' },
  preferredVehicleType: { en: 'Preferred Vehicle Type', es: 'Tipo de vehículo preferido', fr: 'Type de véhicule préféré', de: 'Bevorzugter Fahrzeugtyp', pt: 'Tipo de veículo preferido' },
  paymentMethods: { en: 'Payment Methods', es: 'Métodos de pago', fr: 'Modes de paiement', de: 'Zahlungsmethoden', pt: 'Métodos de pagamento' },
  rideHistory: { en: 'Ride History', es: 'Historial de viajes', fr: 'Historique des trajets', de: 'Fahrtverlauf', pt: 'Histórico de viagens' },
  account: { en: 'Account', es: 'Cuenta', fr: 'Compte', de: 'Konto', pt: 'Conta' },
  privacySettings: { en: 'Privacy Settings', es: 'Configuración de privacidad', fr: 'Paramètres de confidentialité', de: 'Datenschutzeinstellungen', pt: 'Configurações de privacidade' },
  dataStorage: { en: 'Data & Storage', es: 'Datos y almacenamiento', fr: 'Données et stockage', de: 'Daten & Speicher', pt: 'Dados e armazenamento' },
  notifications: { en: 'Notifications', es: 'Notificaciones', fr: 'Notifications', de: 'Benachrichtigungen', pt: 'Notificações' },
  // KYC Upload
  completeYourProfile: { en: 'Complete Your Profile', es: 'Completa tu perfil', fr: 'Complétez votre profil', de: 'Vervollständigen Sie Ihr Profil', pt: 'Complete seu perfil' },
  personalInformation: { en: 'Personal Information', es: 'Información personal', fr: 'Informations personnelles', de: 'Persönliche Informationen', pt: 'Informações pessoais' },
  vehicleInformation: { en: 'Vehicle Information', es: 'Información del vehículo', fr: 'Informations sur le véhicule', de: 'Fahrzeuginformationen', pt: 'Informações do veículo' },
  documentsPhotos: { en: 'Documents & Photos', es: 'Documentos y fotos', fr: 'Documents et photos', de: 'Dokumente und Fotos', pt: 'Documentos e fotos' },
  documentUpload: { en: 'Document Upload', es: 'Carga de documentos', fr: 'Téléchargement de documents', de: 'Dokumentenupload', pt: 'Upload de documentos' },
  reviewSubmit: { en: 'Review & Submit', es: 'Revisar y enviar', fr: 'Réviser et soumettre', de: 'Überprüfen und einreichen', pt: 'Revisar e enviar' },
  fullName: { en: 'Full Name', es: 'Nombre completo', fr: 'Nom complet', de: 'Vollständiger Name', pt: 'Nome completo' },
  phoneNumber: { en: 'Phone Number', es: 'Número de teléfono', fr: 'Numéro de téléphone', de: 'Telefonnummer', pt: 'Número de telefone' },
  dateOfBirth: { en: 'Date of Birth', es: 'Fecha de nacimiento', fr: 'Date de naissance', de: 'Geburtsdatum', pt: 'Data de nascimento' },
  address: { en: 'Address', es: 'Dirección', fr: 'Adresse', de: 'Adresse', pt: 'Endereço' },
  city: { en: 'City', es: 'Ciudad', fr: 'Ville', de: 'Stadt', pt: 'Cidade' },
  emergencyContact: { en: 'Emergency Contact Name', es: 'Nombre de contacto de emergencia', fr: 'Nom du contact d\'urgence', de: 'Name des Notfallkontakts', pt: 'Nome do contato de emergência' },
  emergencyPhone: { en: 'Emergency Contact Phone', es: 'Teléfono de contacto de emergencia', fr: 'Téléphone du contact d\'urgence', de: 'Telefon des Notfallkontakts', pt: 'Telefone do contato de emergência' },
  vehicleMake: { en: 'Vehicle Make', es: 'Marca del vehículo', fr: 'Marque du véhicule', de: 'Fahrzeugmarke', pt: 'Marca do veículo' },
  vehicleModel: { en: 'Vehicle Model', es: 'Modelo del vehículo', fr: 'Modèle du véhicule', de: 'Fahrzeugmodell', pt: 'Modelo do veículo' },
  vehicleYear: { en: 'Vehicle Year', es: 'Año del vehículo', fr: 'Année du véhicule', de: 'Fahrzeugjahr', pt: 'Ano do veículo' },
  vehicleColor: { en: 'Vehicle Color', es: 'Color del vehículo', fr: 'Couleur du véhicule', de: 'Fahrzeugfarbe', pt: 'Cor do veículo' },
  licensePlate: { en: 'License Plate Number', es: 'Número de placa', fr: 'Numéro de plaque', de: 'Kennzeichen', pt: 'Número da placa' },
  driversLicense: { en: 'Driver\'s License Number', es: 'Número de licencia de conducir', fr: 'Numéro de permis de conduire', de: 'Führerscheinnummer', pt: 'Número da carteira de motorista' },
  uploadClearPhotos: { en: 'Upload clear photos of your required documents', es: 'Sube fotos claras de tus documentos requeridos', fr: 'Téléchargez des photos claires de vos documents requis', de: 'Laden Sie klare Fotos Ihrer erforderlichen Dokumente hoch', pt: 'Faça upload de fotos claras dos seus documentos obrigatórios' },
  vehiclePhotosDesc: { en: 'Upload clear photos of your vehicle from different angles.', es: 'Sube fotos claras de tu vehículo desde diferentes ángulos.', fr: 'Téléchargez des photos claires de votre véhicule sous différents angles.', de: 'Laden Sie klare Fotos Ihres Fahrzeugs aus verschiedenen Winkeln hoch.', pt: 'Faça upload de fotos claras do seu veículo de diferentes ângulos.' },
  photoGuidelines: { en: 'Photo Guidelines', es: 'Directrices para fotos', fr: 'Directives pour les photos', de: 'Foto-Richtlinien', pt: 'Diretrizes para fotos' },
  reviewInfo: { en: 'Please review your information before submitting', es: 'Por favor revisa tu información antes de enviar', fr: 'Veuillez vérifier vos informations avant de soumettre', de: 'Bitte überprüfen Sie Ihre Informationen vor dem Absenden', pt: 'Por favor, revise suas informações antes de enviar' },
  uploadedDocuments: { en: 'Uploaded Documents', es: 'Documentos subidos', fr: 'Documents téléchargés', de: 'Hochgeladene Dokumente', pt: 'Documentos enviados' },
  submitApplication: { en: 'Submit Application', es: 'Enviar aplicación', fr: 'Soumettre la demande', de: 'Bewerbung einreichen', pt: 'Enviar aplicação' },
  applicationSubmitted: { en: 'Application Submitted!', es: '¡Aplicación enviada!', fr: 'Demande soumise !', de: 'Bewerbung eingereicht!', pt: 'Aplicação enviada!' },
  applicationSubmittedMsg: { en: 'Your KYC application has been submitted successfully. You will be notified once the review is complete.', es: 'Tu aplicación KYC ha sido enviada exitosamente. Serás notificado una vez que se complete la revisión.', fr: 'Votre demande KYC a été soumise avec succès. Vous serez notifié une fois la révision terminée.', de: 'Ihre KYC-Bewerbung wurde erfolgreich eingereicht. Sie werden benachrichtigt, sobald die Überprüfung abgeschlossen ist.', pt: 'Sua aplicação KYC foi enviada com sucesso. Você será notificado assim que a revisão for concluída.' },
  back: { en: 'Back', es: 'Atrás', fr: 'Retour', de: 'Zurück', pt: 'Voltar' },
  next: { en: 'Next', es: 'Siguiente', fr: 'Suivant', de: 'Weiter', pt: 'Próximo' },
  uploadPhoto: { en: 'Upload Photo', es: 'Subir foto', fr: 'Télécharger la photo', de: 'Foto hochladen', pt: 'Fazer upload da foto' },
  changePhoto: { en: 'Change Photo', es: 'Cambiar foto', fr: 'Changer la photo', de: 'Foto ändern', pt: 'Alterar foto' },
  enter: { en: 'Enter', es: 'Ingresar', fr: 'Entrer', de: 'Eingeben', pt: 'Inserir' },
  frontView: { en: 'Front View *', es: 'Vista frontal *', fr: 'Vue avant *', de: 'Vorderansicht *', pt: 'Vista frontal *' },
  sideView: { en: 'Side View *', es: 'Vista lateral *', fr: 'Vue latérale *', de: 'Seitenansicht *', pt: 'Vista lateral *' },
  backView: { en: 'Back View *', es: 'Vista trasera *', fr: 'Vue arrière *', de: 'Rückansicht *', pt: 'Vista traseira *' },
  insideView: { en: 'Inside View *', es: 'Vista interior *', fr: 'Vue intérieure *', de: 'Innenansicht *', pt: 'Vista interior *' },
  plateNumber: { en: 'Plate Number (Clear Photo) *', es: 'Número de placa (Foto clara) *', fr: 'Numéro de plaque (Photo claire) *', de: 'Kennzeichen (Klares Foto) *', pt: 'Número da placa (Foto clara) *' },
  vehiclePhotos: { en: 'Vehicle Photos', es: 'Fotos del vehículo', fr: 'Photos du véhicule', de: 'Fahrzeugfotos', pt: 'Fotos do veículo' },
  view: { en: 'View', es: 'Vista', fr: 'Vue', de: 'Ansicht', pt: 'Vista' },
  uploaded: { en: 'Uploaded', es: 'Subido', fr: 'Téléchargé', de: 'Hochgeladen', pt: 'Enviado' },
};

export const [ThemeProvider, useTheme] = createContextHook(() => {
  const [settings, setSettings] = useState<ThemeSettings>({
    theme: 'light',
    language: 'en'
  });
  const [isLoading, setIsLoading] = useState(true);

  // Get the actual theme colors based on the selected theme
  const getThemeColors = (): ThemeColors => {
    const effectiveTheme = settings.theme === 'auto' ? 'light' : settings.theme;
    return effectiveTheme === 'dark' ? darkColors : lightColors;
  };

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedSettings = await AsyncStorage.getItem('themeSettings');
        if (savedSettings) {
          const parsed = JSON.parse(savedSettings);
          setSettings(parsed);
        }
      } catch (error) {
        console.error('Failed to load theme settings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  const updateTheme = async (theme: Theme) => {
    try {
      const newSettings = { ...settings, theme };
      setSettings(newSettings);
      await AsyncStorage.setItem('themeSettings', JSON.stringify(newSettings));
    } catch (error) {
      console.error('Failed to update theme:', error);
    }
  };

  const updateLanguage = async (language: Language) => {
    try {
      const newSettings = { ...settings, language };
      setSettings(newSettings);
      await AsyncStorage.setItem('themeSettings', JSON.stringify(newSettings));
    } catch (error) {
      console.error('Failed to update language:', error);
    }
  };

  const colors = getThemeColors();

  const t = (key: string): string => {
    const currentLanguage = isLoading ? 'en' : settings.language;
    return translations[key]?.[currentLanguage] || key;
  };

  return {
    settings: isLoading ? { theme: 'light', language: 'en' } : settings,
    colors,
    isLoading,
    updateTheme,
    updateLanguage,
    t,
    isDark: settings.theme === 'dark' || (settings.theme === 'auto' && false), // TODO: Add system theme detection
  };
});
