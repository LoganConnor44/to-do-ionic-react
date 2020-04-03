import React, { useState, useEffect } from 'react';
import Snackbar from '@material-ui/core/Snackbar';
import SnackbarContent from '@material-ui/core/SnackbarContent';
import InfoIcon from '@material-ui/icons/Info';
import CloseIcon from '@material-ui/icons/Close';
import IconButton from '@material-ui/core/IconButton';
import GetAppIcon from '@material-ui/icons/GetApp';
import AddToHomescreenPrompt from './AddToHomeScreenPrompt';
import { ToDoDb } from '../service/ToDoDb';

/**
 * React web component to install the WebApk or a web shortcut to the user's homescreen.
 */
const InstallPwa = () => {
    const [prompt, promptToInstall] = AddToHomescreenPrompt();
    const [isAddToHomescreenVisible, setIsAddToHomescreenVisible] = useState(false);
    const [promptUserForInstallation, setPromptUserForInstallation] = useState(false);
    const db = new ToDoDb();

    

    const dismissAndStorePreference = event => {
        hideAddToHomescreen();
        doNotPromptAgain(event);
    };

    const hideAddToHomescreen = () => setIsAddToHomescreenVisible(false);

    const installAndHideMessage = () => {
        hideAddToHomescreen();
        promptToInstall();
    };

    const doNotPromptAgain = event => {
        event.preventDefault();
        db.preferences.toArray().then(results => {
            db.preferences.update(results[0].id, {promptUserForInstallation: false});
        });
    };
    
    db.preferences.toArray().then(results => {
        if (results.length !== 0) {
            setPromptUserForInstallation(results[0].promptUserForInstallation);
        }
    });
    
    useEffect(() => {
        /**
         * Determines if the prompt is false or anything else.
         * Prompt may be an object such as { isTrusted: boolean }
         */
        const promptEventIsReady = () => prompt !== false ? prompt : false;

        if (promptEventIsReady() && promptUserForInstallation) {
            setIsAddToHomescreenVisible(true);
        }
    }, [prompt, promptUserForInstallation]);

    const message = "Click here to download this app.";

    return ( 
        isAddToHomescreenVisible ?
            <Snackbar anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'center',
                    
                }}
                open={isAddToHomescreenVisible}
                autoHideDuration={3000} >
                <SnackbarContent message={
                    <div style={{
                            display: 'flex',
                            alignItems: 'center'
                        }} >
                        <InfoIcon style={{marginRight: 4}} />
                    {message}
                    </div>
                    }
                    style={{backgroundColor: '#43a047'}}
                    action={
                        <div>
                            <IconButton key="download-and-dismiss" aria-label="download-and-dismiss" onClick={installAndHideMessage} >
                                <GetAppIcon />
                            </IconButton>
                            <IconButton key="close" aria-label="close" onClick={dismissAndStorePreference} >
                                <CloseIcon />
                            </IconButton>
                        </div>
                    } />
            </Snackbar>
            :
            <div></div>
    );
};

export default InstallPwa;