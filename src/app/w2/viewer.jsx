"use client"
import Image from 'next/image'
import React, { useEffect, useRef, useState } from 'react';
import "./v.css";
import CircularProgress from '@mui/material/CircularProgress';
import { ScrollContainer } from 'react-indiana-drag-scroll';
import { useScrollContainer } from 'react-indiana-drag-scroll';
import 'react-indiana-drag-scroll/dist/style.css';
import { emit } from '@tauri-apps/api/event';
import VideoPlayer from './VideoPlayer'

const Viewer = () => {
	const [isLoaded, setIsLoaded] = useState(false);
	const imgRef = useRef(null);
	const videoPlayerRef = useRef(null);
	const [videoSource, setVideoSource] =useState(null);
	const [shouldPause, setShouldPause] = useState(false);
	const [isMovie, setIsMovie] = useState(false);
	const [imageSrc, setImageSrc] = useState(false);
	const [showWindow, setShowWindow] = useState(false);
	const showWindowRef = useRef(null);
	const [showProgress, setShowProgress] = useState(true);

  const onWheel = (event) => {
    	console.log('wheel',event);
		if (event.target == document.getElementById('video-player')) {
			return false;
		}
		if (event.deltaY <0 ) {
			emit('img_move', {payload:'prev_img'});
		} else if (event.deltaY > 0) {
			emit('img_move', {payload:'next_img'});
		}
	};
	const handleImageLoaded = () => {
		console.log('Image has been loaded');
		setShowProgress(false);
	};
	useEffect(() => {
		let src = localStorage.getItem('src');
		const player = document.getElementById('video-player');
		window.video_source = document.getElementById('video-source');
		const video = document.getElementById('video-container');
		const currentImgRef = imgRef.current;
		const currentShowWindowRef = showWindowRef.current;
		window.__TAURI__.event.emit('img-window-ready', { cmd: 'send', payload: 'prev_img' }); 
		window.__TAURI__.event.listen('load-image', event => {
			console.log('load-image',event);
			const imgPath = event.payload.imgPath;
			setShowProgress(true);
			load_image(imgPath);
			// location.reload();

		});
		
		imgRef.current?.addEventListener("wheel", onWheel, { passive: false });
		// 遅延処理
		const timer = setTimeout(() => {
			fetchData();
		}, 100);
		// 非同期処理を実行
		const fetchData = async () => {
			try {
				if( !currentShowWindowRef ){ 
					// データがロードされたら
					setShowWindow(true);
					clearTimeout(timer);  // タイマーをクリア
				}
				else {
					console.log('reload');
				}
			} catch (error) {
				console.error(error);
			}
		};
		return (() => {
			clearTimeout(timer);
			currentImgRef?.removeEventListener("wheel", onWheel, { passive: false });
		});
	
	}, []);
	const load_image = (imgPath) => {
		const movie_type = ["mp4", "mkv", "avi", "mov"];
		
		console.log('load-image',imgPath);
		let ext = imgPath.split('.').pop();
		if (movie_type.includes(ext) ){
			setIsMovie(true);
			
			setVideoSource(imgPath);
			document.getElementById('image-viewer').src = ""; 
			imgRef.current.style.overflow = 'hidden';
			imgRef.current.style.cursor = 'auto';
		} else {
			setIsMovie(false);
			setImageSrc(imgPath);
			if (videoPlayerRef.current) {
				videoPlayerRef.current.pauseVideo();
				setVideoSource('');
				if ('fullscreen' == videoPlayerRef.current.getScreenState()) {
					videoPlayerRef.current.handleFullScreenToggle();
				}
			}
			// check full screen
		}
		setIsLoaded(true);
		if (localStorage.getItem('imgPath') != null) {
			localStorage.setItem('imgPath', imgPath);
		} else {
			localStorage.setItem('imgPath', imgPath);
		}
	};
	const options = {
		rubberBand:false,
		inertia: false,
	};
	const scrollContainer = useScrollContainer(options);
	const videoJsOptions = { };
	
	return (
		<ScrollContainer id="container" ref={imgRef} style={{cursor:'auto',textAlign:'center', display:'flex', alignItems: 'center', justifyContent: 'center'}} >
			{ setShowProgress && !showWindow && !isLoaded && (
				<div id="progress" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
					<CircularProgress />
				</div>
				
			)}
			{(() => {
					if (isMovie) {
					  return <div id="video-container"  >
								<VideoPlayer shouldPause={shouldPause} ref={videoPlayerRef} options={videoJsOptions} src={videoSource}/>
							</div>
					} else {
					  return <div id='image-container'  
									style={{display:'inline-flex' ,alignItems: 'center', justifyContent: 'center'}} >
								<Image fill id="image-viewer"  src={imageSrc} alt="Image Viewer" onLoadingComplete={() => setIsLoaded(true)}  />
							</div>
				}
			})()}
			
		</ScrollContainer>
	);
};

export default Viewer;
