
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, FileText, Loader2, Search, XCircle } from "lucide-react";
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
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Document {
  id: string;
  name: string;
  category: string;
  link: string;
  type: string;
}

const DocumentsPage = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const { toast } = useToast();
  
  // Fetch documents on load
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setLoading(true);
        const data = await fetchSheetData({
          apiKey: googleSheetsConfig.apiKey,
          spreadsheetId: googleSheetsConfig.sheets.documents.spreadsheetId,
          range: googleSheetsConfig.sheets.documents.range
        });
        setDocuments(data);
        
        // Get all categories
        const categories = [...new Set(data.map(d => d.category))];
        setSelectedCategories(categories);
        
        // Expand first category by default
        if (categories.length > 0) {
          setExpandedCategories([categories[0]]);
        }
      } catch (error) {
        console.error("Error fetching documents:", error);
        toast({
          title: "Error loading documents",
          description: "Failed to load documents. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchDocuments();
  }, [toast]);
  
  // Get all categories
  const allCategories = [...new Set(documents.map(d => d.category))];
  
  // Filter documents based on search term and selected categories
  const filteredDocuments = documents.filter(document => 
    (document.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
     document.category.toLowerCase().includes(searchTerm.toLowerCase())) &&
    selectedCategories.includes(document.category)
  );
  
  // Group documents by category
  const groupedDocuments = filteredDocuments.reduce((acc, document) => {
    if (!acc[document.category]) {
      acc[document.category] = [];
    }
    acc[document.category].push(document);
    return acc;
  }, {} as { [key: string]: Document[] });
  
  // Toggle category expansion
  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => 
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };
  
  // Open document in new tab
  const openDocument = (document: Document) => {
    window.open(document.link, '_blank');
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
          <h1 className="text-3xl font-bold tracking-tight">Documents</h1>
          <p className="text-muted-foreground">
            Access and review project documentation
          </p>
        </div>
        
        {/* Search and Filter Bar */}
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-10 pr-10"
              placeholder="Search documents by name or category..."
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
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="min-w-[150px]">
                Filter: {selectedCategories.length} of {allCategories.length}
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
        </div>
        
        {/* Loading State */}
        {loading && (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
        
        {/* No Results */}
        {!loading && filteredDocuments.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <XCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold">No documents found</h3>
              <p className="text-muted-foreground text-center max-w-md">
                {searchTerm 
                  ? "Try a different search term or adjust your filters"
                  : selectedCategories.length === 0
                    ? "Please select at least one category"
                    : "No documents are available in the system"
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
        
        {/* Documents List */}
        {!loading && filteredDocuments.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Available Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="multiple" value={expandedCategories}>
                {Object.entries(groupedDocuments).map(([category, documents]) => (
                  <AccordionItem key={category} value={category}>
                    <AccordionTrigger onClick={() => toggleCategory(category)}>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        <span>{category}</span>
                        <span className="ml-2 text-xs text-muted-foreground">
                          ({documents.length})
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
                        {documents.map((document) => (
                          <div
                            key={document.id}
                            onClick={() => openDocument(document)}
                            className="flex items-center gap-3 p-2 rounded-md hover:bg-accent transition-colors cursor-pointer"
                          >
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                              {document.type === 'google-doc' && (
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  <path d="M16 13H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  <path d="M16 17H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  <path d="M10 9H9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              )}
                              {document.type === 'pdf' && (
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  <path d="M11.5 14H11.51" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  <path d="M8 14H8.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  <path d="M8 17H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium">{document.name}</p>
                              <p className="text-xs text-muted-foreground">
                                Click to open
                              </p>
                            </div>
                            <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                              <Check className="h-3 w-3" />
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

export default DocumentsPage;
