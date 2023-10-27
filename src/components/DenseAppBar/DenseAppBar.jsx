
"use client"
import TauriBridge from "@/utils/TauriBridge";
// import TauriBridge from "@/utils/TauriBridge";
// import CustomSlider from "./CustomSlider";
import { Slider } from '@mui/material';

import { Component } from "react";
import { AppBar } from '@mui/material';
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import MenuIcon from "@mui/icons-material/Menu";
import MoreIcon from "@mui/icons-material/MoreVert";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import PhotoSizeSelectLargeIcon from '@mui/icons-material/PhotoSizeSelectLarge';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Box from '@mui/material/Box';
import FolderSpecialIcon from '@mui/icons-material/FolderSpecial';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteMenu from './FavoriteMenu'; // お気に入りメニューのコンポーネントをインポート
import TurnedInNotIcon from '@mui/icons-material/TurnedInNot';
import TurnedInIcon from '@mui/icons-material/TurnedIn';
import DriveSelect from './DriveSelect';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Select from '@mui/material/Select';
import './DenseAppBar.css';

class DenseAppBar extends Component {
	constructor(props) {
		super(props);
		this.state = {
			anchorEl: null, // メニューの位置
			favorites: [],
			drives: [],
			favoriteAnchor:null,
			tb: null,
			thumb_setting: {
				aspectRatioEnabled: true,
				aspectRatio: 1,
				rect : {
					width: 240,
					height: 240
				},
				min: 240,

			}
		};
	}
	async componentDidMount() {
		const tb = TauriBridge.getInstance();
		tb.setDense(this);
		const drives = await tb.getDrives();
		const favorites = tb.getFavorites();
		var thumb_setting = await tb.getThumbSettingSync();
		this.setState({ drives:drives, tb:tb, favorites: favorites});
		if(localStorage.getItem("favorites")){
			this.setState({favorites:JSON.parse(localStorage.getItem("favorites"))});
		}
		if(localStorage.getItem("thumbnail_setting")){
			this.setState({thumb_setting:JSON.parse(localStorage.getItem("thumbnail_setting"))});
		}
	}
	// フォルダ選択ダイアログを表示する関数
	openFolderDialog = async () => {
		const tb = TauriBridge.getInstance();
		tb.selectFolder();
				
	};
	handleClick = (event) => {
		this.setState({ anchorEl: event.currentTarget });
	};

	// メニューを閉じる
	handleClose = () => {
		this.setState({ anchorEl: null });
		
	};

	// 幅を変更する
	handleWidthChange = (event, newValue) => {
		if (newValue < this.state.thumb_setting.min) {
			newValue = this.state.thumb_setting.min;
		}
		this.setState(prevState => ({
			thumb_setting: {
				...this.state.thumb_setting,
				rec: {
					...this.state.thumb_setting.rec,
					width: newValue
				}
			}
		}));
	};

	// 高さを変更する
	handleHeightChange = (event, newValue) => {
		const { thumb_setting } = this.state;
		if (newValue < thumb_setting.min) {
		  newValue = thumb_setting.min;
		}
		if (thumb_setting.rect.height !== newValue) {
		  this.setState(prevState => ({
			thumb_setting: {
			  ...prevState.thumb_setting,
			  rec: {
				...prevState.thumb_setting.rec,
				height: newValue
			  }
			}
		  }));
		}
	  };
	  
		// 現在のフォルダをお気に入りに追加または削除
	addToOrRemoveFromFavorite = () => {
		const currentFolder = this.state.tb.getCurrentFolder(); // 現在のフォルダ名を取得
		this.setState(prevState => {
			const { favorites } = prevState;
			let newFavorites;

			// 現在のフォルダがお気に入りに含まれているか確認
			if (favorites.includes(currentFolder)) {
				// お気に入りから削除
				newFavorites = favorites.filter(folder => folder !== currentFolder);
			} else {
				// お気に入りに追加
				newFavorites = [...favorites, currentFolder];
			}

			// localStorageに新しいお気に入りの配列を保存
			this.state.tb.saveFavorites(newFavorites);

			return { favorites: newFavorites };
		});
	};

	handleDeleteFavorite = (folder) => {
		this.setState(prevState => {
			const newFavorites = prevState.favorites.filter(fav => fav !== folder);
	
			// localStorageに新しいお気に入りの配列を保存
			localStorage.setItem('favorites', JSON.stringify(newFavorites));
	
			return { favorites: newFavorites };
		});
	};
	handleAspectRatioChange = () => {
		localStorage.setItem('thumbnail_setting', JSON.stringify({ ...this.state.thumb_setting, aspectRatioEnabled: !this.state.thumb_setting.aspectRatioEnabled }));
	}
	handleFavoriteClick = (event) => {
		this.setState({ favoriteAnchor: event.currentTarget });
	};

	// お気に入りメニューを閉じるための関数
	handleFavoriteClose = () => {
		this.setState({ favoriteAnchor: null });
	};
	handleDriveChange = (drive) => {
		console.log(drive);
		this.state.tb.openFolder(drive);
	}
	render ()  { 
		if (this.state.tb == null || this.state.tb.config.configData == null) {
			return [];
		}
		const { anchorEl,  favorites,  favoriteAnchor } = this.state;
		const { rect ,aspectRatioEnabled, aspectRatio } = this.state.thumb_setting;
		const {height, width} = rect;
		const minSize = this.state.thumb_setting.min;
		const currentFolder = this.state.tb.getCurrentFolder();
			// 現在のフォルダがお気に入りに含まれているか確認
		const isFavorite = favorites.includes(currentFolder);
		const drives = this.state.drives;
		const matchingDrive = drives.find(drive => currentFolder.startsWith(drive.drive));
		let selectedDrive = 'C:\\';
		if (matchingDrive) {
			selectedDrive = matchingDrive.drive;
		}
		return (
		<div className="root" shadow = 'none'>
			<AppBar position="static" shadow = 'none'>
			<Toolbar variant="dense" shadow = 'none' sx={{ minHeight: 32, maxHeight: 42, }}>
			<DriveSelect
				anchorEl={anchorEl}
				drives={drives}
				selectedDrive={selectedDrive}  // 選択されたドライブを渡す
				onDriveChange={this.handleDriveChange}  // 選択が変更されたときの処理を渡す
				style={{borderColor:'white' }}
			/>
				<IconButton
					style={{ marginRight: 1 }} 

						edge="end"
						color="inherit"
						aria-label="add-to-favorite"
						onClick={this.addToOrRemoveFromFavorite}
					>
						{isFavorite ? <TurnedInIcon /> : <TurnedInNotIcon />}
				</IconButton>

				{/* 現在のフォルダ名を表示 */}
				<Typography variant="h6" color="inherit" style={{whiteSpace: 'nowrap', width: '100%'}}>
					{currentFolder}
				</Typography>
				<div className="rightIcons">
					<IconButton
						edge="start"
						color="inherit"
						aria-label="favorite"
						onClick={this.handleFavoriteClick}
					>
						<FavoriteIcon />
					</IconButton>

					{/* お気に入りメニューを追加 */}
					<FavoriteMenu
						anchorEl={favoriteAnchor}
						handleClose={this.handleFavoriteClose}
						favorites={favorites}
						handleDelete={this.handleDeleteFavorite}  // 削除処理のメソッドを渡す
					/>
			
					<IconButton  color="inherit" onClick={this.handleClick}>
						<PhotoSizeSelectLargeIcon />
					</IconButton>
					<Menu
						anchorEl={anchorEl}
						keepMounted
						open={Boolean(anchorEl)}
						
						onClose={this.handleClose}
					>
							<MenuItem style={{ width: '300px' }}>
								<Box display="flex" flexDirection="column" alignItems="left" style={{ width: '100%' , fontSize:'medium'}}>
								<Box display="flex" flexDirection="row" alignItems="center" style={{ width: '100%' , fontSize:'medium'}}>
									<Typography gutterBottom>アスペクト比</Typography>
									<Checkbox
										checked={this.state.thumb_setting.aspectRatioEnabled}
										onChange={this.handleAspectRatioChange}
										name="aspectRatioEnabled"
									/>
									<Select
										labelId="aspect-ratio-select-label"
										id="aspect-ratio-select"
										value={this.state.thumb_setting.aspectRatio}
										onChange={this.handleAspectRatioSelectChange}
										style={{padding:'0px'}}
									>
										<MenuItem value={1}>1:1</MenuItem>
										<MenuItem value={1.5}>3:2</MenuItem>
										<MenuItem value={1.777}>16:9</MenuItem>
									</Select>
								</Box>

								<Typography gutterBottom>高さ：{height} px</Typography>
								<Slider
									value={height}
									min={minSize}
									max={window.screen.height}
									onChange={this.handleHeightChange}
									style={{ width: '100%' }}
								/>
								<Typography gutterBottom>幅：{width} px</Typography>
								<Slider
									value={width}
									min={minSize}
									max={window.screen.width}
									onChange={this.handleWidthChange}
									style={{ width: '100%' }}
								/>
							</Box>
						</MenuItem>
					</Menu>
					<IconButton
						edge="end"
						color="inherit"
						aria-label="folder"
						onClick={this.openFolderDialog}
					>
						<FolderOpenIcon />
					</IconButton>
					<IconButton edge="end" color="inherit" aria-label="more">
						<MoreIcon />
					</IconButton>
				</div>
			</Toolbar>
			</AppBar>
		</div>
		);
	}
}

export default DenseAppBar;
