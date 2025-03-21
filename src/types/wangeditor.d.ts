declare module '@wangeditor/editor-for-vue' {
  import { Component } from 'vue';
  export const Editor: Component;
}

declare module '@wangeditor/editor' {
  interface IDomEditor {
    destroy: () => void;
    getText: () => string;
  }
  
  interface IEditorConfig {
    placeholder?: string;
    MENU_CONF?: Record<string, any>;
  }
} 