import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";
import { FileText, DollarSign, CheckCircle, AlertCircle } from "lucide-react";




export function StatsCards(props: {
   data: any;
//   formatAmount: any;
//   convertAmount: any;
//  other: any;

}) {
  const {
     data,
    // formatAmount,
    // convertAmount,
   // other,

  } = props;

          const { isRTL } = useLanguage();
  
        
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {data.map((element) => (
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{element.title}</p>
                <p className="text-2xl font-bold text-foreground">
                  {element.value}
                </p>
              </div>
              {element.icon}
            </div>
          </div>
        ))}
      </motion.div>
    );};