// import { useLanguage } from "@/contexts/LanguageContext";
// import { handlePaymentTermSelect } from "@/lib/products_function";
// import { ErrorMessage } from "formik";
// import { motion } from "framer-motion";
// import { CreditCard } from "lucide-react";




// export function PaymentTerms(props: {
//   values: any;
//   setFieldValue: any;
//     paymentTerms: any;
//   //  other: any;
// }) {
//   const {
//     values,
//     setFieldValue,
//      paymentTerms,
//     // other,
//   } = props;

//   const { isRTL } = useLanguage();

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ delay: 0.3 }}
//       className="bg-card border border-border rounded-xl p-4 sm:p-6"
//     >
//       {/* Payment Terms */}

//       <h2 className="text-xl font-semibold text-foreground mb-6">
//         {isRTL ? "شروط الدفع" : "Payment Terms"}
//       </h2>
//       <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
//         {paymentTerms.map((term) => (
//           <button
//             key={term.id}
//             type="button"
//             onClick={() => handlePaymentTermSelect(term, setFieldValue)}
//             className={`p-3 border rounded-lg text-left rtl:text-right transition-all ${
//               values.paymentTermId === term.id
//                 ? "border-primary bg-primary/10 text-primary"
//                 : "border-border hover:border-primary/50"
//             }`}
//           >
//             <div className="flex items-center space-x-2 rtl:space-x-reverse">
//               <CreditCard className="w-4 h-4" />
//               <div>
//                 <p className="font-medium text-sm">
//                   {isRTL ? term.nameAr : term.name}
//                 </p>
//                 <p className="text-xs text-muted-foreground">
//                   {term.days === 0
//                     ? isRTL
//                       ? "فوري"
//                       : "Immediate"
//                     : `${term.days} ${isRTL ? "أيام" : "days"}`}
//                 </p>
//               </div>
//             </div>
//           </button>
//         ))}
//       </div>

//       <ErrorMessage
//         name="paymentTermId"
//         component="div"
//         className="text-destructive text-sm mt-1"
//       />
//     </motion.div>
//   );
// };