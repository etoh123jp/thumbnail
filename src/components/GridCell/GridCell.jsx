
"use client"
import TauriBridge from "@/utils/TauriBridge";

import { Component } from 'react';
import VirtualArray from '@/utils/VirtualArray';
import { convertFileSrc } from '@tauri-apps/api/tauri';
import { WebviewWindow } from '@tauri-apps/api/window';
import Image from 'next/image';
import "./GridCell.css";
import CircularProgress from '@mui/material/CircularProgress';
const movie_type = ["mp4", "mkv", "avi", "mov"];
class GridCell extends Component {
	constructor(props) {
		super(props);
		this.state = {
			path: props.path,
			columnIndex : props.columnIndex,
			rowIndex : props.rowIndex,
			isLoading: false,
			url : null,
			filename: null,
			is_movie : false,
			tb :null ,
		};
		this.va = VirtualArray.getInstance();

		const { path, columnIndex, rowIndex } = this.props;
		this.state.fileName = this.va.getItem(rowIndex, columnIndex);
		if (this.state.fileName == null) {
			this.state.url = null;
			return;
		};
		let ext = this.state.fileName.split('.').pop();
		this.state.is_movie = movie_type.includes(ext);
		
	}
	componentDidMount() {
		const tb = TauriBridge.getInstance();
		this.setState({ tb:tb });
	}
	fileSrc(path) {
		return convertFileSrc(path);
	}
	handleDoubleClick = (event) => {
		event.preventDefault();
		event.stopPropagation();
		const page_numbar = this.props.rowIndex * this.va.getColumnCount() +  this.props.columnIndex;

		this.state.tb.openNewWindow(this.state.path, page_numbar);
	};
	handleLoad = () => {
		this.setState({isLoading: true});
	};
	
	/**
	 * 
	 * Renders the component.
	 *
	 * @return {JSX.Element} The rendered component.
	 */
	render() { 
		if (this.state.fileName == null) return null;
		const src = "https://asset.localhost/" +this.state.fileName.replaceAll( '\\', '/' );
		const isLoaded = this.state.isLoading;
		if (this.state.is_movie) {
			return (
				<div m='gc' className="gridCell" onDoubleClick={this.handleDoubleClick} >
					<video m='gc' controls src={src}  controlsList="nodownload" loading="lazy" />
				</div>
			);
		} else {
			return (
				<div style={{ position: 'relative', width: '100%', height: '100%' }}  className="gridCell">
					{ !isLoaded && (
					<div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
						<CircularProgress />
					</div>
					)}
					<div style={{ opacity: isLoaded ? 1 : 0, transition: 'opacity 0.3s' }}  className="gridCell">
					<Image
						src={src}
						width={100}
						height={100}
						alt="My Image"
						sizes="100vw"
						onLoad={this.handleLoad} 
						priority  
						onDoubleClick={this.handleDoubleClick}
					/>
					</div>
				</div>
			);
		}
		
	}
}

export default GridCell;
