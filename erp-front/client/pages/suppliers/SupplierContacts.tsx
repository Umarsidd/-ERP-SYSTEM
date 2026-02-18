import React, { useEffect, useState } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { Edit } from "lucide-react";
import { handleEdit } from "@/lib/function";
import { BackButton } from "@/components/common/BackButton";




export default function SupplierContacts() {
  const navigate = useNavigate();
  const { isRTL } = useLanguage();
  const location = useLocation();
  //const [customer, setCustomer] = useState(location.state?.viewFrom.main);

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 rtl:space-x-reverse">
          <BackButton />
          <div>
            {" "}
            <h1 className="text-2xl font-bold">
              {isRTL ? "قائمة جهات الاتصال" : "Contact List"}
            </h1>
            <p className="text-muted-foreground mt-1">
              {isRTL
                ? "عرض جهات الاتصال الخاصة بالمورد المحدد"
                : "Showing contacts for the selected supplier"}
            </p>
          </div>{" "}
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              handleEdit(location.state?.viewFrom, navigate, `/suppliers/edit`)
            }
            className="flex items-center space-x-2 rtl:space-x-reverse px-3 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-secondary transition-colors text-sm"
          >
            <Edit className="w-4 h-4" />
            <span className="hidden sm:inline">{isRTL ? "تحرير" : "Edit"}</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {JSON.parse(location.state?.viewFrom?.main)?.contacts?.map((c) => (
          <motion.div
            key={c.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">{c.name}</h3>
                  <div className="text-sm text-muted-foreground">{c.role}</div>
                  <div className="mt-2 text-sm">
                    <div>{c.email}</div>
                    <div className="text-muted-foreground text-xs">
                      {c.phone}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      handleEdit(
                        location.state?.viewFrom,
                        navigate,
                        `/suppliers/edit`,
                      )
                    }
                  >
                    {isRTL ? "تحرير" : "Edit"}
                  </Button>
                  {/* <Button size="sm" variant="destructive">
                    {isRTL ? "حذف" : "Delete"}
                  </Button> */}
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
