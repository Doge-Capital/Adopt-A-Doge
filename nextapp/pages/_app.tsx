import "../styles/globals.css";
import type { AppProps } from "next/app";
import Navbar from "../components/Navbar";
import { Wallet } from "../context/Wallet";
import { ProgramProvider } from "../context/Program";

function MyApp({ Component, pageProps }: AppProps) {
    return (
        <>
            <Wallet>
                <Navbar />
                <ProgramProvider>
                    <Component {...pageProps} />
                </ProgramProvider>˝
            </Wallet>
        </>
    );
}

export default MyApp;
