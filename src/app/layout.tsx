"use client";

import { Inter } from "next/font/google";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import theme from "@/app/lib/theme";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import AuthProvider from "@/components/providers/AuthProvider";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }: { children: React.ReactNode; }) {
  return (
    <AuthProvider>
      <html lang="en">
        <body className={inter.className}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
              <Header />
              <Box component="main" sx={{ flexGrow: 1, py: 4, px: 2, maxWidth: "lg", mx: "auto", width: "100%" }}>
                {children}
              </Box>
              <Footer />
            </Box>
          </ThemeProvider>
        </body>
      </html>
    </AuthProvider>
  );
}