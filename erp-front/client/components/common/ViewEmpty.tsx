import { ArrowLeft, FileText } from "lucide-react";


export function ViewEmpty(props: {
  title: any;
  description: any;
//  other: any;

}) {
  const {
    title,
    description,
//    other,

  } = props;


  
        
    return (
      <div className="container mx-auto p-4 sm:p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">{title}</h2>
          <p className="text-muted-foreground mb-4">{description}</p>
        </div>

        {/* <Button onClick={() => navigate("/sales/recurring-invoices")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          {isRTL ? "العودة للقائمة" : "Back to List"}
        </Button> */}
        
      </div>
    );};