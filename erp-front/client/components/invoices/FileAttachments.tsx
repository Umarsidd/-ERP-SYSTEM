import { useLanguage } from "@/contexts/LanguageContext";
import ReliableRichTextEditor from "../editor/ReliableRichTextEditor";
import { Paperclip, Upload, X } from "lucide-react";
import { handleFileUpload, removeAttachment } from "@/lib/products_function";




export function FileAttachments(props: {
  values: any;
  setFieldValue: any;
  setServerImages: any;
  serverImages: any[];
  location: any;
}) {
  const { values, setFieldValue, setServerImages, serverImages, location } = props;

  const { isRTL } = useLanguage();

  return (
    <div
      className="bg-card border border-border rounded-xl p-6 animate-slide-in-up"
      style={{ animationDelay: "550ms" }}
    >
      <h2 className="text-xl font-semibold text-foreground mb-6">
        {isRTL ? "المرفقات" : "Attachments"}
      </h2>

      <div className="space-y-4">
        {location.state?.action == "edit" ? (
          <div className="mb-3">
            <h4 className="text-sm font-medium mb-2">
              {isRTL ? "التحميلات التي على الخادم" : "Server Uploads"}
            </h4>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {serverImages.map((f: any) => {
                // const attached = !!selectedServerFiles.find(
                //   (s) => s.id === f.id,
                // );
                return (
                  <div
                    key={f.id}
                    className="w-40 p-2 bg-card border border-border rounded-lg flex-shrink-0"
                  >
                    <div className="w-full h-24 mb-2 bg-muted rounded overflow-hidden flex items-center justify-center">
                      {f.mime && f.mime.startsWith("image") ? (
                        <img
                          src={f.url}
                          alt={f.original_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-muted-foreground text-sm">
                          {f.original_name}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-muted-foreground truncate">
                        {f.original_name}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setServerImages(
                            serverImages.filter(
                              (file: any) => file.url !== f.url,
                            ),
                          );

                          console.log(serverImages);
                        }}
                        className={`px-2 py-1 text-xs rounded ${1 == 1 ? "bg-red-500 text-white" : "bg-muted/20"}`}
                      >
                        {isRTL ? "حذف" : "Delete"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="mb-3 text-sm text-muted-foreground">
            {/* {isRTL
                        ? "لم يتم العثور على تحميلات على الخادم"
                        : "No server uploads found"} */}
          </div>
        )}

        <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary hover:bg-primary/5 transition-all">
          <input
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
            onChange={(e) =>
              handleFileUpload(
                e.target.files,
                setFieldValue,
                values.attachments,
                isRTL,
              )
            }
            className="hidden"
            id="file-upload"
          />
          <label htmlFor="file-upload" className="cursor-pointer">
            <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium text-foreground mb-2">
              {isRTL ? "اختر الملفات" : "Choose files"}
            </p>
            <p className="text-sm text-muted-foreground">
              {isRTL
                ? "PDF, DOC, DOCX, JPG, PNG, GIF (حد أقصى 10MB)"
                : "PDF, DOC, DOCX, JPG, PNG, GIF (Max 10MB)"}
            </p>
          </label>
        </div>

        {values.attachments.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-foreground">
              {isRTL ? "الملفات المرفقة:" : "Attached Files:"}
            </h4>
            {values.attachments.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-muted rounded-lg"
              >
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <Paperclip className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-foreground">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    removeAttachment(index, values.attachments, setFieldValue)
                  }
                  className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};