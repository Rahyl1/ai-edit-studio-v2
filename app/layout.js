export const metadata = {
  title: 'AI Edit Studio',
  description: 'Edit images and videos with AI prompts',
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
