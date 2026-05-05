## Setup frontend

### 1. Create project

```bash
npm create vite@latest my-app -- --template react
cd my-app
npm install
```

### 2. Install Tailwind

```bash
npm install -D tailwindcss@3 postcss autoprefixer
npx tailwindcss init -p
```

### 3. Configure Tailwind

Edit `tailwind.config.js`

```js
/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {},
    },
    plugins: [],
}
```

### 4. Add Tailwind to CSS

Edit `src/index.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### 5. Import CSS

In `src/main.jsx`

```js
import './index.css'
```

### 6. Test Tailwind

Replace content in `App.jsx`

```jsx
export default function App() {
    return (
        <div className="h-screen bg-black flex items-center justify-center">
            <p className="text-yellow-400 text-2xl">
                Tailwind working
            </p>
        </div>
    )
}
```

### 7. Run project

```bash
npm run dev
```

Open browser → `http://localhost:5173`

## 8. Expected result

* Black background
* Yellow text centered

If you see this → setup is correct

## Notes (important)

* If Tailwind classes don’t apply → check `content` paths
* Always restart dev server after config changes
* Do not use old imports like `tailwindcss/base`
