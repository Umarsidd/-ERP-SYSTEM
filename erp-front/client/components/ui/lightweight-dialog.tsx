import React, { useEffect, useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface LightweightDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  className?: string;
}

interface LightweightDialogContentProps {
  children: React.ReactNode;
  className?: string;
}

interface LightweightDialogHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface LightweightDialogTitleProps {
  children: React.ReactNode;
  className?: string;
}

// Main Dialog Component - Lightweight and Non-Blocking
export function LightweightDialog({
  open,
  onOpenChange,
  children,
  className,
}: LightweightDialogProps) {
  const [isVisible, setIsVisible] = useState(false);

  // Memoize the escape handler to prevent recreation
  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onOpenChange(false);
      }
    },
    [onOpenChange],
  );

  // FIRST useEffect - handles open/close state
  useEffect(() => {
    if (open) {
      // Use requestAnimationFrame to prevent blocking
      requestAnimationFrame(() => {
        setIsVisible(true);
      });
    } else {
      setIsVisible(false);
    }
  }, [open]);

  // SECOND useEffect - handles keyboard and body overflow
  // This MUST be called every render to maintain hooks order
  useEffect(() => {
    if (isVisible) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    } else {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isVisible, handleEscape]);

  // Early return AFTER all hooks are called
  if (!open && !isVisible) {
    return null;
  }

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      //   onOpenChange(false);
    }
  };

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center",
        "bg-black/50 backdrop-blur-sm",
        "transition-opacity duration-200",
        isVisible ? "opacity-100" : "opacity-0",
        className,
      )}
      onClick={handleOverlayClick}
      style={{
        pointerEvents: isVisible ? "auto" : "none",
        display: open ? "flex" : "none",
      }}
    >
      <div
        className={cn(
          "relative transform transition-all duration-200",
          isVisible ? "scale-100 opacity-100" : "scale-95 opacity-0",
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

// Dialog Content - Optimized for Performance
export function LightweightDialogContent({
  children,
  className,
}: LightweightDialogContentProps) {
  return (
    <div
      className={cn(
        "relative bg-white dark:bg-slate-900 rounded-lg shadow-xl",
        "border border-slate-200 dark:border-slate-700",
        "max-h-[90vh] overflow-y-auto",
        "min-w-[300px] max-w-[90vw]",
        "p-6",
        className,
      )}
    >
      {children}
    </div>
  );
}

// Dialog Header
export function LightweightDialogHeader({
  children,
  className,
}: LightweightDialogHeaderProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between mb-4 pb-4",
        "border-b border-slate-200 dark:border-slate-700",
        className,
      )}
    >
      {children}
    </div>
  );
}

// Dialog Title
export function LightweightDialogTitle({
  children,
  className,
}: LightweightDialogTitleProps) {
  return (
    <h2
      className={cn(
        "text-xl font-semibold text-slate-900 dark:text-slate-100",
        className,
      )}
    >
      {children}
    </h2>
  );
}

// Close Button Component
export function LightweightDialogClose({
  onClose,
  className,
}: {
  onClose: () => void;
  className?: string;
}) {
  return (
    <button
      onClick={onClose}
      className={cn(
        "absolute top-4 right-4 p-2 rounded-full",
        "hover:bg-slate-100 dark:hover:bg-slate-800",
        "transition-colors duration-200",
        "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200",
        className,
      )}
    >
      <X className="w-4 h-4" />
    </button>
  );
}

// Quick Dialog Hook for Simple Use Cases
export function useLightweightDialog() {
  const [isOpen, setIsOpen] = useState(false);

  const openDialog = useCallback(() => setIsOpen(true), []);
  const closeDialog = useCallback(() => setIsOpen(false), []);
  const toggleDialog = useCallback(() => setIsOpen(!isOpen), [isOpen]);

  return {
    isOpen,
    openDialog,
    closeDialog,
    toggleDialog,
  };
}

export default LightweightDialog;


// <AnimatePresence>
//   {editingRole && (
//     <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
//       <motion.div
//         initial={{ opacity: 0, scale: 0.95 }}
//         animate={{ opacity: 1, scale: 1 }}
//         exit={{ opacity: 0, scale: 0.95 }}
//         className="bg-background rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-xl"
//       >
//         <div className="bg-gradient-to-r from-primary/5 to-primary/10 border-b p-6 flex items-start justify-between">
//           <div>
//             <h2 className="text-2xl font-semibold text-foreground flex items-center gap-2">
//               <ShieldCheck className="w-6 h-6 text-primary" />
//               {isRTL ? editingRole.nameAr : editingRole.name}
//             </h2>
//             <p className="text-muted-foreground mt-1">
//               {isRTL ? editingRole.descriptionAr : editingRole.description}
//             </p>
//           </div>
//           <button
//             onClick={() => setEditingRoleId(null)}
//             className="text-muted-foreground hover:text-foreground transition-colors"
//           >
//             <X className="w-6 h-6" />
//           </button>
//         </div>

//         <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
//           <div className="flex-1 border-b md:border-b-0 md:border-r overflow-y-auto">
//             <div className="p-4 border-b bg-muted/30">
//               <h3 className="font-semibold text-foreground mb-3">
//                 {isRTL ? "العمليات" : "Operations"}
//               </h3>
//               <div className="flex gap-2">
//                 <Button
//                   size="sm"
//                   variant="outline"
//                   className="text-xs flex-1"
//                   onClick={() =>
//                     selectAllOperations(editingRole.id, selectedSection)
//                   }
//                 >
//                   {isRTL ? "تحديد الكل" : "Select All"}
//                 </Button>
//                 <Button
//                   size="sm"
//                   variant="outline"
//                   className="text-xs flex-1"
//                   onClick={() =>
//                     clearAllOperations(editingRole.id, selectedSection)
//                   }
//                 >
//                   {isRTL ? "مسح الكل" : "Clear All"}
//                 </Button>
//               </div>
//             </div>

//             <div className="p-4 space-y-2">
//               {sectionData.operations.map((operation) => {
//                 const isChecked = currentPermissions[operation] || false;
//                 const opTranslation = operationTranslations[operation];

//                 return (
//                   <label
//                     key={operation}
//                     className="flex items-center gap-3 p-3 rounded-lg border border-input hover:bg-muted/50 cursor-pointer transition-colors"
//                   >
//                     <input
//                       type="checkbox"
//                       checked={isChecked}
//                       onChange={(e) =>
//                         handlePermissionChange(
//                           editingRole.id,
//                           selectedSection,
//                           operation,
//                           e.target.checked,
//                         )
//                       }
//                       className="w-4 h-4 rounded border-border bg-background cursor-pointer accent-primary"
//                     />
//                     <div className="flex-1 min-w-0">
//                       <p className="text-sm font-medium text-foreground">
//                         {isRTL ? opTranslation.nameAr : opTranslation.name}
//                       </p>
//                     </div>
//                     {isChecked && (
//                       <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
//                     )}
//                   </label>
//                 );
//               })}
//             </div>
//           </div>

//           <div className="w-full md:w-64 overflow-y-auto bg-muted/20">
//             <div className="p-4 border-b bg-muted/30 sticky top-0">
//               <h3 className="font-semibold text-foreground">
//                 {isRTL ? "الأقسام" : "Sections"}
//               </h3>
//             </div>
//             <div className="p-2 space-y-1">
//               {Object.entries(siteSections).map(([sectionKey, section]) => {
//                 const isSelected = selectedSection === sectionKey;
//                 return (
//                   <button
//                     key={sectionKey}
//                     onClick={() => setSelectedSection(sectionKey)}
//                     className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center gap-3 ${
//                       isSelected
//                         ? "bg-primary text-primary-foreground"
//                         : "hover:bg-muted/50 text-foreground"
//                     }`}
//                   >
//                     <span className="text-lg flex-shrink-0">
//                       {section.icon}
//                     </span>
//                     <div className="min-w-0 flex-1">
//                       <p className="font-medium text-sm truncate">
//                         {isRTL ? section.nameAr : section.name}
//                       </p>
//                       <p className="text-xs opacity-70">
//                         {section.operations.length}{" "}
//                         {isRTL ? "عمليات" : "operations"}
//                       </p>
//                     </div>
//                   </button>
//                 );
//               })}
//             </div>
//           </div>
//         </div>

//         <div className="border-t p-4 bg-muted/20 flex justify-end gap-3">
//           <Button variant="outline" onClick={() => setEditingRoleId(null)}>
//             {isRTL ? "إغلاق" : "Close"}
//           </Button>
//           <Button onClick={() => setEditingRoleId(null)} className="gap-2">
//             <Save className="w-4 h-4" />
//             {isRTL ? "حفظ الصلاحيات" : "Save Permissions"}
//           </Button>
//         </div>
//       </motion.div>
//     </div>
//   )}
// </AnimatePresence>;