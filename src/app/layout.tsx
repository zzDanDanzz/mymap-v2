import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import "@shared/globals.css";

import { ColorSchemeScript, MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl">
      <head>
        <ColorSchemeScript />
      </head>
      <body>
        <MantineProvider
          theme={{
            fontFamily: "IRANSansWeb",
            primaryColor: "pink",
            components: {
              Modal: {
                defaultProps: {
                  centered: true,
                },
              },
            },
          }}
        >
          <Notifications />
          {children}
        </MantineProvider>
      </body>
    </html>
  );
}
