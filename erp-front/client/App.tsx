import "./global.css";
import NotFound from "./pages/NotFound";
import { LanguageProvider } from "./contexts/LanguageContext";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CurrencyProvider } from "@/contexts/CurrencyContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { Layout } from "@/components/layout/Layout";
import { ErrorBoundary } from "@/components/other/ErrorBoundary";
import Index from "./pages/Index";
import InvoiceManagement from "./pages/sales/InvoiceManagement";
import CreateInvoice from "./pages/sales/CreateInvoice";
import InvoiceView from "./pages/sales/ViewInvoice";
import RecurringInvoices from "./pages/sales/RecurringInvoices";
import CreditNotices from "./pages/sales/CreditNotices";
import Quotations from "./pages/sales/Quotations";
import CreateQuote from "./pages/sales/CreateQuote";
import ViewCreditNotice from "./pages/sales/ViewCreditNotice";
import ViewQuotation from "./pages/sales/ViewQuotation";
import ViewRecurringInvoice from "./pages/sales/ViewRecurringInvoice";
import CustomerPayments from "./pages/sales/CustomerPayments";
import ViewPayment from "./pages/sales/ViewPayment";
import ReturnedInvoices from "./pages/sales/ReturnedInvoices";
import ViewReturn from "./pages/sales/ViewReturn";
import CreateCreditNotices from "./pages/sales/CreateCreditNotices";
import CreateReturn from "./pages/sales/CreateReturn";
import NewSubscription from "./pages/sales/CreateSubscription";
import NewPayment from "./pages/sales/CreatePayment";
import ForgotPassword from "./pages/auth/ForgotPassword";
import Login from "./pages/auth/Login";
import OTP from "./pages/auth/OTP";
import Register from "./pages/auth/Register";
import ResetPassword from "./pages/auth/ResetPassword";
import CustomerContacts from "./pages/customers/CustomerContacts";
import NewCustomer from "./pages/customers/NewCustomer";
import CustomerManagement from "./pages/customers/CustomerManagement";
import CustomerView from "./pages/customers/CustomerView";
import InventoryList from "./pages/inventory/inventory/InventoryList";
import InventoryView from "./pages/inventory/inventory/InventoryView";
import NewInventory from "./pages/inventory/inventory/NewInventory";
import NewPriceList from "./pages/inventory/price-lists/NewPriceList";
import PriceListList from "./pages/inventory/price-lists/PriceListList";
import PriceListView from "./pages/inventory/price-lists/PriceListView";
import NewProduct from "./pages/inventory/products/NewProduct";
import ProductView from "./pages/inventory/products/ProductView";
import NewStockOrder from "./pages/inventory/stock-orders/NewStockOrder";
import StockOrderList from "./pages/inventory/stock-orders/StockOrderList";
import StockOrderView from "./pages/inventory/stock-orders/StockOrderView";
import NewWarehouse from "./pages/inventory/warehouses/NewWarehouse";
import WarehouseList from "./pages/inventory/warehouses/WarehouseList";
import WarehouseView from "./pages/inventory/warehouses/WarehouseView";
import ProtectedRoute from "./lib/ProtectedRoute";
import ProductList from "./pages/inventory/products/ProductList";
import InventoryNow from "./pages/inventory/inventory/InventoryNow";
import CreatePurchasesInvoice from "./pages/purchases/CreatePurchasesInvoice";
import InvoicePurchasesManagement from "./pages/purchases/InvoicePurchasesManagement";
import InvoicePurchasesView from "./pages/purchases/ViewPurchasesInvoice";
import PurchasesCreateCreditNotices from "./pages/purchases/CreatePurchasesCreditNotices";
import PurchasesCreateReturn from "./pages/purchases/CreatePurchasesReturn";
import PurchasesCreditNotices from "./pages/purchases/PurchasesCreditNotices";
import PurchasesReturnedInvoices from "./pages/purchases/ReturnedPurchasesInvoices";
import PurchasesViewCreditNotice from "./pages/purchases/ViewPurchasesCreditNotice";
import PurchasesViewReturn from "./pages/purchases/ViewPurchasesReturn";
import PurchasesNewPayment from "./pages/purchases/CreatePurchasesPayment";
import PurchasesViewPayment from "./pages/purchases/ViewPurchasesPayment";
import PurchasesPayments from "./pages/purchases/CustomerPurchasesPayments";
import CreatePurchaseQuote from "./pages/purchases/CreatePurchaseQuote";
import QuotationsPurchase from "./pages/purchases/QuotationsPurchase";
import ViewPurchaseQuotation from "./pages/purchases/ViewPurchaseQuotation";
import NewSuppliers from "./pages/suppliers/NewSuppliers";
import SuppliersManagement from "./pages/suppliers/Suppliers";
import SuppliersView from "./pages/suppliers/ViewSuppliers";
import CreatePurchaseOrders from "./pages/purchases/CreatePurchaseOrders";
import ViewPurchaseOrders from "./pages/purchases/ViewPurchaseOrders";
import OrdersPurchase from "./pages/purchases/OrdersPurchase";
import CreatePurchaseOrderQuote from "./pages/purchases/CreatePurchaseOrderQuote";
import OrderQuotationsPurchase from "./pages/purchases/OrderQuotationsPurchase";
import ViewPurchaseOrderQuotation from "./pages/purchases/ViewPurchaseOrderQuotation";
import CreatePurchaseRequests from "./pages/purchases/CreatePurchaseRequests";
import RequestsPurchase from "./pages/purchases/RequestsPurchase";
import ViewRequestsPurchase from "./pages/purchases/ViewRequestsPurchase";
import BankAccounts from "./pages/finance/BankAccounts";
import Receivables from "./pages/finance/Receivables";
import CreateExpenses from "./pages/finance/CreateExpenses";
import Expenses from "./pages/finance/Expenses";
import ViewExpenses from "./pages/finance/ViewExpenses";
import CreateReceivables from "./pages/finance/CreateReceipts";
import ViewReceivables from "./pages/finance/ViewReceivables";
import ViewBankAccounts from "./pages/finance/ViewBankAccounts";
import CreateBankAccounts from "./pages/finance/CreateBankAccounts";
import TransferMoney from "./pages/finance/TransferMoney";
import ConversionHistory from "./pages/finance/ConversionHistory";
import ViewInstallmentAgreements from "./pages/installments/ViewInstallmentAgreements";
import CreateInstallmentAgreements from "./pages/installments/CreateInstallmentAgreements";
import InstallmentsAgreements from "./pages/installments/InstallmentsAgreements";
import AccountsSettings from "./pages/accounts/Settings";
import CostCenters from "./pages/accounts/CostCenters";
import Guide from "./pages/accounts/Guide";
import AddEntry from "./pages/accounts/AddEntry";
import DailyEntries from "./pages/accounts/DailyEntries";
import Assets from "./pages/accounts/Assets";
import ViewAssets from "./pages/accounts/ViewAssets";
import CreateAssets from "./pages/accounts/CreateAssets";
import ViewEntry from "./pages/accounts/ViewEntry";
import Reports from "./pages/reports/Reports";
import SalesReports from "./pages/reports/SalesReports";
import SupplierContacts from "./pages/suppliers/SupplierContacts";
import UserContacts from "./pages/users/UserContacts";
import UserView from "./pages/users/UserView";
import UserManagement from "./pages/users/UserManagement";
import NewUser from "./pages/users/NewUser";
import InventorySettings from "./pages/inventory/settings/InventorySettings";
import { SettingProvider } from "./contexts/SettingContext";
import UnitTemplates from "./pages/inventory/settings/UnitTemplates";
import Settings from "./pages/settings/Settings";
import CurrencyTemplates from "./pages/settings/CurrencyTemplates";
import EmployeeRoles from "./pages/users/Roles";
import BranchView from "./pages/branches/BranchView";
import BranchManagement from "./pages/branches/BranchManagement";
import NewBranch from "./pages/branches/NewBranch";
import Brands from "./pages/inventory/settings/Brands";
import Categories from "./pages/inventory/settings/Categories";




const App = () => (
  <ErrorBoundary>
    <SettingProvider>
      <LanguageProvider>
        <ThemeProvider>
          <CurrencyProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/auth/login" element={<Login />} />
                <Route path="/auth/register" element={<Register />} />
                <Route
                  path="/auth/forgot-password"
                  element={<ForgotPassword />}
                />
                <Route path="/auth/otp" element={<OTP />} />
                <Route
                  path="/auth/reset-password"
                  element={<ResetPassword />}
                />
                <Route element={<ProtectedRoute />}>
                  <Route
                    path="/*"
                    element={
                      <Layout>
                        <Routes>
                          <Route path="/" element={<Index />} />
                          {/* General Accounts Routes */}
                          <Route
                            path="/accounts/daily-entries"
                            element={<DailyEntries />}
                          />
                          <Route
                            path="/accounts/daily-entries/:operation"
                            element={<AddEntry />}
                          />
                          <Route
                            path="/accounts/daily-entries/:id/view"
                            element={<ViewEntry />}
                          />
                          <Route path="/accounts/guide" element={<Guide />} />
                          <Route
                            path="/accounts/cost-centers"
                            element={<CostCenters />}
                          />
                          <Route path="/accounts/assets" element={<Assets />} />
                          <Route
                            path="/accounts/assets/:id/view"
                            element={<ViewAssets />}
                          />
                          <Route
                            path="/accounts/assets/:operation"
                            element={<CreateAssets />}
                          />
                          <Route
                            path="/accounts/settings"
                            element={<AccountsSettings />}
                          />
                          {/* Installments Routes */}
                          <Route
                            path="/installments/agreements"
                            element={<InstallmentsAgreements />}
                          />
                          {/* <Route
                            path="/installments/installments"
                            element={<SubInstallments />}
                          /> */}
                          <Route
                            path="/installments/agreements/:id/view"
                            element={<ViewInstallmentAgreements />}
                          />
                          <Route
                            path="/installments/agreements/:operation"
                            element={<CreateInstallmentAgreements />}
                          />
                          {/* Accounting Routes */}
                          <Route
                            path="/finance/expenses"
                            element={<Expenses />}
                          />
                          <Route
                            path="/finance/expenses/:id/view"
                            element={<ViewExpenses />}
                          />
                          <Route
                            path="/finance/expenses/:operation"
                            element={<CreateExpenses />}
                          />
                          <Route
                            path="/finance/receivables/:id/view"
                            element={<ViewReceivables />}
                          />
                          <Route
                            path="/finance/receivables"
                            element={<Receivables />}
                          />
                          <Route
                            path="/finance/receivables/:operation"
                            element={<CreateReceivables />}
                          />
                          <Route
                            path="/finance/bank-accounts"
                            element={<BankAccounts />}
                          />
                          <Route
                            path="/finance/bank-accounts/:id/view"
                            element={<ViewBankAccounts />}
                          />
                          <Route
                            path="/finance/bank-accounts/transfer-money"
                            element={<TransferMoney />}
                          />
                          <Route
                            path="/finance/bank-accounts/:operation"
                            element={<CreateBankAccounts />}
                          />
                          <Route
                            path="/finance/treasury-conversion"
                            element={<TransferMoney />}
                          />
                          <Route
                            path="/finance/conversion-history"
                            element={<ConversionHistory />}
                          />
                          {/* suppliers Routes */}
                          <Route
                            path="/suppliers"
                            element={<SuppliersManagement />}
                          />
                          <Route
                            path="/suppliers/contacts/:id"
                            element={<SupplierContacts />}
                          />
                          <Route
                            path="/suppliers/:operation"
                            element={<NewSuppliers />}
                          />
                          <Route
                            path="/suppliers/view/:id"
                            element={<SuppliersView />}
                          />

                          {/* Branches Routes */}
                          <Route
                            path="/branches/management"
                            element={<BranchManagement />}
                          />

                          <Route
                            path="/branches/:operation"
                            element={<NewBranch />}
                          />
                          <Route
                            path="/branches/view/:id"
                            element={<BranchView />}
                          />

                          {/* Users Routes */}
                          <Route
                            path="/users/management"
                            element={<UserManagement />}
                          />
                          <Route
                            path="/users/contacts/:id"
                            element={<UserContacts />}
                          />
                          <Route
                            path="/users/:operation"
                            element={<NewUser />}
                          />
                          <Route
                            path="/users/view/:id"
                            element={<UserView />}
                          />
                          <Route
                            path="/users/roles"
                            element={<EmployeeRoles />}
                          />
                          {/* purchase */}
                          <Route
                            path="/purchase/requests"
                            element={<RequestsPurchase />}
                          />
                          <Route
                            path="/purchase/requests/:id/view"
                            element={<ViewRequestsPurchase />}
                          />
                          <Route
                            path="/purchase/requests/:operation"
                            element={<CreatePurchaseRequests />}
                          />
                          <Route
                            path="/purchase/order-quotations"
                            element={<OrderQuotationsPurchase />}
                          />
                          <Route
                            path="/purchase/order-quotations/:id/view"
                            element={<ViewPurchaseOrderQuotation />}
                          />
                          <Route
                            path="/purchase/order-quotations/:operation"
                            element={<CreatePurchaseOrderQuote />}
                          />
                          <Route
                            path="/purchase/quotations"
                            element={<QuotationsPurchase />}
                          />
                          <Route
                            path="/purchase/quotations/:id/view"
                            element={<ViewPurchaseQuotation />}
                          />
                          <Route
                            path="/purchase/quotations/:operation"
                            element={<CreatePurchaseQuote />}
                          />
                          <Route
                            path="/purchase/orders"
                            element={<OrdersPurchase />}
                          />
                          <Route
                            path="/purchase/orders/:id/view"
                            element={<ViewPurchaseOrders />}
                          />
                          <Route
                            path="/purchase/orders/:operation"
                            element={<CreatePurchaseOrders />}
                          />
                          <Route
                            path="/purchase/invoices"
                            element={<InvoicePurchasesManagement />}
                          />
                          <Route
                            path="/purchase/invoices/:operation"
                            element={<CreatePurchasesInvoice />}
                          />
                          <Route
                            path="/purchase/invoices/:id/view"
                            element={<InvoicePurchasesView />}
                          />
                          <Route
                            path="/purchase/payments"
                            element={<PurchasesPayments />}
                          />
                          <Route
                            path="/purchase/payments/:operation"
                            element={<PurchasesNewPayment />}
                          />
                          <Route
                            path="/purchase/payments/:id/view"
                            element={<PurchasesViewPayment />}
                          />
                          <Route
                            path="/purchase/credit-notices/:operation"
                            element={<PurchasesCreateCreditNotices />}
                          />
                          <Route
                            path="/purchase/credit-notices"
                            element={<PurchasesCreditNotices />}
                          />
                          <Route
                            path="/purchase/credit-notices/:id/view"
                            element={<PurchasesViewCreditNotice />}
                          />
                          <Route
                            path="/purchase/returned-invoices"
                            element={<PurchasesReturnedInvoices />}
                          />
                          <Route
                            path="/purchase/return/:id/view"
                            element={<PurchasesViewReturn />}
                          />
                          <Route
                            path="/purchase/return/:operation"
                            element={<PurchasesCreateReturn />}
                          />
                          {/* sales  */}
                          <Route
                            path="/sales/invoices"
                            element={<InvoiceManagement />}
                          />
                          <Route
                            path="/sales/invoices/:operation"
                            element={<CreateInvoice />}
                          />
                          <Route
                            path="/sales/invoices/:id/view"
                            element={<InvoiceView />}
                          />
                          {/* <Route
                          path="/sales/invoices/:id/payment"
                          element={<InvoicePayment />}
                        />  */}
                          <Route
                            path="/sales/quotations"
                            element={<Quotations />}
                          />
                          <Route
                            path="/sales/quotations/:id/view"
                            element={<ViewQuotation />}
                          />
                          <Route
                            path="/sales/quotations/:operation"
                            element={<CreateQuote />}
                          />
                          <Route
                            path="/sales/credit-notices/:operation"
                            element={<CreateCreditNotices />}
                          />
                          <Route
                            path="/sales/credit-notices"
                            element={<CreditNotices />}
                          />
                          <Route
                            path="/sales/credit-notices/:id/view"
                            element={<ViewCreditNotice />}
                          />
                          <Route
                            path="/sales/returned-invoices"
                            element={<ReturnedInvoices />}
                          />
                          <Route
                            path="/sales/return/:id/view"
                            element={<ViewReturn />}
                          />
                          <Route
                            path="/sales/return/:operation"
                            element={<CreateReturn />}
                          />
                          <Route
                            path="/sales/recurring-invoices"
                            element={<RecurringInvoices />}
                          />
                          <Route
                            path="/sales/recurring-invoices/:operation"
                            element={<NewSubscription />}
                          />
                          <Route
                            path="/sales/recurring-invoices/:id/view"
                            element={<ViewRecurringInvoice />}
                          />
                          <Route
                            path="/sales/payments"
                            element={<CustomerPayments />}
                          />
                          <Route
                            path="/sales/payments/:operation"
                            element={<NewPayment />}
                          />
                          <Route
                            path="/sales/payments/:id/view"
                            element={<ViewPayment />}
                          />
                          {/* <Route
                          path="/sales/settings"
                          element={<SalesSettings />}
                        /> */}
                          {/* customers Routes */}
                          <Route
                            path="/customers/management"
                            element={<CustomerManagement />}
                          />
                          <Route
                            path="/customers/:operation"
                            element={<NewCustomer />}
                          />
                          <Route
                            path="/customers/contacts/:id"
                            element={<CustomerContacts />}
                          />
                          <Route
                            path="/customers/view/:id"
                            element={<CustomerView />}
                          />
                          {/* Products */}
                          <Route
                            path="/inventory/products"
                            element={<ProductList />}
                          />
                          <Route
                            path="/inventory/products/:operation"
                            element={<NewProduct />}
                          />
                          <Route
                            path="/inventory/products/view/:id"
                            element={<ProductView />}
                          />
                          {/* Stock Orders */}
                          <Route
                            path="/inventory/stock-orders"
                            element={<StockOrderList />}
                          />
                          <Route
                            path="/inventory/stock-orders/:operation"
                            element={<NewStockOrder />}
                          />
                          <Route
                            path="/inventory/stock-orders/view/:id"
                            element={<StockOrderView />}
                          />
                          <Route
                            path="/inventory/settings"
                            element={<InventorySettings />}
                          />
                          {/* Price Lists */}
                          <Route
                            path="/inventory/price-lists"
                            element={<PriceListList />}
                          />
                          <Route
                            path="/inventory/price-lists/:operation"
                            element={<NewPriceList />}
                          />
                          <Route
                            path="/inventory/price-lists/view/:id"
                            element={<PriceListView />}
                          />
                          {/* Warehouses */}
                          <Route
                            path="/inventory/warehouses"
                            element={<WarehouseList />}
                          />
                          <Route
                            path="/inventory/warehouses/:operation"
                            element={<NewWarehouse />}
                          />
                          <Route
                            path="/inventory/warehouses/view/:id"
                            element={<WarehouseView />}
                          />
                          {/* Inventory Adjustments */}
                          <Route
                            path="/inventory/inventory"
                            element={<InventoryList />}
                          />
                          <Route
                            path="/inventory/now"
                            element={<InventoryNow />}
                          />
                          <Route
                            path="/inventory/inventory/:operation"
                            element={<NewInventory />}
                          />
                          <Route
                            path="/inventory/inventory/view/:id"
                            element={<InventoryView />}
                          />
                          <Route
                            path="/inventory/unit-templates"
                            element={<UnitTemplates />}
                          />
                          <Route
                            path="/inventory/brands"
                            element={<Brands />}
                          />
                          <Route
                            path="/inventory/categories"
                            element={<Categories />}
                          />
                          {/* Reports & Settings */}
                          <Route path="/reports" element={<Reports />} />
                          <Route
                            path="/reports/sales"
                            element={<SalesReports />}
                          />


                          <Route path="/settings" element={<Settings />} />
                          <Route
                            path="/settings/currency-templates"
                            element={<CurrencyTemplates />}
                          />
                          {/* Catch-all route */}
                          <Route path="*" element={<NotFound />} />
                        </Routes>
                      </Layout>
                    }
                  />{" "}
                </Route>
              </Routes>
            </BrowserRouter>
          </CurrencyProvider>
        </ThemeProvider>
      </LanguageProvider>
    </SettingProvider>
  </ErrorBoundary>
);

// Ensure single root creation
const rootElement = document.getElementById("root");
if (rootElement && !rootElement.hasAttribute("data-root-created")) {
  rootElement.setAttribute("data-root-created", "true");
  createRoot(rootElement).render(<App />);
}
