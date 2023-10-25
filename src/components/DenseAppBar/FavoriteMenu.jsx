import React from 'react';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';

const FavoriteMenu = ({ anchorEl, handleClose, favorites, handleDelete }) => {
	return (
		<Menu
			anchorEl={anchorEl}
			keepMounted
			open={Boolean(anchorEl)}
			onClose={handleClose}
		>
			{favorites.map((folder, index) => (
				<MenuItem key={index} onClick={handleClose}>
					{/* 削除ボタンを追加 */}
					<IconButton edge="start" color="inherit" onClick={() => handleDelete(folder)}>
						<DeleteIcon />
					</IconButton>
					{folder}
				</MenuItem>
			))}
		</Menu>
	);
};

export default FavoriteMenu;
