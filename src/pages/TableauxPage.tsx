
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BarChart3, Loader2, Search, XCircle } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Tableau {
  id: string;
  name: string;
  category: string;
  link: string;
  type: string;
}

const TableauxPage = () => {
  const [tableaux, setTableaux] = useState<Tableau[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSort, setSelectedSort] = useState<"name" | "category">("category");
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const { toast } = useToast();
  
  // Fetch tableaux on load
  useEffect(() => {
    const fetchTableaux = async () => {
      try {
        setLoading(true);
        const data = await fetchSheetData({
          apiKey: googleSheetsConfig.apiKey,
          spreadsheetId: googleSheetsConfig.sheets.tableaux.spreadsheetId,
          range: googleSheetsConfig.sheets.tableaux.range
        });
        setTableaux(data);
        
        // Expand first category by default
        if (data.length > 0) {
          const categories = [...new Set(data.map(d => d.category))];
          if (categories.length > 0) {
            setExpandedCategories([categories[0]]);
          }
        }
      } catch (error) {
        console.error("Error fetching tableaux:", error);
        toast({
          title: "Error loading tableaux",
          description: "Failed to load tableaux. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchTableaux();
  }, [toast]);
  
  // Filter tableaux based on search term
  const filteredTableaux = tableaux.filter(tableau => 
    tableau.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    tableau.category.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Sort tableaux
  const sortedTableaux = [...filteredTableaux].sort((a, b) => {
    if (selectedSort === "name") {
      return a.name.localeCompare(b.name);
    } else {
      return a.category.localeCompare(b.category) || a.name.localeCompare(b.name);
    }
  });
  
  // Group tableaux by category
  const groupedTableaux = sortedTableaux.reduce((acc, tableau) => {
    if (!acc[tableau.category]) {
      acc[tableau.category] = [];
    }
    acc[tableau.category].push(tableau);
    return acc;
  }, {} as { [key: string]: Tableau[] });
  
  // Toggle category expansion
  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => 
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };
  
  // Open tableau in new tab
  const openTableau = (tableau: Tableau) => {
    window.open(tableau.link, '_blank');
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
          <h1 className="text-3xl font-bold tracking-tight">Tableaux</h1>
          <p className="text-muted-foreground">
            Access data visualizations and analysis tools
          </p>
        </div>
        
        {/* Search and Sort Bar */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-10 pr-10"
              placeholder="Search tableaux by name or category..."
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
          
          <div className="w-full sm:w-40">
            <Select
              value={selectedSort}
              onValueChange={(value) => setSelectedSort(value as "name" | "category")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Sort by Name</SelectItem>
                <SelectItem value="category">Sort by Category</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Loading State */}
        {loading && (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
        
        {/* No Results */}
        {!loading && filteredTableaux.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <XCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold">No tableaux found</h3>
              <p className="text-muted-foreground">
                {searchTerm 
                  ? "Try a different search term or clear your search"
                  : "No tableaux are available in the system"
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
        
        {/* Tableaux List */}
        {!loading && filteredTableaux.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Available Tableaux</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="multiple" value={expandedCategories}>
                {Object.entries(groupedTableaux).map(([category, tableaux]) => (
                  <AccordionItem key={category} value={category}>
                    <AccordionTrigger onClick={() => toggleCategory(category)}>
                      <div className="flex items-center gap-2">
                        <BarChart3 className="h-4 w-4" />
                        <span>{category}</span>
                        <span className="ml-2 text-xs text-muted-foreground">
                          ({tableaux.length})
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
                        {tableaux.map((tableau) => (
                          <div
                            key={tableau.id}
                            onClick={() => openTableau(tableau)}
                            className="flex items-center gap-3 p-2 rounded-md hover:bg-accent transition-colors cursor-pointer"
                          >
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <BarChart3 className="h-4 w-4" />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium">{tableau.name}</p>
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

export default TableauxPage;
