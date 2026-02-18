import {

  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  Receipt,
  FileText,
  Send,
  CreditCard,
  Banknote,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  Wallet,
  Ban,
  MessageSquareDashed,
  FolderKanban,
  Undo2,
  Truck,
} from "lucide-react";

export function MainIcon(props: { icon: any }) {
  const { icon } = props;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Completed":
        return <CheckCircle className="w-4 h-4" />;
      case "Pending":
        return <Clock className="w-4 h-4" />;
      case "Approved":
        return <CheckCircle className="h-5 w-5" />;
      case "Rejected":
        return <XCircle className="h-5 w-5" />;
      case "Draft":
        return <Clock className="w-4 h-4" />;
      case "Processing":
        return <FolderKanban className="w-4 h-4" />;
      case "Failed":
        return <XCircle className="w-4 h-4" />;
      case "Unpaid":
        return <XCircle className="w-4 h-4" />;
      case "Paid":
        return <CreditCard className="w-4 h-4" />;

      //
      case "stockApproved":
        return <CheckCircle className="h-5 w-5" />;
      case "stockRejected":
        return <XCircle className="h-5 w-5" />;
      case "sales_return":
        return <Undo2 className="w-4 h-4" />;

      case "PartiallyReturned":
        return <Undo2 className="w-4 h-4" />;
      case "Returned":
        return <Undo2 className="w-4 h-4" />;
      case "stockPending":
        return <Truck className="w-4 h-4" />;

      ///here
      case "Refunded":
        return <XCircle className="w-4 h-4" />;
      case "Partial":
        return <Receipt className="w-4 h-4" />;

      case "Overdue":
        return <AlertCircle className="w-4 h-4" />;

      case "Sent":
        return <Send className="h-5 w-5" />;
      case "Accepted":
        return <CheckCircle className="h-5 w-5" />;

      case "Expired":
        return <AlertCircle className="h-5 w-5" />;
      case "Converted":
        return <FileText className="h-5 w-5" />;

      case "Issued":
        return <FileText className="h-4 w-4" />;
      case "Applied":
        return <CheckCircle className="h-4 w-4" />;
      case "Cancelled":
        return <AlertCircle className="h-4 w-4" />;

      case "Credit Card":
        return <CreditCard className="h-4 w-4" />;
      case "Bank Transfer":
        return <Banknote className="h-4 w-4" />;
      case "Cash":
        return <Wallet className="h-4 w-4" />;
      case "Check":
        return <FileText className="h-4 w-4" />;
      case "PayPal":
        return <CreditCard className="h-4 w-4" />;

      case "Invoice":
        return <Receipt className="h-4 w-4" />;
      case "Subscription":
        return <RefreshCw className="h-4 w-4" />;
      case "Deposit":
        return <TrendingUp className="h-4 w-4" />;
      case "Refund":
        return <TrendingDown className="h-4 w-4" />;

      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  return getStatusIcon(icon);
}
