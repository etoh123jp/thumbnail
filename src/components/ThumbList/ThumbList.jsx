"use client"
import TauriBridge from "@/utils/TauriBridge";
// import TauriBridge from "@/utils/TauriBridge";

import React from "react";
import { FixedSizeGrid } from "react-window";
import VirtualArray from "@/utils/VirtualArray";
import GridCell from "@/components/GridCell/GridCell";
import 'react-virtualized/styles.css';
import { useEffect } from 'react';
import './ThumbList.css';

class ThumbList extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			Va: VirtualArray.getInstance(),
			path: props.path,
			dirData: props.dirData,
			width:0,
			height:0,
			tb :null ,
			thumb_setting:props.thumb_setting
		};
	}
	shouldComponentUpdate(nextProps, nextState) {
		if (window.SplitView && window.SplitView.inDrag) {
			return false;
		}
		return true;
	}
	async componentDidMount() {
		this.gridRef = document.getElementById("thumb-container");
		const tb =  TauriBridge.getInstance();
		tb.setGrid(this);
		this.setState({  tb:tb });
		
		window.SplitView.setUserDefinedCallback( (newSizeA, newSizeB, percent) => {
			const FGrid = document.getElementsByClassName("FGrid")[0];
			if ( FGrid == null ) {
				return;
			}
			this.setState({ width: newSizeB });
			// console.log(newSizeA, newSizeB, percent ,'/', FGrid.clientWidth, FGrid.clientHeight);
		});
		window.SplitView.setDragStartCallback( (e)=> {
			const FGrid = document.getElementsByClassName("FGrid")[0];
			if ( FGrid == null ) {
				return;
			}
		});
		
	}
  	  	/**
  	 * Renders the component and returns the JSX to be rendered.
  	 *
  	 * @return {JSX} The JSX to be rendered.
  	 */
  	render() { 
		if (this.state.tb == null || this.state.tb.config.configData == null) {
			return [];
		}
		const {path, Va  } = this.state; 
		const dirData = this.state.tb.getDirData();
		if (!dirData || !Va || Va.getLength() === 0 ) {
			return null;
		}
		const gridRef = document.getElementById("thumb-container");
		const gutter = document.getElementById("gutter");
		const width = gridRef.clientWidth;
		const height = gutter.clientHeight ;	
		const thumb_setting = this.props.thumb_setting;

		const tumb_rect = thumb_setting.rect;
		const columnCount = Math.floor( width / tumb_rect.width) || 1;
		Va.setColumnCount(columnCount == 0 ? 1 : columnCount); // 列数をセット

		const numRows = Va.getNumRows();
		//console.log("width:", width, "height:", height, " numRows:" + numRows, " columnCount:" + columnCount);
		const Cg = ({ columnIndex, rowIndex , style}) => (
			<div style={style}>
			<GridCell
				id="Cell"
				className="Cell"
				path={path}
				Va={Va}
				columnIndex={columnIndex}
				rowIndex={rowIndex}
				tumb_rect={tumb_rect}
				style={style}
				/></div>
			
		);
		return (
		<FixedSizeGrid
			id="fsg"
			className="FGrid"
			columnCount={columnCount}
			columnWidth={tumb_rect.width}
			height={height}
			rowCount={numRows}
			rowHeight={tumb_rect.height}
			width={width}
			style={{height, width}}
			shadow = 'none'
			>
			{Cg}
			</FixedSizeGrid>
		);

			
	}
}
export default ThumbList;
