import type React from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { CardData } from '@/interfaces';
import { UploadCloud } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FileUploadProps {
  onFileUpload: (cards: CardData[], fileName: string) => void;
  setIsLoading: (isLoading: boolean) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload, setIsLoading }) => {
  const [file, setFile] = useState<File | null>(null);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0]);
    }
  };

  const parseCSV = (csvText: string): CardData[] => {
    return csvText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0 && line.includes(',')) // Ensure line has a comma
      .map((line, index) => {
        const parts = line.split(',');
        const question = parts[0]?.trim();
        const answer = parts.slice(1).join(',')?.trim(); // Handle commas in answers
        
        if (question && answer) {
          return { id: `card-${Date.now()}-${index}`, question, answer };
        }
        return null;
      })
      .filter(card => card !== null) as CardData[];
  };

  const handleSubmit = () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a CSV file to upload.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        if (!text) {
          throw new Error("File content is empty or unreadable.");
        }
        const parsedCards = parseCSV(text);
        if (parsedCards.length === 0) {
          toast({
            title: "Parsing Error",
            description: "No valid question-answer pairs found. Ensure format is 'question,answer' per line.",
            variant: "destructive",
          });
        } else {
          onFileUpload(parsedCards, file.name);
          toast({
            title: "File Uploaded",
            description: `${parsedCards.length} cards loaded successfully.`,
          });
        }
      } catch (error) {
        console.error("Error parsing file:", error);
        toast({
          title: "File Processing Error",
          description: error instanceof Error ? error.message : "Could not process the file.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    reader.onerror = () => {
      toast({
        title: "File Read Error",
        description: "Could not read the selected file.",
        variant: "destructive",
      });
      setIsLoading(false);
    };
    reader.readAsText(file);
  };

  return (
    <Card className="w-full max-w-md shadow-2xl">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Upload Flashcards</CardTitle>
        <CardDescription className="text-center">
          Upload a CSV file with questions and answers. Each line should be in the format: question,answer
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="csv-file" className="font-semibold">CSV File</Label>
          <Input id="csv-file" type="file" accept=".csv" onChange={handleFileChange} className="file:text-primary file:font-medium"/>
        </div>
        <Button onClick={handleSubmit} className="w-full" size="lg">
          <UploadCloud className="mr-2 h-5 w-5" /> Upload and Start
        </Button>
      </CardContent>
    </Card>
  );
};

export default FileUpload;
