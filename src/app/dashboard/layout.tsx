
import DashboardLayout from "@/components/Sidebar";




export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body   
      >
      <DashboardLayout>{children}</DashboardLayout>
      </body>
    </html>
  );
}
