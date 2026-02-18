import { FileText } from "lucide-react";




export function EmptyState(props: {
  clearAllFilters: any;
  title: any;
  description: any;
  other: any;

}) {
  const {
    clearAllFilters,
    title,
    description,
    other,

  } = props;


  
        
    return (  
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            {title}
          </h3>
          <p className="text-muted-foreground mb-6">
            {description}
          </p>
          <button
            onClick={clearAllFilters}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary transition-colors"
          >
            {other}
          </button>
        </div>
  )};