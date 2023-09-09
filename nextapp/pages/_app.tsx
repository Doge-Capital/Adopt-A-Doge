import "../styles/globals.css";
import type { AppProps } from "next/app";
import Navbar from "../components/Navbar";
import { Wallet } from "../context/Wallet";
import { ProgramProvider } from "../context/Program";
import { Toaster } from 'react-hot-toast';

function MyApp({ Component, pageProps }: AppProps) {
    return (
        <>
            <Wallet>
                <Navbar />
                <ProgramProvider>
                <Toaster
                    position="bottom-center"
                    reverseOrder={false}
                    toastOptions={{
                        duration: 3000,
                    }}
                />
                    <Component {...pageProps} />
                </ProgramProvider>˝
            </Wallet>
        </>
    );
}

export default MyApp;
