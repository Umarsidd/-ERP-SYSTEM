// import React, { useRef, useState, useLayoutEffect } from "react";

// /**
//  * NumberInput.jsx
//  * - thousandSeparator: رمز فاصل الآلاف المعروض (افتراضي ",")
//  * - decimals: عدد الخانات العشرية المسموح بها (null = لا حد)
//  * - يدعم controlled (value & onChange) و uncontrolled
//  *
//  * سلوك مُحسّن: لا يحدّ طول الجزء الصحيح، يطبّق decimals على الجزء العشري فقط،
//  * يحدد الفاصل العشري اعتمادًا على آخر ظهور لرموز '.' ',' '٬' '٫' ويحتفظ بالرمز عند العرض.
//  */
// export default function NumberInput({
//   thousandSeparator = ",",
//   decimals = null,
//   value: controlledValue,
//   onChange: externalOnChange,
//   ...props
// }) {
//   const inputRef = useRef(null);
//   const [internalValue, setInternalValue] = useState("");
//   const caretDigitsRef = useRef(0);
//   const isControlled =
//     controlledValue !== undefined && typeof externalOnChange === "function";

//   // يحول أرقام العربية/الفارسية إلى لاتينية
//   function convertArabicIndicToLatin(s) {
//     if (!s) return s;
//     return s
//       .replace(/[\u0660-\u0669]/g, (c) => String(c.charCodeAt(0) - 0x0660))
//       .replace(/[\u06F0-\u06F9]/g, (c) => String(c.charCodeAt(0) - 0x06f0));
//   }

//   // عدّ الأرقام (digits) في سلسلة
//   function countDigits(s) {
//     return (s.match(/\d/g) || []).length;
//   }

//   // تنسيق الجزء الصحيح (من اليمين إلى اليسار كل 3 خانات)
//   function formatIntegerPart(intStr) {
//     if (!intStr) return "";
//     const parts = [];
//     for (let i = intStr.length; i > 0; i -= 3) {
//       const start = Math.max(0, i - 3);
//       parts.unshift(intStr.slice(start, i));
//     }
//     return parts.join(thousandSeparator);
//   }

//   // يطبّق حد الخانات العشرية فقط على الجزء العشري
//   function enforceDecimalLimit(decStr) {
//     if (decimals === null) return decStr;
//     return decStr.slice(0, decimals);
//   }

//   function handleChange(e) {
//     const el = e.target;
//     const raw = el.value || "";
//     const caretPos = el.selectionStart != null ? el.selectionStart : raw.length;

//     // 1) نطبع النص إلى نسخة موحدة من الأرقام
//     const normalized = convertArabicIndicToLatin(raw);

//     // 2) نحتسب عدد الأرقام على يسار المؤشر (من النص المحول)
//     const leftNormalized = normalized.slice(0, caretPos);
//     caretDigitsRef.current = countDigits(leftNormalized);

//     // 3) السماح بعلامة سالبة في البداية فقط
//     let text = normalized;
//     let negative = false;
//     if (text.startsWith("-")) {
//       negative = true;
//       text = text.slice(1);
//     }

//     // 4) نحدد الفاصل العشري الحقيقي: آخِر ظهور لأي رمز من هذه المجموعة
//     const decimalCandidates = [".", ",", "٬", "٫"];
//     let lastIdx = -1;
//     let sepChar = "";
//     for (const c of decimalCandidates) {
//       const idx = text.lastIndexOf(c);
//       if (idx > lastIdx) {
//         lastIdx = idx;
//         sepChar = idx === -1 ? "" : c;
//       }
//     }

//     // 5) نبني "سلسلة عمل" بإبقاء الأرقام فقط، ونضع '.' كفاصل عشري داخلي في موقع sepChar (إذا وُجد)
//     let working = "";
//     for (let i = 0; i < text.length; i++) {
//       const ch = text.charAt(i);
//       if (/\d/.test(ch)) {
//         working += ch;
//       } else if (sepChar && i === lastIdx) {
//         // استخدم نقطة داخلية موحدة لفصل الجزء العشري
//         working += ".";
//       } else {
//         // تجاهل أي رمز آخر (فواصل آلاف، مسافات، أحرف)
//       }
//     }

//     // 6) الآن قسم إلى جزء صحيح وجزء عشري (بافتراض '.' في working)
//     let intPart = working;
//     let decPart = "";
//     if (working.indexOf(".") !== -1) {
//       const idx = working.indexOf(".");
//       intPart = working.slice(0, idx);
//       decPart = working.slice(idx + 1);
//     }

//     // 7) نطبق حد الخانات العشرية
//     decPart = enforceDecimalLimit(decPart);

//     // 8) تنسيق الجزء الصحيح
//     const formattedInt = formatIntegerPart(intPart);

//     // 9) بناء القيمة المعروضة: نستخدم رمز الفاصل الأصلي الذي أدخله المستخدم (sepChar)
//     let shown = negative ? "-" : "";
//     if (!formattedInt && sepChar) {
//       // إذا بدأ المستخدم بالفاصلة العشرية نعرض 0 قبلها
//       shown += "0";
//     } else {
//       shown += formattedInt;
//     }
//     if (sepChar) {
//       shown += sepChar + decPart;
//     }

//     // 10) حالة خاصة: إذا لا شيء سوى "-" نعرض "-"
//     if (!shown && negative) shown = "-";

//     // 11) تحديث الحالة أو تمرير onChange للـ controlled
//     if (isControlled) {
//       externalOnChange({ target: { value: shown } });
//     } else {
//       setInternalValue(shown);
//     }
//   }

//   // إعادة موضع المؤشر بناءً على عدد الأرقام التي كانت على اليسار قبل التنسيق
//   useLayoutEffect(() => {
//     const el = inputRef.current;
//     if (!el) return;
//     const s = el.value || "";
//     const targetDigits = caretDigitsRef.current;

//     if (targetDigits <= 0) {
//       // إذا لا أرقام اجعل المؤشر بالبداية (أو بعد '-' إن وُجد)
//       if (s === "-") {
//         el.setSelectionRange(1, 1);
//       } else {
//         el.setSelectionRange(0, 0);
//       }
//       return;
//     }

//     // نمشي عبر النص المنسق ونعد الأرقام حتى نصل للهدف
//     let pos = 0;
//     let digitsCount = 0;
//     while (pos < s.length) {
//       if (/\d/.test(s.charAt(pos))) digitsCount++;
//       pos++;
//       if (digitsCount === targetDigits) break;
//     }
//     if (pos > s.length) pos = s.length;
//     el.setSelectionRange(pos, pos);
//   }, [isControlled ? controlledValue : internalValue]);

//   const shownValue = isControlled ? controlledValue : internalValue;

//   return (
//     <input
//       {...props}
//       ref={inputRef}
//       value={shownValue}
//       onChange={handleChange}
//       inputMode="decimal"
//       autoComplete="off"
//     />
//   );
// }
