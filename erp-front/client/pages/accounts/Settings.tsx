import React from "react";
import { Button } from "@/components/ui/button";

const isRTL = typeof window !== "undefined" && localStorage.getItem("language") === "ar";

export default function AccountsSettings() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{isRTL ? "إعدادات الحسابات" : "Accounts Settings"}</h2>
      </div>

      <div className="bg-card border border-border rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-foreground">{isRTL ? "نظام الترقيم" : "Numbering System"}</label>
            <div className="mt-2 text-sm text-muted-foreground">{isRTL ? "إعدادات ترقيم الحسابات" : "Settings for account numbering"}</div>
          </div>
          <div>
            <label className="text-sm font-medium text-foreground">{isRTL ? "الوحدات" : "Currency & Units"}</label>
            <div className="mt-2 text-sm text-muted-foreground">{isRTL ? "إعدادات العملة والوحدات" : "Currency and units settings"}</div>
          </div>
        </div>

        <div className="flex items-center justify-end mt-4">
          <Button>{isRTL ? "حفظ" : "Save"}</Button>
        </div>
      </div>
    </div>
  );
}
