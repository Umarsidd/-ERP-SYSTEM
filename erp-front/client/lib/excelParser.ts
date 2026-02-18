import * as XLSX from "xlsx";
import CryptoJS from "crypto-js";
import { commonApi } from "./api";
import { generateNumber } from "./products_function";
import { newApi } from "./new_api";
import Swal from "sweetalert2";

export interface ParsedRow {
  [key: string]: any;
}

export interface ExcelParseOptions {
  headerRow?: number;
  dataStartRow?: number;
}

export const handleExcelAndImagesImport = async (
  e: React.ChangeEvent<HTMLInputElement>,
  isRTL,
  setIsRefreshing,
  multiFileInputRef,
  setShowAddModal,
) => {
  const files = e.target.files;
  if (!files) return;

  try {
    let excelFile: File | null = null;
    var imageFilesArray: File[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
        excelFile = file;
      } else if (
        file.type.startsWith("image/") ||
        [".jpg", ".jpeg", ".png", ".gif", ".webp"].some((ext) =>
          file.name.toLowerCase().endsWith(ext),
        )
      ) {
        imageFilesArray.push(file);
      }
    }

    if (!excelFile) {
      throw new Error(
        isRTL
          ? "يجب تضمين ملف Excel في الملفات المرفوعة"
          : "Excel file is required",
      );
    }

    // if (Object.keys(imageFiles).length === 0) {
    //   throw new Error(
    //     isRTL
    //       ? "يجب تضمين صور المنتجات في الملفات المرفوعة"
    //       : "At least one image file is required",
    //   );
    // }

    // Parse Excel file
    const parsedRows = await parseExcelFile(excelFile);

    // const dataTransfer = new DataTransfer();
    // imageFilesArray.forEach((file: File) => dataTransfer.items.add(file));
    // const fileList = dataTransfer.files;

    // var resImages = [];
    // resImages = await commonApi.upload(fileList);
    // console.log("upload", resImages);

    const importedProducts = parsedRows.map((rowData: any, index: number) => {
      const imageFileName = rowData["Image"];

      return {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: JSON.stringify(
          JSON.parse(
            CryptoJS.AES.decrypt(
              localStorage.getItem("user"),
              import.meta.env.VITE_SECRET,
            ).toString(CryptoJS.enc.Utf8),
          )?.user,
        ),
        updatedBy: JSON.stringify(
          JSON.parse(
            CryptoJS.AES.decrypt(
              localStorage.getItem("user"),
              import.meta.env.VITE_SECRET,
            ).toString(CryptoJS.enc.Utf8),
          )?.user,
        ),
        issueDate: new Date().toISOString(),
        main: JSON.stringify({
          imageName: imageFileName,
          sku: generateNumber("SKU"),
          name:
            rowData["Name"] ||
            rowData["Product Name"] ||
            `Product ${index + 1}`,
          description: rowData["Description"] || "",
          barcode: rowData["Barcode"] || "",
          unit: "piece",
          unitSell: "1",
          unitBuy: "1",
          unitList: [{ unitName: "piece", value: "1" }],
          unitVal: "unit_1",
          unitSellVal: "piece",
          unitBuyVal: "piece",
          currency: "IQD",
          purchasePrice: parseFloat(rowData["Purchase Price"] || "0"),
          sellingPrice: parseFloat(
            rowData["Selling Price"] || rowData["Price"] || "0",
          ),
          stockQuantity: parseInt(rowData["Stock"] || "0"),
          lowStockThreshold: 0,
          minSellingPrice: 0,
          attachments: [],
          discount: 0,
          profitMargin: 0,
          status: "Active",
          discountType: "percentage",
          warehouses: [
            {
              warehouseName: "main",
              warehouseId: "1",
              quantity: parseInt(rowData["Stock"] || "0"),
            },
          ],
        }),
        status: "Active",
        sku: rowData["SKU"] || generateNumber("SKU"),
        elementNumber:
          rowData["Name"] || rowData["Product Name"] || `Product ${index + 1}`,
        totalAmount: parseFloat(
          rowData["Selling Price"] || rowData["Price"] || "0",
        ),
        stockQuantity: parseInt(rowData["Stock"] || "0"),
        oldQuantity: parseInt(rowData["Stock"] || "0"),
        // attachments: JSON.stringify({
        //   images: resImages.filter(
        //     (img: any) => img.original_name === imageFileName,
        //   ),
        // }),
      };
    });

    const form = new FormData();
    form.append("items", JSON.stringify(importedProducts));

    // Append files (original names matter for matching)
    imageFilesArray.forEach((f) => form.append("files[]", f));

    console.log("Imported importedProducts:", importedProducts);

    var resImages;
    resImages = await newApi.addWithUpload(form, "inventory_products");
    console.log("resImages", resImages);

    await Swal.fire({
      icon: "success",
      title: isRTL ? "تم بنجاح" : "Success",
      text: isRTL
        ? `تم استيراد ${importedProducts.length} منتج`
        : `${importedProducts.length} product(s) imported successfully`,
      timer: 2000,
      showConfirmButton: false,
    });
setShowAddModal(false);
    setIsRefreshing((prev) => !prev);
  } catch (error) {
    // toast({
    //   title: isRTL ? "خطأ" : "Error",
    //   description:
    //     error instanceof Error
    //       ? error.message
    //       : isRTL
    //         ? "فشل في استيراد الملفات"
    //         : "Failed to import files",
    //   variant: "destructive",
    // });
  }

  // Reset file input
  if (multiFileInputRef.current) multiFileInputRef.current.value = "";
};

export const parseExcelFile = (
  file: File,
  options?: ExcelParseOptions,
): Promise<ParsedRow[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];

        if (!sheetName) {
          throw new Error("No sheets found in the Excel file");
        }

        const worksheet = workbook.Sheets[sheetName];
        const headerRow = options?.headerRow || 0;
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (jsonData.length <= headerRow) {
          throw new Error(
            "Excel file must have at least a header row and one data row",
          );
        }

        const headers = (jsonData[headerRow] || []) as string[];
        const dataRows = jsonData.slice(headerRow + 1) as any[][];

        const parsedData: ParsedRow[] = dataRows
          .filter((row) =>
            row.some(
              (cell) => cell !== undefined && cell !== null && cell !== "",
            ),
          )
          .map((row: any[]) => {
            const rowData: ParsedRow = {};
            headers.forEach((header, idx) => {
              if (header) {
                rowData[header] = row[idx];
              }
            });
            return rowData;
          });

        if (parsedData.length === 0) {
          throw new Error("No data rows found in the Excel file");
        }

        resolve(parsedData);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsArrayBuffer(file);
  });
};

export const downloadExcelTemplate = (
  filename: string,
  headers: string[],
  sampleData?: string[][],
) => {
  const wsData: any[] = [headers];

  if (sampleData) {
    wsData.push(...sampleData);
  } else {
    wsData.push(new Array(headers.length).fill(""));
  }

  const ws = XLSX.utils.aoa_to_sheet(wsData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Template");
  XLSX.writeFile(wb, filename);
};

export const downloadProductImportTemplate = () => {
  const headers = ["SKU", "Name", "Category", "Selling Price", "Stock", "Image", "Purchase Price", "Description", "Barcode"];
  const sampleData = [
    ["P-1001", "Widget A", "Gadgets", "19.99", "120", "product1.jpg", "4.50", "A useful widget", "1234567890123"],
    ["P-1002", "Widget B", "Gadgets", "29.99", "60", "product2.jpg", "5.00", "Another useful widget", "1234567890124"],
    ["P-2001", "Accessory X", "Accessories", "4.50", "400", "product3.png", "1.50", "A useful accessory", "1234567890125"],
  ];

  downloadExcelTemplate("products_import_template.xlsx", headers, sampleData);
};

export const matchImagesWithProducts = (
  products: any[],
  imageMap: { [key: string]: string },
): any[] => {
  return products.map((product) => {
    const imageFileName = product.imageFileName;
    if (imageFileName && imageMap[imageFileName]) {
      return {
        ...product,
        image: imageMap[imageFileName],
      };
    }
    return product;
  });
};
