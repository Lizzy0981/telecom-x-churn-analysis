/// <reference types="vite/client" />

/**
 * Vite Environment Variables Type Definitions
 * Telecom X - Customer Churn Analysis Platform
 */

interface ImportMetaEnv {
  // API Configuration
  readonly VITE_API_URL: string
  readonly VITE_API_TIMEOUT: string
  
  // App Configuration
  readonly VITE_APP_NAME: string
  readonly VITE_APP_VERSION: string
  readonly VITE_APP_ENV: 'development' | 'staging' | 'production'
  
  // Feature Flags
  readonly VITE_ENABLE_PWA: string
  readonly VITE_ENABLE_ML: string
  readonly VITE_ENABLE_WEB_WORKERS: string
  
  // External APIs (optional)
  readonly VITE_EXCHANGERATE_API_KEY?: string
  readonly VITE_ALPHA_VANTAGE_API_KEY?: string
  readonly VITE_NEWS_API_KEY?: string
  
  // Analytics (optional)
  readonly VITE_GA_TRACKING_ID?: string
  readonly VITE_SENTRY_DSN?: string
  
  // More env variables...
  [key: string]: string | undefined
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

/**
 * Module declarations for file imports
 */

// CSS Modules
declare module '*.module.css' {
  const classes: { readonly [key: string]: string }
  export default classes
}

declare module '*.module.scss' {
  const classes: { readonly [key: string]: string }
  export default classes
}

// Images
declare module '*.svg' {
  import * as React from 'react'
  export const ReactComponent: React.FunctionComponent<
    React.SVGProps<SVGSVGElement> & { title?: string }
  >
  const src: string
  export default src
}

declare module '*.png' {
  const content: string
  export default content
}

declare module '*.jpg' {
  const content: string
  export default content
}

declare module '*.jpeg' {
  const content: string
  export default content
}

declare module '*.gif' {
  const content: string
  export default content
}

declare module '*.webp' {
  const content: string
  export default content
}

declare module '*.ico' {
  const content: string
  export default content
}

// JSON
declare module '*.json' {
  const value: any
  export default value
}

// Web Workers
declare module '*?worker' {
  const workerConstructor: {
    new (): Worker
  }
  export default workerConstructor
}

declare module '*?worker&inline' {
  const workerConstructor: {
    new (): Worker
  }
  export default workerConstructor
}

// Fonts
declare module '*.woff'
declare module '*.woff2'
declare module '*.ttf'
declare module '*.eot'

// Video/Audio
declare module '*.mp4'
declare module '*.webm'
declare module '*.ogg'
declare module '*.mp3'
declare module '*.wav'
declare module '*.flac'
declare module '*.aac'

// Documents
declare module '*.pdf'
declare module '*.txt'

// TensorFlow.js Model Files
declare module '*/model.json' {
  const content: any
  export default content
}

declare module '*.bin' {
  const content: ArrayBuffer
  export default content
}

/**
 * Global type augmentations
 */

// Extend Window interface for custom properties
declare global {
  interface Window {
    // Service Worker registration
    __PRERENDER_INJECTED__?: {
      isPrerendering: boolean
    }
    
    // Google Analytics
    gtag?: (
      command: 'config' | 'set' | 'event',
      targetId: string,
      config?: Record<string, any>
    ) => void
    
    // Custom app properties
    __TELECOM_X_VERSION__?: string
    __DEVELOPMENT__?: boolean
  }
}

/**
 * Utility types for the application
 */

// Make all properties optional recursively
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

// Make all properties required recursively
export type DeepRequired<T> = {
  [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P]
}

// Extract promise type
export type Awaited<T> = T extends PromiseLike<infer U> ? U : T

// Utility type for async function return types
export type AsyncReturnType<T extends (...args: any) => Promise<any>> = 
  T extends (...args: any) => Promise<infer R> ? R : any

export {}
