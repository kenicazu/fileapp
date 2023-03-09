import React, { FC, useEffect, useState } from 'react';
import { API, Storage } from 'aws-amplify';
import { Box, Button, CircularProgress, Container, Snackbar, Typography, Alert } from "@mui/material";

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import DownloadIcon from '@mui/icons-material/Download';

interface item {
    createdAt: string,
    itemId: string,
    itemName: string,
    fileName: string,
    categoryName: string,
    s3Path: string
}

const downloadBlob = (blob: any, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || 'download';
    const clickHandler = () => {
      setTimeout(() => {
        URL.revokeObjectURL(url);
        a.removeEventListener('click', clickHandler);
      }, 150);
    };
    a.addEventListener('click', clickHandler, false);
    a.click();
    return a;
  }

const getItem = async () => {
    const response = await API.get('main', 'items/', {});
    return response.length !== 0 ? response : [{
        createdAt: '-',
        itemId: '-',
        itemName: '-',
        fileName: '-',
        categoryName: '-',
        s3Path: '-'
    }];
};

const downloadFile = async (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    const key = event.currentTarget.value;
    const response = await Storage.get(key, {level: 'public', download: true});
    downloadBlob(response.Body, key);
}

const ItemList: FC = () => {
    const [data, setData] = useState<item[]|undefined>();
    const [isLoading, setIsLoading] = useState(true);
    const [successOpen, setSuccessOpen] = React.useState(false);
    const [errorOpen, setErrorOpen] = React.useState(false);

    useEffect(() => {
        (async () => {
            loadData();
        })();

    }, []);

    const loadData = async (renew: boolean = false) => {
        setIsLoading(renew ? false : true);
        let tmpData = await getItem();
        setData(tmpData);
        setIsLoading(false);
        setSuccessOpen(renew ? true : false);
    };

    const handleRenewClick = async () => {
        loadData(true);
    };

    const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') {
          return;
        }
        setSuccessOpen(false);
        setErrorOpen(false);
    };
  
    return (
        <Container>
            <Typography component="h1" variant="h4" align="center">
                一覧画面
            </Typography>

            {isLoading
                ?
                <CircularProgress />
                :
                <TableContainer>
                    <Table sx={{ minWidth: 250 }} aria-label="simple table">
                        <TableHead>
                        <TableRow>
                            <TableCell>カテゴリ名</TableCell>
                            <TableCell>項目名</TableCell>
                            <TableCell>ファイル名</TableCell>
                        </TableRow>
                        </TableHead>
                            <TableBody>
                                {data?.length !== undefined ?
                                    data.map((row) => (
                                        <TableRow
                                            key={row.itemId + row.createdAt}
                                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                        >
                                            <TableCell component="th" scope="row">
                                                {row.categoryName}
                                            </TableCell>
                                            <TableCell>{row.itemName}</TableCell>
                                            <TableCell>
                                                {row.fileName}
                                                {row.fileName !== '-'
                                                    ?
                                                    <Button
                                                    value={row.s3Path}
                                                    onClick={(e)=>{downloadFile(e)}}
                                                >
                                                        <DownloadIcon />
                                                </Button>
                                                : undefined

                                                }
                                                
                                            </TableCell>
                                        </TableRow>
                                    ))

                                : 'データはありません。'

                                }
                            </TableBody>
                    </Table>
                </TableContainer>
                }

            <Box textAlign="center" alignItems="center" justifyContent="center" sx={{pb: 5, pt: 5}}>
                <Button variant="contained" onClick={handleRenewClick}>更新</Button>
            </Box>
            <Snackbar
                open={successOpen}
                autoHideDuration={6000}
                onClose={handleClose}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert onClose={handleClose} severity="success" sx={{ width: '100%' }}>
                    新しいデータを取得しました。
                </Alert>
            </Snackbar>
            <Snackbar
                open={errorOpen}
                autoHideDuration={6000}
                onClose={handleClose}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert onClose={handleClose} severity="error" sx={{ width: '100%' }}>
                    エラーが発生しました。
                </Alert>
            </Snackbar>
            
        </Container>
    );
  }
  
  export default ItemList;
  