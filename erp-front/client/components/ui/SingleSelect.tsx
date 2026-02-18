import { useLanguage } from "@/contexts/LanguageContext";
import React, { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";

export default function SingleSelect({
    list,
    selectedItem,
    setFieldValue,
    fieldName,
    fieldName2 = "",
    type = "",
    placeholder = "",
}: any) {
    const [form, setForm] = useState<any>({
        selected: selectedItem || null,
    });

    const [open, setOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const ref = useRef<HTMLDivElement | null>(null);
    const { isRTL } = useLanguage();

    // Sync internal state with selectedItem prop
    useEffect(() => {
        setForm({ selected: selectedItem || null });
    }, [selectedItem]);

    useEffect(() => {
        const onDoc = (e: MouseEvent) => {
            if (!ref.current) return;
            if (!ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener("mousedown", onDoc);
        return () => document.removeEventListener("mousedown", onDoc);
    }, []);

    useEffect(() => {
        if (type === "reportCustomer") {
            setFieldValue({
                ...fieldName2,
                customer: form.selected,
            });
        } else {
            setFieldValue(fieldName, form.selected);
        }
    }, [form]);

    const selectOption = (opt) => {
        setForm({
            selected: opt,
        });
        setOpen(false);
        setSearchTerm("");
    };

    const clearSelection = (e) => {
        e.stopPropagation();
        setForm({
            selected: null,
        });
        setSearchTerm("");
    };

    // Filter list based on search term
    const filteredList = list.filter((opt) => {
        const name = isRTL && opt.nameAr ? opt.nameAr : opt.name;
        return name.toLowerCase().includes(searchTerm.toLowerCase());
    });

    return (
        <div ref={ref} className="relative">
            <div className="mt-1">
                <div
                    className="min-h-[44px] w-full rounded-md border border-input bg-background px-3 py-2 flex items-center justify-between cursor-pointer"
                    onClick={() => setOpen((v) => !v)}
                >
                    {form?.selected ? (
                        <div className="flex items-center justify-between w-full gap-2">
                            <span className="text-sm">{form.selected.name}</span>
                            <button
                                type="button"
                                className="text-xs text-foreground/60 hover:text-foreground"
                                onClick={clearSelection}
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    ) : (
                        <div className="text-muted-foreground">
                            {placeholder || (isRTL ? "اختر " : "Select ")}
                        </div>
                    )}
                </div>

                {open && (
                    <div className="absolute z-20 mt-2 w-full bg-card border border-border rounded-md shadow-lg max-h-64 overflow-hidden flex flex-col">
                        {/* Search Input */}
                        <div className="p-2 border-b border-border">
                            <input
                                type="text"
                                placeholder={isRTL ? "بحث..." : "Search..."}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-2 py-1 text-sm bg-background border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>

                        {/* Options List */}
                        <div className="overflow-auto max-h-48 p-2">
                            {filteredList.length > 0 ? (
                                filteredList.map((opt) => (
                                    <div
                                        key={opt.id}
                                        className={`px-2 py-2 hover:bg-accent/5 rounded cursor-pointer text-sm ${form.selected?.id === opt.id ? "bg-accent/10" : ""
                                            }`}
                                        onClick={() => selectOption(opt)}
                                    >
                                        {isRTL && opt.nameAr ? opt.nameAr : opt.name}
                                    </div>
                                ))
                            ) : (
                                <div className="px-2 py-2 text-sm text-muted-foreground text-center">
                                    {isRTL ? "لا توجد نتائج" : "No results found"}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
