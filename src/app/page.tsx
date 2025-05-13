'use client';

import { useState, useEffect, useCallback } from 'react';
import FileUpload from '@/components/FileUpload';
import Flashcard from '@/components/Flashcard';
import { Button } from '@/components/ui/button';
import type { CardData } from '@/interfaces';
import { Shuffle, FileUp, Loader2, Lightbulb } from 'lucide-react';
import { Toaster } from "@/components/ui/toaster"

export default function HomePage() {
  const [cards, setCards] = useState<CardData[]>([]);
  const [currentCard, setCurrentCard] = useState<CardData | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const selectRandomCard = useCallback(() => {
    if (cards.length === 0) return null;
    if (cards.length === 1) return cards[0];
    
    let randomIndex;
    let newCard;
    // Try to pick a different card if possible
    do {
      randomIndex = Math.floor(Math.random() * cards.length);
      newCard = cards[randomIndex];
    } while (cards.length > 1 && newCard?.id === currentCard?.id);
    
    return newCard;
  }, [cards, currentCard]);

  const handleFileUpload = (parsedCards: CardData[], name: string) => {
    setCards(parsedCards);
    setFileName(name);
    if (parsedCards.length > 0) {
      const firstCard = selectRandomCard(); // selectRandomCard will use parsedCards via closure or need it passed
      // Need to ensure selectRandomCard uses the new `parsedCards`
      const randomIndex = Math.floor(Math.random() * parsedCards.length);
      setCurrentCard(parsedCards[randomIndex]);
    } else {
      setCurrentCard(null);
    }
  };
  
  useEffect(() => {
    // This effect updates currentCard when `cards` changes, especially after initial load.
    if (cards.length > 0 && !currentCard) {
       setCurrentCard(selectRandomCard());
    }
  }, [cards, currentCard, selectRandomCard]);


  const handleNextRandomCard = () => {
    const nextCard = selectRandomCard();
    setCurrentCard(nextCard);
  };

  const handleReset = () => {
    setCards([]);
    setCurrentCard(null);
    setFileName(null);
  };

  if (!isMounted) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <main className="flex flex-col items-center justify-center min-h-screen bg-background p-4 sm:p-8 text-foreground">
        <header className="mb-8 text-center">
          <h1 className="text-5xl font-extrabold tracking-tight text-primary flex items-center justify-center">
            <Lightbulb className="w-12 h-12 mr-3 text-accent" />
            FlashMaster
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">Your personal flashcard study tool.</p>
        </header>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center space-y-4">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
            <p className="text-xl font-medium">Processing your file...</p>
          </div>
        ) : cards.length === 0 ? (
          <FileUpload onFileUpload={handleFileUpload} setIsLoading={setIsLoading} />
        ) : (
          <div className="flex flex-col items-center w-full max-w-2xl space-y-8">
            {fileName && <p className="text-sm text-muted-foreground">Loaded from: <strong>{fileName}</strong></p>}
            <Flashcard card={currentCard} />
            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-xs sm:max-w-md">
              <Button onClick={handleNextRandomCard} className="w-full" size="lg" variant="default" disabled={cards.length <= 1}>
                <Shuffle className="mr-2 h-5 w-5" /> Next Random Card
              </Button>
              <Button onClick={handleReset} className="w-full" size="lg" variant="outline">
                <FileUp className="mr-2 h-5 w-5" /> Upload New File
              </Button>
            </div>
          </div>
        )}
        <footer className="mt-12 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} FlashMaster. Happy studying!</p>
        </footer>
      </main>
      <Toaster />
    </>
  );
}
