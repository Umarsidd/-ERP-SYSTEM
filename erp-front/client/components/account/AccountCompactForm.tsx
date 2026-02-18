import { Check, X } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState } from "react";
import { AccountNode } from "@/lib/accounts_function";




export function AccountCompactForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: Partial<AccountNode>;
  onSave: (p: Partial<AccountNode>) => void;
  onCancel: () => void;
}) {
  const [code, setCode] = useState(initial?.code || "");
  const [name, setName] = useState(initial?.name || "");
  const [accountType, setAccountType] = useState<"main" | "sub">(
    (initial?.accountType as any) || "sub",
  );
  const [balanceType, setBalanceType] = useState<"debit" | "credit" | "both">(
    (initial?.balanceType as any) || "debit",
  );
  const { isRTL } = useLanguage();

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
      <Input
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder={isRTL ? "كود" : "Code"}
      />
      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={isRTL ? "اسم" : "Name"}
      />
      <select
        className="w-full mt- px-4 py- bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
        value={accountType}
        onChange={(e) => setAccountType(e.target.value as any)}
      >
        <option value="main">{isRTL ? "رئيسي" : "Main"}</option>
        <option value="sub">{isRTL ? "فرعي" : "Sub"}</option>
      </select>
      {/* <select
        className="w-full mt-1 px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
        value={balanceType}
        onChange={(e) => setBalanceType(e.target.value as any)}
      >
        <option value="debit">{isRTL ? "مدين" : "Debit"}</option>
        <option value="credit">{isRTL ? "دائن" : "Credit"}</option>
      </select> */}

      <div className="md:col-span-4 flex items-center gap-2 mt-2">
        <Button
          onClick={() => onSave({ code, name, accountType, balanceType })}
          type="button"
        >
          <Check className="w-4 h-4 mr-1" />
          {isRTL ? "حفظ" : "Save"}
        </Button>
        <Button variant="ghost" onClick={onCancel} type="button">
          <X className="w-4 h-4 mr-1" />
          {isRTL ? "إلغاء" : "Cancel"}
        </Button>
      </div>
    </div>
  );
}
