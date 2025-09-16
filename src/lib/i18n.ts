import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      // Navigation
      home: 'Home',
      modules: 'Learning Modules',
      dashboard: 'Dashboard',
      profile: 'Profile',
      
      // Home Page
      welcomeTitle: 'Disaster Preparedness Education Platform',
      welcomeSubtitle: 'Learn, Practice, and Stay Safe with NDMA Guidelines',
      startLearning: 'Start Learning',
      
      // Modules
      floods: 'Floods',
      earthquakes: 'Earthquakes',
      cyclones: 'Cyclones',
      fires: 'Fires',
      
      // Quiz
      quiz: 'Quiz',
      startQuiz: 'Start Quiz',
      nextQuestion: 'Next Question',
      submitAnswer: 'Submit Answer',
      score: 'Score',
      
      // Progress
      progress: 'Progress',
      completed: 'Completed',
      inProgress: 'In Progress',
      certificate: 'Certificate',
      
      // Common
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
    }
  },
  hi: {
    translation: {
      // Navigation
      home: 'होम',
      modules: 'शिक्षण मॉड्यूल',
      dashboard: 'डैशबोर्ड',
      profile: 'प्रोफाइल',
      
      // Home Page
      welcomeTitle: 'आपदा तैयारी शिक्षा मंच',
      welcomeSubtitle: 'एनडीएमए दिशानिर्देशों के साथ सीखें, अभ्यास करें और सुरक्षित रहें',
      startLearning: 'सीखना शुरू करें',
      
      // Modules
      floods: 'बाढ़',
      earthquakes: 'भूकंप',
      cyclones: 'चक्रवात',
      fires: 'आग',
      
      // Quiz
      quiz: 'प्रश्नोत्तरी',
      startQuiz: 'प्रश्नोत्तरी शुरू करें',
      nextQuestion: 'अगला प्रश्न',
      submitAnswer: 'उत्तर जमा करें',
      score: 'स्कोर',
      
      // Progress
      progress: 'प्रगति',
      completed: 'पूर्ण',
      inProgress: 'प्रगति में',
      certificate: 'प्रमाण पत्र',
      
      // Common
      loading: 'लोड हो रहा है...',
      error: 'त्रुटि',
      success: 'सफलता',
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;