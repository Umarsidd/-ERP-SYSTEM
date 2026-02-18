import Swal from "sweetalert2";
import { commonApi } from "./api";
import { generateNumber } from "./products_function";
import CryptoJS from "crypto-js";

// --- Types & Interfaces ---

export type AccountCategory = 'Asset' | 'Liability' | 'Equity' | 'Revenue' | 'Expense';
export type NormalBalance = 'Debit' | 'Credit';
export type AccountStatementType = 'BalanceSheet' | 'ProfitLoss';

export interface AccountNode {
  id: string;
  code: string;
  name: string;
  nameAr?: string;
  accountType?: "main" | "sub"; // 'main' for group, 'sub' for translational
  level: number;
  parentId: string | null;
  accountCategory?: AccountCategory;
  normalBalance?: NormalBalance;
  statementType?: AccountStatementType;
  description?: string;
  status?: "active" | "inactive";
  balanceType?: "debit" | "credit" | "both"; // Legacy support, prefer normalBalance
  children?: AccountNode[];
  // costCenterId: string; // Optional
  // isAnalytical: boolean; // Computed or stored
}

// --- Constants ---

export const LEVEL_INCREMENTS: Record<number, number> = {
  1: 1000,
  2: 100,
  3: 10,
  4: 1,
};

export const CATEGORY_MAP: Record<string, AccountCategory> = {
  '1': 'Asset',
  '2': 'Liability',
  '3': 'Equity',
  '4': 'Revenue',
  '5': 'Expense',
};

export const BALANCE_MAP: Record<AccountCategory, NormalBalance> = {
  'Asset': 'Debit',
  'Liability': 'Credit',
  'Equity': 'Credit',
  'Revenue': 'Credit',
  'Expense': 'Debit',
};

export const STATEMENT_MAP: Record<AccountCategory, AccountStatementType> = {
  'Asset': 'BalanceSheet',
  'Liability': 'BalanceSheet',
  'Equity': 'BalanceSheet',
  'Revenue': 'ProfitLoss',
  'Expense': 'ProfitLoss',
};

// --- Core Helper Functions ---

export function getCategoryFromCode(code: string): AccountCategory | undefined {
  const firstDigit = code.charAt(0);
  return CATEGORY_MAP[firstDigit];
}

export function getDefaultBalanceAndStatement(category: AccountCategory) {
  return {
    normalBalance: BALANCE_MAP[category],
    statementType: STATEMENT_MAP[category],
  };
}

export function getLevelFromCode(code: string): number {
  if (!code) return 1;
  return 1; // Placeholder, relying on hierarchy logic
}

/**
 * Generates the next available code for a new account based on its parent and level.
 */
export function generateNextCode(parentCode: string | null, level: number, siblings: AccountNode[]): string {
  const increment = LEVEL_INCREMENTS[level];

  if (!parentCode) {
    const maxCode = siblings.reduce((max, node) => {
      const codeVal = parseInt(node.code);
      return !isNaN(codeVal) && codeVal > max ? codeVal : max;
    }, 0);
    return maxCode === 0 ? "1000" : (maxCode + 1000).toString();
  }

  const parentVal = parseInt(parentCode);
  if (isNaN(parentVal)) return "";

  let maxSiblingVal = parentVal;

  siblings.forEach(node => {
    const codeVal = parseInt(node.code);
    if (!isNaN(codeVal) && codeVal > maxSiblingVal) {
      maxSiblingVal = codeVal;
    }
  });

  let nextCodeVal = maxSiblingVal + increment;

  return nextCodeVal.toString();
}

/**
 * Validates if an account code is valid within the hierarchy.
 */
export function validateAccountCode(code: string, parentCode: string | null, level: number, existingCodes: string[]): { isValid: boolean, message?: string } {

  if (!code) return { isValid: false, message: "Code is required" };
  if (isNaN(Number(code))) return { isValid: false, message: "Code must be numeric" };

  if (existingCodes.includes(code)) return { isValid: false, message: "Code already exists" };

  if (level === 1) {
    if (code.length !== 4) return { isValid: true };
    if (parseInt(code) % 1000 !== 0) return { isValid: false, message: "Level 1 codes must be multiples of 1000 (e.g. 1000, 2000)" };
  } else if (parentCode) {
    const parentVal = parseInt(parentCode);
    const codeVal = parseInt(code);

    if (codeVal <= parentVal) return { isValid: false, message: "Code must be greater than parent code" };

    if (level === 2 && codeVal % 100 !== 0) return { isValid: false, message: "Level 2 codes should be multiples of 100 (e.g. 1100)" };
    if (level === 3 && codeVal % 10 !== 0) return { isValid: false, message: "Level 3 codes should be multiples of 10 (e.g. 1110)" };

    const parentPrefix = parentCode.substring(0, level - 1);
    const childPrefix = code.substring(0, level - 1);
    if (parentPrefix !== childPrefix) {
      return { isValid: false, message: `Code must start with parent prefix ${parentPrefix}` };
    }
  }

  return { isValid: true };
}

export function flattenTree(tree: AccountNode[]): AccountNode[] {
  let flat: AccountNode[] = [];
  tree.forEach(node => {
    flat.push(node);
    if (node.children && node.children.length > 0) {
      flat = flat.concat(flattenTree(node.children));
    }
  });
  return flat;
}

export function findNode(tree: AccountNode[], id: string): AccountNode | null {
  for (const node of tree) {
    if (node.id === id) return node;
    if (node.children) {
      const found = findNode(node.children, id);
      if (found) return found;
    }
  }
  return null;
}

export function searchAccounts(tree: AccountNode[], query: string): AccountNode[] {
  if (!query) return tree;

  const lowerQuery = query.toLowerCase();

  return tree.reduce((acc, node) => {
    const matches =
      node.name.toLowerCase().includes(lowerQuery) ||
      node.code.includes(lowerQuery) ||
      (node.nameAr && node.nameAr.includes(query));

    const filteredChildren = node.children ? searchAccounts(node.children, query) : [];

    if (matches || filteredChildren.length > 0) {
      acc.push({
        ...node,
        children: filteredChildren
      });
    }

    return acc;
  }, [] as AccountNode[]);
}

export function generateId() {
  if (typeof crypto !== "undefined" && (crypto as any).randomUUID)
    return (crypto as any).randomUUID();
  return String(Date.now()) + Math.floor(Math.random() * 1000);
}

export function updateNode(
  tree: AccountNode[],
  id: string,
  updater: (n: AccountNode) => AccountNode,
): AccountNode[] {
  return tree.map((node) => {
    if (node.id === id) return updater(node);
    if (node.children && node.children.length)
      return { ...node, children: updateNode(node.children, id, updater) };
    return node;
  });
}

export function removeNode(tree: AccountNode[], id: string): AccountNode[] {
  const filtered = tree
    .map((node) => {
      if (node.children && node.children.length)
        return { ...node, children: removeNode(node.children, id) };
      return node;
    })
    .filter((n) => n.id !== id);
  return filtered;
}

export const defaultAccountsTree: AccountNode[] = [
  {
    id: "1",
    code: "1000",
    name: "Assets",
    nameAr: "الأصول",
    accountType: "main",
    balanceType: "debit",
    level: 1,
    parentId: null,
    accountCategory: "Asset",
    normalBalance: "Debit",
    statementType: "BalanceSheet",
    children: [
      {
        id: "11",
        code: "1100",
        name: "Current Assets",
        nameAr: "الأصول المتداولة",
        accountType: "main",
        balanceType: "debit",
        level: 2,
        parentId: "1",
        accountCategory: "Asset",
        normalBalance: "Debit",
        statementType: "BalanceSheet",
        children: [
          {
            id: "111",
            code: "1110",
            name: "Cash on Hand",
            nameAr: "النقدية بالخزينة",
            accountType: "sub",
            balanceType: "debit",
            level: 3,
            parentId: "11",
            accountCategory: "Asset",
            normalBalance: "Debit",
            statementType: "BalanceSheet",
            children: []
          },
          {
            id: "112",
            code: "1120",
            name: "Bank Accounts",
            nameAr: "الحسابات البنكية",
            accountType: "sub",
            balanceType: "debit",
            level: 3,
            parentId: "11",
            accountCategory: "Asset",
            normalBalance: "Debit",
            statementType: "BalanceSheet",
            children: []
          },
        ]
      },
    ],
  },
  {
    id: "2",
    code: "2000",
    name: "Liabilities",
    nameAr: "الخصوم",
    accountType: "main",
    balanceType: "credit",
    level: 1,
    parentId: null,
    accountCategory: "Liability",
    normalBalance: "Credit",
    statementType: "BalanceSheet",
    children: [
      {
        id: "21",
        code: "2100",
        name: "Current Liabilities",
        nameAr: "الخصوم المتداولة",
        accountType: "main",
        balanceType: "credit",
        level: 2,
        parentId: "2",
        accountCategory: "Liability",
        normalBalance: "Credit",
        statementType: "BalanceSheet",
        children: []
      }
    ]
  },
  {
    id: "3",
    code: "3000",
    name: "Equity",
    nameAr: "حقوق الملكية",
    accountType: "main",
    balanceType: "credit",
    level: 1,
    parentId: null,
    accountCategory: "Equity",
    normalBalance: "Credit",
    statementType: "BalanceSheet",
    children: []
  },
  {
    id: "4",
    code: "4000",
    name: "Revenue",
    nameAr: "الإيرادات",
    accountType: "main",
    balanceType: "credit",
    level: 1,
    parentId: null,
    accountCategory: "Revenue",
    normalBalance: "Credit",
    statementType: "ProfitLoss",
    children: []
  },
  {
    id: "5",
    code: "5000",
    name: "Expenses",
    nameAr: "المصروفات",
    accountType: "main",
    balanceType: "debit",
    level: 1,
    parentId: null,
    accountCategory: "Expense",
    normalBalance: "Debit",
    statementType: "ProfitLoss",
    children: []
  },
];

// --- API Functions (Restored) ---

export const calculateCostCenterTotal = (item: any) => {
  var valP = 0,
    valT = 0;
  Array.from(item as any[]).forEach((i: any) => {
    if (i["type"] === "percentage") {
      valP = valP + i["value"];
    } else {
      valT = valT + i["value"];
    }
  });

  return {
    totalPercentage: valP,
    total: valT,
  };
};

export const calculateAccountsTotals = (values: any) => {
  const xdebit = values.items.reduce(
    (sum: number, item: any) => sum + Number(item.debit),
    0,
  );
  const ycredit = values.items.reduce(
    (sum: number, item: any) => sum + Number(item.credit),
    0,
  );

  const totalTaxcredit = values.items.reduce((sum: number, item: any) => {
    const itemSubtotal = Number(item.credit);
    return sum + itemSubtotal * (Number(item.taxRate) / 100);
  }, 0);

  const totalTaxdebit = values.items.reduce((sum: number, item: any) => {
    const itemSubtotal = Number(item.debit);
    return sum + itemSubtotal * (Number(item.taxRate) / 100);
  }, 0);

  const debit = xdebit + totalTaxdebit;
  const credit = ycredit + totalTaxcredit;

  return {
    debit,
    credit,
  };
};

export const calculateAccountsItemTotal = (item: any) => {
  const afterDiscount = item.debit > 0 ? item.debit : item.credit;
  const tax = afterDiscount * (item.taxRate / 100);
  return afterDiscount + tax;
};

export const addOrEditAccountsEntry = async (
  location: any,
  submitData: any,
  invoiceID: any,
  elementName: any,
  name1: any,
  name2: any,
) => {
  var amount;
  if (
    elementName === "expenses" ||
    elementName === "Receivables" ||
    elementName === "sales_payment" ||
    elementName === "purchase_payment"
  ) {
    amount = submitData?.amount;
  } else {
    amount = submitData?.amount?.total;
  }
  if (location?.state?.action == "edit") {
    var res = await commonApi.updateOtherFields(
      "accounts",
      "invoiceID",
      invoiceID,
      {
        updatedAt: new Date().toISOString(),
        issueDate: submitData?.issueDate,
        updatedBy: JSON.stringify(
          JSON.parse(
            CryptoJS.AES.decrypt(
              localStorage.getItem("user") || "",
              import.meta.env.VITE_SECRET,
            ).toString(CryptoJS.enc.Utf8),
          )?.user,
        ),
        main: JSON.stringify({
          elementNumber: submitData?.elementNumber,
          currency: submitData?.currency,
          issueDate: submitData?.issueDate,
          items: [
            {
              costCenterId: "",
              costCenterName: "",
              guideId: "",
              guideName: name1,
              description: "",
              taxRate: 0,
              credit: 0,
              debit: amount,
            },
            {
              costCenterId: "",
              costCenterName: "",
              guideId: "",
              guideName: name2,
              description: "",
              taxRate: 0,
              credit: amount,
              debit: 0,
            },
          ],
          creditTotal: amount,
          debitTotal: amount,
          notes: "",
          elementName: elementName,
          attachments: [],
          status: "Sent",
        }),

        totalAmount: amount,
      },
    );
    console.log("accounts", res);
  } else {
    const elementNumber = generateNumber("ACC");

    var res2 = await commonApi.create(
      {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: JSON.stringify(
          JSON.parse(
            CryptoJS.AES.decrypt(
              localStorage.getItem("user") || "",
              import.meta.env.VITE_SECRET,
            ).toString(CryptoJS.enc.Utf8),
          )?.user,
        ),
        updatedBy: JSON.stringify(
          JSON.parse(
            CryptoJS.AES.decrypt(
              localStorage.getItem("user") || "",
              import.meta.env.VITE_SECRET,
            ).toString(CryptoJS.enc.Utf8),
          )?.user,
        ),
        issueDate: submitData?.issueDate,
        invoiceID: invoiceID,
        main: JSON.stringify({
          elementNumber: submitData?.elementNumber,
          currency: submitData?.currency,
          issueDate: submitData?.issueDate,
          items: [
            {
              costCenterId: "",
              costCenterName: "",
              guideId: "",
              guideName: name1,
              description: "",
              taxRate: 0,
              credit: 0,
              debit: amount,
            },
            {
              costCenterId: "",
              costCenterName: "",
              guideId: "",
              guideName: name2,
              description: "",
              taxRate: 0,
              credit: amount,
              debit: 0,
            },
          ],
          creditTotal: amount,
          debitTotal: amount,
          notes: "",
          elementName: elementName,
          attachments: [],
          status: "Sent",
        }),
        elementNumber: elementNumber,
        totalAmount: amount,
        status: "Sent",
      },
      "accounts",
    );
  }
};

export const loadCostCenterOrTreeAccountsData = async (
  setIsLoading: any,
  setTree: any,
  setUpdateId: any,
  tableName: any,
) => {
  try {
    setIsLoading(true);
    var result = await commonApi.getAll(
      1,
      100,
      [],
      {
        field: "id",
        direction: "desc",
        type: "basic",
        json_path: "$.elementNumber",
      },
      tableName,
    );
    console.log("result", result);
    let treeData = [];

    if (result.data && result.data.length > 0 && result.data[0].main) {
      try {
        treeData = JSON.parse(result.data[0].main);
      } catch (e) {
        console.error("Error parsing tree data", e);
      }
    }

    if (!treeData || treeData.length === 0) {
      treeData = tableName === "accounts_guide" ? defaultAccountsTree : [];
    }

    setTree(treeData);
    if (typeof setUpdateId === 'function') {
      setUpdateId(result.data.length ? result.data[0].id : null);
    }
  } catch (error) {
    console.error("Error loading accounts data:", error);
    // Fallback to default tree on error for accounts_guide
    if (tableName === "accounts_guide") {
      setTree(defaultAccountsTree);
    } else {
      setTree([]);
    }
  } finally {
    setIsLoading(false);
  }
};

export const addCostCenterOrTreeAccountsData = async (
  data: any,
  setIsLoading: any,
  setTree: any,
  subTree: any,
  tableName: any,
  setUpdateId: any,
  updateId: any,
) => {
  try {
    setIsLoading(true);

    if (updateId === null) {
      var result = await commonApi.create(
        {
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: JSON.stringify(
            JSON.parse(
              CryptoJS.AES.decrypt(
                localStorage.getItem("user") || "",
                import.meta.env.VITE_SECRET,
              ).toString(CryptoJS.enc.Utf8),
            )?.user,
          ),
          updatedBy: JSON.stringify(
            JSON.parse(
              CryptoJS.AES.decrypt(
                localStorage.getItem("user") || "",
                import.meta.env.VITE_SECRET,
              ).toString(CryptoJS.enc.Utf8),
            )?.user,
          ),
          //
          issueDate: new Date().toISOString(),
          main: JSON.stringify(data),
          meta: JSON.stringify({
            subTree: subTree,
          }),
        },
        tableName,
      );
    } else {
      await commonApi.update(
        updateId,
        {
          updatedAt: new Date().toISOString(),
          updatedBy: JSON.stringify(
            JSON.parse(
              CryptoJS.AES.decrypt(
                localStorage.getItem("user") || "",
                import.meta.env.VITE_SECRET,
              ).toString(CryptoJS.enc.Utf8),
            )?.user,
          ),
          main: JSON.stringify(data),
          meta: JSON.stringify({
            subTree: subTree,
          }),
        },
        tableName,
      );
    }

    await loadCostCenterOrTreeAccountsData(
      setIsLoading,
      setTree,
      setUpdateId,
      tableName,
    );
  } catch (error) {
    console.error("Error saving data:", error);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Failed to save changes. Please try again.",
    });
  } finally {
    setIsLoading(false);
  }
};

export const toggle = (id: string, setExpanded: any) =>
  setExpanded((s: any) => ({ ...s, [id]: !s[id] }));

export const startEdit = (
  id: string,
  setEditingId: any,
  setAddingUnder: any,
  setRootAddOpen: any,
) => {
  setEditingId(id);
  setAddingUnder(null);
  setRootAddOpen(false);
};

export const startAdd = (
  parentId: string | null,
  setAddingUnder: any,
  setEditingId: any,
  setRootAddOpen: any,
) => {
  setAddingUnder(parentId);
  setEditingId(null);
  setRootAddOpen(parentId === null);
};

export const saveEdit = (
  id: string,
  payload: Partial<AccountNode>,
  setTree: any,
  setEditingId: any,
) => {
  setTree((t: AccountNode[]) => updateNode(t, id, (n) => ({ ...n, ...payload })));
  setEditingId(null);
};

export const saveAdd = (
  parentId: string | null,
  payload: Partial<AccountNode>,
  setTree: any,
  setAddingUnder: any,
  setRootAddOpen: any,
  setExpanded: any,
) => {
  const newNode: AccountNode = {
    id: generateId(),
    code: payload.code || generateId(),
    name: payload.name || generateId(),
    level: 1,
    parentId: parentId,
    accountType: (payload.accountType as any) || "sub",
    balanceType: (payload.balanceType as any) || "debit",
    children: [],
  };
  if (parentId === null) {
    setTree((t: AccountNode[]) => [...t, newNode]);
  } else {
    setTree((t: AccountNode[]) =>
      updateNode(t, parentId, (n) => ({
        ...n,
        children: [...(n.children || []), newNode],
      })),
    );
    setExpanded((s: any) => ({ ...s, [parentId]: true }));
  }
  setAddingUnder(null);
  setRootAddOpen(false);
};

export const confirmDelete = async (
  id: string,
  setTree: any,
  editingId: any,
  setEditingId: any,
  isRTL: boolean,
) => {
  const result = await Swal.fire({
    title: isRTL
      ? "هل أنت متأكد من حذف هذا العنصر؟"
      : "Are you sure you want to delete this item?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: isRTL ? "حذف" : "Delete",
    cancelButtonText: isRTL ? "إلغاء" : "Cancel",
    confirmButtonColor: "#d33",
  });

  if (result.isConfirmed) {
    setTree((t: AccountNode[]) => removeNode(t, id));
    if (editingId === id) setEditingId(null);
  }
};

export function subTreeFun(data: any[], subTree: any[]) {
  //  var subTree = [];
  data.forEach((element) => {
    if (element.accountType === "sub") {
      subTree.push(element);
    } else {
      if (element.children && element.children.length > 0) {
        //  var childrenSubTree =
        subTreeFun(element.children, subTree);
        // childrenSubTree.forEach((childElement)=>{
        //   subTree.push(childElement);
        // });
      }
    }
  });
  // return subTree;
}
