export const metadata = {
  title: "MCP UI",
  description: "AI DB Assistant",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
