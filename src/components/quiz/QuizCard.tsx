import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Award, Trophy } from 'lucide-react';

interface Question {
  question: string;
  options: string[];
  correct: number;
  points: number;
}

interface QuizCardProps {
  questions: Question[];
  onComplete: (score: number, totalPoints: number) => void;
}

export const QuizCard = ({ questions, onComplete }: QuizCardProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);

  const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
  };

  const handleNextQuestion = () => {
    if (selectedAnswer === null) return;

    const newAnswers = [...userAnswers, selectedAnswer];
    setUserAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
    } else {
      // Calculate final score
      const score = newAnswers.reduce((total, answer, index) => {
        return total + (answer === questions[index].correct ? questions[index].points : 0);
      }, 0);
      
      setShowResults(true);
      onComplete(score, totalPoints);
    }
  };

  if (showResults) {
    const score = userAnswers.reduce((total, answer, index) => {
      return total + (answer === questions[index].correct ? questions[index].points : 0);
    }, 0);
    
    const percentage = Math.round((score / totalPoints) * 100);
    const passed = percentage >= 70;

    return (
      <Card className="w-full max-w-2xl mx-auto shadow-card">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            {passed ? (
              <div className="gradient-success h-20 w-20 rounded-full flex items-center justify-center shadow-success">
                <Trophy className="h-10 w-10 text-success-foreground" />
              </div>
            ) : (
              <div className="gradient-alert h-20 w-20 rounded-full flex items-center justify-center shadow-alert">
                <Award className="h-10 w-10 text-alert-foreground" />
              </div>
            )}
          </div>
          <CardTitle className="text-2xl">
            {passed ? 'Congratulations! 🎉' : 'Good Effort! 📚'}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <div className="space-y-4">
            <div className="text-4xl font-bold gradient-primary bg-clip-text text-transparent">
              {score}/{totalPoints}
            </div>
            <div className="text-xl text-muted-foreground">
              {percentage}% Score
            </div>
          </div>
          
          {passed && (
            <Badge variant="secondary" className="gradient-achievement text-achievement-foreground">
              Certificate Earned!
            </Badge>
          )}
          
          <div className="space-y-2">
            <h3 className="font-semibold">Question Results:</h3>
            {questions.map((question, index) => (
              <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                <span className="text-sm">Question {index + 1}</span>
                {userAnswers[index] === question.correct ? (
                  <CheckCircle className="h-5 w-5 text-success" />
                ) : (
                  <div className="h-5 w-5 rounded-full bg-destructive/20" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const question = questions[currentQuestion];

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-card">
      <CardHeader>
        <div className="flex items-center justify-between mb-4">
          <Badge variant="outline">
            Question {currentQuestion + 1} of {questions.length}
          </Badge>
          <Badge className="gradient-primary text-primary-foreground">
            {question.points} points
          </Badge>
        </div>
        <Progress value={progress} className="mb-4" />
        <CardTitle className="text-xl leading-relaxed">
          {question.question}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid gap-3">
          {question.options.map((option, index) => (
            <Button
              key={index}
              variant={selectedAnswer === index ? "default" : "outline"}
              className={`p-4 h-auto text-left justify-start transition-smooth ${
                selectedAnswer === index ? 'gradient-primary text-primary-foreground shadow-card' : ''
              }`}
              onClick={() => handleAnswerSelect(index)}
            >
              <div className="flex items-center space-x-3">
                <span className="flex-shrink-0 h-6 w-6 rounded-full border-2 border-current flex items-center justify-center text-xs font-medium">
                  {String.fromCharCode(65 + index)}
                </span>
                <span className="text-wrap">{option}</span>
              </div>
            </Button>
          ))}
        </div>
        
        <Button
          onClick={handleNextQuestion}
          disabled={selectedAnswer === null}
          className="w-full gradient-primary text-primary-foreground"
          size="lg"
        >
          {currentQuestion === questions.length - 1 ? 'Complete Quiz' : 'Next Question'}
        </Button>
      </CardContent>
    </Card>
  );
};