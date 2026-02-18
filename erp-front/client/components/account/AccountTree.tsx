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
    TrendingUp,
    TrendingDown,
    FolderOpen,
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
import { getCategoryByCode, getCategoryColor } from "@/lib/AccountGuideDefaults";
import { DEFTRA_COLORS, DEFTRA_SPACING, DEFTRA_TRANSITIONS } from "@/lib/accountsTheme";

interface AccountTreeProps {
    data: AccountNode[];
    onSelect: (node: AccountNode) => void;
    onAdd: (parentId: string) => void;
    onDelete: (id: string) => void;
    selectedId?: string | null;
    level?: number;
}

export const AccountTree: React.FC<AccountTreeProps> = ({
    data,
    onSelect,
    onAdd,
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
                    onDelete={onDelete}
                    selectedId={selectedId}
                    level={level}
                />
            ))}
        </div>
    );
};

const TreeNode: React.FC<{
    node: AccountNode;
    onSelect: (node: AccountNode) => void;
    onAdd: (parentId: string) => void;
    onDelete: (id: string) => void;
    selectedId?: string | null;
    level: number;
}> = ({ node, onSelect, onAdd, onDelete, selectedId, level }) => {
    const [isOpen, setIsOpen] = useState(false);
    const { isRTL } = useLanguage();
    const hasChildren = node.children && node.children.length > 0;
    const isSelected = selectedId === node.id;
    const category = getCategoryByCode(node.code);
    const categoryColor = getCategoryColor(node.code);

    const handleToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsOpen(!isOpen);
    };

    const handleSelect = () => {
        onSelect(node);
    };

    // Get category-specific styling
    const getCategoryStyles = () => {
        const categoryCode = node.code.charAt(0);
        switch (categoryCode) {
            case '1': // Assets
                return { iconColor: 'text-blue-600', badgeBg: 'bg-blue-50', badgeText: 'text-blue-700' };
            case '2': // Liabilities
                return { iconColor: 'text-red-600', badgeBg: 'bg-red-50', badgeText: 'text-red-700' };
            case '3': // Equity
                return { iconColor: 'text-purple-600', badgeBg: 'bg-purple-50', badgeText: 'text-purple-700' };
            case '4': // Revenue
                return { iconColor: 'text-green-600', badgeBg: 'bg-green-50', badgeText: 'text-green-700' };
            case '5': // Expenses
                return { iconColor: 'text-orange-600', badgeBg: 'bg-orange-50', badgeText: 'text-orange-700' };
            default:
                return { iconColor: 'text-gray-500', badgeBg: 'bg-gray-50', badgeText: 'text-gray-700' };
        }
    };

    const categoryStyles = getCategoryStyles();

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
                    {node.accountType === 'main' ? (
                        isOpen ? (
                            <FolderOpen className={cn("w-4 h-4 flex-shrink-0", isSelected ? 'text-blue-600' : categoryStyles.iconColor)} />
                        ) : (
                            <Folder className={cn("w-4 h-4 flex-shrink-0", isSelected ? 'text-blue-600' : categoryStyles.iconColor)} />
                        )
                    ) : (
                        <FileText className={cn("w-4 h-4 flex-shrink-0", isSelected ? 'text-blue-600' : 'text-gray-400')} />
                    )}

                    {/* Account Info */}
                    <div className="flex flex-col flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <span className={cn(
                                "text-sm font-medium truncate",
                                isSelected ? 'text-blue-900' : 'text-gray-900'
                            )}>
                                {isRTL ? node.nameAr || node.name : node.name}
                            </span>
                            {/* Category Badge - Only for top-level */}
                            {node.code.length === 1 && category && (
                                <Badge
                                    variant="outline"
                                    className={cn(
                                        "text-xs px-1.5 py-0 font-medium border-0",
                                        categoryStyles.badgeBg,
                                        categoryStyles.badgeText
                                    )}
                                >
                                    {isRTL ? category.nameAr : category.name}
                                </Badge>
                            )}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                            {/* Account Code */}
                            <span className="text-xs text-gray-500 font-mono">
                                {node.code}
                            </span>
                            {/* Balance Type Badge */}
                            {node.balanceType && (
                                <Badge
                                    variant="secondary"
                                    className="text-xs px-1.5 py-0 bg-gray-100 text-gray-700 font-normal"
                                >
                                    {node.balanceType === 'debit' ? (
                                        <span className="flex items-center gap-1">
                                            <TrendingDown className="w-3 h-3" />
                                            {isRTL ? 'مدين' : 'Dr'}
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-1">
                                            <TrendingUp className="w-3 h-3" />
                                            {isRTL ? 'دائن' : 'Cr'}
                                        </span>
                                    )}
                                </Badge>
                            )}
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
                            {node.accountType === 'main' && (
                                <DropdownMenuItem onClick={() => onAdd(node.id)}>
                                    <Plus className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0" />
                                    {isRTL ? "إضافة حساب فرعي" : "Add Sub Account"}
                                </DropdownMenuItem>
                            )}
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
                            <AccountTree
                                data={node.children!}
                                onSelect={onSelect}
                                onAdd={onAdd}
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
