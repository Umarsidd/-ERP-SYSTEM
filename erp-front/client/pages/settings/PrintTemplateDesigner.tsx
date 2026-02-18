import { useState, useEffect } from "react";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { PrintTemplateService, PrintTemplate, PrintSection } from "@/lib/PrintTemplateService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { v4 as uuidv4 } from "uuid";
import { useLanguage } from "@/contexts/LanguageContext";
import { GripVertical, Plus, Trash2, Save, Printer, Eye } from "lucide-react";
import Swal from "sweetalert2";

const toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
});

export default function PrintTemplateDesigner() {
    const { isRTL } = useLanguage();
    const [templates, setTemplates] = useState<PrintTemplate[]>([]);
    const [currentTemplate, setCurrentTemplate] = useState<PrintTemplate | null>(null);
    const [activeId, setActiveId] = useState<string | null>(null);

    useEffect(() => {
        loadTemplates();
    }, []);

    const loadTemplates = () => {
        const loaded = PrintTemplateService.getTemplates();
        setTemplates(loaded);
        if (loaded.length > 0 && !currentTemplate) {
            setCurrentTemplate(loaded[0]);
        } else if (loaded.length === 0) {
            const newTemplate = PrintTemplateService.createDefaultTemplate();
            PrintTemplateService.saveTemplate(newTemplate);
            setTemplates([newTemplate]);
            setCurrentTemplate(newTemplate);
        }
    };

    const handleSave = () => {
        if (currentTemplate) {
            PrintTemplateService.saveTemplate(currentTemplate);
            loadTemplates();
            toast.fire({
                icon: "success",
                title: isRTL ? "تم الحفظ بنجاح" : "Template saved successfully",
            });
        }
    };

    const handleCreateNew = () => {
        const newTemplate = PrintTemplateService.createDefaultTemplate();
        PrintTemplateService.saveTemplate(newTemplate);
        loadTemplates();
        setCurrentTemplate(newTemplate);
    };

    const handleDelete = (id: string) => {
        if (confirm(isRTL ? "هل أنت متأكد؟" : "Are you sure?")) {
            PrintTemplateService.deleteTemplate(id);
            loadTemplates();
            if (currentTemplate?.id === id) {
                setCurrentTemplate(null);
            }
        }
    };

    const handleDragEnd = (event: any) => {
        const { active, over } = event;

        if (active.id !== over.id && currentTemplate) {
            const oldIndex = currentTemplate.sections.findIndex((item) => item.id === active.id);
            const newIndex = currentTemplate.sections.findIndex((item) => item.id === over.id);

            const newSections = arrayMove(currentTemplate.sections, oldIndex, newIndex);
            setCurrentTemplate({ ...currentTemplate, sections: newSections });
        }
        setActiveId(null);
    };

    const handleDragStart = (event: any) => {
        setActiveId(event.active.id);
    }

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const addSection = (type: PrintSection["type"]) => {
        if (!currentTemplate) return;
        const newSection: PrintSection = {
            id: uuidv4(),
            type,
            label: type.charAt(0).toUpperCase() + type.slice(1),
            visible: true,
            content: type === "text" ? "New Text" : "",
            style: {},
        };
        setCurrentTemplate({
            ...currentTemplate,
            sections: [...currentTemplate.sections, newSection],
        });
    };

    const updateSection = (id: string, updates: Partial<PrintSection>) => {
        if (!currentTemplate) return;
        const newSections = currentTemplate.sections.map((s) =>
            s.id === id ? { ...s, ...updates } : s
        );
        setCurrentTemplate({ ...currentTemplate, sections: newSections });
    };

    const removeSection = (id: string) => {
        if (!currentTemplate) return;
        const newSections = currentTemplate.sections.filter((s) => s.id !== id);
        setCurrentTemplate({ ...currentTemplate, sections: newSections });
    };

    if (!currentTemplate) return <div>Loading...</div>;

    return (
        <div className="flex h-screen bg-gray-100 p-4 gap-4">
            {/* Sidebar: Templates List & Toolbox */}
            <div className="w-1/4 bg-white p-4 rounded-lg shadow overflow-y-auto">
                <h2 className="text-xl font-bold mb-4">{isRTL ? "القوالب" : "Templates"}</h2>
                <div className="space-y-2 mb-6">
                    {templates.map((t) => (
                        <div
                            key={t.id}
                            onClick={() => setCurrentTemplate(t)}
                            className={`p-2 rounded cursor-pointer flex justify-between items-center ${currentTemplate.id === t.id ? "bg-primary text-white" : "hover:bg-gray-100"
                                }`}
                        >
                            <span>{t.name}</span>
                            <Trash2 size={16} onClick={(e) => { e.stopPropagation(); handleDelete(t.id); }} />
                        </div>
                    ))}
                    <Button onClick={handleCreateNew} className="w-full mt-2">
                        <Plus size={16} className="mr-2" /> {isRTL ? "جديد" : "New Template"}
                    </Button>
                </div>

                <h3 className="font-bold mb-2">{isRTL ? "أدوات" : "Toolbox"}</h3>
                <div className="grid grid-cols-2 gap-2">
                    {["text", "divider", "image", "table", "qr", "barcode", "header", "footer"].map((type) => (
                        <Button key={type} variant="outline" size="sm" onClick={() => addSection(type as any)}>
                            + {type}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Main Canvas: Preview & Reorder */}
            <div className="flex-1 bg-white p-6 rounded-lg shadow overflow-y-auto flex flex-col items-center">
                <div className="w-full flex justify-between items-center mb-4 border-b pb-2">
                    <div className="flex gap-2 items-center">
                        <Label>{isRTL ? "اسم القالب" : "Template Name"}</Label>
                        <Input
                            value={currentTemplate.name}
                            onChange={(e) => setCurrentTemplate({ ...currentTemplate, name: e.target.value })}
                            className="w-64"
                        />
                    </div>
                    <div className="flex gap-2">
                        <Button onClick={handleSave}><Save size={16} className="mr-2" /> {isRTL ? "حفظ" : "Save"}</Button>
                    </div>
                </div>

                <div className="border bg-white shadow-sm p-4 min-h-[500px]" style={{ width: `${currentTemplate.styles?.width || 80}mm` }}>
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                        onDragStart={handleDragStart}
                    >
                        <SortableContext
                            items={currentTemplate.sections.map(s => s.id)}
                            strategy={verticalListSortingStrategy}
                        >
                            {currentTemplate.sections.map((section) => (
                                <SortableSection
                                    key={section.id}
                                    section={section}
                                    onUpdate={updateSection}
                                    onRemove={removeSection}
                                />
                            ))}
                        </SortableContext>
                        <DragOverlay>
                            {activeId ? (
                                <div className="p-2 border border-dashed border-primary bg-primary/10 opacity-50">
                                    Moving Section...
                                </div>
                            ) : null}
                        </DragOverlay>
                    </DndContext>
                </div>
            </div>

            {/* Right Properties Panel (Simplified for now) */}
            <div className="w-1/4 bg-white p-4 rounded-lg shadow overflow-y-auto">
                <h3 className="font-bold mb-4">{isRTL ? "خصائص" : "Properties"}</h3>
                <p className="text-sm text-gray-500">Select an item to edit styles (Future Implementation)</p>
                <div className="mt-4">
                    <Label>Page Width (mm)</Label>
                    <Input
                        type="number"
                        value={currentTemplate.styles?.width || 80}
                        onChange={(e) => setCurrentTemplate({
                            ...currentTemplate,
                            styles: { ...currentTemplate.styles, width: parseInt(e.target.value) || 80 }
                        })}
                    />
                </div>
            </div>
        </div>
    );
}

function SortableSection({ section, onUpdate, onRemove }: { section: PrintSection, onUpdate: any, onRemove: any }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: section.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div ref={setNodeRef} style={style} className="mb-2 group relative border border-transparent hover:border-gray-300 p-2 rounded">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 w-full">
                    <div {...attributes} {...listeners} className="cursor-grab text-gray-400 hover:text-gray-700">
                        <GripVertical size={16} />
                    </div>

                    {/* Content Edit based on type */}
                    <div className="flex-1">
                        {section.type === 'text' || section.type === 'header' || section.type === 'footer' ? (
                            <Input
                                value={section.content}
                                onChange={(e) => onUpdate(section.id, { content: e.target.value })}
                                className="h-8 text-sm"
                                placeholder="Content / {{variable}}"
                            />
                        ) : (
                            <div className="text-sm font-semibold text-gray-600 bg-gray-50 p-1 rounded text-center">
                                {section.label}
                            </div>
                        )}
                    </div>
                </div>

                <div className="opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500" onClick={() => onRemove(section.id)}>
                        <Trash2 size={14} />
                    </Button>
                </div>
            </div>
        </div>
    );
}
