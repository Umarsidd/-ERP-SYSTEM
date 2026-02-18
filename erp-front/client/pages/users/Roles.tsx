import React, { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import CryptoJS from "crypto-js";
import {
  Plus,
  Edit2,
  Trash2,
  ChevronDown,
  X,
  Save,
  ShieldCheck,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { commonApi } from "@/lib/api";
import { useSetting } from "@/contexts/SettingContext";
import {
  emptyForm,
  operationTranslations,
  Role,
  siteSections,
} from "@/data/data";
import Swal from "sweetalert2";

export default function EmployeeRoles() {
  const [roles, setRoles] = useState([]);
  const [expandedRoleId, setExpandedRoleId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [selectedSection, setSelectedSection] = useState("Inventory");
  const { isRTL } = useLanguage();
  const [saving, setSaving] = useState(false);

  const isEditMode = !!form.id;
  const sectionData =
    siteSections[selectedSection as keyof typeof siteSections];
  const { settings, refreshSettings } = useSetting();

  useEffect(() => {
    if (settings) {
      setRoles(settings?.roles ?? []);
    }
  }, [settings]);

  const handleSaveDB = async () => {
    setSaving(true);
    try {
      if (settings != null) {
        await commonApi.update(
          settings.id,
          {
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            createdBy: JSON.stringify(
              JSON.parse(
                CryptoJS.AES.decrypt(
                  localStorage.getItem("user"),
                  import.meta.env.VITE_SECRET,
                ).toString(CryptoJS.enc.Utf8),
              )?.user,
            ),
            updatedBy: JSON.stringify(
              JSON.parse(
                CryptoJS.AES.decrypt(
                  localStorage.getItem("user"),
                  import.meta.env.VITE_SECRET,
                ).toString(CryptoJS.enc.Utf8),
              )?.user,
            ),
            main: JSON.stringify({ ...settings, roles: roles }),
          },
          "setting",
        );
      } else {
        var res = await commonApi.create(
          {
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            createdBy: JSON.stringify(
              JSON.parse(
                CryptoJS.AES.decrypt(
                  localStorage.getItem("user"),
                  import.meta.env.VITE_SECRET,
                ).toString(CryptoJS.enc.Utf8),
              )?.user,
            ),
            updatedBy: JSON.stringify(
              JSON.parse(
                CryptoJS.AES.decrypt(
                  localStorage.getItem("user"),
                  import.meta.env.VITE_SECRET,
                ).toString(CryptoJS.enc.Utf8),
              )?.user,
            ),
            main: JSON.stringify({ ...settings, roles: roles }),
          },
          "setting",
        );
      }

             Swal.fire({
              icon: "success",
              title: isRTL ? "تم الحفظ بنجاح" : "Settings have been saved",
              timer: 1000,
              showConfirmButton: false,
            });

      refreshSettings();
      console.log("Settings saved successfully", res);
      // Show success message
    } catch (error) {
      console.error("Error saving settings:", error);
    } finally {
      setSaving(false);
    }
  };

  const openAddForm = () => {
    setForm(emptyForm);
    setSelectedSection("Inventory");
    setShowForm(true);
  };
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (showForm) {
      setTimeout(() => {
        // Try scrolling the form element into view
        if (formRef.current) {
          formRef.current.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        } else {
          // Fallback: scroll the window
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      }, 150);
    }
  }, [showForm]);

  const openEditForm = (role: Role) => {
    setForm({
      id: role.id,
      name: role.name,
      nameAr: role.nameAr,
      description: role.description,
      descriptionAr: role.descriptionAr,
      permissions: JSON.parse(JSON.stringify(role.permissions)),
    });
    setSelectedSection("Inventory");
    setShowForm(true);
  };

  const closeForm = () => {
    setForm(emptyForm);
    setShowForm(false);
    setSelectedSection("Inventory");
  };

  const handleSaveForm = () => {
    if (!form.name || !form.nameAr) return;

    if (isEditMode) {
      setRoles(
        roles.map((role) =>
          role.id === form.id
            ? {
                ...role,
                name: form.name,
                nameAr: form.nameAr,
                description: form.description,
                descriptionAr: form.descriptionAr,
                permissions: form.permissions,
              }
            : role,
        ),
      );
    } else {
      setRoles([
        ...roles,
        {
          id: `role_${Date.now()}`,
          name: form.name,
          nameAr: form.nameAr,
          description: form.description,
          descriptionAr: form.descriptionAr,
          permissions: form.permissions,
          createdAt: new Date().toISOString().split("T")[0],
        },
      ]);
    }

    closeForm();
  };

  const handleDeleteRole = (roleId: string) => {
    setRoles(roles.filter((r) => r.id !== roleId));
  };

  const handlePermissionChange = (
    section: string,
    operation: string,
    value: boolean,
  ) => {
    setForm((prev) => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [section]: {
          ...(prev.permissions[section] || {}),
          [operation]: value,
        },
      },
    }));
  };

  const selectAllOperations = (section: string) => {
    const sectionOps =
      siteSections[section as keyof typeof siteSections].operations;
    setForm((prev) => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [section]: Object.fromEntries(sectionOps.map((op) => [op, true])),
      },
    }));
  };

  const clearAllOperations = (section: string) => {
    const sectionOps =
      siteSections[section as keyof typeof siteSections].operations;
    setForm((prev) => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [section]: Object.fromEntries(sectionOps.map((op) => [op, false])),
      },
    }));
  };

  const getPermissionCount = (role: Role) => {
    return Object.values(role.permissions).reduce(
      (count, section) =>
        count +
        Object.values(section).filter((permission) => permission).length,
      0,
    );
  };

  const getTotalOperations = () => {
    return Object.values(siteSections).reduce(
      (count, section) => count + section.operations.length,
      0,
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {isRTL
              ? "أدوار الموظفين والصلاحيات"
              : "Employee Roles & Permissions"}
          </h1>
          <p className="text-muted-foreground mt-2">
            {isRTL
              ? "إدارة أدوار الموظفين وتحديد الصلاحيات لكل قسم وعملية"
              : "Manage employee roles and define permissions for each section and operation"}
          </p>
        </div>
        {!showForm && (
          <div className="">
            {" "}
            {(JSON.parse(localStorage.getItem("subRole") || "null") as any)
              ?.Users?.roleModification !== false && (
              <Button
                variant="outline"
                onClick={handleSaveDB}
                disabled={saving}
                //  className="bg-primary hover:bg-secondary mx-2"
              >
                {saving ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="h-4 w-4 mr-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </motion.div>
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {saving
                  ? isRTL
                    ? "حفظ..."
                    : "Saving..."
                  : isRTL
                    ? "حفظ الإعدادات"
                    : "Save Settings"}
              </Button>
            )}
            {(JSON.parse(localStorage.getItem("subRole") || "null") as any)
              ?.Users?.addNewRole !== false && (
              <Button onClick={openAddForm} className="mx-2">
                <Plus className="w-4 h-4" />
                {isRTL ? "إضافة دور جديد" : "Add New Role"}
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Form - Add or Edit */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            ref={formRef}
          >
            <Card className="overflow-hidden border-2 border-primary">
              {/* Form Header */}
              <div className="bg-gradient-to-r from-primary/5 to-primary/10 p-6 border-b flex items-center justify-between">
                <h2 className="text-lg font-semibold">
                  {isEditMode
                    ? isRTL
                      ? "تعديل الدور"
                      : "Edit Role"
                    : isRTL
                      ? "إنشاء دور جديد"
                      : "Create New Role"}
                </h2>
                <button
                  onClick={closeForm}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Role Information */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-foreground">
                    {isRTL ? "معلومات الدور" : "Role Information"}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        {isRTL ? "الاسم (الإنجليزية)" : "Name (English)"}
                      </label>
                      <Input
                        value={form.name}
                        onChange={(e) =>
                          setForm({ ...form, name: e.target.value })
                        }
                        placeholder={isRTL ? "أدخل الاسم" : "Enter name"}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        {isRTL ? "الاسم (العربية)" : "Name (Arabic)"}
                      </label>
                      <Input
                        value={form.nameAr}
                        onChange={(e) =>
                          setForm({ ...form, nameAr: e.target.value })
                        }
                        placeholder={isRTL ? "أدخل الاسم" : "أدخل الاسم"}
                        dir="rtl"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        {isRTL ? "الوصف (الإنجليزية)" : "Description (English)"}
                      </label>
                      <Input
                        value={form.description}
                        onChange={(e) =>
                          setForm({ ...form, description: e.target.value })
                        }
                        placeholder={isRTL ? "أدخل الوصف" : "Enter description"}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        {isRTL ? "الوصف (العربية)" : "Description (Arabic)"}
                      </label>
                      <Input
                        value={form.descriptionAr}
                        onChange={(e) =>
                          setForm({ ...form, descriptionAr: e.target.value })
                        }
                        placeholder={isRTL ? "أدخل الوصف" : "أدخل الوصف"}
                        dir="rtl"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t" />

                {/* Permissions */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-foreground">
                    {isRTL ? "الصلاحيات" : "Permissions"}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border rounded-lg overflow-hidden">
                    {/* Sections Panel */}
                    <div className="bg-muted/20">
                      <div className="p-4 border-b bg-muted/30 sticky top-0">
                        <h4 className="font-medium text-foreground">
                          {isRTL ? "الأقسام" : "Sections"}
                        </h4>
                      </div>
                      <div className="p-2 space-y-1 h-96 overflow-y-auto">
                        {Object.entries(siteSections).map(
                          ([sectionKey, section]) => (
                            <button
                              key={sectionKey}
                              onClick={() => setSelectedSection(sectionKey)}
                              className={`w-full text-start px-4 py-3 rounded-lg transition-colors flex items-center gap-3 ${
                                selectedSection === sectionKey
                                  ? "bg-primary text-primary-foreground"
                                  : "hover:bg-muted/50 text-foreground"
                              }`}
                            >
                              <div className="min-w-0 flex-1">
                                <p className="font-medium text-sm truncate">
                                  {isRTL ? section.nameAr : section.name}
                                </p>
                                <p className="text-xs opacity-70">
                                  {section.operations.length}{" "}
                                  {isRTL ? "عمليات" : "ops"}
                                </p>
                              </div>
                              <span className="text-lg">{section.icon}</span>
                            </button>
                          ),
                        )}
                      </div>
                    </div>

                    {/* Operations Panel */}
                    <div>
                      <div className="p-4 border-b bg-muted/30">
                        <h4 className="font-medium text-foreground mb-">
                          {isRTL ? "العمليات" : "Operations"}
                        </h4>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs flex-1"
                            onClick={() => selectAllOperations(selectedSection)}
                          >
                            {isRTL ? "تحديد الكل" : "Select All"}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs flex-1"
                            onClick={() => clearAllOperations(selectedSection)}
                          >
                            {isRTL ? "مسح الكل" : "Clear All"}
                          </Button>
                        </div>
                      </div>

                      <div className="p-4 space-y-2 max-h- h-96  overflow-y-auto">
                        {sectionData.operations.map((operation) => {
                          const isChecked =
                            form.permissions[selectedSection]?.[operation] ||
                            false;
                          const opTrans = operationTranslations[operation];

                          return (
                            <label
                              key={operation}
                              className="flex items-center gap-3 p-3 rounded-lg border border-input hover:bg-muted/50 cursor-pointer transition-colors"
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={(e) =>
                                  handlePermissionChange(
                                    selectedSection,
                                    operation,
                                    e.target.checked,
                                  )
                                }
                                className="w-4 h-4 rounded accent-primary"
                              />
                              <span className="text-sm font-medium flex-1">
                                {isRTL ? opTrans?.nameAr : opTrans?.name}
                              </span>
                              {isChecked && (
                                <div className="w-2 h-2 rounded-full bg-primary" />
                              )}
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 justify-end pt-4 border-t">
                  <Button variant="outline" onClick={closeForm}>
                    {isRTL ? "إلغاء" : "Cancel"}
                  </Button>
                  {/* {isEditMode && (
                    <Button
                      variant="destructive"
                      onClick={() => {
                        handleDeleteRole(form.id!);
                        closeForm();
                      }}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      {isRTL ? "حذف" : "Delete"}
                    </Button>
                  )} */}
                  <Button
                    onClick={handleSaveForm}
                    disabled={!form.name || !form.nameAr}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isRTL ? "حفظ" : "Save"}
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Roles List */}
      <div className="space-y-4">
        {roles.length === 0 ? (
          <Card className="p-12 text-center">
            <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {isRTL ? "لا توجد أدوار محددة حالياً" : "No roles defined yet"}
            </p>
          </Card>
        ) : (
          roles.map((role, index) => (
            <motion.div
              key={role.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="overflow-hidden">
                {/* Role Header */}
                <div className="bg-gradient-to-r from-primary/5 to-primary/10 border-b p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <ShieldCheck className="w-6 h-6 text-primary" />
                        <div>
                          <h3 className="text-xl font-semibold text-foreground">
                            {isRTL ? role.nameAr : role.name}
                          </h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {isRTL ? role.descriptionAr : role.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                        <span>
                          {isRTL ? "الصلاحيات:" : "Permissions:"}{" "}
                          <span className="font-semibold text-primary">
                            {getPermissionCount(role)}/{getTotalOperations()}
                          </span>
                        </span>
                        <span>
                          {isRTL ? "تاريخ الإنشاء:" : "Created:"}{" "}
                          {role.createdAt}
                        </span>
                      </div>
                    </div>
                    <div className="">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          openEditForm(role);
                        }}
                        className="gap-2"
                      >
                        <Edit2 className="w-4 h-4" />
                        {/* {isRTL ? "تعديل" : "Edit"} */}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteRole(role.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setExpandedRoleId(
                            expandedRoleId === role.id ? null : role.id,
                          )
                        }
                      >
                        <ChevronDown
                          className={`w-5 h-5 transition-transform ${
                            expandedRoleId === role.id ? "rotate-180" : ""
                          }`}
                        />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Permissions Preview */}
                <AnimatePresence>
                  {expandedRoleId === role.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="border-t p-6 space-y-6"
                    >
                      {Object.entries(siteSections).map(
                        ([sectionKey, sectionData]) => {
                          const sectionPerms =
                            role.permissions[sectionKey] || {};
                          const enabledOps = sectionData.operations.filter(
                            (op) => sectionPerms[op],
                          );

                          if (enabledOps.length === 0) return null;

                          return (
                            <div key={sectionKey}>
                              <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                                <span className="text-2xl">
                                  {sectionData.icon}
                                </span>
                                {isRTL ? sectionData.nameAr : sectionData.name}
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                {enabledOps.map((op) => (
                                  <span
                                    key={op}
                                    className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium"
                                  >
                                    {isRTL
                                      ? operationTranslations[op].nameAr
                                      : operationTranslations[op].name}
                                  </span>
                                ))}
                              </div>
                            </div>
                          );
                        },
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      {/* Info Card */}
      <Card className="p-6 bg-info/5 border border-info/20">
        <div className="flex gap-4">
          <AlertCircle className="w-5 h-5 text-info flex-shrink-0 mt-0.5" />
          <div className="space-y-2">
            <h4 className="font-semibold text-foreground">
              {isRTL ? "كيفية الاستخدام" : "How to Use"}
            </h4>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>
                {isRTL
                  ? "انقر على 'إضافة دور جديد' لإنشاء دور جديد"
                  : "Click 'Add New Role' to create a new role"}
              </li>
              <li>
                {isRTL
                  ? "انقر على 'تعديل' لتحرير دور موجود"
                  : "Click 'Edit' to modify an existing role"}
              </li>
              <li>
                {isRTL
                  ? "اختر الأقسام والعمليات المطلوبة من الأقسام"
                  : "Select sections and operations for each role"}
              </li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}
