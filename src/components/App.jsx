"use client"

import TauriBridge from "@/utils/TauriBridge";

import React, { Component } from "react";
import DenseAppBar from "@/components/DenseAppBar/DenseAppBar";
import ThumbList from "@/components/ThumbList/ThumbList";
import DirList from "@/components/DirList/DirList";
// import TauriBridge from "@/utils/TauriBridge";
// import './SplitView.js';
import "./App.css";

class App extends Component {
	constructor(props) {
		super(props);
		this.state = {
			
			btc: null,
		};
		
		this.gridRef = React.createRef();
		this.dirRef = React.createRef();
	}

	componentDidMount() {
		
		SplitView.activate(document.getElementById("mainContainer"));
		
		this.setState({
			btc: TauriBridge.getInstance(),
		});
		TauriBridge.getInstance().setApp(this);
		window.addEventListener("resize", this.handleResize);
		TauriBridge.getInstance().getStorageDirectory();
		const currentStyle = window.getComputedStyle(this.gridRef.current).width;
		// スタイルから％の数値を読み取る（この例では簡単のため、ステートを直接使用）
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
		const { tumb_rect } = this.state;
		const dynamicStyle = {
			width: `calc(${this.state.percentage}% - 5px)`
		};
		return (
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
		);
	}
}

export default App;
