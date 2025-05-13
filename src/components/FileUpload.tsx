import type React from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { CardData } from '@/interfaces';
import { UploadCloud, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from '@/components/ui/scroll-area';

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
      <CardHeader className="relative">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className="absolute top-3 right-3 h-8 w-8">
              <Info className="h-5 w-5" />
              <span className="sr-only">CSV Format Info</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>CSV File Format Guide</DialogTitle>
            </DialogHeader>
            <ScrollArea className="max-h-[60vh] sm:max-h-[70vh] pr-6">
              <DialogDescription asChild>
                <div className="space-y-3 pt-2 text-sm text-left">
                  <p>Each line in your CSV file should represent one flashcard.</p>
                  <p>The format is: <code>{'question,answer'}</code></p>
                  <p className="font-semibold mt-2">Examples:</p>
                  <pre className="mt-1 w-full overflow-x-auto rounded-md bg-muted p-3 font-mono text-xs">
                    {`What is the capital of France?,Paris
What is 2 + 2?,4
"What is the chemical symbol for water, commonly known as H2O?",H2O
What is $\\sqrt{16}$?,4
"A question, with a comma inside it","An answer, also with a comma"
Translate 'hello' to Spanish,Hola`}
                  </pre>
                  <ul className="list-disc space-y-1 pl-5 mt-2">
                    <li>The <strong>question</strong> is all text before the first comma on a line.</li>
                    <li>The <strong>answer</strong> is all text after the first comma on that line.</li>
                    <li>If your question or answer includes commas, it&apos;s best to enclose that field in double quotes (e.g., <code>&quot;Question, with comma&quot;,&quot;Answer, with comma&quot;</code>). The parser tries to handle unquoted fields with commas by treating everything after the first comma as part of the answer.</li>
                    <li>You can use LaTeX for math formulas by enclosing them in single dollar signs (e.g., <code>$\\sqrt{x^2+y^2}$</code> or <code>$E=mc^2$</code>). These will be rendered on the flashcards. Note that backslashes in LaTeX might need to be escaped with another backslash (e.g., <code>$\\times$</code> for the multiplication symbol) depending on your text editor or CSV generation tool.</li>
                  </ul>
                </div>
              </DialogDescription>
            </ScrollArea>
          </DialogContent>
        </Dialog>
        <CardTitle className="text-2xl font-bold text-center">Upload Flashcards</CardTitle>
        <CardDescription className="text-center pt-1">
          Upload a CSV file with questions and answers.
          <br />
           Each line should be: question,answer
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
