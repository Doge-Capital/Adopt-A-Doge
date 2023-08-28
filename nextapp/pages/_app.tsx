import "../styles/globals.css";
import type { AppProps } from "next/app";
import Navbar from "../components/Navbar";
import { Wallet } from "../context/Wallet";

function MyApp({ Component, pageProps }: AppProps) {
    return (
        <>
            <Wallet>
                <Navbar />
                <Component {...pageProps} />
            </Wallet>
        </>
    );
}

export default MyApp;
