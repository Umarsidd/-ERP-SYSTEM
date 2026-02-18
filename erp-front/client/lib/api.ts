import axios from "axios";
import { format } from "date-fns";
import Swal from "sweetalert2";
import { updateBankAccounts, updateCustomerMeta } from "./api_function";
import { selectedCurrency } from "@/data/data";
import CryptoJS from "crypto-js";

// Create axios instances
export const api = axios.create({
  baseURL: import.meta.env.VITE_BASE,
  withCredentials: true,

  timeout: 60000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

export const filesApi = axios.create({
  baseURL: import.meta.env.VITE_BASE,
  withCredentials: true,

  timeout: 60000, //1 minute
  headers: {
    "Content-Type": "multipart/form-data",
    Accept: "application/json",
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const bytes = CryptoJS?.AES?.decrypt(
      localStorage?.getItem("other"),
      import.meta.env.VITE_SECRET,
    );
    const decrypted = JSON.parse(bytes?.toString(CryptoJS.enc.Utf8));

    var token;
    if (localStorage.getItem("user")) {
      const bytes2 = CryptoJS?.AES?.decrypt(
        localStorage.getItem("user"),
        import.meta.env.VITE_SECRET,
      );
      const decrypted2 = JSON.parse(bytes2?.toString(CryptoJS.enc.Utf8));

      token = decrypted2?.access_token;
    }

    if (config?.headers["x-client"] != "main") {
      config.headers["x-client"] = decrypted;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      //console.log("config", config.headers["x-client"]);
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor
api.interceptors.response.use(
  async (response) => {
    try {
      return response;
    } catch (error) {
      console.log(`error`, error);
    }

    return response;
  },
  async (error) => {
    if (error.response?.status === 401) {
      try {
        var token = JSON.parse(
          CryptoJS.AES.decrypt(
            localStorage.getItem("user"),
            import.meta.env.VITE_SECRET,
          ).toString(CryptoJS.enc.Utf8),
        );
        const response2 = await api.post(`/auth/refreshToken`, {
          token: token?.refresh_token,
        });
        var newData = {
          ...token,
          access_token: response2.data.access_token,
        };

        const encrypted3 = CryptoJS.AES.encrypt(
          JSON.stringify(newData),
          import.meta.env.VITE_SECRET,
        ).toString();

        localStorage.setItem("user", encrypted3);

        const token2 = JSON.parse(
          CryptoJS.AES.decrypt(
            localStorage.getItem("somthing2"),
            import.meta.env.VITE_SECRET,
          ).toString(CryptoJS.enc.Utf8),
        );
        const response3 = await api.post(
          `/auth/refreshToken`,
          {
            token: token2,
          },
          {
            headers: { "x-client": "main" },
          },
        );

        const encrypted2 = CryptoJS.AES.encrypt(
          JSON.stringify(response3.data.access_token),
          import.meta.env.VITE_SECRET,
        ).toString();

        localStorage.setItem("somthing", encrypted2);
      } catch (error) {
        localStorage.removeItem("user");
        window.location.href = "/auth/login";
      }
    }
    return Promise.reject(error);
  },
);

export const commonApi = {
  upload: async (files: FileList | null) => {
    try {
      if (!files || files.length <= 0) return [];
      const formData = new FormData();

      Array.from(files).forEach((file) => {
        formData.append("files[]", file);
      });

      const response = await filesApi.post("/upload", formData, {
        headers: {
          "x-client": `${localStorage.getItem("other") && JSON.parse(CryptoJS.AES.decrypt(localStorage.getItem("other"), import.meta.env.VITE_SECRET).toString(CryptoJS.enc.Utf8))}`,
        },
      });
      console.log("upload", response.data.files);
      return response.data.files;
    } catch (error) {
      return { result: false, error: error };
      //  console.error("Error upload", error);
      //  throw error;
    }
  },

  create: async (data: any, tableName) => {
    try {
      const response = await api.post(`/addData/${tableName}`, data);
      console.log(`${tableName}api`, response);

      // System Logging
      try {
        if (tableName !== "activity_logs") {
          const user = JSON.parse(
            CryptoJS.AES.decrypt(
              localStorage.getItem("user") || "",
              import.meta.env.VITE_SECRET
            ).toString(CryptoJS.enc.Utf8)
          )?.user;

          const logDetails = {
            user_id: user?.id,
            user_name: user?.name,
            action_type: "create",
            module: tableName,
            reference_id: response.data?.insertId || 0,
            request_method: "POST",
            data: JSON.stringify(data),
            created_at: new Date().toISOString(),
          };

          const logData = {
            main: JSON.stringify(logDetails),
          };

          // Use api.post directly to avoid infinite loop if we used commonApi.create
          api.post(`/addData/activity_logs`, logData).catch(console.error);
        }
      } catch (logError) {
        console.error("Logging failed", logError);
      }

      return response;
    } catch (error) {
      console.error(`Error creating ${tableName}:`, error);
      throw error;
    }
  },

  getAll: async (
    page: any,
    itemsPerPage: any,
    filter,
    sort: any,

    tableName: string,
    conversion?: any,
  ) => {
    try {
      const response = await api.post(`/advancedFilter?page=${page}`, {
        filters: filter,
        conversion: conversion ?? null,

        sorts: [sort],
        tableName: tableName,
        per_page: itemsPerPage,
        relations: [],
      });
      //   console.log("filter", filter);

      return response.data;
    } catch (error) {
      console.error(`Error fetching ${tableName}:`, error);
      throw error;
    }
  },

  update: async (conditionValue, data, tableName) => {
    try {
      const response = await api.patch(
        `/updateData/${tableName}/id/${conditionValue}`,
        data,
      );
      console.log("update", response);

      // System Logging
      try {
        if (tableName !== "activity_logs") {
          const user = JSON.parse(
            CryptoJS.AES.decrypt(
              localStorage.getItem("user") || "",
              import.meta.env.VITE_SECRET
            ).toString(CryptoJS.enc.Utf8)
          )?.user;

          const logDetails = {
            user_id: user?.id,
            user_name: user?.name,
            action_type: "update",
            module: tableName,
            reference_id: conditionValue,
            request_method: "PUT", // or PATCH
            data: JSON.stringify(data),
            created_at: new Date().toISOString(),
          };

          const logData = {
            main: JSON.stringify(logDetails),
          };

          api.post(`/addData/activity_logs`, logData).catch(console.error);
        }
      } catch (logError) {
        console.error("Logging failed", logError);
      }

      return response;
    } catch (error) {
      console.error(`Error updating ${tableName}:`, error);
      throw error;
    }
  },

  updateOtherFields: async (tableName, field, conditionValue, data) => {
    try {
      const response = await api.patch(
        `/updateData/${tableName}/${field}/${conditionValue}`,
        data,
      );
      console.log("updateOtherFields", response);
      return response;
    } catch (error) {
      console.error(`Error updating ${tableName}:`, error);
      throw error;
    }
  },

  delete: async (title, text, id, tableName, isRTL, setIsRefreshing) => {
    const result = await Swal.fire({
      title: title,
      text: text,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: isRTL ? "حذف" : "Delete",
      cancelButtonText: isRTL ? "إلغاء" : "Cancel",
      confirmButtonColor: "#d33",
    });

    if (result.isConfirmed) {
      try {
        setIsRefreshing(true);

        var res = await api.patch(`/updateData/${tableName}/id/${id}`, {
          deleted_at: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
        });

        // System Logging
        try {
          if (tableName !== "activity_logs") {
            const user = JSON.parse(
              CryptoJS.AES.decrypt(
                localStorage.getItem("user") || "",
                import.meta.env.VITE_SECRET
              ).toString(CryptoJS.enc.Utf8)
            )?.user;

            const logDetails = {
              user_id: user?.id,
              user_name: user?.name,
              action_type: "delete",
              module: tableName,
              reference_id: id,
              request_method: "DELETE",
              data: JSON.stringify({ deleted_at: new Date() }),
              created_at: new Date().toISOString(),
            };

            const logData = {
              main: JSON.stringify(logDetails),
            };

            api.post(`/addData/activity_logs`, logData).catch(console.error);
          }
        } catch (logError) {
          console.error("Logging failed", logError);
        }

        Swal.fire({
          icon: "success",
          title: isRTL ? "تم الحذف" : "Deleted",
          text: isRTL ? "تم حذف بنجاح" : "deleted successfully",
          timer: 1500,
          showConfirmButton: false,
        });

        setIsRefreshing(false);
        return res;
      } catch (error) {
        console.error("Error deleting sales_invoices:", error);
        throw error;
      }
    }
  },

  deleteNoDialog: async (id, tableName) => {
    try {
      //  setIsRefreshing(true);

      //  var res = await
      var res = await api.patch(`/updateData/${tableName}/id/${id}`, {
        deleted_at: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
      });

      // setIsRefreshing(false);
      return res;
    } catch (error) {
      console.error("Error deleting sales_invoices:", error);
      // throw error;
    }
  },

  deleteInvoice: async (
    title,
    text,
    id,
    type,
    isRTL,
    setIsRefreshing,
    bankAccounts,
    bankAccountsMetaData,
    data,
    convertAmount,
    //   paidAmount,
  ) => {
    const result = await Swal.fire({
      title: title,
      text: text,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: isRTL ? "حذف" : "Delete",
      cancelButtonText: isRTL ? "إلغاء" : "Cancel",
      confirmButtonColor: "#d33",
    });

    if (result.isConfirmed) {
      try {
        setIsRefreshing(true);

        var convertedAmount = convertAmount(
          Number(JSON.parse(data.main)?.paidAmount),
          localStorage.getItem("selectedCurrency") ?? selectedCurrency,
          (JSON.parse(JSON.parse(data.main)?.currency)?.code ||
            localStorage.getItem("selectedCurrency")) ??
          selectedCurrency,
        );

        var convertedAmount2 = convertAmount(
          Number(JSON.parse(data.main)?.returnOnlyAmount),
          localStorage.getItem("selectedCurrency") ?? selectedCurrency,
          (JSON.parse(JSON.parse(data.main)?.currency)?.code ||
            localStorage.getItem("selectedCurrency")) ??
          selectedCurrency,
        );

        updateBankAccounts(
          bankAccounts.id,
          type == "purchase"
            ? Number(bankAccounts.totalAmount) +
            convertedAmount -
            convertedAmount2
            : Number(bankAccounts.totalAmount) -
            convertedAmount +
            convertedAmount2,
          convertedAmount,
          "Delete Invoice",
          "Withdraw",
          bankAccountsMetaData,
          {
            issueDate: data.issueDate,
            customer: JSON.parse(data.main)?.customer,
            currency: JSON.parse(data.main)?.currency,

            elementNumber: data.elementNumber,
          },
        );

        updateCustomerMeta(
          {
            invoiceIDForDeleteMetaCustomer: data.id,
          },
          data.totalAmount,
          "invoicedelete",
          JSON.parse(data.main)?.customerId,
        );

        if (type == "sales") {
          api.patch(`/updateData/installments/invoiceID/${id}`, {
            deleted_at: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
          });

          api.patch(`/updateData/sales_return/invoiceID/${id}`, {
            deleted_at: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
          });

          api.patch(`/updateData/sales_payment/invoiceID/${id}`, {
            deleted_at: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
          });

          api.patch(`/updateData/sales_credit_notices/invoiceID/${id}`, {
            deleted_at: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
          });

          var res = await api.patch(`/updateData/sales_invoices/id/${id}`, {
            deleted_at: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
          });
        } else if (type == "purchase") {
          api.patch(`/updateData/purchase_return/invoiceID/${id}`, {
            deleted_at: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
          });

          api.patch(`/updateData/purchase_payment/invoiceID/${id}`, {
            deleted_at: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
          });

          api.patch(`/updateData/purchase_credit_notices/invoiceID/${id}`, {
            deleted_at: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
          });

          var res = await api.patch(`/updateData/purchase_invoices/id/${id}`, {
            deleted_at: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
          });
        }

        Swal.fire({
          icon: "success",
          title: isRTL ? "تم الحذف" : "Deleted",
          text: isRTL ? "تم حذف بنجاح" : "deleted successfully",
          timer: 1500,
          showConfirmButton: false,
        });

        setIsRefreshing(false);
        return res;
      } catch (error) {
        console.error("Error deleting sales_invoices:", error);
        throw error;
      }
    }
  },
};

// Treasury Conversion API
export const treasuryConversionApi = {
  getAll: async (page: number, limit: number, filters: any = {}) => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...filters,
      });

      const response = await api.get(`/treasury-conversions?${params}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching treasury conversions:", error);
      throw error;
    }
  },

  create: async (data: any) => {
    try {
      // First try the dedicated endpoint
      const response = await api.post("/treasury-conversions", data);
      return response.data;
    } catch (error: any) {
      // If endpoint doesn't exist (404), use generic APIs to simulate transaction
      if (error.response && error.response.status === 404) {
        console.warn("Treasury conversion endpoint not found, using client-side fallback");

        // 1. Get current balances (optional but good for calculation)
        // We assume the frontend passed correct data, but let's fetch strictly if needed.
        // For now, we trust the logic in TransferMoney.tsx that checked sufficiency.

        const timestamp = new Date().toISOString();

        // 2. Deduct from Source Safe
        // We need to fetch the safe first to get current balance to update? 
        // Or assume we can just subtract? 
        // CommonApi.update replaces the whole object or specific fields? 
        // It updates specific fields if we pass object.

        // Fetch source safe to get accurate balance
        const fromSafeRes = await commonApi.getAll(1, 1, [{ field: "id", operator: "=", value: data.fromSafeId, type: "basic", andOr: "and" }], { field: "id", direction: "desc" }, "bank_accounts");
        const fromSafe = fromSafeRes.data[0];

        if (!fromSafe) throw new Error("Source safe not found");

        const newFromBalance = Number(fromSafe.currentBalance) - Number(data.amount);

        await commonApi.update(
          data.fromSafeId,
          {
            currentBalance: newFromBalance,
            totalAmount: newFromBalance,
            updatedAt: timestamp,
          },
          "bank_accounts"
        );

        // 3. Add to Destination Safe
        const toSafeRes = await commonApi.getAll(1, 1, [{ field: "id", operator: "=", value: data.toSafeId, type: "basic", andOr: "and" }], { field: "id", direction: "desc" }, "bank_accounts");
        const toSafe = toSafeRes.data[0];

        if (!toSafe) throw new Error("Destination safe not found");

        const newToBalance = Number(toSafe.currentBalance) + Number(data.amount);

        await commonApi.update(
          data.toSafeId,
          {
            currentBalance: newToBalance,
            totalAmount: newToBalance,
            updatedAt: timestamp,
          },
          "bank_accounts"
        );

        // 4. Create Conversion Record
        // Generate a random element number since backend isn't doing it
        const randomNum = Math.floor(Math.random() * 100000);
        const elementNumber = `CONV-${new Date().getFullYear()}-${randomNum}`;

        const conversionData = {
          ...data,
          elementNumber: elementNumber,
          fromSafeBalanceBefore: fromSafe.currentBalance,
          fromSafeBalanceAfter: newFromBalance,
          toSafeBalanceBefore: toSafe.currentBalance,
          toSafeBalanceAfter: newToBalance,
          status: "Completed",
          isActive: true,
          createdAt: timestamp,
          updatedAt: timestamp,
          main: JSON.stringify(data), // Store original data in main for compatibility
        };

        const createRes = await commonApi.create(conversionData, "treasury_conversions");

        // Return a mock response structure similar to what TransferMoney.tsx expects
        return {
          data: createRes,
          elementNumber: elementNumber,
          id: createRes?.data?.id || Date.now(),
        };
      }

      console.error("Error creating treasury conversion:", error);
      throw error;
    }
  },

  getById: async (id: number) => {
    try {
      const response = await api.get(`/treasury-conversions/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching treasury conversion:", error);
      throw error;
    }
  },

  delete: async (id: number) => {
    try {
      const response = await api.delete(`/treasury-conversions/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting treasury conversion:", error);
      throw error;
    }
  },

  getActiveSafes: async () => {
    try {
      const response = await commonApi.getAll(
        1,
        1000,
        [
          {
            field: "status",
            operator: "in",
            value: ["Active", "Main"],
            type: "basic",
            andOr: "and",
          },
        ],
        { field: "name", direction: "asc" },
        "bank_accounts",
      );
      return response;
    } catch (error) {
      console.error("Error fetching active safes:", error);
      throw error;
    }
  },
};

export default api;

// getById: async (id: number) => {
//   try {
//     const response = await api.get(`/products/${id}`);
//     return {
//       ...response.data,
//       nameAr: getArabicProductName(response.data.title),
//       descriptionAr: getArabicDescription(response.data.description),
//       stock: Math.floor(Math.random() * 100) + 10,
//       isActive: true,
//     };
//   } catch (error) {
//     console.error("Error fetching product:", error);
//     throw error;
//   }
// },
