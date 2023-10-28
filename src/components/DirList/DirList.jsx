"use client"
import React, { Component } from 'react';
import VirtualArray from "@/utils/VirtualArray";
import Grid from '@mui/material/Grid';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import FolderIcon from '@mui/icons-material/Folder';
import ArrowCircleUpIcon from '@mui/icons-material/ArrowCircleUp';
import { invoke } from '@tauri-apps/api/tauri';
import {show_context_dir} from '@/utils/MyContextMenu'
import FolderZipIcon from '@mui/icons-material/FolderZip';
import { Oval } from  'react-loader-spinner'
import '@/public/src/SplitView.js';
import './DirList.css';
import TauriBridge from '@/utils/TauriBridge';

class DirList extends Component {
	constructor(props) {
		super(props);
		this.state = {
			path: props.path,
			dirData: props.dirData,
			width:0,
			height:0,
			header_height:0,
			is_loading: false
		};
		this.state.tb = TauriBridge.getInstance();
		this.state.tb.setDirList(this);
	}
	selectDir=( item)=> {
		if (item) {
			const path = this.state.path + "\\" + item;
			console.log(path);
			this.state.tb.openFolder(path);
		} else {
			let path = this.state.path;
			const match = path.match(/[/\\]/g);
			if (match && match.length > 1) {
				path = path.replace(/[/\\][^/\\]*$/, "");
			}
			console.log(path);
			this.state.tb.openFolder(path);
		}
	}
	openExplorer() {
		//invoke('open_explorer');
	}
	
	componentDidMount() {
		this.gridRef = document.getElementById("dir-list-container");
		
		window.SplitView.setUserDefinedCallback( (newSizeA, newSizeB, percent) => {
			const FGrid = document.getElementsByClassName("DList")[0];
			if ( FGrid == null ) {
				return;
			}
			this.setState({ width: newSizeB });
			console.log(newSizeA, newSizeB, percent ,'/', FGrid.clientWidth, FGrid.clientHeight);
		});
		
	}
	shouldComponentUpdate(nextProps, nextState,) {
		if ( nextState.path != undefined && this.props.path !== nextState.path) { 
			console.log("shouldComponentUpdate path:" + this.props.path + " -> " + nextState.path);
	
			return true;
		}
		return false;
	}
	handleParentContextMenu= (ele) => {
		const index = Number(ele.target.attributes.ind.value);
		const is_f = ele.target.attributes.fs.value === 'f';
		window.is_f = is_f;
		console.log("親要素の右クリックイベントが発火");
		if (is_f && !isNaN(index)) {
			window.selected_ele = this;
			window.select_index = index;
			show_context_dir();
		}
	};
	
	render() {
		if (this.state.tb == null || this.state.tb.config.configData == null) {
			return [];
		}
		const {path, Va ,is_loading } = this.state;
		const dirData = this.state.tb.getDirData();
		if (!dirData || dirData.dirs.length === 0 && dirData.files.length === 0 ) {
			return null;
		}
		const gridRef = document.getElementById("dir-list-container");
		if (gridRef == null) {
			console.log("gridRef == null");
			return;
		}

		const gutter = document.getElementById("gutter");
		const width = gridRef.clientWidth;
		const height = gutter.clientHeight ; 
		return (
			<Grid id="dir-list-container"  item xs={4} md={4}>
				{is_loading && 
					<div className="overlay">
						<Oval
					height={80}
					width={80}
					color="#4fa94d"
					wrapperStyle={{}}
					wrapperClass=""
					visible={true}
					ariaLabel='oval-loading'
					secondaryColor="#4fa94d"
					strokeWidth={2}
					strokeWidthSecondary={2}

					/>
					</div>
				}
				
			<List
				id="DList"
				className="DList"
				>
					<ListItem  fs='f'  style={{ padding: '1px' , margin: '1px'}}>
							<div fs='f' className='folder-icon-div' style={{ backgroundColor: 'grey', borderRadius: '50%', display: 'flex'
								, justifyContent: 'center', alignItems: 'center'}}>
								<ArrowCircleUpIcon style={{ color: 'white', fontSize:'medium' }} />
							</div>
							<ListItemText fs='f' primary={
		 						// TypographyでlineHeightを設定
								<Typography fs='f' id='dir-name' style={{ lineHeight: '2',fontSize: '12px',whiteSpace: 'nowrap' }}>
									...
								</Typography>
							}  onClick={() => this.selectDir()}  />
						</ListItem>


					{dirData.dirs.map((item, index) => (
						<ListItem ind={index} fs='f'  key={index}    style={{ padding: '1px' , margin: '1px'}} >
							<div  fs='f'  ind={index} className='folder-icon-div' style={{ backgroundColor: 'grey', borderRadius: '50%', display: 'flex'
								, justifyContent: 'center', alignItems: 'center'}}>
								<FolderIcon  ind={index}  style={{ color: 'white', fontSize:'medium' }} />
							</div>
							<ListItemText ind={index} fs='f' onContextMenu={this.handleParentContextMenu}  primary={
								// TypographyでlineHeightを設定
								<Typography  fs='f' ind={index} component="p" id='dir-name' style={{ lineHeight: '2',fontSize: '12px',whiteSpace: 'nowrap' }}>
									{item}
								</Typography>
							}  onClick={() => this.selectDir(item)} onDoubleClick={this.openExplorer(item)} />
						</ListItem>
					))}
					{dirData.comps.map((item, index) => (
						<ListItem fs='c' ind={index}  key={index}    style={{ padding: '1px' , margin: '1px'}} >
							<div fs='c' className='folder-icon-div' style={{ backgroundColor: 'grey', borderRadius: '50%', display: 'flex'
								, justifyContent: 'center', alignItems: 'center'}}>
								<FolderZipIcon style={{ color: 'white', fontSize:'medium' }} />
							</div>
							<ListItemText ind={index} fs='c' onContextMenu={this.handleParentContextMenu}  primary={
								// TypographyでlineHeightを設定
								<Typography ind={index} component="p" fs='c' id='dir-name' style={{ lineHeight: '2',fontSize: '12px',whiteSpace: 'nowrap' }}>
									{item}
								</Typography>
							}  onClick={() => this.selectDir(item)} onDoubleClick={this.openExplorer(item)} />
						</ListItem>
					))}
			</List>
			</Grid>
		);
	}
}

export default DirList;