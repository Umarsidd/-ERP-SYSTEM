import { useState } from "react";
import { Bell, Search, User, Moon, Sun, Languages, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import CryptoJS from "crypto-js";

interface HeaderProps {
  onToggleTheme?: () => void;
  isDark?: boolean;
  onToggleSidebar?: () => void;
}

export function Header({
  onToggleTheme,
  isDark = false,
  onToggleSidebar,
}: HeaderProps) {
  const [showSearch, setShowSearch] = useState(false);
  const { isRTL, toggleRTL } = useLanguage();

  return (
    <header
      className="flex items-center justify-between px-6 py-[18px] bg-background border-b border-sidebar-border"
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* Left side - Search */}
      <div className="flex items-center space-x-4 rtl:space-x-reverse">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-lg hover:bg-accent lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* <div className="relative">
          <div className="flex items-center">
            <Search className="w-5 h-5 text-muted-foreground absolute left-3 rtl:left-auto rtl:right-3" />
            <input
              type="text"
              placeholder={isRTL ? "بحث..." : "Search..."}
              className={cn(
                "pl-10 rtl:pl-4 rtl:pr-10 pr-4 py-2 w-48 sm:w-64 bg-muted rounded-lg border border-border",
                "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
                "text-sm text-foreground placeholder:text-muted-foreground",
              )}
            />
          </div>
        </div> */}
      </div>

      {/* Right side - Actions */}
      <div className="flex items-center space-x-4 rtl:space-x-reverse">
        {/* Currency Selector */}
        {/* <CurrencySelector /> */}

        {/* Language Toggle */}
        <button
          onClick={toggleRTL}
          className="p-2 rounded-lg hover:bg-secondary transition-colors text-card-foreground "
          title={isRTL ? "Switch to English" : "التبديل إلى العربية"}
        >
          <Languages className="w-5 h-5" />
        </button>

        {/* Theme Toggle */}
        <button
          onClick={onToggleTheme}
          className="p-2 rounded-lg hover:bg-secondary   text-card-foreground transition-colors"
          title={isRTL ? "تبديل المظهر" : "Toggle theme"}
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5 " />}
        </button>

        {/* Notifications */}
        {/* <button className="relative p-2 rounded-lg hover:bg-accent transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full text-[10px] text-destructive-foreground flex items-center justify-center">
            3
          </span>
        </button> */}

        {/* User Menu */}
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <div className="text-right rtl:text-left">
            <p className="text-sm font-medium text- text-card-foreground ">
              {
                JSON.parse(
                  CryptoJS.AES.decrypt(
                    localStorage.getItem("user"),
                    import.meta.env.VITE_SECRET,
                  ).toString(CryptoJS.enc.Utf8),
                )?.user?.name

                //    isRTL ? "أحمد محمد" : "Ahmed Mohamed"
              }
            </p>
            <p className="text-xs text-muted-foreground">
              {
                JSON.parse(
                  CryptoJS.AES.decrypt(
                    localStorage.getItem("user"),
                    import.meta.env.VITE_SECRET,
                  ).toString(CryptoJS.enc.Utf8),
                )?.user?.role

              }
            </p>

            <p
              onClick={() => {
                localStorage.removeItem("user");
                window.location.href = "/auth/login";
              }}
              className="text-xs text-muted-foreground hover:underline cursor-pointer"
            >
              {isRTL ? "تسجيل خروج " : "Log Out"}
            </p>
          </div>
          <div
            // to="/profile"
            className="p-1 w-11 sm:h-9 sm:w-9 flex items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-sidebar-accent transition-colors"
          >
            <User className="w-5 h-5" />
          </div>
        </div>
      </div>
    </header>
  );
}
