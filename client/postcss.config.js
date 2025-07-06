import tailwindcss from '@tailwindcss/postcss'
import autoprefixer from 'autoprefixer'

export default {
  plugins: [
    tailwindcss(), // ✅ This now works in v4+
    autoprefixer(),
  ],
}

