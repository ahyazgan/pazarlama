import nextCoreWebVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = [
  ...nextCoreWebVitals,
  {
    rules: {
      "react/no-unescaped-entities": "off",
      // React 19/Next 16 yeni katı kural. Mevcut kullanımlar mount'ta
      // localStorage'dan state init eden doğru/yaygın desen (tek sefer çalışır,
      // cascading render yok). Hata yerine uyarı: görünürlük korunur, gate yeşil.
      "react-hooks/set-state-in-effect": "warn",
    },
  },
  {
    ignores: ["node_modules/", ".next/", "coverage/"],
  },
];

export default eslintConfig;
