
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BarChart3, ChevronDown, Loader2, Search, SlidersHorizontal, XCircle } from "lucide-react";
import { fetchSheetData } from "@/utils/googleSheetsUtils";
import { googleSheetsConfig } from "@/configs/appConfig";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [selectedTableau, setSelectedTableau] = useState<Tableau | null>(null);
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
        
        // Get all categories
        const categories = [...new Set(data.map(t => t.category))];
        setSelectedCategories(categories);
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
  
  // Get all categories
  const allCategories = [...new Set(tableaux.map(t => t.category))];
  
  // Filter tableaux based on search term and selected categories
  const filteredTableaux = tableaux.filter(tableau => 
    (tableau.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
     tableau.category.toLowerCase().includes(searchTerm.toLowerCase())) &&
    selectedCategories.includes(tableau.category)
  );
  
  // Sort tableaux
  const sortedTableaux = [...filteredTableaux].sort((a, b) => {
    const comparison = a.name.localeCompare(b.name);
    return sortOrder === "asc" ? comparison : -comparison;
  });
  
  // Toggle sort order
  const toggleSortOrder = () => {
    setSortOrder(prev => prev === "asc" ? "desc" : "asc");
  };
  
  // Open tableau in new tab
  const openTableau = (tableau: Tableau) => {
    window.open(tableau.link, '_blank');
  };
  
  // Clear search
  const clearSearch = () => {
    setSearchTerm("");
  };
  
  // Toggle category filter
  const toggleCategoryFilter = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };
  
  // Select all categories
  const selectAllCategories = () => {
    setSelectedCategories(allCategories);
  };
  
  // Clear all category selections
  const clearAllCategories = () => {
    setSelectedCategories([]);
  };
  
  // View tableau details
  const viewTableauDetails = (tableau: Tableau) => {
    setSelectedTableau(tableau);
  };
  
  // Close tableau details
  const closeTableauDetails = () => {
    setSelectedTableau(null);
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
            View and analyze data tables and visualizations
          </p>
        </div>
        
        {/* Search and Filter Bar */}
        <div className="flex flex-col gap-4 sm:flex-row">
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
          
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <SlidersHorizontal className="h-4 w-4" />
                  Filter
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px]">
                <DropdownMenuLabel>Filter by Category</DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                <div className="max-h-[300px] overflow-auto">
                  {allCategories.map(category => (
                    <DropdownMenuCheckboxItem
                      key={category}
                      checked={selectedCategories.includes(category)}
                      onCheckedChange={() => toggleCategoryFilter(category)}
                    >
                      {category}
                    </DropdownMenuCheckboxItem>
                  ))}
                </div>
                
                <DropdownMenuSeparator />
                <div className="flex justify-between p-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-xs"
                    onClick={selectAllCategories}
                  >
                    Select All
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-xs"
                    onClick={clearAllCategories}
                  >
                    Clear All
                  </Button>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button variant="outline" onClick={toggleSortOrder} className="gap-2">
              Sort {sortOrder === "asc" ? "A-Z" : "Z-A"}
              <ChevronDown className={`h-4 w-4 transition-transform ${sortOrder === "desc" ? "rotate-180" : ""}`} />
            </Button>
          </div>
        </div>
        
        {/* Loading State */}
        {loading && (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
        
        {/* No Results */}
        {!loading && sortedTableaux.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <XCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold">No tableaux found</h3>
              <p className="text-muted-foreground text-center max-w-md">
                {searchTerm 
                  ? "Try a different search term or adjust your filters"
                  : selectedCategories.length === 0
                    ? "Please select at least one category"
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
              {selectedCategories.length === 0 && (
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={selectAllCategories}
                >
                  Select All Categories
                </Button>
              )}
            </CardContent>
          </Card>
        )}
        
        {/* Tableaux Grid */}
        {!loading && sortedTableaux.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sortedTableaux.map((tableau) => (
              <Card key={tableau.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <div
                  className="h-32 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center cursor-pointer"
                  onClick={() => viewTableauDetails(tableau)}
                >
                  <BarChart3 className="h-12 w-12 text-primary/60" />
                </div>
                <CardHeader className="p-4">
                  <div className="flex justify-between items-start gap-2">
                    <CardTitle className="text-lg">{tableau.name}</CardTitle>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{tableau.category}</p>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="flex justify-between mt-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-xs"
                      onClick={() => viewTableauDetails(tableau)}
                    >
                      View Details
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openTableau(tableau)}
                      className="text-xs"
                    >
                      Open
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        
        {/* Tableau Details Dialog */}
        <Dialog open={!!selectedTableau} onOpenChange={closeTableauDetails}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{selectedTableau?.name}</DialogTitle>
              <DialogDescription>
                {selectedTableau?.category}
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="flex justify-center mb-4">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <BarChart3 className="h-8 w-8 text-primary" />
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium">Type</h4>
                  <p className="text-sm text-muted-foreground capitalize">
                    {selectedTableau?.type.replace('-', ' ')}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium">Description</h4>
                  <p className="text-sm text-muted-foreground">
                    Detailed visualization for data analysis and reporting. Click the button below to open.
                  </p>
                </div>
                <Button 
                  className="w-full" 
                  onClick={() => selectedTableau && openTableau(selectedTableau)}
                >
                  Open in New Tab
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>
    </AnimatePresence>
  );
};

export default TableauxPage;
