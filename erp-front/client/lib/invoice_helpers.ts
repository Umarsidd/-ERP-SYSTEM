import { commonApi } from "./api";

/**
 * Fetch the last invoice for a customer
 * @param customerId Customer ID to fetch invoice for
 * @param tableName Table name (sales_invoices or purchase_invoices)
 * @returns Last invoice object or null
 */
export async function fetchLastInvoice(customerId: string, tableName: string = "sales_invoices") {
    if (!customerId) return null;

    try {
        const filter = [
            { field: "customerId", operator: "=", value: customerId, type: "json", andOr: "and", json_path: "$.id" }
        ];

        const sort = { field: "issueDate", direction: "desc", type: "basic" };

        const result = await commonApi.getAll(
            1, // currentPage
            1, // itemsPerPage - we only need the last one
            filter,
            sort,
            tableName
        );

        if (result?.data && result.data.length > 0) {
            const lastInvoice = result.data[0];
            return {
                id: lastInvoice.id,
                elementNumber: lastInvoice.elementNumber,
                issueDate: lastInvoice.issueDate,
                totalAmount: lastInvoice.totalAmount,
                paidAmount: JSON.parse(lastInvoice.main)?.paidAmount || 0,
                status: lastInvoice.status,
                outstanding: lastInvoice.totalAmount - (JSON.parse(lastInvoice.main)?.paidAmount || 0),
            };
        }

        return null;
    } catch (error) {
        console.error("Error fetching last invoice:", error);
        return null;
    }
}

/**
 * Calculate total outstanding amount for a customer
 * @param customerId Customer ID
 * @param tableName Table name (sales_invoices or purchase_invoices)
 * @returns Total outstanding amount
 */
export async function calculateCustomerOutstanding(customerId: string, tableName: string = "sales_invoices") {
    if (!customerId) return 0;

    try {
        // Fetch all unpaid and partially paid invoices for this customer
        const filter = [
            { field: "customerId", operator: "=", value: customerId, type: "json", andOr: "and", json_path: "$.id" },
            { field: "status", operator: "IN", value: ["Unpaid", "PartiallyPaid"], type: "basic", andOr: "and" }
        ];

        const sort = { field: "id", direction: "desc", type: "basic" };

        const result = await commonApi.getAll(
            1,
            100, // Get up to 100 unpaid invoices
            filter,
            sort,
            tableName
        );

        if (result?.data && result.data.length > 0) {
            const totalOutstanding = result.data.reduce((sum: number, invoice: any) => {
                const totalAmount = invoice.totalAmount || 0;
                const paidAmount = JSON.parse(invoice.main)?.paidAmount || 0;
                return sum + (totalAmount - paidAmount);
            }, 0);

            return totalOutstanding;
        }

        return 0;
    } catch (error) {
        console.error("Error calculating customer outstanding:", error);
        return 0;
    }
}

/**
 * Get customer's last two invoices as a summary
 * @param customerId Customer ID
 * @param tableName Table name
 * @returns Array of last two invoices or empty array
 */
export async function getLastInvoices(customerId: string, tableName: string = "sales_invoices") {
    if (!customerId) return [];

    try {
        const filter = [
            { field: "customerId", operator: "=", value: customerId, type: "json", andOr: "and", json_path: "$.id" }
        ];

        const sort = { field: "issueDate", direction: "desc", type: "basic" };

        const result = await commonApi.getAll(
            1,
            2, // Get last 2 invoices
            filter,
            sort,
            tableName
        );

        if (result?.data && result.data.length > 0) {
            return result.data.map((invoice: any) => ({
                id: invoice.id,
                elementNumber: invoice.elementNumber,
                issueDate: invoice.issueDate,
                totalAmount: invoice.totalAmount,
                paidAmount: JSON.parse(invoice.main)?.paidAmount || 0,
                status: invoice.status,
                outstanding: invoice.totalAmount - (JSON.parse(invoice.main)?.paidAmount || 0),
            }));
        }

        return [];
    } catch (error) {
        console.error("Error fetching last invoices:", error);
        return [];
    }
}
