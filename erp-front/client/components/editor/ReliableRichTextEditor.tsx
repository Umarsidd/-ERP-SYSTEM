import React, { useRef, useState, useCallback } from "react";
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Link,
  Type,
  Undo,
  Redo,
  Eye,
  EyeOff,
} from "lucide-react";

interface ReliableRichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  height?: string;
  isRTL?: boolean;
  className?: string;
}

export default function ReliableRichTextEditor({
  value,
  onChange,
  placeholder = "",
  height = "150px",
  isRTL = false,
  className = "",
}: ReliableRichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isSourceMode, setIsSourceMode] = useState(false);
  const [sourceValue, setSourceValue] = useState(value);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");

  const execCommand = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleContentChange();
  }, []);

  const handleContentChange = useCallback(() => {
    if (editorRef.current) {
      const content = editorRef.current.innerHTML;
      onChange(content);
      setSourceValue(content);
    }
  }, [onChange]);

  const handleSourceChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setSourceValue(newValue);
    onChange(newValue);
    if (editorRef.current) {
      editorRef.current.innerHTML = newValue;
    }
  };

  const toggleSourceMode = () => {
    if (!isSourceMode && editorRef.current) {
      setSourceValue(editorRef.current.innerHTML);
    } else if (isSourceMode && editorRef.current) {
      editorRef.current.innerHTML = sourceValue;
    }
    setIsSourceMode(!isSourceMode);
  };

  const insertLink = () => {
    if (linkUrl && linkText) {
      execCommand(
        "insertHTML",
        `<a href="${linkUrl}" target="_blank" rel="noopener noreferrer">${linkText}</a>`,
      );
      setLinkUrl("");
      setLinkText("");
      setShowLinkDialog(false);
    }
  };

  const toolbarButtons = [
    {
      icon: <Bold className="w-4 h-4" />,
      command: "bold",
      title: isRTL ? "عريض" : "Bold",
    },
    {
      icon: <Italic className="w-4 h-4" />,
      command: "italic",
      title: isRTL ? "مائل" : "Italic",
    },
    {
      icon: <Underline className="w-4 h-4" />,
      command: "underline",
      title: isRTL ? "تحته خط" : "Underline",
    },
    {
      icon: <AlignLeft className="w-4 h-4" />,
      command: "justifyLeft",
      title: isRTL ? "محاذاة يسار" : "Align Left",
    },
    {
      icon: <AlignCenter className="w-4 h-4" />,
      command: "justifyCenter",
      title: isRTL ? "محاذاة وسط" : "Center",
    },
    {
      icon: <AlignRight className="w-4 h-4" />,
      command: "justifyRight",
      title: isRTL ? "محاذاة يمين" : "Align Right",
    },
    {
      icon: <List className="w-4 h-4" />,
      command: "insertUnorderedList",
      title: isRTL ? "قائمة نقطية" : "Bullet List",
    },
    {
      icon: <ListOrdered className="w-4 h-4" />,
      command: "insertOrderedList",
      title: isRTL ? "قائمة مرقمة" : "Numbered List",
    },
    {
      icon: <Undo className="w-4 h-4" />,
      command: "undo",
      title: isRTL ? "تراجع" : "Undo",
    },
    {
      icon: <Redo className="w-4 h-4" />,
      command: "redo",
      title: isRTL ? "إعادة" : "Redo",
    },
  ];

  React.useEffect(() => {
    if (editorRef.current && !isSourceMode) {
      if (value !== editorRef.current.innerHTML) {
        editorRef.current.innerHTML = value;
      }
    }
  }, [value, isSourceMode]);

  return (
    <div className={`reliable-rich-editor ${className}`}>
      <style>{`
        .reliable-rich-editor {
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
          background: white;
          overflow: hidden;
        }

        .toolbar {
          background: #f9fafb;
          border-bottom: 1px solid #e5e7eb;
          padding: 0.5rem;
          display: flex;
          align-items: center;
          gap: 0.25rem;
          flex-wrap: wrap;
        }

        .toolbar-group {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          margin-right: 0.5rem;
        }

        .toolbar-button {
          padding: 0.375rem;
          border: none;
          background: transparent;
          border-radius: 0.25rem;
          cursor: pointer;
          color: #6b7280;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .toolbar-button:hover {
          background: #e5e7eb;
          color: #374151;
        }

        .toolbar-button:active,
        .toolbar-button.active {
          background: #3b82f6;
          color: white;
        }

        .toolbar-select {
          padding: 0.25rem 0.5rem;
          border: 1px solid #d1d5db;
          border-radius: 0.25rem;
          background: white;
          font-size: 0.875rem;
          color: #374151;
        }

        .toolbar-separator {
          width: 1px;
          height: 1.5rem;
          background: #d1d5db;
          margin: 0 0.25rem;
        }

        .editor-content {
          min-height: ${height};
          max-height: 300px;
          overflow-y: auto;
          padding: 0.75rem;
          font-family: inherit;
          font-size: 0.875rem;
          line-height: 1.6;
          color: #374151;
          outline: none;
        }

        .editor-content:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          font-style: italic;
        }

        .editor-content ul,
        .editor-content ol {
          padding-left: 1.5rem;
          margin: 0.5rem 0;
        }

        .editor-content ul {
          list-style-type: disc;
        }

        .editor-content ol {
          list-style-type: decimal;
        }

        .editor-content li {
          margin: 0.25rem 0;
        }

        .editor-content a {
          color: #3b82f6;
          text-decoration: underline;
        }

        .editor-content a:hover {
          color: #1d4ed8;
        }

        .editor-content h1,
        .editor-content h2,
        .editor-content h3,
        .editor-content h4,
        .editor-content h5,
        .editor-content h6 {
          font-weight: bold;
          margin: 0.5rem 0;
        }

        .editor-content h1 {
          font-size: 1.5rem;
        }
        .editor-content h2 {
          font-size: 1.25rem;
        }
        .editor-content h3 {
          font-size: 1.125rem;
        }

        .editor-content p {
          margin: 0.5rem 0;
        }

        .editor-content blockquote {
          border-left: 4px solid #e5e7eb;
          padding-left: 1rem;
          margin: 1rem 0;
          color: #6b7280;
          font-style: italic;
        }

        .source-textarea {
          width: 100%;
          min-height: ${height};
          max-height: 300px;
          padding: 0.75rem;
          border: none;
          outline: none;
          font-family: "Courier New", monospace;
          font-size: 0.875rem;
          line-height: 1.5;
          color: #374151;
          background: white;
          resize: vertical;
        }

        .link-dialog {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .link-dialog-content {
          background: white;
          padding: 1.5rem;
          border-radius: 0.5rem;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
          min-width: 400px;
        }

        .link-dialog-title {
          font-size: 1.125rem;
          font-weight: 600;
          margin-bottom: 1rem;
          color: #374151;
        }

        .link-dialog-input {
          width: 100%;
          padding: 0.5rem;
          border: 1px solid #d1d5db;
          border-radius: 0.25rem;
          margin-bottom: 1rem;
          font-size: 0.875rem;
        }

        .link-dialog-buttons {
          display: flex;
          gap: 0.5rem;
          justify-content: flex-end;
        }

        .link-dialog-button {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 0.25rem;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .link-dialog-button.primary {
          background: #3b82f6;
          color: white;
        }

        .link-dialog-button.primary:hover {
          background: #2563eb;
        }

        .link-dialog-button.secondary {
          background: #e5e7eb;
          color: #374151;
        }

        .link-dialog-button.secondary:hover {
          background: #d1d5db;
        }

        /* RTL Support */
        .reliable-rich-editor[dir="rtl"] .editor-content {
          direction: rtl;
          text-align: right;
        }

        .reliable-rich-editor[dir="rtl"] .toolbar-group {
          margin-left: 0.5rem;
          margin-right: 0;
        }

        .reliable-rich-editor[dir="rtl"] .editor-content ul,
        .reliable-rich-editor[dir="rtl"] .editor-content ol {
          padding-right: 1.5rem;
          padding-left: 0;
        }

        .reliable-rich-editor[dir="rtl"] .editor-content blockquote {
          border-right: 4px solid #e5e7eb;
          border-left: none;
          padding-right: 1rem;
          padding-left: 0;
        }

        .reliable-rich-editor:focus-within {
          border-color: #3b82f6;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
        }
      `}</style>

      <div dir={isRTL ? "rtl" : "ltr"}>
        {/* Toolbar */}
        <div className="toolbar">
          <div className="toolbar-group">
            <select
              onChange={(e) => execCommand("formatBlock", e.target.value)}
              className="toolbar-select"
              defaultValue=""
            >
              <option value="">{isRTL ? "تنسيق" : "Format"}</option>
              <option value="p">{isRTL ? "فقرة" : "Paragraph"}</option>
              <option value="h1">{isRTL ? "عنوان 1" : "Heading 1"}</option>
              <option value="h2">{isRTL ? "عنوان 2" : "Heading 2"}</option>
              <option value="h3">{isRTL ? "عنوان 3" : "Heading 3"}</option>
              <option value="blockquote">{isRTL ? "اقتباس" : "Quote"}</option>
            </select>
          </div>

          <div className="toolbar-separator" />

          <div className="toolbar-group">
            {toolbarButtons.slice(0, 3).map((button, index) => (
              <button
                key={index}
                type="button"
                onClick={() => execCommand(button.command)}
                className="toolbar-button"
                title={button.title}
              >
                {button.icon}
              </button>
            ))}
          </div>

          <div className="toolbar-separator" />

          <div className="toolbar-group">
            {toolbarButtons.slice(3, 6).map((button, index) => (
              <button
                key={index}
                type="button"
                onClick={() => execCommand(button.command)}
                className="toolbar-button"
                title={button.title}
              >
                {button.icon}
              </button>
            ))}
          </div>

          <div className="toolbar-separator" />

          <div className="toolbar-group">
            {toolbarButtons.slice(6, 8).map((button, index) => (
              <button
                key={index}
                type="button"
                onClick={() => execCommand(button.command)}
                className="toolbar-button"
                title={button.title}
              >
                {button.icon}
              </button>
            ))}
          </div>

          <div className="toolbar-separator" />

          <div className="toolbar-group">
            <button
              type="button"
              onClick={() => setShowLinkDialog(true)}
              className="toolbar-button"
              title={isRTL ? "إدراج رابط" : "Insert Link"}
            >
              <Link className="w-4 h-4" />
            </button>
          </div>

          <div className="toolbar-separator" />

          <div className="toolbar-group">
            {toolbarButtons.slice(8, 10).map((button, index) => (
              <button
                key={index}
                type="button"
                onClick={() => execCommand(button.command)}
                className="toolbar-button"
                title={button.title}
              >
                {button.icon}
              </button>
            ))}
          </div>

          <div className="toolbar-separator" />

          <div className="toolbar-group">
            <button
              type="button"
              onClick={toggleSourceMode}
              className="toolbar-button"
              title={isRTL ? "عرض المصدر" : "Source View"}
            >
              {isSourceMode ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Editor */}
        {isSourceMode ? (
          <textarea
            value={sourceValue}
            onChange={handleSourceChange}
            className="source-textarea"
            placeholder={placeholder}
          />
        ) : (
          <div
            ref={editorRef}
            contentEditable
            onInput={handleContentChange}
            onBlur={handleContentChange}
            className="editor-content"
            data-placeholder={placeholder}
            suppressContentEditableWarning={true}
          />
        )}

        {/* Link  */}
        {showLinkDialog && (
          <div className="link-dialog" onClick={() => setShowLinkDialog(false)}>
            <div
              className="link-dialog-content"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="link-dialog-title">
                {isRTL ? "إدراج رابط" : "Insert Link"}
              </h3>
              <input
                type="text"
                value={linkText}
                onChange={(e) => setLinkText(e.target.value)}
                placeholder={isRTL ? "نص الرابط" : "Link Text"}
                className="link-dialog-input"
              />
              <input
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://example.com"
                className="link-dialog-input"
              />
              <div className="link-dialog-buttons">
                <button
                  type="button"
                  onClick={() => setShowLinkDialog(false)}
                  className="link-dialog-button secondary"
                >
                  {isRTL ? "إلغاء" : "Cancel"}
                </button>
                <button
                  type="button"
                  onClick={insertLink}
                  className="link-dialog-button primary"
                >
                  {isRTL ? "إدراج" : "Insert"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
