
import DashboardLayout from "@/components/DashboardLayout";




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
