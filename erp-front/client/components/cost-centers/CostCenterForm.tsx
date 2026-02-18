import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AccountNode } from "@/lib/accounts_function";

interface CostCenterFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (values: any) => void;
    initialValues: any;
    mode: "add" | "edit";
    parentName?: string;
}

export const CostCenterForm: React.FC<CostCenterFormProps> = ({
    isOpen,
    onClose,
    onSubmit,
    initialValues,
    mode,
    parentName,
}) => {
    const { isRTL } = useLanguage();

    const schema = Yup.object().shape({
        name: Yup.string().required(isRTL ? "مطلوب" : "Required"),
        code: Yup.string().required(isRTL ? "مطلوب" : "Required"),
    });

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>
                        {mode === "add"
                            ? isRTL
                                ? "إضافة مركز تكلفة جديد"
                                : "Add New Cost Center"
                            : isRTL
                                ? "تعديل مركز التكلفة"
                                : "Edit Cost Center"}
                    </DialogTitle>
                </DialogHeader>
                <Formik
                    initialValues={initialValues}
                    validationSchema={schema}
                    onSubmit={onSubmit}
                >
                    {({ isSubmitting }) => (
                        <Form className="space-y-4">
                            {/* Parent Info if adding sub */}
                            {parentName && (
                                <div className="p-3 bg-muted rounded-md text-sm">
                                    <span className="text-muted-foreground">
                                        {isRTL ? "تابع لـ: " : "Parent: "}
                                    </span>
                                    <span className="font-medium">{parentName}</span>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="code">{isRTL ? "الكود" : "Code"}</Label>
                                    <Field
                                        id="code"
                                        name="code"
                                        as={Input}
                                        placeholder="e.g. 100"
                                    />
                                    <ErrorMessage
                                        name="code"
                                        component="div"
                                        className="text-destructive text-xs"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="status">{isRTL ? "الحالة" : "Status"}</Label>
                                    <Field
                                        as="select"
                                        name="status"
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <option value="active">{isRTL ? "نشط" : "Active"}</option>
                                        <option value="inactive">{isRTL ? "غير نشط" : "Inactive"}</option>
                                    </Field>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="name">{isRTL ? "الاسم العربي" : "Name (Arabic)"}</Label>
                                <Field
                                    id="nameAr"
                                    name="nameAr"
                                    as={Input}
                                    className="text-right"
                                    placeholder={isRTL ? "مثال: قسم المبيعات" : ""}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="name">{isRTL ? "الاسم الانجليزي" : "Name (English)"}</Label>
                                <Field
                                    id="name"
                                    name="name"
                                    as={Input}
                                    className="text-left"
                                    placeholder="e.g. Sales Department"
                                />
                                <ErrorMessage
                                    name="name"
                                    component="div"
                                    className="text-destructive text-xs"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">{isRTL ? "الوصف" : "Description"}</Label>
                                <Field
                                    id="description"
                                    name="description"
                                    as="textarea"
                                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                />
                            </div>

                            <div className="flex justify-end space-x-2 rtl:space-x-reverse pt-4">
                                <Button variant="outline" type="button" onClick={onClose}>
                                    {isRTL ? "إلغاء" : "Cancel"}
                                </Button>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isRTL ? "حفظ" : "Save"}
                                </Button>
                            </div>
                        </Form>
                    )}
                </Formik>
            </DialogContent>
        </Dialog>
    );
};
