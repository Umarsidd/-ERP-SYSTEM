import React, { useEffect, useMemo } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
    AccountNode,
    generateId,
    generateNextCode,
    validateAccountCode,
    flattenTree,
    findNode,
    AccountCategory,
    BALANCE_MAP,
    STATEMENT_MAP,
} from "@/lib/accounts_function";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
// import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AccountCategorySelect } from "./AccountCategorySelect";
// import { getCategoryByCode } from "@/lib/AccountGuideDefaults";
import { FileText, FolderPlus } from "lucide-react";

interface AccountDetailProps {
    selectedNode: AccountNode | null;
    onSave: (node: AccountNode) => void;
    onCancel: () => void;
    mode: "edit" | "create";
    parentId?: string | null;
    tree: AccountNode[]; // Added prop
}

export const AccountDetail: React.FC<AccountDetailProps> = ({
    selectedNode,
    onSave,
    onCancel,
    mode,
    parentId,
    tree = [], // Default to empty array if not provided
}) => {
    const { isRTL } = useLanguage();

    const flatAccounts = useMemo(() => flattenTree(tree), [tree]);
    const existingCodes = useMemo(() => flatAccounts.map(a => a.code).filter(c => c !== selectedNode?.code), [flatAccounts, selectedNode]);

    // Determine effective parent
    // If Creating: parentId is passed.
    // If Editing: selectedNode.parentId is the parent.
    const effectiveParentId = mode === 'create' ? (parentId || null) : selectedNode?.parentId;
    const parentNode = useMemo(() => effectiveParentId ? findNode(tree, effectiveParentId) : null, [tree, effectiveParentId]);

    // Calculate level: Parent Level + 1, or 1 if no parent
    const calculatedLevel = parentNode ? (parentNode.level + 1) : 1;

    const formik = useFormik({
        initialValues: {
            id: selectedNode?.id || "",
            code: selectedNode?.code || "",
            name: selectedNode?.name || "",
            nameAr: selectedNode?.nameAr || "",
            accountType: selectedNode?.accountType || "sub",
            // balanceType: selectedNode?.balanceType || "debit", // Deprecated in UI, mapped to normalBalance
            accountCategory: selectedNode?.accountCategory || (parentNode?.accountCategory) || "Asset",
            normalBalance: selectedNode?.normalBalance || (parentNode?.normalBalance) || "Debit",
            statementType: selectedNode?.statementType || (parentNode?.statementType) || "BalanceSheet",
            description: selectedNode?.description || "",
            status: selectedNode?.status || "active",
            // Helpers
            level: selectedNode?.level || calculatedLevel,
        } as any,
        enableReinitialize: true,
        validationSchema: Yup.object({
            name: Yup.string().required(isRTL ? "مطلوب" : "Required"),
            code: Yup.string()
                .required(isRTL ? "مطلوب" : "Required")
                .test('valid-code', isRTL ? "الكود غير صالح" : "Invalid Code", function (value) {
                    if (!value) return false;
                    const { isValid, message } = validateAccountCode(
                        value,
                        parentNode?.code || null,
                        calculatedLevel,
                        existingCodes
                    );
                    if (!isValid) {
                        return this.createError({ message: isRTL && message === "Code already exists" ? "الكود موجود مسبقاً" : message });
                    }
                    return true;
                }),
        }),
        onSubmit: (values) => {
            const newNode: AccountNode = {
                ...selectedNode, // Keep existing props
                id: values.id || generateId(),
                code: values.code,
                name: values.name,
                nameAr: values.nameAr,
                accountType: values.accountType,
                level: calculatedLevel,
                parentId: effectiveParentId || null,
                accountCategory: values.accountCategory,
                normalBalance: values.normalBalance,
                statementType: values.statementType,
                description: values.description,
                status: values.status,
                balanceType: values.normalBalance === 'Debit' ? 'debit' : 'credit', // Sync legacy field
                children: selectedNode?.children || [],
            };
            onSave(newNode);
        },
    });

    // Auto-generate code on mount or when parent changes if in create mode
    useEffect(() => {
        if (mode === 'create' && !formik.values.code) {
            // Find siblings
            let siblings: AccountNode[] = [];
            if (parentNode) {
                siblings = parentNode.children || [];
            } else {
                siblings = tree.filter(n => !n.parentId);
            }

            const nextCode = generateNextCode(parentNode?.code || null, calculatedLevel, siblings);
            if (nextCode) {
                formik.setFieldValue("code", nextCode);
            }
        }
    }, [mode, parentNode, calculatedLevel]);

    // Update characteristics based on Category if Level 1
    useEffect(() => {
        if (calculatedLevel === 1 && formik.values.accountCategory) {
            const cat = formik.values.accountCategory as AccountCategory;
            const defaults = BALANCE_MAP[cat];
            if (defaults) formik.setFieldValue("normalBalance", defaults);

            const stmt = STATEMENT_MAP[cat];
            if (stmt) formik.setFieldValue("statementType", stmt);
        }
    }, [formik.values.accountCategory, calculatedLevel]);

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="px-6 py-5 border-b border-gray-200">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                        {mode === "create" ? (
                            <FolderPlus className="w-5 h-5 text-blue-600" />
                        ) : (
                            <FileText className="w-5 h-5 text-blue-600" />
                        )}
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                            {mode === "create"
                                ? isRTL ? "إضافة حساب جديد" : "Add New Account"
                                : isRTL ? "تفاصيل الحساب" : "Account Details"}
                        </h3>
                        {parentNode && (
                            <p className="text-xs text-blue-600 mt-1 font-medium">
                                {isRTL ? `تحت الحساب: ${parentNode.name}` : `Under: ${parentNode.name} (${parentNode.code})`}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Form Content */}
            <div className="flex-1 overflow-y-auto">
                <form onSubmit={formik.handleSubmit} className="flex flex-col min-h-full">

                    <div className="p-6 space-y-6 flex-1">
                        {/* Level Indicator */}
                        <div className="flex items-center gap-2 mb-4">
                            <span className="text-xs font-semibold uppercase text-gray-500 tracking-wider">
                                {isRTL ? "المستوى" : "LEVEL"}: {calculatedLevel}
                            </span>
                            <div className="h-px bg-gray-200 flex-1"></div>
                        </div>

                        {/* Basic Information Section */}
                        <div className="space-y-4">
                            <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                                <div className="w-1 h-4 bg-blue-600 rounded-full"></div>
                                {isRTL ? "المعلومات الأساسية" : "Basic Information"}
                            </h4>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="code" className="text-sm font-medium text-gray-700">
                                        {isRTL ? "رقم الحساب" : "Account Code"}
                                        <span className="text-red-500 ml-1">*</span>
                                    </Label>
                                    <Input
                                        id="code"
                                        {...formik.getFieldProps("code")}
                                        className={`${isRTL ? "text-right" : "text-left"} font-mono`}
                                        placeholder={isRTL ? "مثال: 1110" : "e.g., 1110"}
                                    // Disable code edit if strictly enforced? No, user might need to override, validation handles it.
                                    />
                                    {formik.touched.code && formik.errors.code && (
                                        <div className="text-red-600 text-xs mt-1">{formik.errors.code as string}</div>
                                    )}
                                    <p className="text-[10px] text-gray-400">
                                        {isRTL ? "يتبع النظام العشري (مثال: 1100, 1110, 1111)" : "Decimal format (e.g. 1100, 1110, 1111)"}
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="accountType" className="text-sm font-medium text-gray-700">
                                        {isRTL ? "نوع الحساب" : "Account Type"}
                                    </Label>
                                    <Select
                                        value={formik.values.accountType}
                                        onValueChange={(value) => formik.setFieldValue("accountType", value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="main">{isRTL ? "رئيسي (مجموعة)" : "Main (Group)"}</SelectItem>
                                            <SelectItem value="sub">{isRTL ? "فرعي (حركة)" : "Sub-Account (Transaction)"}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                                    {isRTL ? "الاسم (English)" : "Name (English)"}
                                    <span className="text-red-500 ml-1">*</span>
                                </Label>
                                <Input
                                    id="name"
                                    {...formik.getFieldProps("name")}
                                    className="text-left"
                                    dir="ltr"
                                    placeholder={isRTL ? "مثال: Cash" : "e.g., Cash"}
                                />
                                {formik.touched.name && formik.errors.name && (
                                    <div className="text-red-600 text-xs mt-1">{formik.errors.name as string}</div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="nameAr" className="text-sm font-medium text-gray-700">
                                    {isRTL ? "الاسم (عربي)" : "Name (Arabic)"}
                                </Label>
                                <Input
                                    id="nameAr"
                                    {...formik.getFieldProps("nameAr")}
                                    className="text-right"
                                    dir="rtl"
                                    placeholder={isRTL ? "مثال: النقدية" : "e.g., النقدية"}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                                    {isRTL ? "الوصف" : "Description"}
                                </Label>
                                <Textarea
                                    id="description"
                                    {...formik.getFieldProps("description")}
                                    className={isRTL ? "text-right" : "text-left"}
                                    rows={3}
                                    placeholder={isRTL ? "وصف الحساب (اختياري)" : "Account description (optional)"}
                                />
                            </div>
                        </div>

                        <Separator className="my-6" />

                        {/* Financial Classification Section */}
                        <div className="space-y-4">
                            <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                                <div className="w-1 h-4 bg-blue-600 rounded-full"></div>
                                {isRTL ? "التصنيف المالي" : "Financial Classification"}
                            </h4>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-gray-700">
                                        {isRTL ? "الفئة" : "Category"}
                                    </Label>
                                    <AccountCategorySelect
                                        value={formik.values.accountCategory}
                                        onValueChange={(value) => formik.setFieldValue("accountCategory", value)}
                                        disabled={calculatedLevel > 1}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-gray-700">
                                        {isRTL ? "طبيعة الحساب" : "Normal Balance"}
                                    </Label>
                                    <Select
                                        value={formik.values.normalBalance}
                                        onValueChange={(value) => formik.setFieldValue("normalBalance", value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Debit">{isRTL ? "مدين" : "Debit"}</SelectItem>
                                            <SelectItem value="Credit">{isRTL ? "دائن" : "Credit"}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700">
                                    {isRTL ? "القائمة المالية" : "Financial Statement"}
                                </Label>
                                <Select
                                    value={formik.values.statementType}
                                    onValueChange={(value) => formik.setFieldValue("statementType", value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="BalanceSheet">{isRTL ? "الميزانية العمومية" : "Balance Sheet"}</SelectItem>
                                        <SelectItem value="ProfitLoss">{isRTL ? "الأرباح والخسائر" : "Profit & Loss"}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Status Section */}
                        <div className="space-y-2 pt-2">
                            <Label htmlFor="status" className="text-sm font-medium text-gray-700">
                                {isRTL ? "الحالة" : "Status"}
                            </Label>
                            <Select
                                value={formik.values.status}
                                onValueChange={(value) => formik.setFieldValue("status", value)}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="active">{isRTL ? "نشط" : "Active"}</SelectItem>
                                    <SelectItem value="inactive">{isRTL ? "غير نشط" : "Inactive"}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Action Buttons - Fixed at bottom */}
                    <div className="sticky bottom-0 bg-white p-6 border-t border-gray-200 mt-auto">
                        <div className="flex justify-end gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onCancel}
                                className="min-w-[100px]"
                            >
                                {isRTL ? "إلغاء" : "Cancel"}
                            </Button>
                            <Button
                                type="submit"
                                className="min-w-[100px]"
                                disabled={!formik.dirty || !formik.isValid}
                            >
                                {isRTL ? "حفظ" : "Save"}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};
