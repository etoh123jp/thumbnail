"use client"

import React, { useRef, useState, useEffect,useImperativeHandle, forwardRef } from 'react';
import { IconButton, Slider, Typography, FormControl, Select, MenuItem, Box } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FitScreenIcon from '@mui/icons-material/FitScreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
const formatTime = (time ) => {
	const minutes = Math.floor(time / 60);
	const seconds = Math.floor(time % 60);
	return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
};
const VideoPlayer = forwardRef(({ src, options }, ref) =>  {
	const videoRef = useRef(null);
	const [currentTime, setCurrentTime] = useState(0);
	const [duration, setDuration] = useState(0);
	const [playbackRate, setPlaybackRate] = useState(1);
	const [isPlaying, setIsPlaying] = useState(false);

	const fontSize = '0.8rem';  // 共通のfontSizeを変数に格納
	const menuItemStyle = { fontSize, whiteSpace: 'nowrap' };
	const [screenState, setScreenState] = useState('normal');

	const video = videoRef.current;
	const parentContainer = videoRef.parentNode;
	
	const togglePlay = () => {
		if (video.paused) {
			video.play();
			setIsPlaying(true);
		} else {
			video.pause();
			setIsPlaying(false);
		}
	};
	const handleFullScreenChange = () => {
		if (document.fullscreenElement) {
			setScreenState('fullscreen');
		} else {
			setScreenState('normal');
		}
	};
	const handleFullScreenToggle = () => {
		if (screenState === 'normal') {
		  videoRef.current.parentNode.requestFullscreen();  // 親要素をフルスクリーンに
		  setScreenState('fullscreen');
		} else {
		  document.exitFullscreen();  // フルスクリーンを解除
		  setScreenState('normal');
		}
	  };
	useImperativeHandle(ref, () => ({
		pauseVideo: () => {
		  if (videoRef.current) {
			videoRef.current.pause();
		  }
		},
		handleFullScreenChange ,
		handleFullScreenToggle,
		getScreenState: () => screenState,
	  }));
	useEffect(() => {
		const video = videoRef.current;
		const parentContainer = video.parentNode;
		if (videoRef.current) {
			videoRef.current.src = src;
		}
		const handleTimeUpdate = () => {
			setCurrentTime(video.currentTime);
		};
	
		const canplay = () => {
			setDuration(video.duration);
			if (video.videoWidth > video.videoHeight) {
				parentContainer.style.width = '100vw';
				parentContainer.style.height = 'auto';
				video.style.width = 'auto';
				video.style.height = '100vh';
			} else {
				parentContainer.style.width = 'auto';
				parentContainer.style.height = '100vh';
				video.style.width = '100vw';
				video.style.height = 'auto';
			}
			return;
			console.log('metadata with:%s height:%s',  video.videoWidth, video.videoHeight);
			const videoAspectRatio = video.videoWidth / video.videoHeight;
			const parentWidth = parentContainer.clientWidth;
			const parentHeight = parentContainer.clientHeight;
		
			// 親コンテナのアスペクト比を計算
			const parentAspectRatio = parentWidth / parentHeight;
		
			if (videoAspectRatio > parentAspectRatio) {
			  // 動画の方が横長の場合
			  video.style.width = `${parentWidth}px`;
			  video.style.height = `${parentWidth / videoAspectRatio}px`;
			} else {
			  // 動画の方が縦長、またはアスペクト比が同じ場合
			  video.style.height = `${parentHeight}px`;
			  video.style.width = `${parentHeight * videoAspectRatio}px`;
			}
		};
		document.addEventListener('fullscreenchange', handleFullScreenChange);
		video.addEventListener('timeupdate', handleTimeUpdate);
		video.addEventListener('loadedmetadata', canplay);
	
		return () => {
			video.removeEventListener('timeupdate', handleTimeUpdate);
			video.removeEventListener('loadedmetadata', canplay);
			document.removeEventListener('fullscreenchange', handleFullScreenChange);
		};
	}, [src, options]);
	const handlePlaybackRateChange = (e) => {
		const newRate = e.target.value;
		setPlaybackRate(newRate);
		videoRef.current.playbackRate = newRate;  // ここでビデオの再生速度を更新
	  };
	return (
		<div className={`video-container ${screenState}`}style={{ display: 'flex', flexDirection: 'column' }} >
			<div id="videoscreen" style={{ flexGrow: 1, display:'flex', alignItems: 'center', justifyContent: 'center' }}>
				<video ref={videoRef} controls={false}  />
			</div>
			<Box display="flex" alignItems="center" className={`fixed-controls  video-controls ${screenState}`}>
				<IconButton  color="primary" onClick={togglePlay} size="small" className={"button"}>
					{isPlaying ? <PauseIcon fontSize="inherit" /> : <PlayArrowIcon fontSize="inherit" />}
				</IconButton>
				<Slider
					value={currentTime}
					max={duration}
					onChange={(e, value) => {
						videoRef.current.currentTime = value;
					}}
					style={{ flexGrow: 1, width: 'auto', whiteSpace: 'nowrap', padding:0, margin:'0px 12px', height: '10px' }}
				/>
				<Typography style={{ whiteSpace: 'nowrap', fontSize }}>{formatTime(currentTime)} / {formatTime(duration)}</Typography>
				<FormControl variant="standard" size="small" style={{ marginLeft: 'auto' }}>
					<Select 
					sx={{
						'& .MuiSelect-select': {
							margin: '3px',
						  padding: 0,  // ここでpaddingを調整
						},
					  }}
						value={playbackRate} 
						onChange={handlePlaybackRateChange}
						autoWidth 
						style={{ fontSize, marginLeft: '6px', marginRight: '1px' , textAlign: 'right', padding: 0}}
						renderValue={(selectedValue) => (
							<div style={{ padding: 0  }}>
							{selectedValue}x
							</div>
						)}
						>
						<MenuItem value={0.5} style={menuItemStyle}>0.5x</MenuItem>
						<MenuItem value={1} style={menuItemStyle}>1x</MenuItem>
						<MenuItem value={1.5} style={menuItemStyle}>1.5x</MenuItem>
						<MenuItem value={2} style={menuItemStyle}>2x</MenuItem>
					</Select>
				</FormControl>
				<IconButton
				
					color="secondary"
					onClick={() => {
						// videoRef.current.requestFullscreen();  // これではなく
						videoRef.current.parentNode.requestFullscreen();  // 親要素をフルスクリーンに
					}}
					size="small"
				>
					<FullscreenIcon fontSize="inherit" />
				</IconButton>
				
			</Box>
		</div>
	);
});
VideoPlayer.displayName = 'VideoPlayer';
export default VideoPlayer;
