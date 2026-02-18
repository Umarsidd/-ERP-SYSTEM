import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Plus, Save, Target } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Loading } from "@/components/common/loading";
import {
  AccountNode,
  addCostCenterOrTreeAccountsData,
  loadCostCenterOrTreeAccountsData,
  saveAdd,
  startAdd,
  subTreeFun,
} from "@/lib/accounts_function";
import { AccountCompactForm } from "@/components/account/AccountCompactForm";
import { AccountsNode } from "@/components/account/AccountsNode";


export default function CostCenters() {
  const [tree, setTree] = useState<AccountNode[]>();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [addingUnder, setAddingUnder] = useState<string | null>(null);
  const [rootAddOpen, setRootAddOpen] = useState(false);
  const { isRTL } = useLanguage();
  const [isLoading, setIsLoading] = useState(true);
  const [updateId, setUpdateId] = useState<string | null>(null);

  var subTree: AccountNode[] = [];

  useEffect(() => {
    loadCostCenterOrTreeAccountsData(setIsLoading, setTree, setUpdateId, "cost_centers");
  }, []);

  if (isLoading) {
    return <Loading title={isRTL ? "جاري التحميل ..." : "Loading..."} />;
  }

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col space-y-4 p-6 bg-gray-50">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-50 rounded-lg">
            <Target className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">
              {isRTL ? "مراكز التكلفة" : "Cost Centers"}
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {isRTL
                ? "إدارة وتنظيم مراكز التكلفة للمشروع"
                : "Manage and organize project cost centers"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() =>
              startAdd(null, setAddingUnder, setEditingId, setRootAddOpen)
            }
            type="button"
            variant="outline"
          >
            <Plus className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0" />
            {isRTL ? "إضافة مركز تكلفة" : "Add Cost Center"}
          </Button>
          <Button
            disabled={isLoading}
            onClick={async () => {
              subTreeFun(tree, subTree);

              await addCostCenterOrTreeAccountsData(
                tree,
                setIsLoading,
                setTree,
                subTree,
                "cost_centers",
                setUpdateId,
                updateId,
              );
            }}
          >
            {isLoading && (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
            )}
            <Save className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0" />
            {isRTL ? "حفظ" : "Save"}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden flex flex-col">
        {/* Info Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <p className="text-sm text-gray-600">
            {isRTL
              ? "هنا يمكنك تنظيم مراكز التكلفة، إضافة وتحرير وحذف مراكز التكلفة بسهولة"
              : "Organize your cost centers here — add, edit or remove cost centers."}
          </p>
        </div>

        {/* Tree Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-2">
            {tree && tree.length > 0 ? (
              tree.map((node) => (
                <AccountsNode
                  key={node.id}
                  node={node}
                  expanded={expanded}
                  setExpanded={setExpanded}
                  setAddingUnder={setAddingUnder}
                  setEditingId={setEditingId}
                  setTree={setTree}
                  addingUnder={addingUnder}
                  editingId={editingId}
                  setRootAddOpen={setRootAddOpen}
                />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <Target className="w-16 h-16 mb-4 opacity-20" />
                <h3 className="text-lg font-medium text-gray-500 mb-2">
                  {isRTL ? "لا توجد مراكز تكلفة" : "No Cost Centers"}
                </h3>
                <p className="text-sm text-gray-400">
                  {isRTL
                    ? "ابدأ بإضافة مركز تكلفة جديد"
                    : "Start by adding a new cost center"}
                </p>
              </div>
            )}
          </div>

          {/* Add Root Form */}
          {addingUnder === null && rootAddOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200"
            >
              <AccountCompactForm
                initial={{ accountType: "main", balanceType: "debit" }}
                onCancel={() => setRootAddOpen(false)}
                onSave={(payload) =>
                  saveAdd(
                    null,
                    payload,
                    setTree,
                    setAddingUnder,
                    setRootAddOpen,
                    setExpanded,
                  )
                }
              />
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
