import { AccountNode, confirmDelete, saveAdd, saveEdit, startAdd, startEdit, toggle } from "@/lib/accounts_function";
import { motion } from "framer-motion";
import { BookOpen, ChevronDown, ChevronRight, Edit, Folder, Plus, Trash2 } from "lucide-react";
import { AccountIcon } from "./AccountIcon";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "../ui/button";
import { AccountCompactForm } from "./AccountCompactForm";



export function AccountsNode({
  node,
  level = 0,
  expanded,
  setExpanded,
  setAddingUnder,
  setEditingId,
  setTree,
  addingUnder,
  editingId,
  setRootAddOpen,
}: {
  node: AccountNode;
  level?: number;
  expanded: Record<string, boolean>;
  setExpanded: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  setAddingUnder: React.Dispatch<React.SetStateAction<string | null>>;
  setEditingId: React.Dispatch<React.SetStateAction<string | null>>;
  setTree: React.Dispatch<React.SetStateAction<AccountNode[]>>;
  addingUnder: string | null;
  editingId: string | null;
  setRootAddOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const isOpen = !!expanded[node.id];
  const { isRTL } = useLanguage();

  return (
    <div className="mt-2">
      <motion.div
        // initial={{ opacity: 0, y: -6 }}
        // animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between gap-3"
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => toggle(node.id, setExpanded)}
            className="flex items-center gap-2 text-muted-foreground"
            aria-expanded={isOpen}
            type="button"
          >
            {node.children && node.children.length ? (
              isOpen ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )
            ) : (
              <div className="w-4" />
            )}
            <AccountIcon accountType={node.accountType} />
            <div className="ml-1">
              <div className="font-semibold">
                {node.code} • {node.name}
              </div>
              <div className="text-xs text-muted-foreground text-start">
                {isRTL
                  ? node.accountType === "main"
                    ? "حساب رئيسي"
                    : "حساب فرعي"
                  : node.accountType === "main"
                    ? "Main Account"
                    : "Sub Account"}
              </div>
            </div>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {node.accountType === "main" && (
            <Button
              variant="link"
              size="sm"
              onClick={() =>
                startAdd(node.id, setAddingUnder, setEditingId, setRootAddOpen)
              }
              type="button"
            >
              <Plus className="w-4 h-4" />
              {/* <span className="hidden md:inline ml-">
                {isRTL ? "إضافة" : "Add"}
              </span> */}
            </Button>
          )}
          <Button
            variant="link"
            size="sm"
            onClick={() =>
              startEdit(node.id, setEditingId, setAddingUnder, setRootAddOpen)
            }
            type="button"
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant="link"
            size="sm"
            onClick={() =>
              confirmDelete(node.id, setTree, editingId, setEditingId, isRTL)
            }
            type="button"
          >
            <Trash2 className="w-4 h-4 text-destructive" />
          </Button>
        </div>
      </motion.div>

      {/* Inline Add Form for this node */}

      {addingUnder === node.id && (
        <motion.div
          // initial={{ opacity: 0 }}
          // animate={{ opacity: 1 }}
          // exit={{ opacity: 0 }}
          className="mt-2 p-3 bg-muted/5 rounded"
        >
          <AccountCompactForm
            initial={{ accountType: "sub", balanceType: "debit" }}
            onCancel={() => setAddingUnder(null)}
            onSave={(payload) =>
              saveAdd(
                node.id,
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

      {/* Inline Edit Form for this node */}

      {editingId === node.id && (
        <motion.div
          // initial={{ opacity: 0 }}
          // animate={{ opacity: 1 }}
          // exit={{ opacity: 0 }}
          className="mt-2 p-3 bg-muted/5 rounded"
        >
          <AccountCompactForm
            initial={{
              code: node.code,
              name: node.name,
              accountType: node.accountType || "sub",
              balanceType: node.balanceType || "debit",
            }}
            onCancel={() => setEditingId(null)}
            onSave={(payload) =>
              saveEdit(node.id, payload, setTree, setEditingId)
            }
          />
        </motion.div>
      )}

      {node.children && node.children.length > 0 && isOpen && (
        <motion.div
          // initial={{ height: 0, opacity: 0 }}
          // animate={
          //   isOpen
          //     ? { height: "auto", opacity: 1 }
          //     : { height: 0, opacity: 0 }
          // }
          className={`overflow-hidden ${isRTL ? "mr-4" : "ml-4"}`}
        >
          {node.children.map((c) => (
            <AccountsNode
              key={c.id}
              node={c}
              level={level + 1}
              expanded={expanded}
              setExpanded={setExpanded}
              setAddingUnder={setAddingUnder}
              setEditingId={setEditingId}
              setTree={setTree}
              addingUnder={addingUnder}
              editingId={editingId}
              setRootAddOpen={setRootAddOpen}
            />
          ))}
        </motion.div>
      )}
    </div>
  );
}