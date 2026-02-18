import React, { useState, useMemo, useRef, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Search, ChevronDown, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { AccountNode } from "@/lib/accounts_function";
import { getCategoryByCode, getCategoryColor } from "@/lib/AccountGuideDefaults";
import { Button } from "@/components/ui/button";

interface AccountGuideDropdownProps {
    accounts: AccountNode[];
    selectedAccountId?: string;
    onSelect: (account: AccountNode) => void;
    label?: string;
    placeholder?: string;
    filterByCategory?: string; // Filter accounts by category code (e.g., "5" for Expenses)
    className?: string;
}

export const AccountGuideDropdown: React.FC<AccountGuideDropdownProps> = ({
    accounts,
    selectedAccountId,
    onSelect,
    label,
    placeholder,
    filterByCategory,
    className,
}) => {
    const { isRTL } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);

    // Filter and search accounts
    const filteredAccounts = useMemo(() => {
        let filtered = accounts;

        // Filter by category if specified
        if (filterByCategory) {
            filtered = filtered.filter((acc) => acc.code.startsWith(filterByCategory));
        }

        // Search filter
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            const filterRecursive = (nodes: AccountNode[]): AccountNode[] => {
                return nodes.reduce((acc, node) => {
                    const matchesSearch =
                        node.name.toLowerCase().includes(searchLower) ||
                        node.nameAr?.toLowerCase().includes(searchLower) ||
                        node.code.includes(searchLower);

                    const filteredChildren = node.children ? filterRecursive(node.children) : [];

                    if (matchesSearch || filteredChildren.length > 0) {
                        acc.push({
                            ...node,
                            children: filteredChildren,
                        });
                    }

                    return acc;
                }, [] as AccountNode[]);
            };

            filtered = filterRecursive(filtered);
        }

        return filtered;
    }, [accounts, filterByCategory, searchTerm]);

    // Auto-expand nodes when searching
    useEffect(() => {
        if (searchTerm) {
            const getAllIds = (nodes: AccountNode[]): string[] => {
                let ids: string[] = [];
                nodes.forEach(node => {
                    if (node.children && node.children.length > 0) {
                        ids.push(node.id);
                        ids = [...ids, ...getAllIds(node.children)];
                    }
                });
                return ids;
            };
            setExpandedNodes(new Set(getAllIds(filteredAccounts)));
        }
    }, [searchTerm, filteredAccounts]);

    // Find selected account
    const selectedAccount = useMemo(() => {
        const findAccount = (nodes: AccountNode[]): AccountNode | null => {
            for (const node of nodes) {
                if (node.id === selectedAccountId) return node;
                if (node.children) {
                    const found = findAccount(node.children);
                    if (found) return found;
                }
            }
            return null;
        };
        return findAccount(accounts);
    }, [accounts, selectedAccountId]);

    const toggleNode = (nodeId: string) => {
        const newExpanded = new Set(expandedNodes);
        if (newExpanded.has(nodeId)) {
            newExpanded.delete(nodeId);
        } else {
            newExpanded.add(nodeId);
        }
        setExpandedNodes(newExpanded);
    };

    const handleSelect = (account: AccountNode) => {
        onSelect(account);
        setIsOpen(false);
        setSearchTerm("");
    };

    const handleClear = () => {
        onSelect(null as any);
        setSearchTerm("");
    };

    const renderAccountNode = (node: AccountNode, level: number = 0) => {
        const hasChildren = node.children && node.children.length > 0;
        const isExpanded = expandedNodes.has(node.id);
        const category = getCategoryByCode(node.code);
        const categoryColor = getCategoryColor(node.code);

        return (
            <div key={node.id}>
                <div
                    className={cn(
                        "flex items-center gap-2 px-3 py-2 hover:bg-muted cursor-pointer transition-colors",
                        selectedAccountId === node.id && "bg-primary/10"
                    )}
                    style={{ paddingLeft: isRTL ? "12px" : `${level * 16 + 12}px`, paddingRight: isRTL ? `${level * 16 + 12}px` : "12px" }}
                    onClick={() => handleSelect(node)}
                >
                    {hasChildren && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                toggleNode(node.id);
                            }}
                            className="p-0.5 hover:bg-muted rounded"
                        >
                            {isExpanded ? (
                                <ChevronDown className="w-3 h-3" />
                            ) : (
                                <ChevronRight className={cn("w-3 h-3", isRTL && "rotate-180")} />
                            )}
                        </button>
                    )}
                    {!hasChildren && <div className="w-4" />}

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium truncate">
                                {isRTL ? node.nameAr || node.name : node.name}
                            </span>
                            {node.code.length === 1 && category && (
                                <Badge variant="outline" className={cn("text-xs px-1.5 py-0", categoryColor, "text-white border-0")}>
                                    {isRTL ? category.nameAr : category.name}
                                </Badge>
                            )}
                        </div>
                        <div className="text-xs text-muted-foreground font-mono">{node.code}</div>
                    </div>
                </div>

                {hasChildren && isExpanded && (
                    <div>
                        {node.children!.map((child) => renderAccountNode(child, level + 1))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className={cn("relative", className)} ref={dropdownRef}>
            {label && <Label className="mb-2 block">{label}</Label>}

            <div className="relative">
                <div
                    className={cn(
                        "flex items-center gap-2 w-full px-3 py-2 bg-background border border-border rounded-lg cursor-pointer transition-all",
                        isOpen && "ring-2 ring-primary ring-offset-0"
                    )}
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <Search className="w-4 h-4 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                        {selectedAccount ? (
                            <div>
                                <div className="text-sm font-medium truncate">
                                    {isRTL ? selectedAccount.nameAr || selectedAccount.name : selectedAccount.name}
                                </div>
                                <div className="text-xs text-muted-foreground font-mono">{selectedAccount.code}</div>
                            </div>
                        ) : (
                            <span className="text-sm text-muted-foreground">
                                {placeholder || (isRTL ? "اختر حساب..." : "Select account...")}
                            </span>
                        )}
                    </div>
                    {selectedAccount && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleClear();
                            }}
                        >
                            <X className="w-3 h-3" />
                        </Button>
                    )}
                    <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform", isOpen && "rotate-180")} />
                </div>

                {isOpen && (
                    <div className="absolute z-50 w-full mt-1 bg-background border border-border rounded-lg shadow-lg max-h-80 overflow-hidden">
                        <div className="p-2 border-b border-border">
                            <Input
                                placeholder={isRTL ? "بحث..." : "Search..."}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="h-8"
                                autoFocus
                            />
                        </div>

                        <div className="overflow-y-auto max-h-64">
                            {filteredAccounts.length > 0 ? (
                                filteredAccounts.map((account) => renderAccountNode(account))
                            ) : (
                                <div className="p-4 text-center text-sm text-muted-foreground">
                                    {isRTL ? "لا توجد نتائج" : "No results found"}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
