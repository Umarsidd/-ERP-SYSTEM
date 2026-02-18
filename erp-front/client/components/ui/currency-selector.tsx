// import React, { useState } from "react";
// import { ChevronDown, DollarSign, Check } from "lucide-react";
// import { useCurrency } from "@/contexts/CurrencyContext";
// import { currencies } from "@/data/currencies";

// export const CurrencySelector: React.FC = () => {
//   const { currentCurrency, setCurrency, isRTL } = useCurrency();
//   const [isOpen, setIsOpen] = useState(false);

//   const handleCurrencySelect = (currency) => {
//     setCurrency(currency);
//     setIsOpen(false);
//   };

//   return (
//     <div className="relative">
//       <button
//         onClick={() => setIsOpen(!isOpen)}
//         className="flex items-center space-x-2 rtl:space-x-reverse px-3 py-2 bg-card border border-border rounded-lg hover:bg-accent transition-colors"
//         title={isRTL ? "تغيير العملة" : "Change Currency"}
//       >
//         <DollarSign className="w-4 h-4 text-muted-foreground" />
//         <span className="text-sm font-medium text-foreground">
//           {currentCurrency.code}
//         </span>
//         <ChevronDown
//           className={`w-4 h-4 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`}
//         />
//       </button>

//       {isOpen && (
//         <>
//           {/* Backdrop */}
//           <div
//             className="fixed inset-0 z-40"
//             onClick={() => setIsOpen(false)}
//           />

//           {/* Dropdown */}
//           <div className="absolute top-full mt-1 left-0 rtl:left-auto rtl:right-0 w-64 bg-card border border-border rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
//             <div className="p-2">
//               <div className="text-xs font-medium text-muted-foreground px-2 py-1 mb-2">
//                 {isRTL ? "اختر العملة" : "Select Currency"}
//               </div>
//               {currencies.map((currency) => (
//                 <button
//                   key={currency.code}
//                   onClick={() => handleCurrencySelect(currency)}
//                   className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors hover:bg-accent ${
//                     currentCurrency.code === currency.code
//                       ? "bg-primary/10 text-primary"
//                       : "text-foreground"
//                   }`}
//                 >
//                   <div className="flex items-center space-x-3 rtl:space-x-reverse">
//                     <div className="flex items-center justify-center w-8 h-8 bg-muted rounded-full text-xs font-medium">
//                       {currency.symbol}
//                     </div>
//                     <div className="text-left rtl:text-right">
//                       <div className="font-medium">{currency.code}</div>
//                       <div className="text-xs text-muted-foreground">
//                         {isRTL ? currency.code : currency.code}
//                       </div>
//                     </div>
//                   </div>
//                   {currentCurrency.code === currency.code && (
//                     <Check className="w-4 h-4 text-primary" />
//                   )}
//                 </button>
//               ))}
//             </div>

//             {/* Exchange Rate Info */}
//             <div className="border-t border-border p-3">
//               <div className="text-xs text-muted-foreground">
//                 {isRTL
//                   ? "سعر الصرف (نسبة إلى الدولار):"
//                   : "Exchange Rate (vs IQD):"}
//               </div>
//               <div className="text-sm font-medium text-foreground mt-1">
//                 1 IQD = {currentCurrency.rate.toLocaleString()}{" "}
//                 {currentCurrency.code}
//               </div>
//             </div>
//           </div>
//         </>
//       )}
//     </div>
//   );
// };
