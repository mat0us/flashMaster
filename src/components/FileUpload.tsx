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
Solve for x: $2x + 3 = 7$,$x = 2$
"A question, with a comma","An answer, also with a comma"
What is H$_2$O?,Water
Co je permitivita vakua a jaká je její hodnota?,Permitivita vakua $\\epsilon_{0}$ charakterizuje prostředí a její hodnota je $\\epsilon_{0}=8,854187\\times10^{-12}F\\cdot m^{-1}$.
Jaký je vztah mezi prací vykonanou silou elektrostatického pole a potenciální energií?,Práce vykonaná silou elektrostatického pole se rovná rozdílu potenciálních energií na začátku a konci dráhy ($A=W_{r1}-W_{r2}$).
Jak se vypočítá potenciální energie náboje $Q_2$ v poli náboje $Q_1$?,Potenciální energie $W_Q$ se vypočítá jako $W_{Q}=\\frac{Q_{1}Q_{2}}{4\\pi\\epsilon_{0}}\\frac{1}{r}$, kde r je vzdálenost mezi náboji.
Jak se definuje potenciál v elektrostatickém poli?,Potenciál se číselně rovná potenciální energii kladného jednotkového náboje nacházejícího se v daném místě. Pro bodový zdroj se vypočítá jako $\\varphi=\\frac{Q_{1}}{4\\pi\\epsilon_{0}}\\frac{1}{r}$.
Jak lze vyjádřit potenciál pomocí intenzity elektrického pole?,Potenciál $\\varphi$ lze vyjádřit jako $\\varphi=\\int_{\\infty}^{r}-E~dr=\\frac{Q_{1}}{4\\pi\\epsilon_{0}}\\frac{1}{r}$.
Co je elektrické napětí a jak se definuje?,Elektrické napětí U je definováno jako rozdíl potenciálů mezi dvěma body elektrického pole ($U=\\varphi_{1}-\\varphi_{2}$).
Co je elektrická indukce a jaký je její vztah k intenzitě elektrického pole?,Elektrická indukce D udává elektrický náboj připadající na jednotku plochy desek, na kterých se náboj nahromadil. Vypočítá se podle rovnice $D=\\frac{Q}{S}$. Vztah k intenzitě elektrického pole je $D=\\epsilon E$, kde $\\epsilon$ je permitivita dielektrika.
Jaká je jednotka elektrické indukce?,Jednotkou elektrické indukce je C·m$^{-2}$.
Jak se vypočítá kapacita deskového kondenzátoru?,Kapacita C se vypočítá jako $C=\\epsilon_{0}\\epsilon_{r}\\frac{S}{l}$, kde $\\epsilon_{0}$ je permitivita vakua, $\\epsilon_{r}$ je relativní permitivita dielektrika, S je plocha desek a l je vzdálenost mezi deskami.
Jak se sčítají kapacity při paralelním a sériovém spojení kondenzátorů?,Při paralelním řazení se výsledná kapacita rovná součtu jednotlivých kapacit ($C = C_1 + C_2 + \\dots + C_n$). Při sériovém spojení se převrácená hodnota výsledné kapacity rovná součtu převrácených hodnot jednotlivých kapacit ($\\frac{1}{C} = \\frac{1}{C_1} + \\frac{1}{C_2} + \\dots + \\frac{1}{C_n}$).
Jak se vypočítá energie nahromaděná v elektrickém poli kondenzátoru?,Energie nahromaděná v elektrickém poli kondenzátoru ($E_P$) se vypočítá jako $E_P = \\frac{1}{2}CU^2$ nebo $E_P = \\frac{1}{2}\\frac{Q^2}{C}$.
Uveďte příklady praktického využití elektrostatiky.,Praktické využití elektrostatiky zahrnuje elektrostatické třídění sypkých směsí (např. obilí, rudy), postřik ochranných látek nebo stříkání barev.
Jak se definuje elektrický proud?,Elektrický proud i můžeme definovat jako množství náboje dq, který projde vodičem za velmi krátkou dobu dt ($i = \\frac{dq}{dt}$). Pro konstantní proud platí $I = \\frac{Q}{t}$.
Jaká je jednotka elektrického proudu?,Jednotkou elektrického proudu je 1 Ampér (A).
Co je proudová hustota a jak se vyjádří?,Proudová hustota J je vyjádřena jako proud připadající na jednotku plochy ($J = \\frac{dI}{dS}$).
Jaký je mezinárodní konvenční směr toku elektrického proudu?,Kladný směr toku proudu se podle mezinárodní konvence bere ve směru od kladného k zápornému bodu obvodu.
Jak zní Ohmův zákon?,Elektrický proud v kovovém vodiči je přímo úměrný napětí na koncech vodiče a nepřímo úměrný elektrickému odporu vodiče ($I = \\frac{U}{R}$).
Jak se vypočítá elektrický odpor vodiče?,Elektrický odpor vodiče R se vypočítá podle rovnice $R = \\rho\\frac{l}{S}$, kde $\\rho$ je rezistivita materiálu, l je délka vodiče a S je průřez vodiče.
Co je rezistivita materiálu?,Rezistivita $\\rho$ je konstanta charakterizující materiál vodiče.
Co je konduktivita a jaký je její vztah k rezistivitě?,Konduktivita $\\gamma$ je převrácená hodnota rezistivity ($\\gamma = \\frac{1}{\\rho}$).
Co je elektrická vodivost a jaký je její vztah k elektrickému odporu?,Elektrická vodivost G je převrácená hodnota elektrického odporu ($G = \\frac{1}{R}$). Její jednotkou je siemens (S).
Jak se mění odpor vodiče se změnou teploty?,Pro malé rozdíly teploty platí $R = R_0(1 + \\alpha\\Delta T)$, kde R je hodnota odporu při výsledné teplotě, R0 je hodnota odporu při výchozí teplotě, $\\Delta T$ je rozdíl teplot a $\\alpha$ je teplotní součinitel odporu.
Co je uzel, větev a smyčka v elektrickém obvodu?,Uzel charakterizuje bod spojení svorek dvou nebo více prvků. Větev je část obvodu mezi dvěma uzly. Smyčka je uzavřená dráha obvodu.
Jak se vypočítá práce vykonaná elektrickým proudem při přetečení náboje dQ z místa s potenciálem $\\varphi_1$ na místo s potenciálem $\\varphi_2$?,Práce dA se vypočítá jako $dA = (\\varphi_1 - \\varphi_2)dQ$.
Jak se vypočítá okamžitý výkon elektrického proudu?,Okamžitý výkon p se vypočítá jako práce vykonaná za jednotku času: $p = \\frac{dA}{dt} = (\\varphi_1 - \\varphi_2)\\frac{dQ}{dt} = ui$.
Jak se vypočítá výkon při konstantní hodnotě proudu a napětí?,Výkon P se vypočítá jako $P = UI$.
Jak zní Joulův zákon a co vyjadřuje?,Joulův zákon vyjadřuje množství tepla za jednotku času (výkon) ve vodiči s odporem, kterým prochází proud. Platí $P = UI = RI^2 = \\frac{U^2}{R}$.
Co jsou ztráty v elektrických rozvodech způsobené tepelnými účinky proudu?,Ztráty jsou nežádoucí přeměna elektrické energie na teplo všude tam, kde teče proud, tedy i při rozvodech elektrické energie.
Uveďte příklad praktického využití tepelných účinků proudu v průmyslu.,Praktické využití tepelných účinků proudu v průmyslu je například odporové svařování.
Jak se sčítají odpory při sériovém a paralelním spojení rezistorů?,Při sériovém zapojení se odpor náhradního rezistoru vypočítá jako součet jednotlivých odporů ($R = R_1 + R_2 + \\dots + R_n$). Při paralelním zapojení se převrácená hodnota odporu náhradního rezistoru rovná součtu převrácených hodnot jednotlivých odporů ($\\frac{1}{R} = \\frac{1}{R_1} + \\frac{1}{R_2} + \\dots + \\frac{1}{R_n}$).
Jak se vypočítá odpor dvou rezistorů zapojených paralelně?,Odpor dvou rezistorů zapojených paralelně se vypočítá jako $R = \\frac{R_1 R_2}{R_1 + R_2}$.
Jaké dva druhy zdrojů stejnosměrného napětí a proudu rozeznáváme?,Rozeznáváme ideální a skutečné zdroje.
Jaká je charakteristika ideálního zdroje napětí?,Ideální zdroj napětí má svorkové napětí nezávislé na odebíraném proudu, tzn. jeho vnitřní odpor je roven nule.
Jaká je charakteristika ideálního zdroje proudu?,Ideální zdroj proudu má proud nezávislý na napětí mezi svorkami, tzn. jeho vnitřní odpor je nekonečně velký.
Jak se sčítají proudy při paralelním řazení elektrických zdrojů?,Při paralelním řazení zdrojů je výsledný proud dán součtem jednotlivých proudů ($I = \\sum_{i=1}^n I_i$).
Jak se sčítají napětí při sériovém řazení elektrických zdrojů?,Při sériovém řazení zdrojů je celkové napětí rovné součtu napětí jednotlivých zdrojů ($U_{celk} = \\sum_{j=1}^n U_j$).
Jak zní I. Kirchhoffův zákon?,Součet proudů v uzlu se rovná nule.
Jak zní II. Kirchhoffův zákon?,Součet úbytků napětí vytvářených proudy na rezistorech spolu se součtem elektrických napětí zdrojů se v uzavřené smyčce rovná nule ($\\sum R_i I_i + \\sum U_j = 0$).
Popište obecný postup použití Kirchhoffových zákonů pro řešení elektrických obvodů.,Postup zahrnuje označení směrů proudů, sestavení rovnic podle I. Kirchhoffova zákona pro uzly, označení směrů napětí zdrojů, výběr smyček a zvolení směrů jejich obíhání, sestavení rovnic podle II. Kirchhoffova zákona a řešení soustavy rovnic.
K čemu slouží převod zapojení trojúhelník - hvězda a hvězda - trojúhelník?,Tyto převody slouží k nahrazení zapojení tří rezistorů mezi třemi uzly buď zapojením do hvězdy, nebo do trojúhelníka, tak aby obě zapojení byla ekvivalentní (odpor mezi kterýmikoliv dvěma uzly je stejný).
K čemu slouží dělič napětí?,Napěťový dělič umožňuje rozdělit napětí zdroje tak, aby na spotřebiči připojeném k daným svorkám bylo požadované napětí.
Jak se vypočítá napětí na jednotlivých rezistorech v nezatíženém děliči napětí?,Napětí na rezistoru R1 je $U_1 = U \\frac{R_1}{R_1 + R_2}$ a na rezistoru R2 je $U_2 = U \\frac{R_2}{R_1 + R_2}$.
Popište princip lineární superpozice.,V lineárním obvodu je účinek všech zdrojů roven součtu účinků jednotlivých zdrojů působících samostatně.
K čemu slouží Theveninova věta?,Theveninova věta slouží k výpočtu proudu nebo napětí pouze v jedné větvi obvodu. Principem je nahrazení zbývající části obvodu ekvivalentním obvodem s jedním zdrojem napětí (UTh) sériově zapojeným s odporem (RTh).
Kde vzniká magnetické pole?,Magnetické pole vzniká kolem permanentních magnetů a kolem vodiče, kterým protéká elektrický proud.
Co je magnetomotorické napětí?,Magnetomotorické napětí na uzavřené dráze je rovné součtu proudů obepnutých touto dráhou ($\\sum H dl = \\sum I$).
Co je intenzita magnetického pole?,Intenzita magnetického pole je definována jako magnetické napětí připadající na jednotku délky indukční čáry ($H = \\frac{U_m}{l}$).
Jak se zobrazuje magnetické pole?,Magnetické pole se zobrazuje pomocí magnetických indukčních čar, které jsou vždy uzavřené křivky.
Jaký je vztah mezi magnetickou indukcí a intenzitou magnetického pole?,Vztah mezi magnetickou indukcí B a intenzitou magnetického pole H je $B = \\mu H$, kde $\\mu$ je absolutní permeabilita prostředí.
Co je absolutní permeabilita a z čeho se skládá?,Absolutní permeabilita $\\mu$ je dána vztahem $\\mu = \\mu_0 \\mu_r$, kde $\\mu_0$ je permeabilita vakua a $\\mu_r$ je relativní permeabilita.
Co je magnetický tok?,Magnetický tok $\\Phi$ je definován jako tok vektoru magnetické indukce B přes plochu S ($\\Phi = \\int_S B \\cdot dS$). Pro homogenní pole kolmé na plochu platí $\\Phi = BS$.
Jaká je jednotka magnetického toku?,Jednotkou magnetického toku je Weber (Wb).
Jak zní Hopkinsonův zákon?,Hopkinsonův zákon je analogií Ohmova zákona pro magnetické obvody a platí $\\Phi = \\frac{U_m}{R_m}$, kde $U_m$ je magnetomotorické napětí a $R_m$ je magnetický odpor (reluktance).
Co je magnetická vodivost (permeance)?,Magnetická vodivost $G_m$ je definována jako $G_m = \\frac{\\mu S}{l}$.
Co je magnetický odpor (reluktance)?,Magnetický odpor $R_m$ je převrácenou hodnotou magnetické vodivosti ($R_m = \\frac{1}{G_m} = \\frac{l}{\\mu S}$).
K čemu slouží Biotův–Savartův zákon?,Biotův–Savartův zákon slouží k výpočtu magnetické indukce v okolí proudem protékajícího vodiče.
Jak se vypočítá magnetická indukce B vně dlouhého přímého vodiče ve vzdálenosti r?,Magnetická indukce se vypočítá jako $B = \\frac{\\mu_0 I}{2\\pi r}$.
Jak zní Ampérův zákon (zákon celkového proudu)?,Ampérův zákon lze zapsat ve tvaru $\\oint B dl = \\mu_0 I_C$, kde integrál se počítá po uzavřené křivce, $\\mu_0$ je permeabilita vakua a $I_C$ je celkový proud uzavřený křivkou.
Jak se vypočítá magnetická indukce B uvnitř dlouhého ideálního solenoidu?,Magnetická indukce se vypočítá jako $B = \\mu_0 \\frac{N}{l} I = \\mu_0 n I$, kde N je počet závitů, l je délka solenoidu a n je počet závitů na jednotku délky.
Jak se vypočítá magnetická indukce B uvnitř toroidu ve vzdálenosti r od středu?,Magnetická indukce se vypočítá jako $B = \\frac{\\mu_0 I N}{2\\pi r}$, kde I je proud a N je celkový počet závitů.
Jak se dělí látky podle velikosti relativní permeability?,Látky se dělí na diamagnetické ($\\mu_r < 1$, např. Cu, Zn, Hg), paramagnetické ($\\mu_r > 1$, např. Al, Pt, Mn) a feromagnetické ($\\mu_r \\gg 1$, např. Fe, Ni, Co).
Jak feromagnetické látky ovlivňují původní magnetické pole?,Feromagnetické látky zesilují původní magnetické pole vytvořené proudem.
Co je křivka prvotní magnetizace?,Křivka prvotní magnetizace vyjadřuje průběh magnetizace látky z odmagnetovaného stavu (H = 0, B = 0) až do nasycení.
Co je magnetická hystereze?,Magnetická hystereze je jev, kdy pozorujeme závislost stavu materiálu na předchozích stavech zmagnetování. Indukce neklesá po stejné křivce, po které rostla.
Co je remanentní (zbytková) magnetická indukce?,Remanentní magnetická indukce $B_r$ je hodnota magnetické indukce, kterou si látka udrží při nulové intenzitě magnetického pole (H = 0).
Co je koercitivní síla?,Koercitivní síla $H_c$ je velikost intenzity magnetického pole opačného směru, při které se magnetická indukce sníží na nulu (B = 0).
Co je hysterezní smyčka a co vyjadřuje její plocha?,Hysterezní smyčka je uzavřená křivka zobrazující závislost magnetické indukce B na intenzitě magnetického pole H při cyklickém přemagnetovávání feromagnetického materiálu. Plocha hysterezní smyčky je rovna energii přeměněné na teplo (hysterezní ztráta) při provedení jednoho magnetizačního cyklu.
Jaké jsou vlastnosti magneticky měkkých feromagnetických materiálů a k čemu se používají?,Magneticky měkké materiály mají úzkou hysterezní smyčku a malou koercitivní sílu ($H_c = 1 − 100 A · m^{-1}$). Používají se k výrobě transformátorových plechů nebo jako jádra elektromagnetů (např. měkké oceli, železo).
Jaké jsou vlastnosti magneticky tvrdých feromagnetických materiálů a k čemu se používají?,Magneticky tvrdé materiály mají širokou hysterezní smyčku a velkou koercitivní sílu ($H_c = 1,6 \\times 10^3 − 3 \\times 10^5 A · m^{-1}$). Používají se ke zhotovování trvalých magnetů (např. tvrdé oceli).
Co je magnetostrikce?,Magnetostrikce je jev, kdy při magnetizaci feromagnetických látek dochází ke změně jejich objemu.
Co objevil Oersted v souvislosti s elektrickým proudem a magnetickým polem?,Oersted objevil, že kolem vodiče, kterým prochází elektrický proud, vzniká magnetické pole.
Co objevil Faraday v souvislosti s elektromagnetickou indukcí?,Faraday objevil, že časovými změnami magnetického pole, které obepíná svými indukčními čarami vodič, vzniká v tomto vodiči elektrické napětí.
Jak zní Faradayův indukční zákon?,Faradayův indukční zákon určuje indukované elektromotorické napětí e v uzavřené smyčce jako $e = -\\frac{d\\Phi}{dt}$, kde $\\Phi$ je magnetický tok procházející smyčkou.
Jaký je vztah mezi indukovaným elektromotorickým napětím a indukovaným napětím na svorkách otevřené smyčky?,Indukované napětí na svorkách otevřené smyčky u je velikostí stejné jako elektromotorické napětí, ale opačného směru ($u = \\frac{d\\Phi}{dt}$).
Co říká Lenzův zákon?,Lenzův zákon říká, že směr indukovaného napětí je vždy takový, že toto napětí brání změně, která jej vyvolala.
Co je vlastní indukčnost závitu nebo cívky?,Vlastní indukčnost L je konstanta úměrnosti mezi magnetickým tokem procházejícím závitem (nebo cívkou s N závity) a proudem, který tento tok vytváří. Statická definice je $L = \\frac{\\Phi}{I}$ (pro závit) nebo $L = \\frac{N\\Phi}{I}$ (pro cívku). Dynamická definice je $u = L\\frac{di}{dt}$.
Jaká je jednotka vlastní indukčnosti?,Jednotkou vlastní indukčnosti je Henry (H).
Co je vzájemná indukčnost mezi dvěma cívkami?,Vzájemná indukčnost M charakterizuje indukční vazbu mezi dvěma cívkami. Při průchodu proudu I1 primární cívkou se v sekundární cívce indukuje napětí u2, které je úměrné rychlosti změny proudu v primární cívce ($u_2 = M\\frac{di_1}{dt}$). Statická definice je $M = N_2\\frac{\\Phi_{12}}{I_1}$.
Jaká je jednotka vzájemné indukčnosti?,Jednotkou vzájemné indukčnosti je Henry (H).
Co je činitel vazby mezi dvěma cívkami?,Činitel vazby $\\kappa$ vyjadřuje míru magnetické vazby mezi dvěma cívkami a pohybuje se od 0 do 1. Platí $M = \\kappa\\sqrt{L_1L_2}$.
Co znamená, když je činitel vazby $\\kappa = 1$?,Když je činitel vazby $\\kappa = 1$, vazba je těsná, což znamená, že veškerý magnetický tok vytvořený jednou cívkou prochází i druhou cívkou.
Co znamená, když je činitel vazby $\\kappa = 0$?,Když je činitel vazby $\\kappa = 0$, obvody nejsou vůbec vázány, tzn. nemají společný magnetický tok.
Jak se vypočítá energie magnetického pole cívky?,Energie magnetického pole cívky ($E_{mag}$) se vypočítá jako $E_{mag} = \\frac{1}{2}LI^2$.
Jak se sčítají indukčnosti při sériovém a paralelním řazení cívek bez vzájemné indukčnosti?,Při sériovém zapojení je výsledná indukčnost součtem jednotlivých indukčností ($L = L_1 + L_2 + \\dots + L_n$). Při paralelním zapojení je převrácená hodnota výsledné indukčnosti součtem převrácených hodnot jednotlivých indukčností ($\\frac{1}{L} = \\frac{1}{L_1} + \\frac{1}{L_2} + \\dots$).
Jak se vypočítá výsledná indukčnost při sériovém zapojení dvou cívek se vzájemnou indukčností?,Výsledná indukčnost se vypočítá jako $L = L_1 + L_2 \\pm 2M$, kde znaménko závisí na směru vinutí a toku.
Jaká síla působí mezi dvěma rovnoběžnými vodiči, kterými protéká proud?,Mezi dvěma rovnoběžnými vodiči, kterými protéká proud, působí síla $F = \\mu_0\\frac{I_1 I_2}{2\\pi r}l$ (nebo $F = \\frac{2I_1 I_2 l}{r} \\cdot 10^{-7}$), kde $I_1$ a $I_2$ jsou proudy, l je délka vodičů a r je jejich vzdálenost. Síla je přitažlivá pro proudy stejného směru a odpudivá pro proudy opačného směru.
Z čeho se skládají ztráty ve feromagnetických materiálech při střídavém magnetickém toku?,Ztráty se skládají z hysterezních ztrát ($P_h$) a ze ztrát vířivými proudy ($P_v$), tedy $P_{Fe} = P_h + P_v$.
Na čem závisí hysterezní ztráty?,Hysterezní ztráty závisí na druhu feromagnetického materiálu, na maximální magnetické indukci, na frekvenci proudu a na hmotnosti materiálu.
Na čem závisí ztráty vířivými proudy?,Ztráty vířivými proudy závisí na druhu materiálu, na druhé mocnině maximální indukce, na druhé mocnině frekvence a na tloušťce a hmotnosti plechů.
Jaký je hlavní důvod pro využívání střídavých proudů v elektrotechnice?,Hlavními důvody jsou menší ztráty při přenosu elektrické energie při vysokém napětí, možnost konstrukce generátorů na vyšší výkony a možnost transformace elektrické energie pomocí transformátorů.
Jak vzniká jednofázový střídavý proud?,Jednofázový střídavý proud vzniká například otáčením závitu v homogenním magnetickém poli, kdy se indukuje napětí s harmonickým průběhem ($u = U_m \\sin(\\omega t + \\varphi)$).
Co je perioda a frekvence střídavého proudu?,Perioda T je doba jednoho kmitu. Frekvence f je převrácená hodnota periody a udává počet kmitů za sekundu ($f = \\frac{1}{T}$).
Co je úhlová frekvence a jaký je její vztah k frekvenci?,Úhlová frekvence $\\omega$ je definována jako $\\omega = 2\\pi f$.
Co je počáteční fáze napětí?,Počáteční fáze napětí $\\varphi$ je úhel normály k rovině závitu a směru magnetického pole v době t = 0.
Co je efektivní hodnota střídavého proudu nebo napětí?,Efektivní hodnota střídavého proudu (nebo napětí) je rovna hodnotě stejnosměrného proudu (nebo napětí), který by za dobu jedné periody vyvinul v odporu stejné množství tepla jako střídavý proud (nebo napětí). Pro sinusový průběh platí $I = \\frac{I_m}{\\sqrt{2}} \\approx 0,707 I_m$ a $U = \\frac{U_m}{\\sqrt{2}} \\approx 0,707 U_m$.
Co je střední hodnota střídavého proudu nebo napětí?,Střední hodnota periodického průběhu za dobu jedné periody je $I_0 = \\frac{1}{T}\\int_0^T idt$. Pro čistě střídavý sinusový průběh je střední hodnota za celou periodu rovna nule. Zavádí se střední hodnota jedné půlvlny, která je pro sinusový průběh $I_s = \\frac{2}{\\pi}I_m \\approx 0,637 I_m$.
K čemu slouží symbolicko-komplexní metoda při řešení obvodů střídavého proudu?,Symbolicko-komplexní metoda nahrazuje grafické řešení obvodů střídavého proudu výpočetním řešením pomocí komplexních čísel (fázorů).
Co je fázor?,Fázor je nehybný vektor v rovině komplexních čísel, který svírá s osou x úhel odpovídající fázi veličiny. Používá se k symbolickému vyjádření střídavých veličin. Rotující fázor zahrnuje i časovou závislost.
Jak se vypočítá okamžitá hodnota výkonu v obvodu střídavého proudu?,Okamžitá hodnota výkonu se vypočítá jako součin okamžitých hodnot napětí a proudu: $p = ui$.
Co je činný výkon, jalový výkon a zdánlivý výkon v obvodu střídavého proudu?,Činný výkon P je střední hodnota okamžitého výkonu za jednu periodu a vyjadřuje energii, která se přemění na užitečnou práci nebo teplo ($P = UI \\cos \\varphi$). Jalový výkon $P_j$ souvisí s energií, která se v obvodu akumuluje a opět vrací zdroji ($P_j = UI \\sin \\varphi$). Zdánlivý výkon $P_S$ je součin efektivních hodnot napětí a proudu ($P_S = UI$) a nemá fyzikální význam, ale je důležitý pro dimenzování zařízení.
Jaká je jednotka činného výkonu?,Jednotkou činného výkonu je watt \\[W\\].
Jaká je jednotka jalového výkonu?,Jednotkou jalového výkonu je reaktanční voltampér \\[var\\].
V jakých jednotkách se udává zdánlivý výkon?,Zdánlivý výkon se udává ve voltampérech \\[VA\\].
Co je účiník a jak se vypočítá?,Účiník ($\\cos \\varphi$) je poměr mezi činným a zdánlivým výkonem ($\\cos \\varphi = \\frac{P}{P_S}$). Vyjadřuje, jak efektivně je odebíraná energie využívána.
Jak se chová ideální rezistor v obvodu střídavého proudu?,Napětí a proud na ideálním rezistoru mají stejnou fázi. Platí Ohmův zákon $U = RI$. Příkon je pouze činný ($P = UI$).
Jak se chová ideální cívka v obvodu střídavého proudu?,Napětí na ideální cívce časově předbíhá proud o $\\frac{\\pi}{2}$ (90°). Cívka klade proudu odpor, který se nazývá indukční reaktance ($X_L = \\omega L$). Výkon je pouze jalový.
Co je indukční reaktance a jaká je její jednotka?,Indukční reaktance $X_L = \\omega L$ je odpor, který klade ideální cívka střídavému proudu. Její jednotka je ohm \\[$\\Omega$\\]].
Co je indukční susceptance a jaký je její vztah k indukční reaktanci?,Indukční susceptance $B_L = \\frac{1}{\\omega L}$ je převrácená hodnota indukční reaktance.
Jak se chová ideální kondenzátor v obvodu střídavého proudu?,Proud ideálním kondenzátorem časově předbíhá napětí o $\\frac{\\pi}{2}$ (90°). Kondenzátor klade proudu odpor, který se nazývá kapacitní reaktance ($X_C = \\frac{1}{\\omega C}$). Výkon je pouze jalový.
Co je kapacitní reaktance a jaká je její jednotka?,Kapacitní reaktance $X_C = \\frac{1}{\\omega C}$ je odpor, který klade ideální kondenzátor střídavému proudu. Její jednotka je ohm \\[$\\Omega$\\]].
Co je kapacitní susceptance a jaký je její vztah ke kapacitní reaktanci?,Kapacitní susceptance $B_C = \\omega C$ je převrácená hodnota kapacitní reaktance. Její jednotka je siemens \\[S\\] (nebo $\\Omega^{-1}$).
Jak se vypočítá celkový proud při paralelním zapojení odporu a kapacity?,Celkový proud I je součet proudů rezistorem a kondenzátorem: $I = I_R + I_C$. V symbolickém vyjádření platí $I = U (\\frac{1}{R} + j\\omega C)$.
Co je admitance a jaká je její jednotka?,Admitance Y je komplexní číslo, které charakterizuje zdánlivou vodivost prvku nebo části obvodu střídavému proudu. Její jednotka je siemens \\[S\\].
Co je impedance a jaká je její jednotka?,Impedance Z je komplexní číslo, které charakterizuje zdánlivý odpor prvku nebo části obvodu střídavému proudu. Její jednotka je ohm \\[$\\Omega$\\]]. Impedance je převrácená hodnota admitance ($Z = \\frac{1}{Y}$).
Jak se vypočítá celkový proud při paralelním zapojení odporu a indukčnosti?,Celkový proud I je součet proudů rezistorem a cívkou: $I = I_R + I_L$. V symbolickém vyjádření platí $I = U (\\frac{1}{R} + \\frac{1}{j\\omega L})$.
Co je rezonance v paralelním LC obvodu?,Rezonance v paralelním LC obvodu nastává při frekvenci, kdy je celkový proud minimální (ideálně nulový) a impedance maximální (ideálně nekonečná). Nastává, když se indukční a kapacitní susceptance rovnají ($\\omega C = \\frac{1}{\\omega L}$).
Jak se vypočítá rezonanční frekvence v paralelním LC obvodu?,Rezonanční frekvence $f_r$ se vypočítá jako $f_r = \\frac{1}{2\\pi\\sqrt{LC}}$.
Co je rezonance v sériovém RLC obvodu?,Rezonance v sériovém RLC obvodu nastává při frekvenci, kdy je celková impedance minimální (rovna odporu R) a proud maximální. Nastává, když se indukční a kapacitní reaktance rovnají ($\\omega L = \\frac{1}{\\omega C}$).
Jak se vypočítá rezonanční frekvence v sériovém RLC obvodu?,Rezonanční frekvence $f_r$ se vypočítá jako $f_r = \\frac{1}{2\\pi\\sqrt{LC}}$.
Jak se vypočítá celkové napětí při sériovém zapojení odporu a indukčnosti?,Celkové napětí U je součet napětí na rezistoru a cívce: $U = U_R + U_L$. V symbolickém vyjádření platí $U = I (R + j\\omega L)$.
Co je ztrátový úhel cívky?,Ztrátový úhel cívky $\\delta$ je úhel, o který se fázor napětí na cívce odchyluje od ideálního posunu 90° vůči proudu. Vypočítá se jako $\\delta = \\arctan \\frac{R}{\\omega L}$.
Co je ztrátový činitel cívky?,Ztrátový činitel cívky je definován jako $\\tan \\delta = \\frac{R}{\\omega L}$.
Jak se vypočítá celkové napětí při sériovém zapojení odporu a kapacity?,Celkové napětí U je součet napětí na rezistoru a kondenzátoru: $U = U_R + U_C$. V symbolickém vyjádření platí $U = I (R + \\frac{1}{j\\omega C})$.
Jak se vypočítá celkové napětí při sériovém zapojení ideální indukčnosti a kapacity?,Celkové napětí U je součet napětí na cívce a kondenzátoru: $U = U_L + U_C$. V symbolickém vyjádření platí $U = I (j\\omega L + \\frac{1}{j\\omega C})$.
Jak se chová ideální sériový rezonanční obvod při rezonanci?,Při rezonanci se ideální sériový rezonanční obvod chová jako zkrat, protože impedance Z klesá k nule.
Jak se vypočítá celkové napětí při sériovém zapojení odporu, indukčnosti a kapacity?,Celkové napětí U je součet napětí na rezistoru, cívce a kondenzátoru: $U = U_R + U_L + U_C$. V symbolickém vyjádření platí $U = I (R + j\\omega L + \\frac{1}{j\\omega C})$.
Jak se chová sériový rezonanční obvod se ztrátami při rezonanci?,Při rezonanci se sériový rezonanční obvod se ztrátami chová jako činný odpor, tzn. impedance Z je rovna R.
Kdy vznikají přechodné jevy v elektrických obvodech?,Přechodné jevy vznikají v obvodech s prvky schopnými akumulovat energii (L, C) při náhlé změně parametrů obvodu, například při zapojení nebo odpojení zdroje, nebo při náhlé změně zapojení.
Co je časová konstanta RL obvodu?,Časová konstanta $\\tau$ sériového RL obvodu je definována jako $\\tau = \\frac{L}{R}$. Charakterizuje rychlost náběhu nebo poklesu proudu v obvodu po skokové změně napětí.
Jaký tvar má průběh proudu v sériovém RL obvodu po připojení ke zdroji stejnosměrného napětí?,Průběh proudu má tvar $i = I_\\infty (1 - e^{-\\frac{t}{\\tau}}) = \\frac{U}{R} (1 - e^{-\\frac{t}{\\tau}})$, kde $I_\\infty = \\frac{U}{R}$ je ustálený proud.
Po jaké době se prakticky považuje přechodný stav v RL obvodu za ustálený?,Prakticky se přechodný stav považuje za ustálený po době $t \\ge 3\\tau$.
Co je časová konstanta RC obvodu?,Časová konstanta $\\tau$ sériového RC obvodu je definována jako $\\tau = RC$. Charakterizuje rychlost náběhu nebo poklesu napětí na kondenzátoru a proudu v obvodu po skokové změně napětí.
Jaký tvar má průběh proudu v sériovém RC obvodu při nabíjení kondenzátoru ze zdroje stejnosměrného napětí?,Průběh proudu má tvar $i = I_0 e^{-\\frac{t}{\\tau}} = \\frac{U}{R} e^{-\\frac{t}{\\tau}}$, kde $I_0 = \\frac{U}{R}$ je počáteční proud.
Jaký tvar má průběh napětí na kondenzátoru v sériovém RC obvodu při nabíjení ze zdroje stejnosměrného napětí?,Průběh napětí na kondenzátoru má tvar $u_C = U (1 - e^{-\\frac{t}{\\tau}})$.
Jaký tvar má průběh napětí na rezistoru v sériovém RC obvodu při nabíjení ze zdroje stejnosměrného napětí?,Průběh napětí na rezistoru má tvar $u_R = U e^{-\\frac{t}{\\tau}}$.
Proč se místo jednofázové soustavy využívá trojfázová soustava?,Trojfázová soustava je výhodnější z hlediska přenosu elektrické energie a využití elektrických strojů.
Co je trojfázová soustava?,Trojfázová soustava je soustava tří harmonických napětí se stejnou amplitudou a stejnou frekvencí, která jsou vzájemně posunuta o stejný úhel 120° (nebo $\\frac{2\\pi}{3}$ radiánů).
Jaký je fázový posun mezi jednotlivými napětími v trojfázové soustavě?,Fázový posun je 120° (nebo $\\frac{2\\pi}{3}$ radiánů).
Jaký tvar mají indukovaná napětí v cívkách alternátoru trojfázového proudu?,Indukovaná napětí mají harmonický časový průběh: $u_A = U_m \\sin(\\omega t)$, $u_B = U_m \\sin(\\omega t - \\frac{2}{3}\\pi)$, $u_C = U_m \\sin(\\omega t + \\frac{2}{3}\\pi)$.
Jaká výhodná vlastnost platí pro součet okamžitých hodnot napětí v trojfázové soustavě?,Pro součet okamžitých hodnot napětí v trojfázové soustavě platí, že je roven nule ($u_A + u_B + u_C = 0$).
Jaká výhodná vlastnost platí pro součet fázorů napětí v trojfázové soustavě?,Součet fázorů napětí v trojfázové soustavě je roven nule ($U_A + U_B + U_C = 0$).
Jaká jsou základní zapojení trojfázové soustavy?,Základní zapojení jsou spojení do hvězdy a spojení do trojúhelníka.
K čemu slouží kompenzace fázového posunu v trojfázové soustavě?,Kompenzace fázového posunu slouží ke zmenšení fázového posunu celkového odebíraného proudu vůči napětí, například paralelním připojením kondenzátoru ke spotřebiči.
`}
                  </pre>
                  <ul className="list-disc space-y-1 pl-5 mt-2">
                    <li>The <strong>question</strong> is all text before the first comma on a line.</li>
                    <li>The <strong>answer</strong> is all text after the first comma on that line.</li>
                    <li>If your question or answer includes commas, it&apos;s best to enclose that field in double quotes (e.g., <code>&quot;Question, with comma&quot;,&quot;Answer, with comma&quot;</code>). The parser tries to handle unquoted fields with commas by treating everything after the first comma as part of the answer.</li>
                    <li>You can use LaTeX for math formulas by enclosing them in single dollar signs (e.g., <code>$E=mc^2$</code> or <code>$\\frac{'a'}{'b'}$</code>). These will be rendered on the flashcards. Note that backslashes in LaTeX might need to be escaped with another backslash (e.g., <code>$\\times$</code> for the multiplication symbol) depending on your text editor or CSV generation tool.</li>
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
