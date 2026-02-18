import { useLanguage } from "@/contexts/LanguageContext";
import React, { useState, useEffect, useRef } from "react";

// const CATEGORY_OPTIONS = [
//   "Office",
//   "Travel",
//   "Grocery",
//   "Utilities",
//   "Entertainment",
//   "Software",
//   "Other",
// ];

export default function MultiSelect({
  list,
  selectedList,
  setFieldValue,
  fieldName,
  fieldName2 = "",
  type = "",
}: any) {
  const normalizeCategory = (cat: any) => {
    if (Array.isArray(cat)) return cat;
    if (typeof cat === "string" && cat) return [cat];
    return [];
  };

  const [form, setForm] = useState<any>({
    // date: initial.date || new Date().toISOString().substring(0, 10),
    // vendor: initial.vendor || "",
    category: normalizeCategory(selectedList),
    // amount: initial.amount || 0,
    // tax: initial.tax || 0,
    // description: initial.description || "",
    // receipt: initial.receipt || null,
  });

  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const { isRTL } = useLanguage();

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  useEffect(() => {
    //  console.log("fieldName, form.category", fieldName, form.category);
    var x = [];

    if (type === "reportBranch") {
      console.log("reportBranch", x);
      form.category.map((c: any) => {
        list.map((l: any) => {
          if (c.id === l.id) {
            x = [...x, ...JSON.parse(l.main).usersIDS];
            console.log("matched", x);
          }
        });
      });

      fieldName({
        ...fieldName2,
        branch: x,
      });

    } else if (type === "reportEmployee") {
      fieldName({
        ...fieldName2,
        employees: form.category,
      });
    } else {

      if (type === "branches") {
        form.category.map((c: any) => {
          list.map((l: any) => {
            if (c.id === l.id) {
              x = [...x, ...JSON.parse(l.main).usersIDS];
              console.log("matched", x);
            }
          });
        });
        setFieldValue(fieldName2, x);
      } else {
        console.log(" form.category", form.category);
        setFieldValue(fieldName2, form.category);
      }

      setFieldValue(fieldName, form.category);

    }

  }, [form]);

  const toggleOption = (opt) => {
    setForm((f: any) => {
      const exists = f.category.some((c) => c.id === opt.id);
      return {
        ...f,
        category: exists
          ? f.category.filter((c) => c.id !== opt.id)
          : [...f.category, opt],
      };
    });
  };

  const removeCategory = (opt) => {
    setForm((f: any) => ({
      ...f,
      category: f.category.filter((c) => c.id !== opt.id),
    }));
  };

  return (
    <div ref={ref} className="relative">
      <div className="mt-1">
        <div
          className="min-h-[44px] w-full rounded-md border border-input bg-background px-3 py-2 flex items-center gap-2 flex-wrap cursor-pointer"
          onClick={() => setOpen((v) => !v)}
        >
          {form?.category?.length === 0 ? (
            <div className="text-muted-foreground">
              {isRTL ? "اختر " : "Select "}
            </div>
          ) : (
            form?.category?.map((c: any) => (
              <div
                key={c.id}
                className="flex items-center gap-2 bg-muted px-2 py-1 rounded text-sm"
              >
                <span>{c.name}</span>
                <button
                  type="button"
                  className="text-xs text-foreground/60"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeCategory(c);
                  }}
                >
                  ×
                </button>
              </div>
            ))
          )}
        </div>

        {open && (
          <div className="absolute z-20 mt-2 w-full bg-card border border-border rounded-md shadow-lg p-2 max-h-48 overflow-auto">
            {list.map((opt) => (
              <label
                key={opt.name}
                className="flex items-center gap-2 px-2 py-1 hover:bg-accent/5 rounded cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={form.category.some((c) => c.id === opt.id)}
                  onChange={() => toggleOption({ id: opt.id, name: opt.name })}
                />
                <span className="text-sm">
                  {isRTL
                    ? opt.nameAr !== undefined
                      ? opt.nameAr
                      : opt.name
                    : opt.name}
                </span>
              </label>
            ))}
            {/* <div className="border-t border-border mt-2 pt-2 text-sm text-muted-foreground px-2">
              {isRTL ? "انقر لإغلاق" : "Click outside to close"}
            </div> */}
          </div>
        )}
      </div>
    </div>
  );
}
