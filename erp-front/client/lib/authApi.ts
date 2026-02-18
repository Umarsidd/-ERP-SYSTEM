import { format } from "date-fns";
import Swal from "sweetalert2";
import api from "./api";
import CryptoJS from "crypto-js";


export const authApi = {
  getAll: async (
    page: any,
    itemsPerPage: any,
    filter,
    sort,
    tableName,
    role,
  ) => {
    try {
      const response = await api.post(`/auth/advancedFilter?page=${page}`, {
        filters: [
          ...filter,
          {
            field: "role",
            operator: "=",
            value: role, //"customer",
            type: "basic",
            andOr: "and",
          },
        ],
        sorts: [sort],
        tableName: tableName,
        auth: "auth",
        per_page: itemsPerPage,
        relations: [],
      });
      console.log("filter", filter);

      return response.data;
    } catch (error) {
      console.error(`Error fetching ${tableName}:`, error);
      throw error;
    }
  },

  getAllWithoutRole: async (
    page: any,
    itemsPerPage: any,
    filter,
    sort,
    tableName,
  ) => {
    try {
      const response = await api.post(`/auth/advancedFilter?page=${page}`, {
        filters: filter,
        sorts: [sort],
        tableName: tableName,
        auth: "auth",
        per_page: itemsPerPage,
        relations: [],
      });

      return response.data;
    } catch (error) {
      console.error(`Error fetching ${tableName}:`, error);
      throw error;
    }
  },

  getOneUser: async (id) => {
    try {
      const response = await api.post(`/auth/advancedFilter`, {
        filters: [
          {
            field: "id",
            operator: "=",
            value: id, //"customer",
            type: "basic",
            andOr: "and",
          },
        ],
        sorts: [],
        tableName: "users",
        auth: "auth",
        per_page: 1,
        relations: [],
      });
      //console.log("filter", filter);

      return response.data;
    } catch (error) {
      console.error(`Error fetching users:`, error);
      throw error;
    }
  },

  register: async (data: any, isRTL) => {
    try {
      const response = await api.post(`/auth/register`, data);
      // console.log(response);
      return response;
    } catch (error) {
      if (error.response && error.response.status === 422) {
        //  console.log(error.status);

        await Swal.fire({
          icon: "error",
          title: isRTL ? "خطأ" : "Error",
          text:
            //     res.error.message ||
            isRTL ? "البريد الإلكتروني موجود بالفعل" : "email already exists",
          confirmButtonText: isRTL ? "حسناً" : "OK",
        });
      } else if (error.response) {
        await Swal.fire({
          icon: "error",
          title: isRTL ? "خطأ" : "Error",
          text: error.response.data.message + " " + error.response.status,
          confirmButtonText: isRTL ? "حسناً" : "OK",
        });
      }

     // console.error(`Error creating register:`, error);
       throw error;
    }
  },

  update: async (id: number, data: any) => {
    try {
      const response = await api.patch(`/auth/update/${id}`, data);
      console.log(response);
      return response;
    } catch (error) {
      console.error(`Error creating register:`, error);
        throw error;
    }
  },

  login: async (data: any, isRTL) => {
    try {
      const response = await api.post(`/auth/login`, data);
      //  console.log(response);
      return response;
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: isRTL ? "خطأ" : "Error",
        text:
          //     res.error.message ||
          isRTL
            ? "البريد الإلكتروني أو كلمة المرور غير صحيحة"
            : "email or password is incorrect",
        confirmButtonText: isRTL ? "حسناً" : "OK",
      });

      //   console.error(`Error creating register:`, error);
        throw error;
    }
  },

  delete: async (title, text, id, isRTL) => {
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
        var res = await api.patch(`/auth/update/${id}`, {
          deleted_at: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
        });

        Swal.fire({
          icon: "success",
          title: isRTL ? "تم الحذف" : "Deleted",
          text: isRTL ? "تم حذف بنجاح" : "deleted successfully",
          timer: 1500,
          showConfirmButton: false,
        });

        return res;
      } catch (error) {
        console.error("Error deleting :", error);
        throw error;
      }
    }
  },
};

export const authApiMain = {

       
             


  getAllWithoutRole: async (
    page: any,
    itemsPerPage: any,
    filter,
    sort,
    tableName,
  ) => {
    try {
      const response = await api.post(
        `/auth/advancedFilter?page=${page}`,
        {
          filters: filter,
          sorts: [sort],
          tableName: tableName,
          auth: "auth",
          per_page: itemsPerPage,
          relations: [],
        },
        {
          headers: {
            "x-client": "main",
            Authorization: `Bearer ${
              localStorage.getItem("somthing") &&
              JSON.parse(
                CryptoJS.AES.decrypt(
                  localStorage.getItem("somthing"),
                  import.meta.env.VITE_SECRET,
                ).toString(CryptoJS.enc.Utf8),
              )
            }`,
          },
        },
      );

      return response.data;
    } catch (error) {
      console.error(`Error fetching ${tableName}:`, error);
      throw error;
    }
  },

  registerWithDataBase: async (data: any, isRTL) => {
    try {
      const response = await api.post(`/auth/register-tenant`, data, {
        headers: {
          "x-client": "main",
          Authorization: `Bearer ${
            localStorage.getItem("somthing") &&
            JSON.parse(
              CryptoJS.AES.decrypt(
                localStorage.getItem("somthing"),
                import.meta.env.VITE_SECRET,
              ).toString(CryptoJS.enc.Utf8),
            )
          }`,
        },
      });
      // console.log(response);
      return response;
    } catch (error) {
      if (error.response && error.response.status === 422) {
        //  console.log(error.status);

        await Swal.fire({
          icon: "error",
          title: isRTL ? "خطأ" : "Error",
          text:
            //     res.error.message ||
            isRTL ? "البريد الإلكتروني موجود بالفعل" : "email already exists",
          confirmButtonText: isRTL ? "حسناً" : "OK",
        });
      } else if (error.response) {
        await Swal.fire({
          icon: "error",
          title: isRTL ? "خطأ" : "Error",
          text: error.response.data.message + " " + error.response.status,
          confirmButtonText: isRTL ? "حسناً" : "OK",
        });
      }

      console.error(`Error creating register:`, error);
       throw error;
    }
  },

  register: async (data: any, isRTL) => {
    try {
      const response = await api.post(`/auth/register`, data, {
        headers: {
          "x-client": "main",
          Authorization: `Bearer ${
            localStorage.getItem("somthing") &&
            JSON.parse(
              CryptoJS.AES.decrypt(
                localStorage.getItem("somthing"),
                import.meta.env.VITE_SECRET,
              ).toString(CryptoJS.enc.Utf8),
            )
          }`,
        },
      });
      // console.log(response);
      return response;
    } catch (error) {
      if (error.response && error.response.status === 422) {
        //  console.log(error.status);

        await Swal.fire({
          icon: "error",
          title: isRTL ? "خطأ" : "Error",
          text:
            //     res.error.message ||
            isRTL ? "البريد الإلكتروني موجود بالفعل" : "email already exists",
          confirmButtonText: isRTL ? "حسناً" : "OK",
        });
      } else if (error.response) {
        await Swal.fire({
          icon: "error",
          title: isRTL ? "خطأ" : "Error",
          text: error.response.data.message + " " + error.response.status,
          confirmButtonText: isRTL ? "حسناً" : "OK",
        });
      }

      //console.error(`Error creating register:`, error);
      throw error;
    }
  },

  update: async (id: number, data: any) => {
    try {
      const response = await api.patch(`/auth/update/${id}`, data, {
        headers: {
          "x-client": "main",
          Authorization: `Bearer ${
            localStorage.getItem("somthing") &&
            JSON.parse(
              CryptoJS.AES.decrypt(
                localStorage.getItem("somthing"),
                import.meta.env.VITE_SECRET,
              ).toString(CryptoJS.enc.Utf8),
            )
          }`,
        },
      });
      console.log(response);
      return response;
    } catch (error) {
      console.error(`Error creating register:`, error);
        throw error;
    }
  },

  login: async (data: any, isRTL) => {
    try {
      const response = await api.post(`/auth/login`, data, {
        headers: {
          "x-client": "main",
          Authorization: `Bearer ${
            localStorage.getItem("somthing") &&
            JSON.parse(
              CryptoJS.AES.decrypt(
                localStorage.getItem("somthing"),
                import.meta.env.VITE_SECRET,
              ).toString(CryptoJS.enc.Utf8),
            )
          }`,
        },
      });
      //  console.log(response);
      return response;
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: isRTL ? "خطأ" : "Error",
        text:
          //     res.error.message ||
          isRTL
            ? "البريد الإلكتروني أو كلمة المرور غير صحيحة"
            : "email or password is incorrect",
        confirmButtonText: isRTL ? "حسناً" : "OK",
      });

      //   console.error(`Error creating register:`, error);
     throw error;
    }
  },

  delete: async (title, text, id, isRTL) => {
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
        var res = await api.patch(
          `/auth/update/${id}`,
          {
            deleted_at: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
          },
          {
            headers: {
              "x-client": "main",
              Authorization: `Bearer ${
                localStorage.getItem("somthing") &&
                JSON.parse(
                  CryptoJS.AES.decrypt(
                    localStorage.getItem("somthing"),
                    import.meta.env.VITE_SECRET,
                  ).toString(CryptoJS.enc.Utf8),
                )
              }`,
            },
          },
        );

        Swal.fire({
          icon: "success",
          title: isRTL ? "تم الحذف" : "Deleted",
          text: isRTL ? "تم حذف بنجاح" : "deleted successfully",
          timer: 1500,
          showConfirmButton: false,
        });

        return res;
      } catch (error) {
        console.error("Error deleting :", error);
        throw error;
      }
    }
  },

  getUser: async () => {
    try {
      const response = await api.post(`/auth/getUser`, {
        headers: {
          "x-client": "main",
          Authorization: `Bearer ${localStorage.getItem("somthing") && JSON.parse(CryptoJS.AES.decrypt(localStorage.getItem("somthing"), import.meta.env.VITE_SECRET).toString(CryptoJS.enc.Utf8))}`,
        },
      });
      return response.data.users;
    } catch (error) {
      console.error("Error fetching user:", error);
      throw error;
    }
  },
};
