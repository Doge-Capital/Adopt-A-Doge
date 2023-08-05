import React from "react";
import { Image } from "@nextui-org/react";
import { useRouter } from "next/router";
import styles from '../../styles/about.module.css'

function About() {
    const router = useRouter();

    return (
        <div>
        <div className={styles.main}>
        <div className={styles.profilecard}>
            <div className={styles.img}>
                <img src= "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRIr4loAVhNomgO1rnqoav3sDHbr3TxasdftOOCFP1L-g&s"/>
            </div>
            <div className={styles.caption}>
                <h3>Arun</h3>
                <div className={styles.sociallinks}>
                    <a href="https://twitter.com/arun_14159"><img src = "https://img.icons8.com/?size=512&id=60014&format=png" width={'40'}/></a>
                </div>
            </div>
        </div>
      
        <div className={styles.profilecard}>
            <div className={styles.img}>
                <img src="https://media.discordapp.net/attachments/1129690773865103430/1137433639362236487/myMonke.png?width=952&height=952"/>
            </div>
            <div className={styles.caption}>
                <h3>Elijahbrnv</h3>
                <div className={styles.sociallinks}>
                <a href="https://twitter.com/elijahbrnv"><img src = "https://img.icons8.com/?size=512&id=60014&format=png" width={'40'}/></a>
                <a href="https://twitter.com/elijahbrnv"><img src = "https://img.icons8.com/?size=512&id=62856&format=png" width={'40'}/></a>
                </div>
            </div>
        </div>
      
        <div className={styles.profilecard}>
            <div className={styles.img}>
                <img src="https://avatars.githubusercontent.com/u/63744576?v=4"/>
            </div>
            <div className={styles.caption}>
                <h3>Alsjourney</h3>
                <div className={styles.sociallinks}>
                <a href="https://twitter.com/alsjourney"><img src = "https://img.icons8.com/?size=512&id=60014&format=png" width={'40'} /></a>
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