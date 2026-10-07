// lib/themeStore.ts

let currentTheme: "home" | "home2" = "home";

export function getTheme() {
  return currentTheme;
}

export function setTheme(theme: "home" | "home2") {
  currentTheme = theme;
}
