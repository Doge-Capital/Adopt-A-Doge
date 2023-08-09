import React from "react";
import { useRouter } from "next/router";
import styles from "../../styles/about.module.css";
import Image from "next/image";
import Link from "next/link";

function About() {
  const router = useRouter();

  return (
    <div>
      <div className={styles.header}>
        <h1 className="mt-4 mb-4 text-4xl font-extrabold leading-none tracking-tight text-gray-900 md:text-5xl lg:text-6xl text-center">
          Created by the Doge Academy Students
        </h1>
      </div>
      <div className={styles.main}>
        <div className={styles.profilecard}>
          <div className={styles.img}>
            <Image
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRIr4loAVhNomgO1rnqoav3sDHbr3TxasdftOOCFP1L-g&s"
              width="160"
              height="160"
              alt="Aruns Profile Picture showing a pepe in a batman costume"
            />
          </div>
          <div className={styles.caption}>
            <h3>
              Arun
              <br />
              Student
            </h3>
            <div
              className={
                styles.sociallinks + " flex items-center justify-center"
              }
            >
              <Link href="https://github.com/ArunS-tack">
                <a target="_blank" rel="noopener noreferrer">
                  <Image
                    src="https://img.icons8.com/?size=512&id=62856&format=png"
                    width={"40"}
                    alt="Github Icon"
                    height={"40"}
                  />
                </a>
              </Link>
              <Link href="https://twitter.com/arun_14159">
                <a target="_blank" rel="noopener noreferrer">
                  <Image
                    src="https://img.icons8.com/?size=512&id=60014&format=png"
                    width={"40"}
                    alt="Twitter Icon"
                    height={"40"}
                  />
                </a>
              </Link>
            </div>
          </div>
        </div>

        <div className={styles.profilecard}>
          <div className={styles.img}>
            <Image
              src="https://media.discordapp.net/attachments/1129690773865103430/1137433639362236487/myMonke.png?width=952&height=952"
              width="160"
              height="160"
              alt="Elijahs Profile Picture showing a Solana Monkey Business Generation 3"
            />
          </div>
          <div className={styles.caption}>
            <h3>
              Elijahbrnv
              <br />
              Student
            </h3>
            <div
              className={
                styles.sociallinks + " flex items-center justify-center"
              }
            >
              <Link href="https://github.com/ilyxabatko">
                <a target="_blank" rel="noopener noreferrer">
                  <Image
                    src="https://img.icons8.com/?size=512&id=62856&format=png"
                    width={"40"}
                    alt="Github Icon"
                    height={"40"}
                  />
                </a>
              </Link>
              <Link href="https://twitter.com/elijahbrnv">
                <a target="_blank" rel="noopener noreferrer">
                  <Image
                    src="https://img.icons8.com/?size=512&id=60014&format=png"
                    width={"40"}
                    alt="Twitter Icon"
                    height={"40"}
                  />
                </a>
              </Link>
            </div>
          </div>
        </div>

        <div className={styles.profilecard}>
          <div className={styles.img}>
            <Image
              src="https://avatars.githubusercontent.com/u/63744576?v=4"
              width="160"
              height="160"
              alt="Image of ALsJourney Profile Picture showing a SectorH Profile picture"
            />
          </div>
          <div className={styles.caption}>
            <h3>
              ALsJourney
              <br />
              Mentor
            </h3>
            <div
              className={
                styles.sociallinks + " flex items-center justify-center"
              }
            >
              <Link href="https://github.com/alsjourney">
                <a target="_blank" rel="noopener noreferrer">
                  <Image
                    src="https://img.icons8.com/?size=512&id=62856&format=png"
                    width={"40"}
                    alt="Github Icon"
                    height={"40"}
                  />
                </a>
              </Link>
              <Link href="https://twitter.com/alsjourney">
                <a target="_blank" rel="noopener noreferrer">
                  <Image
                    src="https://img.icons8.com/?size=512&id=60014&format=png"
                    width={"40"}
                    alt="Twitter Icon"
                    height={"40"}
                  />
                </a>
              </Link>
            </div>
          </div>
        </div>
      </div>
      <div>
        <div className="flex justify-center items-center">
          <div className=" max-w-1/2 flex justify-center items-center hidden sm:flex">
            <Image
              src="/assets/images/dawg.svg"
              alt="Doge Capital Logo"
              width="300"
              height="250"
            />
          </div>
          <div className="flex flex-col w-1/2 pt-32">
          <h1 className="text-2xl font-bold leading-none tracking-tight text-gray-900 text-center sm:text-left md:text-3xl lg:text-4xl mb-8">
            Doge Capital
          </h1>
            <p className="text-center sm:text-left">
              Doge Capital is a startup development studio offering SaaS based
              applications, custom services, Web3 consulting and education to
              the Solana ecosystem. <br /> <br />
              Our team believes blockchain technology will play a critical role
              in shaping the future of internet infrastructure which is why we
              are positioning ourselves as a strong technical competitor by
              creating tools and services that can facilitate initial obstacles
              to teams looking to launch on the blockchain.
            </p>
            <div className="text-l bg-[#2278F9] px-9 rounded-full text-white w-fit flex py-4 hover:border-[#2278F9] border-4 hover:bg-white hover:text-[#2278F9] cursor-pointer mt-6 mx-auto sm:mx-0">
              <a href="https://thedogecapital.com/"> Learn More! </a>
            </div>
          </div>
        </div>
      </div>
      <div
        className="text-xl bg-[#2278F9] px-10 rounded-full text-white w-fit flex mx-auto py-4 hover:border-[#2278F9] border-2 hover:bg-white hover:text-[#2278F9] cursor-pointer mt-14 mb-14"
        onClick={() => router.back()}
      >
        Back
      </div>
    </div>
  );
}

export default About;
