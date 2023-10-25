"use client"
import styles from '@/app/page.module.css';
import Viewer from './viewer'



export default function Home() {
	return (
		<main className={styles.main}>
			<Viewer/>
		</main>
	)
}
