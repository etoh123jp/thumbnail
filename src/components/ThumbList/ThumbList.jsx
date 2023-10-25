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
			tumb_rect : {width : 0, height : 0}, 
			width:0,
			height:0,
			header_height:0,
			percentage: 30,
			tb :null ,
		};
	}

	componentDidMount() {
		this.gridRef = document.getElementById("thumb-container");
		const tb =  TauriBridge.getInstance();
		tb.setGrid(this);
		const thumb_rect = tb.getThumbRect();
		this.setState({ thumb_rect: thumb_rect, tb:tb });
		
		window.SplitView.setUserDefinedCallback( (newSizeA, newSizeB, percent) => {
			const FGrid = document.getElementsByClassName("FGrid")[0];
			if ( FGrid == null ) {
				return;
			}
			this.setState({ width: newSizeB });
			console.log(newSizeA, newSizeB, percent ,'/', FGrid.clientWidth, FGrid.clientHeight);
		});

		
	}
  	  	/**
  	 * Renders the component and returns the JSX to be rendered.
  	 *
  	 * @return {JSX} The JSX to be rendered.
  	 */
  	render() { 
		if (this.state.tb == null) {
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

		const tumb_rect = this.props.tumb_rect;
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
