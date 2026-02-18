import { AccountNode } from "./accounts_function";

const STORAGE_KEY = "erp_accounts_data";

export const LocalAccountsApi = {
    getAccounts: (): AccountNode[] | null => {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error("Error reading from local storage:", error);
            return null;
        }
    },

    saveAccounts: (accounts: AccountNode[]): boolean => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
            return true;
        } catch (error) {
            console.error("Error saving to local storage:", error);
            return false;
        }
    },

    // Helper to find and update a node in the tree
    updateAccount: (accounts: AccountNode[], id: string, payload: Partial<AccountNode>): AccountNode[] => {
        const updateRecursive = (nodes: AccountNode[]): AccountNode[] => {
            return nodes.map(node => {
                if (node.id === id) {
                    return { ...node, ...payload };
                }
                if (node.children) {
                    return { ...node, children: updateRecursive(node.children) };
                }
                return node;
            });
        };

        const updated = updateRecursive(accounts);
        LocalAccountsApi.saveAccounts(updated);
        return updated;
    },

    // Helper to add a node to the tree
    addAccount: (accounts: AccountNode[], parentId: string | null, newAccount: AccountNode): AccountNode[] => {
        let updated: AccountNode[];

        if (!parentId) {
            updated = [...accounts, newAccount];
        } else {
            const addRecursive = (nodes: AccountNode[]): AccountNode[] => {
                return nodes.map(node => {
                    if (node.id === parentId) {
                        return {
                            ...node,
                            children: [...(node.children || []), newAccount]
                        };
                    }
                    if (node.children) {
                        return { ...node, children: addRecursive(node.children) };
                    }
                    return node;
                });
            };
            updated = addRecursive(accounts);
        }

        LocalAccountsApi.saveAccounts(updated);
        return updated;
    },

    // Helper to delete a node from the tree
    deleteAccount: (accounts: AccountNode[], id: string): AccountNode[] => {
        const deleteRecursive = (nodes: AccountNode[]): AccountNode[] => {
            return nodes.filter(node => {
                if (node.id === id) return false;
                if (node.children) {
                    node.children = deleteRecursive(node.children);
                }
                return true;
            });
        };

        const updated = deleteRecursive(accounts);
        LocalAccountsApi.saveAccounts(updated);
        return updated;
    },

    // Clear all data (mostly for debug/reset)
    clear: () => {
        localStorage.removeItem(STORAGE_KEY);
    }
};
