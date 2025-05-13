import type React from 'react';
import { useState, useEffect, Fragment } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import type { CardData } from '@/interfaces';
import { InlineMath } from 'react-katex';

interface FlashcardProps {
  card: CardData | null;
}

const renderTextWithMath = (text: string | undefined | null) => {
  if (!text) {
    return null;
  }
  const parts = text.split('$');
  return parts.map((part, index) => {
    if (index % 2 === 1) {
      // Odd parts are math
      return <InlineMath key={index} math={part} />;
    } else {
      // Even parts are text
      return <Fragment key={index}>{part}</Fragment>;
    }
  });
};

const Flashcard: React.FC<FlashcardProps> = ({ card }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    // Reset flip state when card changes
    setIsFlipped(false);
  }, [card]);

  if (!card) {
    return null; 
  }

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <div
      className="perspective w-[350px] h-[220px] sm:w-[400px] sm:h-[250px] md:w-[480px] md:h-[300px] cursor-pointer group"
      onClick={handleFlip}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleFlip(); }}
      aria-pressed={isFlipped}
      aria-label={isFlipped ? `Answer: ${card.answer}` : `Question: ${card.question}. Press to flip.`}
    >
      <div className={`flashcard-inner ${isFlipped ? 'is-flipped' : ''}`}>
        <Card className="flashcard-front bg-card text-card-foreground flex items-center justify-center p-6">
          <CardContent className="text-center">
            <p className="text-lg sm:text-xl md:text-2xl font-semibold">{renderTextWithMath(card.question)}</p>
          </CardContent>
        </Card>
        <Card className="flashcard-back bg-card text-card-foreground flex items-center justify-center p-6">
          <CardContent className="text-center">
            <p className="text-base sm:text-lg md:text-xl">{renderTextWithMath(card.answer)}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Flashcard;
