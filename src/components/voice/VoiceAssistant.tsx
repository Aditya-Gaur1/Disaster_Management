import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Mic, MicOff, Volume2, VolumeX, MessageCircle, Languages } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface VoiceCommand {
  command: string;
  response: string;
  timestamp: Date;
}

const safetyTips = {
  en: {
    flood: [
      "During floods, move to higher ground immediately and avoid walking through flowing water.",
      "Keep emergency supplies ready including water, non-perishable food, flashlight, and first aid kit.",
      "Stay informed through radio or mobile alerts about flood warnings and evacuation orders."
    ],
    earthquake: [
      "During an earthquake, drop to your hands and knees, take cover under a desk, and hold on.",
      "Stay away from windows, mirrors, and heavy objects that could fall during shaking.",
      "After shaking stops, check for injuries and hazards before moving around."
    ],
    cyclone: [
      "Secure outdoor items and board up windows before a cyclone arrives.",
      "Stay indoors in the strongest part of your building, away from windows and doors.",
      "Keep battery-powered radio for updates and avoid using landline phones during storms."
    ],
    fire: [
      "If caught in a fire, stay low to avoid smoke and feel doors before opening them.",
      "Have an escape plan with two ways out of every room and a meeting point outside.",
      "Install smoke detectors and check batteries regularly to ensure they work."
    ]
  },
  hi: {
    flood: [
      "बाढ़ के दौरान तुरंत ऊंचे स्थान पर जाएं और बहते पानी में चलने से बचें।",
      "आपातकालीन आपूर्ति तैयार रखें जिसमें पानी, गैर-खराब होने वाला भोजन, टॉर्च और प्राथमिक चिकित्सा किट शामिल हो।",
      "बाढ़ की चेतावनी और निकासी के आदेशों के बारे में रेडियो या मोबाइल अलर्ट के माध्यम से सूचित रहें।"
    ],
    earthquake: [
      "भूकंप के दौरान अपने हाथों और घुटनों पर गिरें, मेज के नीचे कवर लें, और पकड़ कर रखें।",
      "खिड़कियों, दर्पणों और भारी वस्तुओं से दूर रहें जो हिलने के दौरान गिर सकती हैं।",
      "हिलना बंद होने के बाद, चारों ओर घूमने से पहले चोटों और खतरों की जांच करें।"
    ],
    cyclone: [
      "चक्रवात आने से पहले बाहरी वस्तुओं को सुरक्षित करें और खिड़कियों पर बोर्ड लगाएं।",
      "अपनी इमारत के सबसे मजबूत हिस्से में घर के अंदर रहें, खिड़कियों और दरवाजों से दूर।",
      "अपडेट के लिए बैटरी चालित रेडियो रखें और तूफान के दौरान लैंडलाइन फोन का उपयोग करने से बचें।"
    ],
    fire: [
      "अगर आग में फंस जाएं तो धुएं से बचने के लिए नीचे रहें और दरवाजे खोलने से पहले उन्हें छूकर देखें।",
      "हर कमरे से बाहर निकलने के दो रास्ते और बाहर एक मिलने का स्थान के साथ एक बचाव योजना रखें।",
      "स्मोक डिटेक्टर लगाएं और नियमित रूप से बैटरी जांचें कि वे काम कर रहे हैं।"
    ]
  }
};

export const VoiceAssistant = () => {
  const { t, i18n } = useTranslation();
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [commands, setCommands] = useState<VoiceCommand[]>([]);
  const [language, setLanguage] = useState(i18n.language);
  const [isSupported, setIsSupported] = useState(false);
  
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    // Check for Web Speech API support
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setIsSupported(true);
      synthRef.current = window.speechSynthesis;
      
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = language === 'hi' ? 'hi-IN' : 'en-US';
      
      recognitionRef.current.onstart = () => {
        setIsListening(true);
        setTranscript('');
      };
      
      recognitionRef.current.onresult = (event: any) => {
        const result = event.results[0][0].transcript.toLowerCase();
        setTranscript(result);
        processCommand(result);
      };
      
      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        toast.error('Speech recognition failed. Please try again.');
      };
      
      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, [language]);

  const processCommand = (command: string) => {
    let response = '';
    const tips = safetyTips[language as keyof typeof safetyTips];
    
    // Simple command matching
    if (command.includes('flood') || command.includes('बाढ़')) {
      response = tips.flood[Math.floor(Math.random() * tips.flood.length)];
    } else if (command.includes('earthquake') || command.includes('भूकंप')) {
      response = tips.earthquake[Math.floor(Math.random() * tips.earthquake.length)];
    } else if (command.includes('cyclone') || command.includes('तूफान') || command.includes('चक्रवात')) {
      response = tips.cyclone[Math.floor(Math.random() * tips.cyclone.length)];
    } else if (command.includes('fire') || command.includes('आग')) {
      response = tips.fire[Math.floor(Math.random() * tips.fire.length)];
    } else if (command.includes('help') || command.includes('मदद')) {
      response = language === 'hi' 
        ? 'आप मुझसे बाढ़, भूकंप, चक्रवात या आग के बारे में सुरक्षा सुझाव पूछ सकते हैं।'
        : 'You can ask me for safety tips about floods, earthquakes, cyclones, or fires.';
    } else {
      response = language === 'hi'
        ? 'माफ करें, मैं समझ नहीं सका। कृपया बाढ़, भूकंप, चक्रवात या आग के बारे में पूछें।'
        : 'Sorry, I didn\'t understand. Please ask about floods, earthquakes, cyclones, or fires.';
    }
    
    const newCommand: VoiceCommand = {
      command,
      response,
      timestamp: new Date()
    };
    
    setCommands(prev => [newCommand, ...prev.slice(0, 4)]); // Keep last 5 commands
    speak(response);
  };

  const speak = (text: string) => {
    if (!synthRef.current) return;
    
    // Cancel any ongoing speech
    synthRef.current.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === 'hi' ? 'hi-IN' : 'en-US';
    utterance.rate = 0.9;
    utterance.pitch = 1;
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    synthRef.current.speak(utterance);
  };

  const startListening = () => {
    if (!isSupported || !recognitionRef.current) {
      toast.error('Speech recognition is not supported in your browser');
      return;
    }
    
    try {
      recognitionRef.current.lang = language === 'hi' ? 'hi-IN' : 'en-US';
      recognitionRef.current.start();
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      toast.error('Failed to start voice recognition');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const stopSpeaking = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
  };

  const changeLanguage = (newLang: string) => {
    setLanguage(newLang);
    i18n.changeLanguage(newLang);
  };

  if (!isSupported) {
    return (
      <Card className="shadow-card">
        <CardContent className="pt-6 text-center">
          <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            Voice assistant is not supported in your browser. Please use a modern browser like Chrome or Firefox.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MessageCircle className="h-5 w-5" />
            <span>Voice Safety Assistant</span>
          </div>
          <Select value={language} onValueChange={changeLanguage}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">
                <div className="flex items-center space-x-2">
                  <span>🇬🇧</span>
                  <span>English</span>
                </div>
              </SelectItem>
              <SelectItem value="hi">
                <div className="flex items-center space-x-2">
                  <span>🇮🇳</span>
                  <span>हिंदी</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {language === 'hi' 
            ? 'आपातकालीन सुरक्षा सुझावों के लिए मुझसे बात करें'
            : 'Ask me for quick safety tips during emergencies'
          }
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Voice Controls */}
        <div className="flex space-x-2">
          <Button
            onClick={isListening ? stopListening : startListening}
            disabled={isSpeaking}
            className={cn(
              'flex-1',
              isListening && 'gradient-alert text-white animate-pulse'
            )}
          >
            {isListening ? (
              <>
                <MicOff className="h-4 w-4 mr-2" />
                {language === 'hi' ? 'सुनाई बंद करें' : 'Stop Listening'}
              </>
            ) : (
              <>
                <Mic className="h-4 w-4 mr-2" />
                {language === 'hi' ? 'बोलना शुरू करें' : 'Start Speaking'}
              </>
            )}
          </Button>
          
          <Button
            variant="outline"
            onClick={isSpeaking ? stopSpeaking : undefined}
            disabled={!isSpeaking}
            className={isSpeaking ? 'gradient-primary text-white' : ''}
          >
            {isSpeaking ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Current Status */}
        <div className="flex items-center space-x-2">
          <Badge variant={isListening ? 'destructive' : isSpeaking ? 'default' : 'secondary'}>
            {isListening 
              ? (language === 'hi' ? 'सुन रहा है...' : 'Listening...')
              : isSpeaking 
              ? (language === 'hi' ? 'बोल रहा है...' : 'Speaking...')
              : (language === 'hi' ? 'तैयार' : 'Ready')
            }
          </Badge>
          {(isListening || isSpeaking) && (
            <motion.div
              className="h-2 w-2 bg-primary rounded-full"
              animate={{ scale: [1, 1.5, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          )}
        </div>

        {/* Current Transcript */}
        {transcript && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 bg-muted/50 rounded-lg"
          >
            <p className="text-sm">
              <strong>{language === 'hi' ? 'आपने कहा:' : 'You said:'}</strong> {transcript}
            </p>
          </motion.div>
        )}

        {/* Recent Commands */}
        {commands.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">
              {language === 'hi' ? 'हाल की बातचीत:' : 'Recent Conversations:'}
            </h4>
            <div className="max-h-60 overflow-y-auto space-y-2">
              <AnimatePresence>
                {commands.map((cmd, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="p-3 bg-muted/30 rounded-lg text-sm"
                  >
                    <div className="font-medium text-primary mb-1">
                      Q: {cmd.command}
                    </div>
                    <div className="text-muted-foreground">
                      A: {cmd.response}
                    </div>
                    <div className="text-xs text-muted-foreground mt-2">
                      {cmd.timestamp.toLocaleTimeString()}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* Example Commands */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">
            {language === 'hi' ? 'उदाहरण प्रश्न:' : 'Example Questions:'}
          </h4>
          <div className="grid grid-cols-1 gap-2 text-xs">
            {language === 'hi' ? (
              <>
                <Badge variant="outline">"बाढ़ के दौरान क्या करें?"</Badge>
                <Badge variant="outline">"भूकंप की तैयारी कैसे करें?"</Badge>
                <Badge variant="outline">"आग से कैसे बचें?"</Badge>
              </>
            ) : (
              <>
                <Badge variant="outline">"What to do during floods?"</Badge>
                <Badge variant="outline">"How to prepare for earthquakes?"</Badge>
                <Badge variant="outline">"Fire safety tips?"</Badge>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};