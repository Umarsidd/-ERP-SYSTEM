import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { treasuryConversionApi } from "@/lib/api";
import {
    Search,
    Calendar,
    ArrowRightLeft,
    Download,
    Eye,
    Filter,
} from "lucide-react";
import { format } from "date-fns";

interface Conversion {
    id: number;
    elementNumber: string;
    fromSafeId: number;
    toSafeId: number;
    fromSafeName: string;
    toSafeName: string;
    amount: number;
    conversionDate: string;
    notes: string;
    status: string;
    createdAt: string;
}

const ConversionHistory = () => {
    const { isRTL } = useLanguage();
    const { formatAmount } = useCurrency();
    const navigate = useNavigate();

    const [conversions, setConversions] = useState<Conversion[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [limit] = useState(10);

    // Filters
    const [searchTerm, setSearchTerm] = useState("");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const [statusFilter, setStatusFilter] = useState("");

    useEffect(() => {
        fetchConversions();
    }, [page, searchTerm, dateFrom, dateTo, statusFilter]);

    const fetchConversions = async () => {
        try {
            setIsLoading(true);
            const filters: any = {};

            if (dateFrom) filters.dateFrom = dateFrom;
            if (dateTo) filters.dateTo = dateTo;
            if (statusFilter) filters.status = statusFilter;

            const response = await treasuryConversionApi.getAll(page, limit, filters);

            let data = response.data || [];

            // Client-side search filter
            if (searchTerm) {
                data = data.filter(
                    (conv: Conversion) =>
                        conv.elementNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        conv.fromSafeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        conv.toSafeName?.toLowerCase().includes(searchTerm.toLowerCase())
                );
            }

            setConversions(data);
            setTotal(response.total || 0);
        } catch (error) {
            console.error("Error fetching conversions:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleExport = () => {
        // TODO: Implement Excel export
        console.log("Export to Excel");
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "Completed":
                return "bg-green-500/10 text-green-600 border-green-500/20";
            case "Failed":
                return "bg-destructive/10 text-destructive border-destructive/20";
            case "Cancelled":
                return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
            default:
                return "bg-accent text-accent-foreground";
        }
    };

    const clearFilters = () => {
        setSearchTerm("");
        setDateFrom("");
        setDateTo("");
        setStatusFilter("");
    };

    return (
        <div className="container mx-auto p-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
            >
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">
                            {isRTL ? "سجل التحويلات" : "Conversion History"}
                        </h1>
                        <p className="text-muted-foreground mt-2">
                            {isRTL
                                ? "عرض جميع التحويلات بين الخزائن"
                                : "View all treasury conversions"}
                        </p>
                    </div>
                    <Button onClick={handleExport} variant="outline">
                        <Download className="w-4 h-4 mr-2" />
                        {isRTL ? "تصدير" : "Export"}
                    </Button>
                </div>
            </motion.div>

            {/* Filters */}
            <Card className="p-6 mb-6">
                <div className="flex items-center gap-2 mb-4">
                    <Filter className="w-5 h-5 text-primary" />
                    <h2 className="text-lg font-semibold">
                        {isRTL ? "الفلاتر" : "Filters"}
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Search */}
                    <div>
                        <Label>{isRTL ? "بحث" : "Search"}</Label>
                        <div className="relative mt-2">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                type="text"
                                placeholder={isRTL ? "رقم التحويل، الخزينة..." : "Number, safe..."}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>

                    {/* Date From */}
                    <div>
                        <Label>{isRTL ? "من تاريخ" : "From Date"}</Label>
                        <Input
                            type="date"
                            value={dateFrom}
                            onChange={(e) => setDateFrom(e.target.value)}
                            className="mt-2"
                        />
                    </div>

                    {/* Date To */}
                    <div>
                        <Label>{isRTL ? "إلى تاريخ" : "To Date"}</Label>
                        <Input
                            type="date"
                            value={dateTo}
                            onChange={(e) => setDateTo(e.target.value)}
                            className="mt-2"
                        />
                    </div>

                    {/* Status */}
                    <div>
                        <Label>{isRTL ? "الحالة" : "Status"}</Label>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full mt-2 px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            <option value="">{isRTL ? "الكل" : "All"}</option>
                            <option value="Completed">{isRTL ? "مكتمل" : "Completed"}</option>
                            <option value="Failed">{isRTL ? "فشل" : "Failed"}</option>
                            <option value="Cancelled">{isRTL ? "ملغى" : "Cancelled"}</option>
                        </select>
                    </div>
                </div>

                <div className="mt-4 flex justify-end">
                    <Button onClick={clearFilters} variant="ghost" size="sm">
                        {isRTL ? "مسح الفلاتر" : "Clear Filters"}
                    </Button>
                </div>
            </Card>

            {/* Conversions Table */}
            <Card className="overflow-hidden">
                {isLoading ? (
                    <div className="flex items-center justify-center p-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    </div>
                ) : conversions.length === 0 ? (
                    <div className="text-center p-12">
                        <ArrowRightLeft className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">
                            {isRTL ? "لا توجد تحويلات" : "No conversions found"}
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-accent border-b border-border">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-semibold">
                                        {isRTL ? "رقم التحويل" : "Number"}
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold">
                                        {isRTL ? "التاريخ" : "Date"}
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold">
                                        {isRTL ? "من" : "From"}
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold">
                                        {isRTL ? "إلى" : "To"}
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold">
                                        {isRTL ? "المبلغ" : "Amount"}
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold">
                                        {isRTL ? "الحالة" : "Status"}
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold">
                                        {isRTL ? "إجراءات" : "Actions"}
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {conversions.map((conversion, index) => (
                                    <motion.tr
                                        key={conversion.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="hover:bg-accent/50 transition-colors"
                                    >
                                        <td className="px-6 py-4">
                                            <span className="font-medium text-primary">
                                                {conversion.elementNumber}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-muted-foreground">
                                            {conversion.conversionDate
                                                ? format(new Date(conversion.conversionDate), "dd/MM/yyyy")
                                                : "-"}
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            {conversion.fromSafeName}
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            {conversion.toSafeName}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-semibold">
                                                {formatAmount(conversion.amount)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge className={getStatusColor(conversion.status)}>
                                                {isRTL
                                                    ? conversion.status === "Completed"
                                                        ? "مكتمل"
                                                        : conversion.status === "Failed"
                                                            ? "فشل"
                                                            : "ملغى"
                                                    : conversion.status}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => {
                                                    // TODO: Navigate to conversion details
                                                    console.log("View conversion", conversion.id);
                                                }}
                                            >
                                                <Eye className="w-4 h-4" />
                                            </Button>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {!isLoading && conversions.length > 0 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-border">
                        <p className="text-sm text-muted-foreground">
                            {isRTL
                                ? `عرض ${conversions.length} من ${total}`
                                : `Showing ${conversions.length} of ${total}`}
                        </p>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage(page - 1)}
                                disabled={page === 1}
                            >
                                {isRTL ? "السابق" : "Previous"}
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage(page + 1)}
                                disabled={page * limit >= total}
                            >
                                {isRTL ? "التالي" : "Next"}
                            </Button>
                        </div>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default ConversionHistory;
