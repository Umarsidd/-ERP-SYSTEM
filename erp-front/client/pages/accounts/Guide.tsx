import React, { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Plus, Search, Save, Wallet, CreditCard, PieChart, TrendingUp, TrendingDown, FileText, AlertCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Loading } from "@/components/common/loading";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  AccountNode,
  loadCostCenterOrTreeAccountsData,
  searchAccounts,
  updateNode,
  confirmDelete
} from "@/lib/accounts_function";
import { LocalAccountsApi } from "@/lib/accounts_local_api";
import { AccountTree } from "@/components/account/AccountTree";
import { AccountDetail } from "@/components/account/AccountDetail";
import { DEFAULT_ACCOUNT_STRUCTURE, shouldInitializeDefaults, ACCOUNT_CATEGORIES } from "@/lib/AccountGuideDefaults";
import Swal from "sweetalert2";

export default function Guide() {
  const { isRTL } = useLanguage();
  const [tree, setTree] = useState<AccountNode[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // UI State
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [mode, setMode] = useState<"view" | "edit" | "create">("view");
  const [searchTerm, setSearchTerm] = useState("");
  const [parentIdForAdd, setParentIdForAdd] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Initial Load - Check Local Storage first
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);

      // 1. Try Local Storage
      const localData = LocalAccountsApi.getAccounts();

      if (localData && localData.length > 0) {
        setTree(localData);
        setIsLoading(false);
      } else {
        // 2. Fallback to API / Defaults (only on first ever load)
        await loadCostCenterOrTreeAccountsData(
          setIsLoading,
          (data: AccountNode[]) => {
            setTree(data);
            // Verify if defaults need to be added even after API load
            if (data.length > 0 && shouldInitializeDefaults(data)) {
              const mergedTree = [...DEFAULT_ACCOUNT_STRUCTURE];
              setTree(mergedTree);
              LocalAccountsApi.saveAccounts(mergedTree);
            } else {
              LocalAccountsApi.saveAccounts(data);
            }
          },
          () => { }, // setUpdateId - not needed for local only flow
          "accounts_guide"
        );
      }
    };

    loadData();
  }, []);

  // Sync to Local Storage whenever tree changes (Optional: could be done only on "Save")
  // For this requirement: "When 'Save Changes' is clicked... Persist to local storage"
  // So we will just track changes in state, and persist explicitly.

  const filteredTree = useMemo(() => {
    return searchAccounts(tree, searchTerm);
  }, [tree, searchTerm]);

  const selectedNode = useMemo(() => {
    if (!selectedNodeId) return null;
    const find = (nodes: AccountNode[]): AccountNode | null => {
      for (const node of nodes) {
        if (node.id === selectedNodeId) return node;
        if (node.children) {
          const found = find(node.children);
          if (found) return found;
        }
      }
      return null;
    };
    return find(tree);
  }, [tree, selectedNodeId]);

  const handleSelect = (node: AccountNode) => {
    setSelectedNodeId(node.id);
    setMode("edit");
    setParentIdForAdd(null);
  };

  const handleAdd = (parentId: string | null) => {
    setParentIdForAdd(parentId);
    setSelectedNodeId(null);
    setMode("create");
  };

  const handleDelete = (id: string) => {
    confirmDelete(id, (newTreeOrUpdater: any) => {
      // Handle both function updater and direct value for compatibility
      if (typeof newTreeOrUpdater === 'function') {
        setTree(prev => {
          const newData = newTreeOrUpdater(prev);
          LocalAccountsApi.saveAccounts(newData);
          return newData;
        });
      } else {
        setTree(newTreeOrUpdater);
        LocalAccountsApi.saveAccounts(newTreeOrUpdater);
      }
      Swal.fire({
        icon: 'success',
        title: isRTL ? "تم حذف الحساب" : "Account deleted",
        toast: true,
        position: isRTL ? 'top-start' : 'top-end',
        showConfirmButton: false,
        timer: 3000
      });
    }, selectedNodeId, setSelectedNodeId, isRTL);
  };

  const handleSaveNode = (node: AccountNode) => {
    let newTree: AccountNode[];
    if (mode === 'create') {
      if (parentIdForAdd) {
        newTree = updateNode(tree, parentIdForAdd, (n) => ({
          ...n,
          children: [...(n.children || []), node]
        }));
      } else {
        newTree = [...tree, node];
      }
    } else {
      newTree = updateNode(tree, node.id, (n) => ({ ...n, ...node }));
    }

    setTree(newTree);
    const success = LocalAccountsApi.saveAccounts(newTree);

    setMode("view");
    setSelectedNodeId(node.id);

    if (success) {
      Swal.fire({
        icon: 'success',
        title: isRTL ? "تم الحفظ بنجاح" : "Saved successfully",
        text: isRTL ? "تم تحديث الحساب وحفظه محلياً" : "Account updated and saved locally",
        toast: true,
        position: isRTL ? 'top-start' : 'top-end',
        showConfirmButton: false,
        timer: 3000
      });
    } else {
      Swal.fire({
        icon: 'error',
        title: isRTL ? "حدث خطأ" : "Error",
        text: isRTL ? "فشل الحفظ في التخزين المحلي" : "Failed to save to local storage",
        toast: true,
        position: isRTL ? 'top-start' : 'top-end',
        showConfirmButton: false,
        timer: 3000
      });
    }
  };

  const handleSaveChanges = async () => {
    const success = LocalAccountsApi.saveAccounts(tree);
    if (success) {
      setHasUnsavedChanges(false);
      Swal.fire({
        icon: 'success',
        title: isRTL ? "تم حفظ التغييرات بنجاح" : "Changes saved successfully",
        text: isRTL ? "تم تحديث البيانات في التخزين المحلي" : "Data persisted to local storage",
        toast: true,
        position: isRTL ? 'top-start' : 'top-end',
        showConfirmButton: false,
        timer: 3000
      });
    } else {
      Swal.fire({
        icon: 'error',
        title: isRTL ? "حدث خطأ أثناء الحفظ" : "Error saving changes",
        toast: true,
        position: isRTL ? 'top-start' : 'top-end',
        showConfirmButton: false,
        timer: 3000
      });
    }
  };

  // Calculate statistics
  const accountStats = useMemo(() => {
    const stats = {
      total: 0,
      byCategory: {} as Record<string, number>,
    };

    const countAccounts = (nodes: AccountNode[]) => {
      nodes.forEach((node) => {
        stats.total++;
        const categoryCode = node.code.charAt(0);
        stats.byCategory[categoryCode] = (stats.byCategory[categoryCode] || 0) + 1;
        if (node.children) {
          countAccounts(node.children);
        }
      });
    };

    countAccounts(tree);
    return stats;
  }, [tree]);

  if (isLoading) {
    return <Loading title={isRTL ? "جاري التحميل ..." : "Loading..."} />;
  }

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] md:h-[calc(100vh-100px)] lg:p-6 p-2 space-y-4 bg-gray-50 overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 flex items-center gap-2">
          {isRTL ? "دليل الحسابات" : "Chart of Accounts"}
          {hasUnsavedChanges && (
            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full border border-amber-200 flex items-center gap-1 font-normal">
              <AlertCircle className="w-3 h-3" />
              {isRTL ? "تغييرات غير محفوظة" : "Unsaved Changes"}
            </span>
          )}
        </h2>

        {/* Desktop Buttons */}
        <div className="hidden sm:flex items-center gap-2">
          <Button onClick={() => handleAdd(null)} variant="outline" size="sm" className="hidden md:flex">
            <Plus className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0" />
            {isRTL ? "إضافة حساب" : "Add Account"}
          </Button>
          <Button onClick={handleSaveChanges} disabled={!hasUnsavedChanges} variant={hasUnsavedChanges ? "default" : "secondary"}>
            <Save className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0" />
            {isRTL ? "حفظ التغييرات" : "Save Changes"}
          </Button>
        </div>
      </div>

      {/* Statistics Cards - Horizontal Scroll on Mobile */}
      <div className="flex overflow-x-auto pb-2 gap-3 shrink-0 scrollbar-hide">
        {/* Total Accounts Card */}
        <Card className="min-w-[140px] md:min-w-0 flex-1 p-3 md:p-4 bg-white border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg shrink-0">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-[10px] md:text-xs text-gray-500 font-medium whitespace-nowrap">
                {isRTL ? "إجمالي الحسابات" : "Total Accounts"}
              </div>
              <div className="text-xl md:text-2xl font-bold text-gray-900">{accountStats.total}</div>
            </div>
          </div>
        </Card>

        {/* Category Cards */}
        {ACCOUNT_CATEGORIES.map((category) => {
          const icons = { Wallet, CreditCard, PieChart, TrendingUp, TrendingDown };
          const IconComponent = icons[category.icon as keyof typeof icons];
          const categoryColorMap: Record<string, { bg: string; text: string; icon: string }> = {
            '1': { bg: 'bg-blue-50', text: 'text-blue-900', icon: 'text-blue-600' },
            '2': { bg: 'bg-red-50', text: 'text-red-900', icon: 'text-red-600' },
            '3': { bg: 'bg-purple-50', text: 'text-purple-900', icon: 'text-purple-600' },
            '4': { bg: 'bg-green-50', text: 'text-green-900', icon: 'text-green-600' },
            '5': { bg: 'bg-orange-50', text: 'text-orange-900', icon: 'text-orange-600' },
          };
          const colors = categoryColorMap[category.code];

          return (
            <Card key={category.code} className="min-w-[140px] md:min-w-0 flex-1 p-3 md:p-4 bg-white border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3">
                <div className={`p-2 ${colors.bg} rounded-lg shrink-0`}>
                  <IconComponent className={`w-5 h-5 ${colors.icon}`} />
                </div>
                <div>
                  <div className="text-[10px] md:text-xs text-gray-500 font-medium truncate w-[80px] md:w-auto">
                    {isRTL ? category.nameAr : category.name}
                  </div>
                  <div className={`text-xl md:text-2xl font-bold ${colors.text}`}>
                    {accountStats.byCategory[category.code] || 0}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Main Content - Responsive Grid */}
      <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-12 gap-4 pb-16 md:pb-0">

        {/* Left Panel: Tree View (Top on mobile) */}
        <div className={`
             col-span-1 md:col-span-5 flex flex-col bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden
             ${mode !== 'view' && selectedNode ? 'hidden md:flex' : 'flex'} 
             h-full
        `}>
          {/* Search Bar */}
          <div className="p-3 md:p-4 border-b border-gray-200 bg-gray-50 shrink-0">
            <div className="relative">
              <Search className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder={isRTL ? "بحث في الحسابات..." : "Search accounts..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`${isRTL ? "pr-10" : "pl-10"} bg-white border-gray-300 focus:ring-blue-500 focus:border-blue-500 h-9`}
              />
            </div>

            {/* Mobile Add Button (Visible only here on mobile) */}
            <div className="mt-2 md:hidden">
              <Button onClick={() => handleAdd(null)} variant="outline" size="sm" className="w-full">
                <Plus className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0" />
                {isRTL ? "إضافة حساب رئيسي" : "Add Main Account"}
              </Button>
            </div>
          </div>

          {/* Tree Content */}
          <div className="flex-1 overflow-y-auto p-2 md:p-3">
            {filteredTree.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <Search className="w-12 h-12 mb-3 opacity-30" />
                <p className="text-sm">
                  {isRTL ? "لا توجد نتائج للبحث" : "No accounts found"}
                </p>
              </div>
            ) : (
              <AccountTree
                data={filteredTree}
                onSelect={handleSelect}
                onAdd={handleAdd}
                onDelete={handleDelete}
                selectedId={selectedNodeId}
              />
            )}
          </div>
        </div>

        {/* Right Panel: Detail View (Bottom on mobile / Full screen if editing on mobile) */}
        <div className={`
            col-span-1 md:col-span-7 bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden flex flex-col
            ${mode === 'view' && !selectedNode ? 'hidden md:flex' : 'flex'}
            h-full
        `}>
          {mode === 'view' && !selectedNode ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 p-8">
              <div className="p-6 rounded-full bg-gray-50 mb-4">
                <FileText className="w-12 h-12 opacity-40" />
              </div>
              <h3 className="text-lg font-medium text-gray-600 mb-2">
                {isRTL ? "اختر حساباً" : "Select an Account"}
              </h3>
              <p className="text-sm text-gray-500 text-center">
                {isRTL
                  ? "اختر حساباً من القائمة لعرض التفاصيل أو قم بإضافة حساب جديد"
                  : "Select an account from the list to view details or add a new account"}
              </p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto relative flex flex-col">
              {/* Mobile Header for details */}
              <div className="md:hidden p-3 border-b flex items-center justify-between bg-gray-50">
                <span className="font-semibold text-gray-700">
                  {mode === 'create' ? (isRTL ? 'حساب جديد' : 'New Account') : (selectedNode?.name || 'Account Details')}
                </span>
                <Button variant="ghost" size="sm" onClick={() => {
                  setMode('view');
                  setSelectedNodeId(null);
                }}>
                  {isRTL ? 'رجوع' : 'Back'}
                </Button>
              </div>

              <div className="flex-1 overflow-hidden h-full">
                <AccountDetail
                  selectedNode={selectedNode}
                  mode={mode as "create" | "edit"}
                  onSave={handleSaveNode}
                  onCancel={() => {
                    setMode('view');
                    // On mobile, if we cancel, we likely want to go back to the tree if we were essentially "closing" the detail view
                    // But for now keeping desktop behavior of just switching mode
                  }}
                  parentId={parentIdForAdd}
                  tree={tree}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Sticky Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-3 bg-white border-t border-gray-200 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] md:hidden z-50 flex gap-2">
        <Button
          onClick={handleSaveChanges}
          disabled={!hasUnsavedChanges}
          className="flex-1"
          variant={hasUnsavedChanges ? "default" : "secondary"}
        >
          <Save className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0" />
          {isRTL ? "حفظ التغييرات" : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
