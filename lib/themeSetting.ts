// lib/themeSettings.ts

export const themes = {
  home: {
     id:1,
     variant: "home",
     type:"main"
     
  },
  home2: {
     id: 2,
     variant: "home2",
     type:{
      first:"first",
      second:"second"
     }
  },
 
} as const;

export type ThemeKey = keyof typeof themes;
export type ThemeSettings = typeof themes[ThemeKey];
