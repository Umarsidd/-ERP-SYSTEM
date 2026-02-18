import { useLanguage } from "@/contexts/LanguageContext";
import ReliableRichTextEditor from "../editor/ReliableRichTextEditor";
import { Paperclip, Upload, X } from "lucide-react";
import { useEffect, useState } from "react";
import { AddCustomer } from "../customer/AddCustomer";
import { Button } from "../ui/button";
import LightweightDialog, { LightweightDialogContent, LightweightDialogHeader } from "../ui/lightweight-dialog";




export function DisplayImages(props: {
  data: any;

}) {
  const { data } = props;

  const { isRTL } = useLanguage();
  const [showAddModal, setShowAddModal] = useState(false);
  const [url, setUrl] = useState("");
  useEffect(() => {

    console.log("DisplayImages data", data);
  }, []);





  

  
  return (
    <div>
      {
        //JSON.parse(invoice.attachments)?.images

        data?.map((f: any) => {
          // const attached = !!selectedServerFiles.find(
          //   (s) => s.id === f.id,
          // );
          return (
            <div
              onClick={() => {
                setShowAddModal(true);
                setUrl(f.url);
              }}
              key={f.id}
              className="w-40 p-2 bg-card border border-border rounded-lg flex-shrink-0"
            >
              <div className="w-full h-24 mb-2 bg-muted rounded overflow-hidden flex items-center justify-center">
                <img
                  src={f.url}
                  alt={f.original_name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="text-xs text-muted-foreground truncate">
                  {f.original_name}
                </div>
              </div>
            </div>
          );
        })
      }

      <LightweightDialog open={showAddModal} onOpenChange={setShowAddModal}>
        <LightweightDialogContent className="">
          <div className="flex items-center justify-between mb-">
            <h3 className="text-lg font-semibold">
              {isRTL ? " عرض الصورة" : "View Image"}
            </h3>
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
            <img
              src={url}
  
    
            />
          </>
        </LightweightDialogContent>
      </LightweightDialog>
    </div>
  );
};