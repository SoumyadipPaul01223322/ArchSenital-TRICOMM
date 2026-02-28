import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Architecture Builder",
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}
