import React, { FC, useEffect, useState } from 'react';
import { API, Storage } from 'aws-amplify';
import { Alert, Box, Button, Container, Grid, Snackbar, TextField, Typography } from "@mui/material";
import DropZone from '../components/Dropzone';

interface Item {
    categoryName: string,
    itemName: string,
    fileName: string
}

const putItem = async (request: Item) => {
    await API.put('main', 'items/', { body: request });
};

const putFile = async (file: File) => {
    await Storage.put(file.name, file, { level: "public" });
}

const FilePost: FC = () => {
    const [item, setItem] = useState({categoryName: '', itemName: ''});
    const [buttonDisabled, setButtonDisable] = useState(true);
    const [successOpen, setSuccessOpen] = React.useState(false);
    const [errorOpen, setErrorOpen] = React.useState(false);

    const [myFiles, setMyFiles] = React.useState<File[]>([]);

    useEffect(()=>{
        if (item.categoryName && item.itemName && myFiles.length !== 0) {
            setButtonDisable(false);
        } else {
            setButtonDisable(true);
        }
    }, [myFiles]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const target = e.target;
        const name = target.name;
        const value = target.value;
        setItem({...item, [name]: value});
        if ({...item, [name]: value}.categoryName
            && {...item, [name]: value}.itemName
            && myFiles.length !== 0
            ) {
            setButtonDisable(false);
        } else {
            setButtonDisable(true);
        }
    };

    const sendForm = async () => {
        try {
            await putItem({...item, fileName: myFiles[0].name });
            await putFile(myFiles[0]);
            setItem({categoryName: '', itemName: ''});
            setMyFiles([]);
            setButtonDisable(true);
            setSuccessOpen(true);
        } catch (e: any) {
            console.log(e);
            setErrorOpen(true);
        }
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
                登録画面
            </Typography>
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <TextField
                        required
                        id="categoryName"
                        name="categoryName"
                        label="カテゴリ名"
                        fullWidth
                        autoComplete="family-name"
                        variant="standard"
                        onChange={handleInputChange}
                        value={item.categoryName}
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        required
                        id="itemName"
                        name="itemName"
                        label="項目名"
                        fullWidth
                        autoComplete="family-name"
                        variant="standard"
                        onChange={handleInputChange}
                        value={item.itemName}
                    />
                </Grid>
                <Grid item xs={12}>
                    <DropZone myFiles={myFiles} setMyFiles={setMyFiles} />
                </Grid>

            </Grid>
            <Box textAlign="center" alignItems="center" justifyContent="center" sx={{pb: 5, pt: 5}}>
                <Button variant="contained" onClick={sendForm} disabled={buttonDisabled}>送信</Button>
            </Box>
            <Snackbar
                open={successOpen}
                autoHideDuration={6000}
                onClose={handleClose}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert onClose={handleClose} severity="success" sx={{ width: '100%' }}>
                    データが正常に登録されました。
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
  
  export default FilePost;