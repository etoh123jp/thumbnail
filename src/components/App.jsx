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
		console.log('componentDidMount');
		const tb = TauriBridge.getInstance(); 
		await tb.init();
		TauriBridge.getInstance().setApp(this);
		TauriBridge.getInstance().getStorageDirectory();
		const theme = tb.getTheme();

		this.setState(state=>({
			tb: tb,
			init:true,
			theme:theme
		}));
		const mainContainer= document.getElementById("mainContainer");
		if (mainContainer) {
			SplitView.activate(document.getElementById("mainContainer"));
			window.addEventListener("resize", this.handleResize);
		}
		
	}

	 componentWillUnmount() {
		window.removeEventListener("resize", this.handleResize);
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
						<DenseAppBar  />
					</div>
					<div id="mainContainer" className="split-view horizontal">
						<div ref={this.dirRef} id="dir-list-container" className="dir-list-container">
							<DirList   />
						</div>
						<div id="gutter" className="gutter"></div>
						<div ref={this.gridRef} id="thumb-container" className="thumb-container">
							<ThumbList />
						</div>
					</div>
				</div>
			</ThemeProvider>
		);
	}
}

export default App;
