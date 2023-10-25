"use client"

import Image from 'next/image'
import styles from '@/app/page.module.css';
import dynamic from 'next/dynamic';
const App = dynamic(() => import("@/components/App"), { ssr: false });


export default function AppMani() {
	return (
		<main className={styles.main}>
			<App />
			
		</main>
	)
}