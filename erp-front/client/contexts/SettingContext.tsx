import { commonApi } from "@/lib/api";
import React, { createContext, useContext, useState, useEffect } from "react";
import CryptoJS from "crypto-js";

const SettingContext = createContext(undefined);

export const useSetting = () => {
  const context = useContext(SettingContext);
  if (!context) {
    throw new Error("useSetting must be used within a SettingProvider");
  }
  return context;
};

export const SettingProvider = ({ children }) => {
  const [settings, setSettings] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentRole, setCurrentRole] = useState(null);

  useEffect(() => {
    refreshSettings();
  }, []);

  const refreshSettings = async () => {
    setIsLoading(true);
    try {
      var result = await commonApi.getAll(
        1,
        1,
        [],
        {
          field: "id",
          direction: "desc",
          type: "basic",
          json_path: "$.elementNumber",
        },
        "setting",
      );
      if (result.data && result.data.length > 0) {
        var y = JSON.parse(result.data[0].main);
        y.id = result.data[0].id;
        var role = JSON.parse(
          JSON.parse(
            CryptoJS.AES.decrypt(
              localStorage.getItem("user"),
              import.meta.env.VITE_SECRET,
            ).toString(CryptoJS.enc.Utf8),
          )?.user?.main,
        )?.subRole;

        var mainRole = JSON.parse(
          JSON.parse(
            CryptoJS.AES.decrypt(
              localStorage.getItem("user"),
              import.meta.env.VITE_SECRET,
            ).toString(CryptoJS.enc.Utf8),
          )?.user?.main,
        )?.role;

        var currRole = y?.roles?.filter((r) => role === r.name);
        var currentRoleValue =
          currRole && currRole.length > 0 ? currRole[0].permissions : null;
        setCurrentRole(currentRoleValue);
        localStorage.setItem("subRole", JSON.stringify(currentRoleValue));
        // console.log(
        //   "role",
        //   JSON.parse(
        //     JSON.parse(
        //       CryptoJS.AES.decrypt(
        //         localStorage.getItem("user"),
        //         import.meta.env.VITE_SECRET,
        //       ).toString(CryptoJS.enc.Utf8),
        //     )?.user?.main,
        //   ),
        // );
        //console.log("result.data", result.data);

        if (mainRole === "Admin") {
          setCurrentRole(null);
          localStorage.setItem("subRole", null);
        }

        setSettings(y ?? null);
        localStorage.setItem("selectedCurrency", y.currency.selected ?? "IQD");
        localStorage.setItem(
          "selectedCurrencySymbol",
          y?.currency?.selectedSymbol ?? "د.ع",
        );

        localStorage.setItem(
          "logo",
          y?.logo != null ? JSON.stringify(y?.logo) : null,
        );

        localStorage.setItem(
          "enableInventoryStockOrders",
          y?.enableInventoryStockOrders != null
            ? y?.enableInventoryStockOrders.toString()
            : "false",
        );

        // console.log(
        //   "ttttt",
        //   localStorage.getItem("enableInventoryStockOrders"),
        // );
        localStorage.setItem(
          "selectedCurrencyList",
          JSON.stringify(y.currency.list),
        );

        localStorage.setItem(
          "selectedCurrencyObject",
          JSON.stringify({
            code: "IQD",
            english_name: "Iraqi Dinar",
            arabic_name: "الدينار العراقي",
            symbol: "د.ع",
            rate_to_iqd: 1,
          }),
        );
      }
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    currentRole,
    settings,
    refreshSettings,
    isLoading,
  };

  return (
    <SettingContext.Provider value={value}>{children}</SettingContext.Provider>
  );
};
