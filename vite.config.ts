import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: './',
  define: {
    // 添加全局变量polyfill
    global: 'globalThis',
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    // 启用CSS代码分割
    cssCodeSplit: true,
    // 减小chunk体积
    chunkSizeWarningLimit: 1500,
    // 代码分割策略
    rollupOptions: {
      output: {
        // 对静态资源进行分类存放
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          let extType = info[info.length - 1];
          if (/\.(png|jpe?g|gif|svg|webp|ico)(\?.*)?$/.test(assetInfo.name)) {
            extType = 'img';
          } else if (/\.(woff2?|eot|ttf|otf)(\?.*)?$/.test(assetInfo.name)) {
            extType = 'fonts';
          } else if (/\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/.test(assetInfo.name)) {
            extType = 'media';
          }
          return `assets/${extType}/[name]-[hash][extname]`;
        },
        // 拆分JS代码，但保持CSS的同步加载
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        // 自定义分包策略
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            // 将node_modules中的包按照大类分组
            if (id.includes('element-plus')) {
              return 'element-plus';
            }
            if (id.includes('ant-design-vue')) {
              return 'ant-design-vue';
            }
            if (id.includes('vant')) {
              return 'vant';
            }
            if (id.includes('vue') || id.includes('@vue')) {
              return 'vue-vendor';
            }
            return 'vendor'; // 其他依赖
          }
        }
      }
    },
    // 最小化JS体积
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  },
  // 优化依赖预构建
  optimizeDeps: {
    include: ['vue', 'vue-router', 'element-plus', 'ant-design-vue', 'vant'],
    // 强制预构建，减少首次加载时的依赖解析
    force: true
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  // 开发服务器配置
  server: {
    port: 5173,
    host: 'localhost',
    proxy: {
      '/api': {
        // target: 'http://localhost:10010',
        // target: 'http://127.0.0.1',
        target: 'http://139.159.243.123',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      },
      '/ws': {
        // target: 'http://localhost:80',
        target: 'http://139.159.243.123',
        ws: true // 必须启用WebSocket代理
      }
    }
  },
  // 预览配置
  preview: {
    port: 5173,
    host: 'localhost',
    // 开启gzip压缩
    // compress: true  // 这个选项在某些版本的Vite中不受支持
  }
})