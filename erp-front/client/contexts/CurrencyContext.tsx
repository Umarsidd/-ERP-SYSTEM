import { currencies } from "@/data/currencies";
import { selectedSymbol } from "@/data/data";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useMemo,
  useCallback,
} from "react";

// export const currencies = [
//   {
//     code: "IQD",
//     english_name: "Iraqi Dinar",
//     arabic_name: "الدينار العراقي",
//     symbol: "د.ع",
//     rate_to_iqd: 1,
//   },
//   {
//     code: "USD",
//     english_name: "US Dollar",
//     arabic_name: "الدولار الأمريكي",
//     symbol: "$",
//     rate_to_iqd: 0.00076229,
//   },
// ];

const CurrencyContext = createContext(undefined);

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
};

interface CurrencyProviderProps {
  children: ReactNode;
}

export const CurrencyProvider: React.FC<CurrencyProviderProps> = ({
  children,
}) => {
  const [currentCurrency, setCurrentCurrency] = useState(currencies[0]); // Default to IQD

  useEffect(() => {
    // Load saved currency from localStorage
    const savedCurrency = localStorage.getItem("selectedCurrencyObject");
    if (savedCurrency) {
      setCurrentCurrency(
        JSON.parse(localStorage.getItem("selectedCurrencyObject")),
      );
    }
  }, []);

  const formatAmount = useCallback(
    (
      amount: number,
      fromCurrencySymbol: string,
      showSymbol: boolean = true,
      precision: number = 0,
    ): string => {
      if (isNaN(amount) || !isFinite(amount)) {
        return "0.00";
      }

      const formattedNumber = amount.toLocaleString(undefined, {
        minimumFractionDigits: precision,
        maximumFractionDigits: precision,
      });

      if (!showSymbol) {
        return formattedNumber;
      }

      return `${formattedNumber} ${fromCurrencySymbol ?? localStorage.getItem("selectedCurrencySymbol") ?? selectedSymbol}`;
    },
    [currentCurrency],
  );

  const convertAmount = useCallback(
    (amount: number, fromCurrency: string, toCurrency?: string): number => {
      if (isNaN(amount) || !isFinite(amount)) {
        return 0;
      }

      const targetCurrency = toCurrency || currentCurrency.code;

      if (fromCurrency === targetCurrency) {
        return amount;
      }

      const fromCurrencyObj = (
        JSON.parse(localStorage.getItem("selectedCurrencyList")) ?? currencies
      ).find((c) => c.code === fromCurrency);


            const toCurrencyObj = (
              JSON.parse(localStorage.getItem("selectedCurrencyList")) ??
              currencies
            ).find((c) => c.code === targetCurrency);


      if (!fromCurrencyObj || !toCurrencyObj) {
        return amount;
      }

      // Convert to IQD first, then to target currency
      const usdAmount = amount / toCurrencyObj.rate_to_iqd;
      return usdAmount * fromCurrencyObj.rate_to_iqd;
    },
    [currentCurrency],
  );

  const value = useMemo(
    () => ({
      currentCurrency,
      formatAmount,
      convertAmount,
    }),
    [currentCurrency, formatAmount, convertAmount],
  );

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};
