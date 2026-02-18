import { filesApi } from "./api";
import CryptoJS from "crypto-js";

export const newApi = {
  addWithUpload: async (data, tableName) => {
    try {
      const response = await filesApi.post(
        `/addWithUpload/${tableName}`,
        data,
        {
          headers: {
            "x-client": `${localStorage.getItem("other") && JSON.parse(CryptoJS.AES.decrypt(localStorage.getItem("other"), import.meta.env.VITE_SECRET).toString(CryptoJS.enc.Utf8))}`,
          },
        },
      );
      return response.data;
    } catch (error) {
      console.error("Error upload", error);
      throw error;
    }
  },
};
