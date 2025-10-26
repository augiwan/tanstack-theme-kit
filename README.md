# tanstack-theme-kit

Perfect dark mode for your TanStack Start app in 2 lines of code.

The goal of this library is to get dark mode to work out of the box with TanStack Start and other React frameworks. I've made it for myself, but others are welcome to use.

## Credits

This library is an adaptation of [ThemeProvider](https://gist.github.com/WellDone2094/16107a2a9476b28a5b394bee3fa1b8a3) which itself is a modified version of [next-themes](https://github.com/pacocoursey/next-themes). All credits to [pacocoursey](https://github.com/pacocoursey) for `next-themes` and [WellDone2094](https://github.com/WellDone2094) for the adaptation.

I've also kept this README as close as possible to `next-themes` to help new developers.

## Features

- ✅ Perfect dark mode in 2 lines of code
- ✅ System setting with `prefers-color-scheme`
- ✅ Themed browser UI with `color-scheme`
- ✅ Works with TanStack Start SSR
- ✅ No flash on load (SSR compatible)
- ✅ Sync theme across tabs and windows
- ✅ Disable transitions when changing themes
- ✅ Force specific themes on pages/routes
- ✅ Class or data attribute selector
- ✅ `useTheme` hook for theme control
- ✅ Framework-agnostic (works with any React framework)

## Installation

```bash
npm install tanstack-theme-kit
# or
yarn add tanstack-theme-kit
# or
pnpm add tanstack-theme-kit
```

## Usage

### With TanStack Start

In your root layout or app entry point (typically `app/root.tsx` or `app/routes/__root.tsx`), wrap your application with `ThemeProvider`:

```tsx
// app/routes/__root.tsx
import { ThemeProvider } from 'tanstack-theme-kit'
import { Outlet } from '@tanstack/react-router'

export default function Root() {
  return (
    <html suppressHydrationWarning>
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body>
        <ThemeProvider>
          <Outlet />
        </ThemeProvider>
      </body>
    </html>
  )
}
```

That's it! Your TanStack Start app now fully supports dark mode.

> **Note!** Add [suppressHydrationWarning](https://react.dev/reference/react-dom/components/common#common-props) to your `<html>` element to prevent warnings. The ThemeProvider injects a script that updates the html element before React hydrates, which is intentional to prevent flashing.

### With Other React Frameworks

For other React frameworks, wrap your app at the highest level possible:

```tsx
import { ThemeProvider } from 'tanstack-theme-kit'

function App() {
  return (
    <ThemeProvider>
      {/* Your app content */}
    </ThemeProvider>
  )
}
```

### HTML & CSS

Your app now fully supports dark mode, including System preference with `prefers-color-scheme`. The theme is also immediately synced between tabs. By default, `tanstack-theme-kit` modifies the `data-theme` attribute on the `html` element, which you can easily use to style your app:

```css
:root {
  /* Your default theme */
  --background: white;
  --foreground: black;
}

[data-theme='dark'] {
  --background: black;
  --foreground: white;
}
```

> **Note!** If you set the `attribute` prop to `class` (for Tailwind), the library will modify the `class` attribute on the `html` element instead. See [With TailwindCSS](#with-tailwindcss).

### useTheme

Your UI will need to know the current theme and be able to change it. The `useTheme` hook provides theme information:

```tsx
import { useTheme } from 'tanstack-theme-kit'

const ThemeChanger = () => {
  const { theme, setTheme } = useTheme()

  return (
    <div>
      The current theme is: {theme}
      <button onClick={() => setTheme('light')}>Light Mode</button>
      <button onClick={() => setTheme('dark')}>Dark Mode</button>
    </div>
  )
}
```

> **Warning!** The above code is hydration _unsafe_ and will throw a hydration mismatch warning when rendering with SSR. This is because we cannot know the `theme` on the server, so it will always be `undefined` until mounted on the client.
>
> You should delay rendering any theme toggling UI until mounted on the client. See the [example](#avoid-hydration-mismatch).

## API

Let's dig into the details.

### ThemeProvider

All your theme configuration is passed to ThemeProvider.

- `storageKey = 'theme'`: Key used to store theme setting in localStorage
- `defaultTheme = 'system'`: Default theme name (for v0.0.12 and lower the default was `light`). If `enableSystem` is false, the default theme is `light`
- `forcedTheme`: Forced theme name for the current page (does not modify saved theme settings)
- `enableSystem = true`: Whether to switch between `dark` and `light` based on `prefers-color-scheme`
- `enableColorScheme = true`: Whether to indicate to browsers which color scheme is used (dark or light) for built-in UI like inputs and buttons
- `disableTransitionOnChange = false`: Optionally disable all CSS transitions when switching themes ([example](#disable-transitions-on-theme-change))
- `themes = ['light', 'dark']`: List of theme names
- `attribute = 'data-theme'`: HTML attribute modified based on the active theme
  - accepts `class` and `data-*` (meaning any data attribute, `data-mode`, `data-color`, etc.) ([example](#class-instead-of-data-attribute))
- `value`: Optional mapping of theme name to attribute value
  - value is an `object` where key is the theme name and value is the attribute value ([example](#differing-dom-attribute-and-theme-name))
- `nonce`: Optional nonce passed to the injected `script` tag, used to allow-list the script in your CSP

### useTheme

`useTheme` takes no parameters, but returns:

- `theme`: Active theme name
- `setTheme(name)`: Function to update the theme. The API is identical to the [set function](https://react.dev/reference/react/useState#setstate) returned by `useState` hook. Pass the new theme value or use a callback to set the new theme based on the current theme.
- `forcedTheme`: Forced page theme or falsy. If `forcedTheme` is set, you should disable any theme switching UI
- `systemTheme`: If `enableSystem` is true, represents the System theme preference ("dark" or "light"), regardless of what the active theme is
- `themes`: The list of themes passed to `ThemeProvider` (with "system" appended, if `enableSystem` is true)

Not too bad, right? Let's see how to use these properties with examples:

## Examples

### Use System preference by default

The `defaultTheme` is automatically set to "system", so to use System preference you can simply use:

```tsx
<ThemeProvider>
  {children}
</ThemeProvider>
```

### Ignore System preference

If you don't want a System theme, disable it via `enableSystem`:

```tsx
<ThemeProvider enableSystem={false}>
  {children}
</ThemeProvider>
```

### Class instead of data attribute

If your app uses a class to style the page based on the theme (e.g., with Tailwind), change the `attribute` prop to `class`:

```tsx
<ThemeProvider attribute="class">
  {children}
</ThemeProvider>
```

Now, setting the theme to "dark" will set `class="dark"` on the `html` element.

### Force a route to a specific theme

Let's say your marketing page should always be dark mode. You can force a theme by passing the `forcedTheme` prop to your `ThemeProvider`. In TanStack Start, you might do this based on the current route:

```tsx
// app/routes/__root.tsx
import { ThemeProvider } from 'tanstack-theme-kit'
import { Outlet, useRouter } from '@tanstack/react-router'

export default function Root() {
  const router = useRouter()
  const isDarkPage = router.state.location.pathname === '/marketing'

  return (
    <html suppressHydrationWarning>
      <body>
        <ThemeProvider forcedTheme={isDarkPage ? 'dark' : undefined}>
          <Outlet />
        </ThemeProvider>
      </body>
    </html>
  )
}
```

Done! When on the `/marketing` route, the theme is always dark (regardless of user preference), and calling `setTheme` from `useTheme` is now a no-op. You should disable any theme switching UI when a theme is forced:

```tsx
const { forcedTheme } = useTheme()

// Theme is forced, we shouldn't allow user to change the theme
const disabled = !!forcedTheme
```

### Disable transitions on theme change

We can forcefully disable all CSS transitions before the theme is changed, and re-enable them immediately afterwards. This ensures your UI with different transition durations won't feel inconsistent when changing the theme.

To enable this behavior, pass the `disableTransitionOnChange` prop:

```tsx
<ThemeProvider disableTransitionOnChange>
  {children}
</ThemeProvider>
```

### Differing DOM attribute and theme name

The name of the active theme is used as both the localStorage value and the value of the DOM attribute. If the theme name is "pink", localStorage will contain `theme=pink` and the DOM will be `data-theme="pink"`. You **cannot** modify the localStorage value, but you **can** modify the DOM value.

If we want the DOM to instead render `data-theme="my-pink-theme"` when the theme is "pink", pass the `value` prop:

```tsx
<ThemeProvider value={{ pink: 'my-pink-theme' }}>
  {children}
</ThemeProvider>
```

Done! To be extra clear, this affects only the DOM. Here's how all the values will look:

```tsx
const { theme } = useTheme()
// => "pink"

localStorage.getItem('theme')
// => "pink"

document.documentElement.getAttribute('data-theme')
// => "my-pink-theme"
```


### More than light and dark mode

`tanstack-theme-kit` is designed to support any number of themes! Simply pass a list of themes:

```tsx
<ThemeProvider themes={['pink', 'red', 'blue']}>
  {children}
</ThemeProvider>
```

> **Note!** When you pass `themes`, the default set of themes ("light" and "dark") are overridden. Make sure you include those if you still want your light and dark themes:

```tsx
<ThemeProvider themes={['pink', 'red', 'blue', 'light', 'dark']}>
  {children}
</ThemeProvider>
```

### Without CSS variables

This library does not rely on your theme styling using CSS variables. You can hard-code the values in your CSS, and everything will work as expected (without any flashing):

```css
html,
body {
  color: #000;
  background: #fff;
}

[data-theme='dark'],
[data-theme='dark'] body {
  color: #fff;
  background: #000;
}
```

### With Styled Components and any CSS-in-JS

`tanstack-theme-kit` is completely CSS independent and works with any styling library. For example, with Styled Components:

```tsx
import { createGlobalStyle } from 'styled-components'
import { ThemeProvider } from 'tanstack-theme-kit'

// Your theming variables
const GlobalStyle = createGlobalStyle`
  :root {
    --fg: #000;
    --bg: #fff;
  }

  [data-theme="dark"] {
    --fg: #fff;
    --bg: #000;
  }
`

function App() {
  return (
    <>
      <GlobalStyle />
      <ThemeProvider>
        {/* Your app content */}
      </ThemeProvider>
    </>
  )
}
```

### Avoid Hydration Mismatch

Because we cannot know the `theme` on the server, many of the values returned from `useTheme` will be `undefined` until mounted on the client. This means if you try to render UI based on the current theme before mounting on the client, you will see a hydration mismatch error.

The following code sample is **unsafe**:

```tsx
import { useTheme } from 'tanstack-theme-kit'

// Do NOT use this! It will throw a hydration mismatch error.
const ThemeSwitch = () => {
  const { theme, setTheme } = useTheme()

  return (
    <select value={theme} onChange={e => setTheme(e.target.value)}>
      <option value="system">System</option>
      <option value="dark">Dark</option>
      <option value="light">Light</option>
    </select>
  )
}

export default ThemeSwitch
```

To fix this, make sure you only render UI that uses the current theme when the page is mounted on the client:

```tsx
import { useState, useEffect } from 'react'
import { useTheme } from 'tanstack-theme-kit'

const ThemeSwitch = () => {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <select value={theme} onChange={e => setTheme(e.target.value)}>
      <option value="system">System</option>
      <option value="dark">Dark</option>
      <option value="light">Light</option>
    </select>
  )
}

export default ThemeSwitch
```

Alternatively, you could lazy load the component on the client side using `React.lazy`:

```tsx
import { lazy, Suspense } from 'react'

const ThemeSwitch = lazy(() => import('./ThemeSwitch'))

const ThemePage = () => {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <ThemeSwitch />
      </Suspense>
    </div>
  )
}

export default ThemePage
```

To avoid [Layout Shift](https://web.dev/cls/), consider rendering a skeleton/placeholder until mounted on the client side.

#### CSS

You can also use CSS to hide or show content based on the current theme. To avoid the hydration mismatch, you'll need to render _both_ versions of the UI, with CSS hiding the unused version. For example:

```tsx
function ThemedImage() {
  return (
    <>
      {/* When the theme is dark, hide this div */}
      <div data-hide-on-theme="dark">
        <img src="light.png" alt="Light theme" />
      </div>

      {/* When the theme is light, hide this div */}
      <div data-hide-on-theme="light">
        <img src="dark.png" alt="Dark theme" />
      </div>
    </>
  )
}

export default ThemedImage
```

```css
[data-theme='dark'] [data-hide-on-theme='dark'],
[data-theme='light'] [data-hide-on-theme='light'] {
  display: none;
}
```

### With TailwindCSS

> NOTE! Tailwind only supports dark mode in version >2.

In your `tailwind.config.js`, set the dark mode property to `selector`:

```js
// tailwind.config.js
module.exports = {
  darkMode: 'selector'
}
```

_Note: If you are using an older version of tailwindcss < 3.4.1 use `'class'` instead of `'selector'`_

Set the `attribute` prop for your ThemeProvider to `class`:

```tsx
<ThemeProvider attribute="class">
  {children}
</ThemeProvider>
```

If you're using the `value` prop to specify different attribute values, make sure your dark theme explicitly uses the "dark" value, as required by Tailwind.

That's it! Now you can use dark-mode specific classes:

```tsx
<h1 className="text-black dark:text-white">My Heading</h1>
```

#### Using a custom selector (tailwindcss > 3.4.1)

Tailwind also allows you to use a [custom selector](https://tailwindcss.com/docs/dark-mode#customizing-the-selector) for dark-mode as of v3.4.1.

In that case, your `tailwind.config.js` would look like this:

```js
// tailwind.config.js
module.exports = {
  // data-mode is used as an example
  darkMode: ['selector', '[data-mode="dark"]']
}
```

Now set the `attribute` for your ThemeProvider to `data-mode`:

```tsx
<ThemeProvider attribute="data-mode">
  {children}
</ThemeProvider>
```

With this setup, you can now use Tailwind's dark mode classes, as in the previous example.

## Discussion

### The Flash

ThemeProvider automatically injects a script to update the `html` element with the correct attributes before the rest of your page loads. This means the page will not flash under any circumstances, including forced themes, system theme, multiple themes, and incognito. No `noflash.js` required.

## FAQ

---

**Why is my page still flashing?**

In development mode, the page may still flash. When you build your app in production mode, there will be no flashing.

---

**Why do I get server/client mismatch error?**

When using `useTheme`, you will see a hydration mismatch error when rendering UI that relies on the current theme. This is because many of the values returned by `useTheme` are undefined on the server, since we can't read `localStorage` until mounting on the client. See the [example](#avoid-hydration-mismatch) for how to fix this error.

---

**Do I need to use CSS variables with this library?**

Nope. See the [example](#without-css-variables).

---

**Can I set the class or data attribute on the body or another element?**

No, the library only supports setting attributes on the `html` element. If you have a good reason for supporting this feature, please open an issue.

---

**Is the injected script minified?**

Yes.

---

**How do I know what the system theme is?**

Use `systemTheme` from the `useTheme` hook. When `enableSystem` is true, this returns either "dark" or "light" based on the system preference, regardless of what the active theme is.

```tsx
const { theme, systemTheme } = useTheme()

// theme might be "system", "dark", or "light"
// systemTheme is either "dark" or "light" (the actual system preference)
```

---

## Attribution

This library is adapted from [next-themes](https://github.com/pacocoursey/next-themes) by [Paco Coursey](https://paco.sh/). The original library was designed specifically for Next.js, and this version has been modified to work seamlessly with TanStack Start and other React frameworks by removing Next.js-specific dependencies.

## License

MIT
