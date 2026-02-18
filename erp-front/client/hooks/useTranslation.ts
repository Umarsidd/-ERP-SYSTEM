import { en } from "../translations/en";
import { ar } from "../translations/ar";
import { useLanguage } from "@/contexts/LanguageContext";

type TranslationKey = string;

export const useTranslation = () => {
  const { language } = useLanguage();

  const translations = {
    en,
    ar,
  };

  const t = (key: TranslationKey): string => {
    const keys = key.split(".");
    let translation: any = translations[language];

    for (const k of keys) {
      if (translation && typeof translation === "object" && k in translation) {
        translation = translation[k];
      } else {
        // Fallback to English if key not found
        translation = translations.en;
        for (const fallbackKey of keys) {
          if (
            translation &&
            typeof translation === "object" &&
            fallbackKey in translation
          ) {
            translation = translation[fallbackKey];
          } else {
            console.warn(`Translation key "${key}" not found`);
            return key; // Return the key itself as fallback
          }
        }
        break;
      }
    }

    return typeof translation === "string" ? translation : key;
  };

  return { t, language };
};

//  const { t,language } = useTranslation();
//t("about.innovation"),


export const useResponsiveLang = () => {
  const { language } = useLanguage();

  const responsiveLang = (ar: any, en: any) => {
    if (language === "ar") {
      return ar;
    }
    return en;
  };
  return { responsiveLang };
};
//  const { responsiveLang } = useResponsiveLang();
//import { useResponsiveLang } from "@/hooks/useResponsiveLang";


//{responsiveLang(currentNews.arname, currentNews.name)}

// export const useTranslateCatLang = (mainCatLang) => {
//   const { language } = useLanguage();

//   const translateCatLang = (inp1, inp2) => {
//     if (language === mainCatLang) {
//       return inp1;
//     }
//     return inp2;
//   };
//   return { translateCatLang };
// };


//  const { translateCatLang } = useTranslateCatLang(
//     award.category?.language ?? "en"
//   );


  //  {translateCatLang(
  //                     award?.category?.name,
  //                     awardT?.category?.name
  //                   )}
