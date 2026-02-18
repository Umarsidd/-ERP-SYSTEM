import { BookOpen, Folder } from "lucide-react";




export function AccountIcon({ accountType }: { accountType: string }) {
  if (accountType === "sub")
    return <BookOpen className="w-5 h-5 text-amber-500" />;
  return <Folder className="w-5 h-5 text-green-500" />;
}
