"use client"

import TauriBridge from "@/utils/TauriBridge";
import React, { Component } from "react";
import DenseAppBar from "@/components/DenseAppBar/DenseAppBar";
import ThumbList from "@/components/ThumbList/ThumbList";
import DirList from "@/components/DirList/DirList";
import { ThemeProvider, createTheme } from '@mui/material/styles'
// import TauriBridge from "@/utils/TauriBridge";
// import './SplitView.js';
import "./App.css";

class App extends Component {
	mainContainerRef = React.createRef();
	constructor(props) {
		super(props);
		this.state = {
			init: false,
			tb: null,
			theme:null,
		};
		this.gridRef = React.createRef();
		this.dirRef = React.createRef(); 
	}

	async componentDidMount() { 
		console.log('App componentDidMount');
		const tb = TauriBridge.getInstance(); 
		await tb.init();
		TauriBridge.getInstance().setApp(this);
		TauriBridge.getInstance().getStorageDirectory();
		const theme = tb.getTheme();
		const thumb_setting	= tb.getThumbnailSetting();
		this.setState(state=>({
			tb: tb,
			init:true,
			theme:theme,
			thumb_setting:thumb_setting 
		}));
		window.addEventListener("resize", this.handleResize);
	}
	componentDidUpdate() 
	{
		console.log('App componentDidUpdate');
		if (this.state.init) {
			SplitView.activate(this.mainContainerRef.current);
		}
	}
	componentWillUnmount() {
		window.removeEventListener("resize", this.handleResize);
	}
	changeThumbSize = (size) => {
		this.setState(prevState => ({
			thumb_setting: {
				...prevState.thumb_setting,
				rect: size
			}
		}));
	}
	handleResize = () => {
		this.setState({
			windowSize: {
				width: window.innerWidth,
				height: window.innerHeight,
			},
		}); 
	};

	render() {
		console.log('render');
		if (this.state.tb == null) return [];
		const theme = createTheme(this.state.theme);
		return (
			<ThemeProvider theme={theme}>
				<div className="App">
						<div id="header" className="header">
							<DenseAppBar changeThumbSize={this.changeThumbSize} />
						</div>
						<div id="mainContainer" ref={this.mainContainerRef} className="split-view horizontal">
							<div ref={this.dirRef} id="dir-list-container" className="dir-list-container">
								<DirList   />
							</div>
							<div id="gutter" className="gutter"></div>
							<div ref={this.gridRef} id="thumb-container" className="thumb-container">
								<ThumbList thumb_setting={this.state.thumb_setting} />
							</div>
						
						</div>
				</div>
			</ThemeProvider>
		);
	}
}

export default App;
