import React, { useState } from "react";
import { AccountNode } from "@/lib/accounts_function";
import { motion, AnimatePresence } from "framer-motion";
import {
    ChevronRight,
    ChevronDown,
    Folder,
    FileText,
    Plus,
    MoreHorizontal,
    Edit,
    Trash2,
    FolderOpen,
    Layers,
    LayoutGrid
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { DEFTRA_SPACING } from "@/lib/accountsTheme";

// Reusing AccountNode for simplicity as the structure is compatible
// We might want to define a specific CostCenterNode if divergence increases
export type CostCenterNode = AccountNode;

interface CostCenterTreeProps {
    data: CostCenterNode[];
    onSelect: (node: CostCenterNode) => void;
    onAdd: (parentId: string) => void;
    onEdit: (node: CostCenterNode) => void;
    onDelete: (id: string) => void;
    selectedId?: string | null;
    level?: number;
}

export const CostCenterTree: React.FC<CostCenterTreeProps> = ({
    data,
    onSelect,
    onAdd,
    onEdit,
    onDelete,
    selectedId,
    level = 0
}) => {
    const { isRTL } = useLanguage();

    return (
        <div className={cn(
            "flex flex-col space-y-0.5",
            level > 0 && (isRTL ? "pr-5 border-r border-gray-200" : "pl-5 border-l border-gray-200")
        )}>
            {data.map((node) => (
                <TreeNode
                    key={node.id}
                    node={node}
                    onSelect={onSelect}
                    onAdd={onAdd}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    selectedId={selectedId}
                    level={level}
                />
            ))}
        </div>
    );
};

const TreeNode: React.FC<{
    node: CostCenterNode;
    onSelect: (node: CostCenterNode) => void;
    onAdd: (parentId: string) => void;
    onEdit: (node: CostCenterNode) => void;
    onDelete: (id: string) => void;
    selectedId?: string | null;
    level: number;
}> = ({ node, onSelect, onAdd, onEdit, onDelete, selectedId, level }) => {
    const [isOpen, setIsOpen] = useState(false);
    const { isRTL } = useLanguage();
    const hasChildren = node.children && node.children.length > 0;
    const isSelected = selectedId === node.id;

    const handleToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsOpen(!isOpen);
    };

    const handleSelect = () => {
        onSelect(node);
    };

    return (
        <div className="relative">
            <motion.div
                initial={false}
                whileHover={{ backgroundColor: isSelected ? undefined : 'rgb(249 250 251)' }}
                transition={{ duration: 0.15 }}
                className={cn(
                    "group flex items-center justify-between rounded-md cursor-pointer",
                    "transition-all duration-150",
                    isSelected
                        ? "bg-blue-50 shadow-sm border border-blue-200"
                        : "border border-transparent hover:border-gray-200"
                )}
                style={{
                    padding: `${DEFTRA_SPACING.sm} ${DEFTRA_SPACING.md}`,
                }}
                onClick={handleSelect}
            >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                    {/* Expand/Collapse Button */}
                    <button
                        className={cn(
                            "p-0.5 rounded hover:bg-gray-200 transition-colors flex-shrink-0",
                            !hasChildren && "invisible"
                        )}
                        onClick={handleToggle}
                        type="button"
                    >
                        {isOpen ? (
                            <ChevronDown className="w-4 h-4 text-gray-600" />
                        ) : (
                            <ChevronRight className={cn("w-4 h-4 text-gray-600", isRTL && "rotate-180")} />
                        )}
                    </button>

                    {/* Icon */}
                    {hasChildren || node.accountType === 'main' ? (
                        isOpen ? (
                            <FolderOpen className={cn("w-4 h-4 flex-shrink-0 text-blue-600")} />
                        ) : (
                            <Folder className={cn("w-4 h-4 flex-shrink-0 text-blue-600")} />
                        )
                    ) : (
                        <Layers className={cn("w-4 h-4 flex-shrink-0 text-gray-500")} />
                    )}

                    {/* Cost Center Info */}
                    <div className="flex flex-col flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <span className={cn(
                                "text-sm font-medium truncate",
                                isSelected ? 'text-blue-900' : 'text-gray-900'
                            )}>
                                {isRTL ? node.nameAr || node.name : node.name}
                            </span>
                            {node.status === "inactive" && (
                                <Badge variant="secondary" className="text-[10px] px-1 h-4 bg-gray-100 text-gray-500">
                                    {isRTL ? "غير نشط" : "Inactive"}
                                </Badge>
                            )}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                            {/* Code */}
                            <span className="text-xs text-gray-500 font-mono">
                                {node.code}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Actions Dropdown */}
                <div className={cn(
                    "flex items-center transition-opacity duration-150",
                    isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                )}>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 hover:bg-gray-200"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <MoreHorizontal className="w-4 h-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align={isRTL ? "start" : "end"} className="w-48">
                            <DropdownMenuItem onClick={() => onAdd(node.id)}>
                                <Plus className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0" />
                                {isRTL ? "إضافة مركز فرعي" : "Add Sub Cost Center"}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onEdit(node)}>
                                <Edit className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0" />
                                {isRTL ? "تعديل" : "Edit"}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => onDelete(node.id)}
                                className="text-red-600 focus:text-red-600 focus:bg-red-50"
                            >
                                <Trash2 className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0" />
                                {isRTL ? "حذف" : "Delete"}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </motion.div>

            {/* Children */}
            <AnimatePresence initial={false}>
                {isOpen && hasChildren && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{
                            duration: 0.2,
                            ease: "easeInOut"
                        }}
                        className="overflow-hidden"
                    >
                        <div className="mt-0.5">
                            <CostCenterTree
                                data={node.children!}
                                onSelect={onSelect}
                                onAdd={onAdd}
                                onEdit={onEdit}
                                onDelete={onDelete}
                                selectedId={selectedId}
                                level={level + 1}
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
