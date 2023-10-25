import React, { useState } from 'react';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import DriveEtaIcon from '@mui/icons-material/DriveEta';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';  // Boxコンポーネントを追加
import DriveEtaOutlinedIcon from '@mui/icons-material/DriveEtaOutlined';
export default function DriveSelect({ drives, selectedDrive, onDriveChange }) {

  const handleChange = (event) => {
    const newDrive = event.target.value;
    onDriveChange(newDrive);  // 外部の関数を呼び出して選択を更新
  }

  return (
    <Select
	id="driveSelect"

	style={{ width:170 , height:32, paddingRight:10, margin:0, overflow:"hidden"}}
	value={selectedDrive}  // 選択された値を外部から受け取る
	onChange={handleChange}
      displayEmpty
	  renderValue={(selectedValue) => { 
        const drive = drives.find((d) => d.drive === selectedValue);
        return (
          <Box  display="flex" alignItems="center" style={{ width:240 , height:32, padding:0, margin:0}}>
            <DriveEtaOutlinedIcon   fontSize="small" style={{color: 'white'}} />
            <Typography style={{color: 'white'}} >{drive ? drive.drive : 'Select Drive'}</Typography>
          </Box>
        );
      }}
    >
      {drives.map((drive) => (
        <MenuItem key={drive.drive} value={drive.drive} style={{ width:240 , height:32, padding:0, marginLeft:10}}>
          <Box display="flex" alignItems="left"  >  {/* alignItemsをcenterに設定 */}
            <ListItemIcon>
              <DriveEtaOutlinedIcon color="inherit"  fontSize="small" variant="inherit" />
            </ListItemIcon>
            <Typography variant="inherit">
              {drive.drive}
            </Typography>
          </Box>
        </MenuItem>
      ))}
    </Select>
  );
}
