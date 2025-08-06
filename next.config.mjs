/** @type {import('next').NextConfig} */
// Cache-busting comment - force new deployment
const nextConfig = {
  // Enable experimental features
  experimental: {
    // Optimize package imports for better tree shaking
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-icons',
      'framer-motion',
      '@react-three/fiber',
      '@react-three/drei',
      'date-fns',
      'recharts',
      'three',
      '@types/three',
      'react-hook-form',
      '@hookform/resolvers',
      'zod'
    ],
    // External packages for server components (don't bundle these)
    serverComponentsExternalPackages: [
      'mongoose',
      'bcryptjs',
      'nodemailer',
      'sharp',
      'canvas'
    ],
    // Enable webpack build cache for faster builds
    webpackBuildWorker: true,
  },



  // Image optimization
  images: {
    // Add your domains here
    domains: [
      'localhost',
      'neurotrauma2026.vercel.app',
      'neurotrauma2026.in',
      'images.unsplash.com',
      'via.placeholder.com'
    ],
    // Modern image formats for better performance
    formats: ['image/webp', 'image/avif'],
    // Cache optimization
    minimumCacheTTL: 3600, // 1 hour
    // Image sizing for responsive images
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Enable image optimization for static images
    dangerouslyAllowSVG: true,
    // Temporarily disabled CSP for debugging - RE-ENABLE AFTER TESTING  
    // contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Enable compression
  compress: true,

  // PoweredBy header (disable for security)
  poweredByHeader: false,

  // Strict mode for development
  reactStrictMode: true,

  // Environment variables that should be available on client side
  env: {
    APP_URL: process.env.APP_URL,
    APP_NAME: process.env.APP_NAME,
  },

  // Headers for security and performance
  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          },
          // Temporarily disabled CSP for debugging - RE-ENABLE AFTER TESTING
          // {
          //   key: 'Content-Security-Policy',
          //   value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://checkout.razorpay.com https://cdn.razorpay.com https://www.googletagmanager.com https://www.google-analytics.com https://*.googletagmanager.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https: blob:; font-src 'self' data:; connect-src 'self' https://api.razorpay.com https://*.razorpay.com https://raw.githack.com https://*.githubusercontent.com https://www.google-analytics.com https://*.google-analytics.com https://analytics.google.com https://region1.google-analytics.com https://*.googletagmanager.com blob: data:; worker-src 'self' blob:; child-src 'self' blob:; frame-src 'self' https://api.razorpay.com https://*.razorpay.com;"
          // }
        ]
      },
      {
        // Cache static assets
        source: '/images/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      },
      {
        // Cache API responses (short-term)
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=60, stale-while-revalidate=300'
          }
        ]
      }
    ]
  },

  // Redirects for better SEO
  async redirects() {
    return [
      // Redirect old URLs if needed
      {
        source: '/home',
        destination: '/',
        permanent: true
      },
      {
        source: '/login',
        destination: '/auth/login',
        permanent: true
      },
      {
        source: '/auth/register',
        destination: '/register',
        permanent: true
      },
      {
        source: '/favicon.ico',
        destination: '/Favicons/favicon.ico',
        permanent: true
      }
    ]
  },

  // Webpack optimizations
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Ignore source maps in production for smaller bundles
    if (!dev) {
      config.devtool = false
    }

    // Bundle analyzer in development
    if (dev && !isServer) {
      config.plugins.push(
        new webpack.DefinePlugin({
          'process.env.ANALYZE_BUNDLE': JSON.stringify(process.env.ANALYZE_BUNDLE)
        })
      )

      // Optional: Add bundle analyzer
      if (process.env.ANALYZE_BUNDLE === 'true') {
        const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
        config.plugins.push(
          new BundleAnalyzerPlugin({
            analyzerMode: 'server',
            openAnalyzer: false,
            analyzerPort: 8888
          })
        )
      }
    }

    // Resolve fallbacks for client-side
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      }
    }

    return config
  },

  // Output configuration for static exports if needed
  output: process.env.STATIC_EXPORT === 'true' ? 'export' : undefined,
  trailingSlash: process.env.STATIC_EXPORT === 'true',
  skipTrailingSlashRedirect: true,

  // Logging
  logging: {
    fetches: {
      fullUrl: true,
    },
  },

  // TypeScript configuration
  typescript: {
    // Ignore type errors during build (not recommended for production)
    ignoreBuildErrors: false,
  },

  // ESLint configuration
  eslint: {
    // Ignore ESLint errors during build (not recommended for production)
    ignoreDuringBuilds: false,
  },

  // Server-side rendering configuration
  async rewrites() {
    return [
      // API rewrites if needed
      {
        source: '/api/v1/:path*',
        destination: '/api/:path*'
      }
    ]
  }
}

export default nextConfig