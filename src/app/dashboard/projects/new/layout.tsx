import { Metadata } from "next";

export const metadata: Metadata = {
    title: "New Architecture",
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}
