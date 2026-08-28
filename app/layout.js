export const metadata = {
  title: 'AI Edit Studio',
  description: 'Edit images and videos with AI prompts',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
}

export default function RootLayout({ children }) {
  return (
    <html lang="bn">
      <body style={{ margin: 0, padding: 0, backgroundColor: "#0b0f19" }}>
        {children}
      </body>
    </html>
  )
}
