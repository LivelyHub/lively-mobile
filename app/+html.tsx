import { ScrollViewStyleReset } from 'expo-router/html';

// Web-only document shell (expo-router convention). Locks html/body/#root to
// the viewport height with overflow hidden, so scrolling only ever happens
// inside our own ScrollView — without this, mobile Safari lets the whole page
// rubber-band/bounce past its content, which for a second exposes the raw
// white <body> background above the hero (the "white gap" on overscroll).
export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover" />
        <ScrollViewStyleReset />
        <style
          // Same cream as constants/tokens#colors.background — kept as a literal
          // since this file renders before any RN styling exists to import from.
          dangerouslySetInnerHTML={{
            __html: `html,body{overscroll-behavior:none;background-color:#FBF6F1;}`,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
