import i18n from "i18next";
import Backend from "i18next-http-backend";
import { initReactI18next } from "react-i18next";

i18n
  .use(Backend)
  .use(initReactI18next)
  .init({
    backend: { loadPath: "/locales/{{lng}}.json" },
    fallbackLng: "en-US",
    debug: false,
    interpolation: {
      espaceValue: false,
    },
    react: {
      wait: true,
    },
  });

export default i18n;
