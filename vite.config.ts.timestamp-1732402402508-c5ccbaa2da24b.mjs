// vite.config.ts
import { defineConfig, loadEnv } from "file:///home/project/node_modules/vite/dist/node/index.js";
import react from "file:///home/project/node_modules/@vitejs/plugin-react/dist/index.mjs";
import compression from "file:///home/project/node_modules/vite-plugin-compression/dist/index.mjs";
import { visualizer } from "file:///home/project/node_modules/rollup-plugin-visualizer/dist/plugin/index.js";
import preload from "file:///home/project/node_modules/vite-plugin-preload/dist/index.mjs";
import imagemin from "file:///home/project/node_modules/vite-plugin-imagemin/dist/index.mjs";
var vite_config_default = defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    plugins: [
      react({
        babel: {
          plugins: [
            ["@emotion/babel-plugin", { sourceMap: false }],
            ["babel-plugin-transform-remove-console", { exclude: ["error", "warn"] }]
          ]
        }
      }),
      compression({
        algorithm: "brotli",
        ext: ".br"
      }),
      compression({
        algorithm: "gzip",
        ext: ".gz"
      }),
      preload(),
      imagemin({
        gifsicle: {
          optimizationLevel: 7,
          interlaced: false
        },
        optipng: {
          optimizationLevel: 7
        },
        mozjpeg: {
          quality: 80
        },
        pngquant: {
          quality: [0.8, 0.9],
          speed: 4
        },
        svgo: {
          plugins: [
            {
              name: "removeViewBox"
            },
            {
              name: "removeEmptyAttrs",
              active: false
            }
          ]
        }
      }),
      visualizer({
        open: false,
        gzipSize: true,
        brotliSize: true
      })
    ],
    build: {
      target: "esnext",
      minify: "esbuild",
      cssMinify: true,
      cssCodeSplit: true,
      modulePreload: {
        polyfill: false
      },
      rollupOptions: {
        output: {
          manualChunks: {
            "react-vendor": ["react", "react-dom", "react-router-dom"],
            "ui-vendor": ["framer-motion", "lucide-react"],
            "three-vendor": ["three", "@react-three/fiber", "@react-three/drei"],
            "audio-vendor": ["tone", "wavesurfer.js", "recordrtc"],
            "data-vendor": ["d3", "@nivo/line", "@nivo/radar"],
            "dnd-vendor": ["@dnd-kit/core", "@dnd-kit/sortable", "@dnd-kit/utilities"]
          },
          assetFileNames: "assets/[hash][extname]",
          chunkFileNames: "assets/[hash].js",
          entryFileNames: "assets/[hash].js"
        }
      },
      reportCompressedSize: false,
      chunkSizeWarningLimit: 1e3
    },
    optimizeDeps: {
      include: [
        "react",
        "react-dom",
        "react-router-dom",
        "framer-motion",
        "lucide-react"
      ],
      exclude: ["@react-three/fiber"]
    },
    server: {
      fs: {
        strict: true
      },
      hmr: {
        overlay: false
      }
    }
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9wcm9qZWN0XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3Byb2plY3Qvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcsIGxvYWRFbnYgfSBmcm9tICd2aXRlJztcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCc7XG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCBjb21wcmVzc2lvbiBmcm9tICd2aXRlLXBsdWdpbi1jb21wcmVzc2lvbic7XG5pbXBvcnQgeyB2aXN1YWxpemVyIH0gZnJvbSAncm9sbHVwLXBsdWdpbi12aXN1YWxpemVyJztcbmltcG9ydCBwcmVsb2FkIGZyb20gJ3ZpdGUtcGx1Z2luLXByZWxvYWQnO1xuaW1wb3J0IGltYWdlbWluIGZyb20gJ3ZpdGUtcGx1Z2luLWltYWdlbWluJztcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKCh7IG1vZGUgfSkgPT4ge1xuICBjb25zdCBlbnYgPSBsb2FkRW52KG1vZGUsIHByb2Nlc3MuY3dkKCksICcnKTtcbiAgcmV0dXJuIHtcbiAgICBwbHVnaW5zOiBbXG4gICAgICByZWFjdCh7XG4gICAgICAgIGJhYmVsOiB7XG4gICAgICAgICAgcGx1Z2luczogW1xuICAgICAgICAgICAgWydAZW1vdGlvbi9iYWJlbC1wbHVnaW4nLCB7IHNvdXJjZU1hcDogZmFsc2UgfV0sXG4gICAgICAgICAgICBbJ2JhYmVsLXBsdWdpbi10cmFuc2Zvcm0tcmVtb3ZlLWNvbnNvbGUnLCB7IGV4Y2x1ZGU6IFsnZXJyb3InLCAnd2FybiddIH1dXG4gICAgICAgICAgXVxuICAgICAgICB9XG4gICAgICB9KSxcbiAgICAgIGNvbXByZXNzaW9uKHtcbiAgICAgICAgYWxnb3JpdGhtOiAnYnJvdGxpJyxcbiAgICAgICAgZXh0OiAnLmJyJ1xuICAgICAgfSksXG4gICAgICBjb21wcmVzc2lvbih7XG4gICAgICAgIGFsZ29yaXRobTogJ2d6aXAnLFxuICAgICAgICBleHQ6ICcuZ3onXG4gICAgICB9KSxcbiAgICAgIHByZWxvYWQoKSxcbiAgICAgIGltYWdlbWluKHtcbiAgICAgICAgZ2lmc2ljbGU6IHtcbiAgICAgICAgICBvcHRpbWl6YXRpb25MZXZlbDogNyxcbiAgICAgICAgICBpbnRlcmxhY2VkOiBmYWxzZVxuICAgICAgICB9LFxuICAgICAgICBvcHRpcG5nOiB7XG4gICAgICAgICAgb3B0aW1pemF0aW9uTGV2ZWw6IDdcbiAgICAgICAgfSxcbiAgICAgICAgbW96anBlZzoge1xuICAgICAgICAgIHF1YWxpdHk6IDgwXG4gICAgICAgIH0sXG4gICAgICAgIHBuZ3F1YW50OiB7XG4gICAgICAgICAgcXVhbGl0eTogWzAuOCwgMC45XSxcbiAgICAgICAgICBzcGVlZDogNFxuICAgICAgICB9LFxuICAgICAgICBzdmdvOiB7XG4gICAgICAgICAgcGx1Z2luczogW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICBuYW1lOiAncmVtb3ZlVmlld0JveCdcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIG5hbWU6ICdyZW1vdmVFbXB0eUF0dHJzJyxcbiAgICAgICAgICAgICAgYWN0aXZlOiBmYWxzZVxuICAgICAgICAgICAgfVxuICAgICAgICAgIF1cbiAgICAgICAgfVxuICAgICAgfSksXG4gICAgICB2aXN1YWxpemVyKHtcbiAgICAgICAgb3BlbjogZmFsc2UsXG4gICAgICAgIGd6aXBTaXplOiB0cnVlLFxuICAgICAgICBicm90bGlTaXplOiB0cnVlXG4gICAgICB9KVxuICAgIF0sXG4gICAgYnVpbGQ6IHtcbiAgICAgIHRhcmdldDogJ2VzbmV4dCcsXG4gICAgICBtaW5pZnk6ICdlc2J1aWxkJyxcbiAgICAgIGNzc01pbmlmeTogdHJ1ZSxcbiAgICAgIGNzc0NvZGVTcGxpdDogdHJ1ZSxcbiAgICAgIG1vZHVsZVByZWxvYWQ6IHtcbiAgICAgICAgcG9seWZpbGw6IGZhbHNlXG4gICAgICB9LFxuICAgICAgcm9sbHVwT3B0aW9uczoge1xuICAgICAgICBvdXRwdXQ6IHtcbiAgICAgICAgICBtYW51YWxDaHVua3M6IHtcbiAgICAgICAgICAgICdyZWFjdC12ZW5kb3InOiBbJ3JlYWN0JywgJ3JlYWN0LWRvbScsICdyZWFjdC1yb3V0ZXItZG9tJ10sXG4gICAgICAgICAgICAndWktdmVuZG9yJzogWydmcmFtZXItbW90aW9uJywgJ2x1Y2lkZS1yZWFjdCddLFxuICAgICAgICAgICAgJ3RocmVlLXZlbmRvcic6IFsndGhyZWUnLCAnQHJlYWN0LXRocmVlL2ZpYmVyJywgJ0ByZWFjdC10aHJlZS9kcmVpJ10sXG4gICAgICAgICAgICAnYXVkaW8tdmVuZG9yJzogWyd0b25lJywgJ3dhdmVzdXJmZXIuanMnLCAncmVjb3JkcnRjJ10sXG4gICAgICAgICAgICAnZGF0YS12ZW5kb3InOiBbJ2QzJywgJ0BuaXZvL2xpbmUnLCAnQG5pdm8vcmFkYXInXSxcbiAgICAgICAgICAgICdkbmQtdmVuZG9yJzogWydAZG5kLWtpdC9jb3JlJywgJ0BkbmQta2l0L3NvcnRhYmxlJywgJ0BkbmQta2l0L3V0aWxpdGllcyddXG4gICAgICAgICAgfSxcbiAgICAgICAgICBhc3NldEZpbGVOYW1lczogJ2Fzc2V0cy9baGFzaF1bZXh0bmFtZV0nLFxuICAgICAgICAgIGNodW5rRmlsZU5hbWVzOiAnYXNzZXRzL1toYXNoXS5qcycsXG4gICAgICAgICAgZW50cnlGaWxlTmFtZXM6ICdhc3NldHMvW2hhc2hdLmpzJ1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgcmVwb3J0Q29tcHJlc3NlZFNpemU6IGZhbHNlLFxuICAgICAgY2h1bmtTaXplV2FybmluZ0xpbWl0OiAxMDAwXG4gICAgfSxcbiAgICBvcHRpbWl6ZURlcHM6IHtcbiAgICAgIGluY2x1ZGU6IFtcbiAgICAgICAgJ3JlYWN0JyxcbiAgICAgICAgJ3JlYWN0LWRvbScsXG4gICAgICAgICdyZWFjdC1yb3V0ZXItZG9tJyxcbiAgICAgICAgJ2ZyYW1lci1tb3Rpb24nLFxuICAgICAgICAnbHVjaWRlLXJlYWN0J1xuICAgICAgXSxcbiAgICAgIGV4Y2x1ZGU6IFsnQHJlYWN0LXRocmVlL2ZpYmVyJ11cbiAgICB9LFxuICAgIHNlcnZlcjoge1xuICAgICAgZnM6IHtcbiAgICAgICAgc3RyaWN0OiB0cnVlXG4gICAgICB9LFxuICAgICAgaG1yOiB7XG4gICAgICAgIG92ZXJsYXk6IGZhbHNlXG4gICAgICB9XG4gICAgfVxuICB9O1xufSk7Il0sCiAgIm1hcHBpbmdzIjogIjtBQUF5TixTQUFTLGNBQWMsZUFBZTtBQUMvUCxPQUFPLFdBQVc7QUFFbEIsT0FBTyxpQkFBaUI7QUFDeEIsU0FBUyxrQkFBa0I7QUFDM0IsT0FBTyxhQUFhO0FBQ3BCLE9BQU8sY0FBYztBQUVyQixJQUFPLHNCQUFRLGFBQWEsQ0FBQyxFQUFFLEtBQUssTUFBTTtBQUN4QyxRQUFNLE1BQU0sUUFBUSxNQUFNLFFBQVEsSUFBSSxHQUFHLEVBQUU7QUFDM0MsU0FBTztBQUFBLElBQ0wsU0FBUztBQUFBLE1BQ1AsTUFBTTtBQUFBLFFBQ0osT0FBTztBQUFBLFVBQ0wsU0FBUztBQUFBLFlBQ1AsQ0FBQyx5QkFBeUIsRUFBRSxXQUFXLE1BQU0sQ0FBQztBQUFBLFlBQzlDLENBQUMseUNBQXlDLEVBQUUsU0FBUyxDQUFDLFNBQVMsTUFBTSxFQUFFLENBQUM7QUFBQSxVQUMxRTtBQUFBLFFBQ0Y7QUFBQSxNQUNGLENBQUM7QUFBQSxNQUNELFlBQVk7QUFBQSxRQUNWLFdBQVc7QUFBQSxRQUNYLEtBQUs7QUFBQSxNQUNQLENBQUM7QUFBQSxNQUNELFlBQVk7QUFBQSxRQUNWLFdBQVc7QUFBQSxRQUNYLEtBQUs7QUFBQSxNQUNQLENBQUM7QUFBQSxNQUNELFFBQVE7QUFBQSxNQUNSLFNBQVM7QUFBQSxRQUNQLFVBQVU7QUFBQSxVQUNSLG1CQUFtQjtBQUFBLFVBQ25CLFlBQVk7QUFBQSxRQUNkO0FBQUEsUUFDQSxTQUFTO0FBQUEsVUFDUCxtQkFBbUI7QUFBQSxRQUNyQjtBQUFBLFFBQ0EsU0FBUztBQUFBLFVBQ1AsU0FBUztBQUFBLFFBQ1g7QUFBQSxRQUNBLFVBQVU7QUFBQSxVQUNSLFNBQVMsQ0FBQyxLQUFLLEdBQUc7QUFBQSxVQUNsQixPQUFPO0FBQUEsUUFDVDtBQUFBLFFBQ0EsTUFBTTtBQUFBLFVBQ0osU0FBUztBQUFBLFlBQ1A7QUFBQSxjQUNFLE1BQU07QUFBQSxZQUNSO0FBQUEsWUFDQTtBQUFBLGNBQ0UsTUFBTTtBQUFBLGNBQ04sUUFBUTtBQUFBLFlBQ1Y7QUFBQSxVQUNGO0FBQUEsUUFDRjtBQUFBLE1BQ0YsQ0FBQztBQUFBLE1BQ0QsV0FBVztBQUFBLFFBQ1QsTUFBTTtBQUFBLFFBQ04sVUFBVTtBQUFBLFFBQ1YsWUFBWTtBQUFBLE1BQ2QsQ0FBQztBQUFBLElBQ0g7QUFBQSxJQUNBLE9BQU87QUFBQSxNQUNMLFFBQVE7QUFBQSxNQUNSLFFBQVE7QUFBQSxNQUNSLFdBQVc7QUFBQSxNQUNYLGNBQWM7QUFBQSxNQUNkLGVBQWU7QUFBQSxRQUNiLFVBQVU7QUFBQSxNQUNaO0FBQUEsTUFDQSxlQUFlO0FBQUEsUUFDYixRQUFRO0FBQUEsVUFDTixjQUFjO0FBQUEsWUFDWixnQkFBZ0IsQ0FBQyxTQUFTLGFBQWEsa0JBQWtCO0FBQUEsWUFDekQsYUFBYSxDQUFDLGlCQUFpQixjQUFjO0FBQUEsWUFDN0MsZ0JBQWdCLENBQUMsU0FBUyxzQkFBc0IsbUJBQW1CO0FBQUEsWUFDbkUsZ0JBQWdCLENBQUMsUUFBUSxpQkFBaUIsV0FBVztBQUFBLFlBQ3JELGVBQWUsQ0FBQyxNQUFNLGNBQWMsYUFBYTtBQUFBLFlBQ2pELGNBQWMsQ0FBQyxpQkFBaUIscUJBQXFCLG9CQUFvQjtBQUFBLFVBQzNFO0FBQUEsVUFDQSxnQkFBZ0I7QUFBQSxVQUNoQixnQkFBZ0I7QUFBQSxVQUNoQixnQkFBZ0I7QUFBQSxRQUNsQjtBQUFBLE1BQ0Y7QUFBQSxNQUNBLHNCQUFzQjtBQUFBLE1BQ3RCLHVCQUF1QjtBQUFBLElBQ3pCO0FBQUEsSUFDQSxjQUFjO0FBQUEsTUFDWixTQUFTO0FBQUEsUUFDUDtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxNQUNGO0FBQUEsTUFDQSxTQUFTLENBQUMsb0JBQW9CO0FBQUEsSUFDaEM7QUFBQSxJQUNBLFFBQVE7QUFBQSxNQUNOLElBQUk7QUFBQSxRQUNGLFFBQVE7QUFBQSxNQUNWO0FBQUEsTUFDQSxLQUFLO0FBQUEsUUFDSCxTQUFTO0FBQUEsTUFDWDtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
