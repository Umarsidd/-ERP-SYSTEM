import { useLanguage } from "@/contexts/LanguageContext";
import { loadCustomers } from "@/lib/api_function";

import { motion } from "framer-motion";
import {
  Building,
  Search,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import LightweightDialog, {
  LightweightDialogContent,
  LightweightDialogHeader,
} from "../ui/lightweight-dialog";
import { ErrorMessage} from "formik";
import { AddCustomer } from "./AddCustomer";
import { AddSuppliers } from "./AddSuppliers";
import { handleCustomerSelect } from "@/lib/products_function";

export function CustomerSelection(props: {
  values: any;
  setFieldValue: any;
  addQuery: string;
  initialValues: any;
  setIsLoading: any;
  setAddQuery: any;
  tableName: string;
  title: string;
  title2: string;
  titleAdd: string;
  titleList: string;
  titleSearch: string;
  condition?: string;
  section?: string;
}) {
  const {
    values,
    setFieldValue,
    addQuery,
    initialValues,
    setIsLoading,
    setAddQuery,
    tableName,
    title,
    title2,
    titleAdd,
    titleList,
    titleSearch,
    condition,
    section,
  } = props;

  const { isRTL } = useLanguage();
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCustomerSearch, setShowCustomerSearch] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  useEffect(() => {
    loadCustomers(
      addQuery,
      setIsLoading,
      setCustomers,
      tableName,
      condition,
      section,
    );
  }, [searchTerm]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-card border border-border rounded-xl p-4 sm:p-6 h-80"
    >
      <h2 className="text-xl font-semibold text-foreground mb-6">{title} </h2>

      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        {/* Customer Selection */}
        <div className="space-y-4">
          <label className="text-sm font-medium text-foreground">
            {title2}
          </label>

          {/* Customer Search */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <input
                type="text"
                placeholder={titleSearch}
                value={searchTerm}
                onChange={(e) => {
                  setAddQuery(e.target.value);
                  setSearchTerm(e.target.value);
                }}
                onFocus={() => setShowCustomerSearch(true)}
                onBlur={() => {
                  // Delay hiding to allow click events
                  setTimeout(() => setShowCustomerSearch(false), 150);
                }}
                className="w-full pl-10 rtl:pl-4 rtl:pr-10 pr-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>

            {!values.customerId && !showCustomerSearch && (
              <button
                type="button"
                onClick={() => setShowCustomerSearch(true)}
                className="w-full px-4 py-2 text-sm border border-dashed border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-colors text-muted-foreground hover:text-primary"
              >
                {titleList}{" "}
              </button>
            )}

            {!values.customerId && !showCustomerSearch && (
              <button
                type="button"
                onClick={() => setShowAddModal(true)}
                className="w-full px-4 py-2 text-sm border border-dashed border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-colors text-muted-foreground hover:text-primary"
              >
                {titleAdd}
              </button>
            )}
          </div>

          {/* Customer Dropdown */}
          {showCustomerSearch && (
            <div className="border border-border rounded-lg bg-background max-h-60 overflow-y-auto shadow-lg z-10">
              {customers.map((customer) => (
                <button
                  key={customer.id}
                  type="button"
                  onClick={() => {
                    handleCustomerSelect(
                      customer,
                      setFieldValue,
                      setShowCustomerSearch,
                      setSearchTerm,
                      //   setAddQuery,
                    );

                    setAddQuery("");
                  }}
                  className="w-full p-4 text-left rtl:text-right hover:bg-muted transition-colors border-b border-border last:border-b-0"
                >
                  <div className="flex items-center space-x-3 rtl:space-x-reverse">
                    <Building className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium text-foreground">
                        {isRTL ? customer.name : customer.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {customer.email}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
              {customers.length === 0 && (
                <div className="p-4 text-center text-muted-foreground">
                  {isRTL ? "لا توجد نتائج" : "No results found"}
                </div>
              )}
            </div>
          )}

          {/* Selected Customer Display */}
          {values.customerId && (
            <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <Building className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">
                      {isRTL ? values.customer.name : values.customer.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {values.customer.email}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setFieldValue("customerId", "");
                    setFieldValue("customer", initialValues.customer);
                  }}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          <ErrorMessage
            name="customerId"
            component="div"
            className="text-destructive text-sm"
          />
        </div>

        {/* Sales Representative Selection */}
        {/* <div className="space-y-4">
                    <label className="text-sm font-medium text-foreground">
                      {isRTL ? "مندوب المبيعات" : "Sales Representative"} *
                    </label>

                    <div className="relative">
                      <Users className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Field
                        as="select"
                        name="salesRepId"
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                          const selectedRep = customers.find(
                            (rep) => rep.id === e.target.value,
                          );
                          if (selectedRep) {
                            handleSalesRepSelect(selectedRep, setFieldValue);
                          }
                        }}
                        className="w-full pl-10 rtl:pl-4 rtl:pr-10 pr-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all appearance-none"
                      >
                        <option value="">
                          {isRTL
                            ? "اختر مندوب المبيعات"
                            : "Select Sales Representative"}
                        </option>
                        {customers.map((rep) => (
                          <option key={rep.id} value={rep.id}>
                            {isRTL ? rep.name : rep.name} ({rep.email}%)
                          </option>
                        ))}
                      </Field>
                      <ChevronDown className="absolute right-3 rtl:right-auto rtl:left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 pointer-events-none" />
                    </div>

                    <ErrorMessage
                      name="salesRepId"
                      component="div"
                      className="text-destructive text-sm"
                    />
                  </div> */}
      </div>

      <LightweightDialog open={showAddModal} onOpenChange={setShowAddModal}>
        <LightweightDialogContent className="sm:w-[900px] sm:h-[77vh]">
          <div className="flex items-center justify-between mb-">
            <h3 className="text-lg font-semibold">{titleAdd}</h3>
            <div className="flex items-center  gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowAddModal(false);
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <LightweightDialogHeader>
            <></>
          </LightweightDialogHeader>

          <>
            {tableName == "customer" ? (
              <AddCustomer isDialog={true} setShowAddModal={setShowAddModal} />
            ) : (
              <AddSuppliers isDialog={true} setShowAddModal={setShowAddModal} />
            )}
          </>
        </LightweightDialogContent>
      </LightweightDialog>
    </motion.div>
  );
}
