import React, { useEffect, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { CostCenterTree, CostCenterNode } from "./CostCenterTree";
import { CostCenterForm } from "./CostCenterForm";
import {
    AccountNode,
    loadCostCenterOrTreeAccountsData,
    addCostCenterOrTreeAccountsData,
    findNode,
    updateNode,
    removeNode,
    flattenTree,
    generateNextCode,
    getLevelFromCode
} from "@/lib/accounts_function";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import Swal from "sweetalert2";

export default function CostCenters() {
    const { isRTL } = useLanguage();
    const [treeData, setTreeData] = useState<CostCenterNode[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [updateId, setUpdateId] = useState<string | null>(null);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<"add" | "edit">("add");
    const [editingNode, setEditingNode] = useState<CostCenterNode | null>(null);
    const [addingParentId, setAddingParentId] = useState<string | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        loadCostCenterOrTreeAccountsData(
            setIsLoading,
            setTreeData,
            setUpdateId,
            "cost_centers"
        );
    };

    const saveData = async (newData: CostCenterNode[]) => {
        // Generate flat list for meta/subtree if needed, but the current API function
        // expects the full tree in 'main' and maybe a subtree in 'meta'.
        // subTreeFun in accounts_function seems to generate a list of sub-accounts.

        // For Cost Centers, we can just save the tree. 
        // We'll pass [] for subtree for now as we might not need separate sub-account tracking like Chart of Accounts.

        await addCostCenterOrTreeAccountsData(
            newData,
            setIsLoading,
            setTreeData,
            [], // Subtree - can be empty or flattened tree if needed for searching
            "cost_centers",
            setUpdateId,
            updateId
        );
    };

    const handleAddRoot = () => {
        setModalMode("add");
        setAddingParentId(null);
        setEditingNode(null);
        setIsModalOpen(true);
    };

    const handleAddSub = (parentId: string) => {
        setModalMode("add");
        setAddingParentId(parentId);
        setEditingNode(null);
        setIsModalOpen(true);
    };

    const handleEdit = (node: CostCenterNode) => {
        setModalMode("edit");
        setEditingNode(node);
        setAddingParentId(node.parentId);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        // Check if node has children
        const node = findNode(treeData, id);
        if (node && node.children && node.children.length > 0) {
            Swal.fire({
                icon: "error",
                title: isRTL ? "خطأ" : "Error",
                text: isRTL ? "لا يمكن حذف مركز تكلفة يحتوي على مراكز فرعية" : "Cannot delete a cost center with sub-centers",
            });
            return;
        }

        // Confirm delete
        const result = await Swal.fire({
            title: isRTL
                ? "هل أنت متأكد من حذف هذا العنصر؟"
                : "Are you sure you want to delete this item?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: isRTL ? "حذف" : "Delete",
            cancelButtonText: isRTL ? "إلغاء" : "Cancel",
            confirmButtonColor: "#d33",
        });

        if (result.isConfirmed) {
            const newTree = removeNode(treeData, id);
            setTreeData(newTree);
            saveData(newTree);
        }
    };

    const handleFormSubmit = (values: any) => {
        let newTree = [...treeData];

        if (modalMode === "add") {
            const newNode: CostCenterNode = {
                id: crypto.randomUUID(),
                code: values.code,
                name: values.name,
                nameAr: values.nameAr,
                description: values.description,
                status: values.status,
                parentId: addingParentId,
                level: addingParentId ? (findNode(treeData, addingParentId)?.level || 0) + 1 : 1,
                children: [],
                accountType: "sub", // Treat all as sub for simplicity or differentiate if needed
            };

            if (addingParentId) {
                newTree = updateNode(newTree, addingParentId, (node) => ({
                    ...node,
                    children: [...(node.children || []), newNode],
                }));
            } else {
                newTree.push(newNode);
            }
        } else if (modalMode === "edit" && editingNode) {
            newTree = updateNode(newTree, editingNode.id, (node) => ({
                ...node,
                ...values,
            }));
        }

        setTreeData(newTree);
        saveData(newTree);
        setIsModalOpen(false);
    };

    const getParentName = () => {
        if (addingParentId) {
            const parent = findNode(treeData, addingParentId);
            return parent ? (isRTL ? parent.nameAr || parent.name : parent.name) : "";
        }
        return undefined;
    };

    // Generate initial code for new items based on basic logic
    const getInitialValues = () => {
        if (modalMode === "edit" && editingNode) {
            return {
                name: editingNode.name,
                nameAr: editingNode.nameAr || "",
                code: editingNode.code,
                description: editingNode.description || "",
                status: editingNode.status || "active",
            };
        }

        // Logic to suggest next code could be added here
        // For now, empty
        return {
            name: "",
            nameAr: "",
            code: "",
            description: "",
            status: "active",
        };
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        {isRTL ? "مراكز التكلفة" : "Cost Centers"}
                    </h1>
                    <p className="text-muted-foreground text-sm">
                        {isRTL
                            ? "إدارة هيكل مراكز التكلفة الخاصة بك"
                            : "Manage your cost center hierarchy"}
                    </p>
                </div>
                <Button onClick={handleAddRoot} className="w-full sm:w-auto">
                    <Plus className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0" />
                    {isRTL ? "إضافة مركز رئيسي" : "Add Main Cost Center"}
                </Button>
            </div>

            <div className="bg-card border rounded-xl shadow-sm">
                <div className="p-4 border-b">
                    <div className="relative">
                        <Search className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input
                            placeholder={isRTL ? "بحث..." : "Search..."}
                            className="pl-10 rtl:pl-4 rtl:pr-10"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="p-4">
                    {isLoading ? (
                        <div className="text-center py-8 text-muted-foreground">
                            {isRTL ? "جاري التحميل..." : "Loading..."}
                        </div>
                    ) : treeData.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <p>{isRTL ? "لا توجد مراكز تكلفة بعد" : "No cost centers found"}</p>
                            <Button variant="link" onClick={handleAddRoot}>
                                {isRTL ? "أضف أول مركز تكلفة" : "Add your first cost center"}
                            </Button>
                        </div>
                    ) : (
                        <CostCenterTree
                            data={treeData.filter(node =>
                                node.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                node.code.includes(searchQuery) ||
                                (node.nameAr && node.nameAr.includes(searchQuery))
                            )}
                            onSelect={(node) => console.log("Selected", node)}
                            onAdd={handleAddSub}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                        />
                    )}
                </div>
            </div>

            <CostCenterForm
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleFormSubmit}
                initialValues={getInitialValues()}
                mode={modalMode}
                parentName={getParentName()}
            />
        </div>
    );
}
