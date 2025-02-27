
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FolderOpen, Loader2, Search, XCircle } from "lucide-react";
import { fetchSheetData } from "@/utils/googleSheetsUtils";
import { googleSheetsConfig } from "@/configs/appConfig";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface Diagram {
  id: string;
  name: string;
  category: string;
  link: string;
  type: string;
}

const DiagrammesPage = () => {
  const [diagrams, setDiagrams] = useState<Diagram[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const { toast } = useToast();
  
  // Fetch diagrams on load
  useEffect(() => {
    const fetchDiagrams = async () => {
      try {
        setLoading(true);
        const data = await fetchSheetData({
          apiKey: googleSheetsConfig.apiKey,
          spreadsheetId: googleSheetsConfig.sheets.diagrammes.spreadsheetId,
          range: googleSheetsConfig.sheets.diagrammes.range
        });
        setDiagrams(data);
        
        // Expand first category by default
        if (data.length > 0) {
          const categories = [...new Set(data.map(d => d.category))];
          if (categories.length > 0) {
            setExpandedCategories([categories[0]]);
          }
        }
      } catch (error) {
        console.error("Error fetching diagrams:", error);
        toast({
          title: "Error loading diagrams",
          description: "Failed to load diagrams. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchDiagrams();
  }, [toast]);
  
  // Filter diagrams based on search term
  const filteredDiagrams = diagrams.filter(diagram => 
    diagram.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    diagram.category.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Group diagrams by category
  const groupedDiagrams = filteredDiagrams.reduce((acc, diagram) => {
    if (!acc[diagram.category]) {
      acc[diagram.category] = [];
    }
    acc[diagram.category].push(diagram);
    return acc;
  }, {} as { [key: string]: Diagram[] });
  
  // Toggle category expansion
  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => 
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };
  
  // Open diagram in new tab
  const openDiagram = (diagram: Diagram) => {
    window.open(diagram.link, '_blank');
  };
  
  // Clear search
  const clearSearch = () => {
    setSearchTerm("");
  };
  
  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Diagrammes</h1>
          <p className="text-muted-foreground">
            Explore process diagrams and visual documentation
          </p>
        </div>
        
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-10 pr-10"
            placeholder="Search diagrams by name or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2"
              onClick={clearSearch}
            >
              <XCircle className="h-4 w-4 text-muted-foreground" />
            </Button>
          )}
        </div>
        
        {/* Loading State */}
        {loading && (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
        
        {/* No Results */}
        {!loading && filteredDiagrams.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <XCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold">No diagrams found</h3>
              <p className="text-muted-foreground">
                {searchTerm 
                  ? "Try a different search term or clear your search"
                  : "No diagrams are available in the system"
                }
              </p>
              {searchTerm && (
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={clearSearch}
                >
                  Clear Search
                </Button>
              )}
            </CardContent>
          </Card>
        )}
        
        {/* Diagrams List */}
        {!loading && filteredDiagrams.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Available Diagrams</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="multiple" value={expandedCategories}>
                {Object.entries(groupedDiagrams).map(([category, diagrams]) => (
                  <AccordionItem key={category} value={category}>
                    <AccordionTrigger onClick={() => toggleCategory(category)}>
                      <div className="flex items-center gap-2">
                        <FolderOpen className="h-4 w-4" />
                        <span>{category}</span>
                        <span className="ml-2 text-xs text-muted-foreground">
                          ({diagrams.length})
                        </span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="grid gap-2 py-2"
                      >
                        {diagrams.map((diagram) => (
                          <div
                            key={diagram.id}
                            onClick={() => openDiagram(diagram)}
                            className="flex items-center gap-3 p-2 rounded-md hover:bg-accent transition-colors cursor-pointer"
                          >
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                              {diagram.type === 'google-doc' && (
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  <path d="M16 13H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  <path d="M16 17H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  <path d="M10 9H9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              )}
                              {diagram.type === 'pdf' && (
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  <path d="M11.5 14H11.51" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  <path d="M8 14H8.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  <path d="M8 17H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              )}
                              {diagram.type === 'html' && (
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M10.5 8L14.5 12L10.5 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  <path d="M4 6V18C4 19.1046 4.89543 20 6 20H18C19.1046 20 20 19.1046 20 18V6C20 4.89543 19.1046 4 18 4H6C4.89543 4 4 4.89543 4 6Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium">{diagram.name}</p>
                              <p className="text-xs text-muted-foreground">
                                Click to open
                              </p>
                            </div>
                          </div>
                        ))}
                      </motion.div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default DiagrammesPage;
