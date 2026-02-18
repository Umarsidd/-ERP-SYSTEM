import { useLanguage } from "@/contexts/LanguageContext";

import {
  getStatusColor,
  getStatusLabel,
  handleCopy,
  handleEdit,
  handleSendToClient,
  handleView,
} from "@/lib/function";
import {
  ArrowUpDown,
  FileText,
  User,
  Calendar,
  Eye,
  Edit,
  MoreHorizontal,
  Copy,
  Trash2,
  Printer,
  Send,
  FileType,
  FileSpreadsheet,
} from "lucide-react";
import { MainIcon } from "../common/mainIcon";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useNavigate } from "react-router-dom";
import { commonApi } from "@/lib/api";
import { MainDropDown } from "./MainDropDown";
import { selectedCurrency, selectedSymbol } from "@/data/data";

export function TableView(props: {
  main: any;
  setIsRefreshing: any;
  type: any;
  sectionName;
  pageName?;
  pageName2?;
}) {
  const { main, setIsRefreshing, type, sectionName, pageName, pageName2 } = props;

  const { isRTL } = useLanguage();
  const { formatAmount, convertAmount } = useCurrency();
  const navigate = useNavigate();

  return (
    <div className="overflow-x-">
      <table className="w-full">
        <thead className="bg-muted/50">
          <tr>
            <th className="px-2 py-2 text-left rtl:text-right text-sm font-medium text-muted-foreground">
              <button
                // onClick={() => handleSort("elementNumber")}
                className="flex items-center space-x-1 rtl:space-x-reverse hover:text-foreground"
              >
                <span>{isRTL ? "رقم الفاتورة" : "Invoice #"}</span>
                {/* <ArrowUpDown className="w-3 h-3" /> */}
              </button>
            </th>
            <th className="px-2 py-2 text-left rtl:text-right text-sm font-medium text-muted-foreground">
              <button
                // onClick={() => handleSort("customer")}
                className="flex items-center space-x-1 rtl:space-x-reverse hover:text-foreground"
              >
                <span>{isRTL ? "العميل" : "Customer"}</span>
                {/* <ArrowUpDown className="w-3 h-3" /> */}
              </button>
            </th>
            <th className="px-2 py-2 text-left rtl:text-right text-sm font-medium text-muted-foreground">
              <button
                // onClick={() => handleSort("amount")}
                className="flex items-center space-x-1 rtl:space-x-reverse hover:text-foreground"
              >
                <span>{isRTL ? "المبلغ" : "Amount"}</span>
                {/* <ArrowUpDown className="w-3 h-3" /> */}
              </button>
            </th>
            <th className="px-2 py-2 text-left rtl:text-right text-sm font-medium text-muted-foreground">
              <button
                // onClick={() => handleSort("status")}
                className="flex items-center space-x-1 rtl:space-x-reverse hover:text-foreground"
              >
                <span>{isRTL ? "الحالة" : "Status"}</span>
                {/* <ArrowUpDown className="w-3 h-3" /> */}
              </button>
            </th>
            <th className="px-2 py-2 text-left rtl:text-right text-sm font-medium text-muted-foreground">
              <button
                // onClick={() => handleSort("createdAt")}
                className="flex items-center space-x-1 rtl:space-x-reverse hover:text-foreground"
              >
                <span>{isRTL ? "التاريخ" : "Date"}</span>
                {/* <ArrowUpDown className="w-3 h-3" /> */}
              </button>
            </th>
            <th className="px-2 py-2 text-left rtl:text-right text-sm font-medium text-muted-foreground">
              {isRTL ? "الإجراءات" : "Actions"}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {main?.map((data) => (
            <tr key={data.id} className="hover:bg-muted/30 transition-colors">
              <td className="px-2 py-2">
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium text-foreground">
                    {JSON.parse(data.main)?.elementNumber}
                  </span>
                </div>
              </td>
              <td className="px-2 py-2">
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <span className="text-foreground">
                      {isRTL
                        ? JSON.parse(data.main)?.customer?.name
                        : JSON.parse(data.main)?.customer?.name}
                    </span>
                    {/* <div className="text-xs text-muted-foreground">
                      {isRTL
                        ? JSON.parse(data.main).salesRep.name
                        : JSON.parse(data.main).salesRep.name}
                    </div> */}
                  </div>
                </div>
              </td>
              <td className="px-2 py-2">
                <span className="font-semibold text-foreground">
                  {formatAmount(
                    convertAmount(
                      data.totalAmount ?? 0,
                      localStorage.getItem("selectedCurrency") ??
                        selectedCurrency,
                    ),
                    ((JSON.parse(data.main)?.currency &&
                      JSON.parse(JSON.parse(data.main)?.currency)?.symbol) ||
                      localStorage.getItem("selectedCurrencySymbol")) ??
                      selectedSymbol,
                  )}
                </span>
                <div className="text-xs text-muted-foreground">
                  {isRTL
                    ? JSON.parse(data.main)?.paymentMethodAr
                    : JSON.parse(data.main)?.paymentMethod}
                </div>
              </td>
              <td className="px-2 py-2">
                <span
                  className={`flex items-center space-x-1 mb-1 rtl:space-x-reverse px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(data?.status)}`}
                >
                  <MainIcon icon={data?.status} />
                  <span>{getStatusLabel(data?.status, isRTL)}</span>
                </span>
                {JSON.parse(data.main)?.returnStatus && (
                  <span
                    className={`flex items-center space-x-1 mt-1 rtl:space-x-reverse px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(JSON.parse(data.main).returnStatus)}`}
                  >
                    <MainIcon icon={JSON.parse(data.main)?.returnStatus} />
                    <span>
                      {getStatusLabel(
                        JSON.parse(data.main)?.returnStatus,
                        isRTL,
                      )}
                    </span>
                  </span>
                )}

                {data?.stockStatus && (
                  <span
                    className={`flex items-center space-x-1 mt-1 rtl:space-x-reverse px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(data?.stockStatus)}`}
                  >
                    <MainIcon icon={data?.stockStatus} />
                    <span>{getStatusLabel(data?.stockStatus, isRTL)}</span>
                  </span>
                )}
              </td>
              <td className="px-2 py-2">
                <div className="flex items-center space-x-1 rtl:space-x-reverse text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {new Date(
                      JSON.parse(data.main)?.issueDate,
                    ).toLocaleDateString()}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {type === "sales"
                    ? isRTL
                      ? "الاستحقاق:"
                      : "Due:"
                    : isRTL
                      ? "تاريخ الاستلام:"
                      : "Delivery Date:"}
                  {new Date(
                    JSON.parse(data.main)?.dueDate,
                  ).toLocaleDateString()}
                </div>
              </td>
              <td className="px-2 py-2">
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <button
                    onClick={() =>
                      handleView(
                        data,
                        navigate,
                        `/${type}/invoices/${data.id}/view`,
                      )
                    }
                    className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-all duration-200 transform hover:scale-105"
                    title={isRTL ? "عرض" : "View"}
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  {/* <button
                    onClick={() =>
                      handleEdit(data, navigate, `/${type}/invoices/edit`)
                    }
                    className="p-2 text-muted-foreground hover:text-warning hover:bg-warning/10 rounded-lg transition-all duration-200 transform hover:scale-105"
                    title={isRTL ? "تحرير" : "Edit"}
                  >
                    <Edit className="w-4 h-4" />
                  </button> */}
                  <MainDropDown
                    type={type}
                    data={data}
                    setIsRefreshing={setIsRefreshing}
                    titleLink={"invoices"}
                    title={null}
                    sectionName={sectionName}
                    pageName={pageName}
                    pageName2={pageName2}
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
