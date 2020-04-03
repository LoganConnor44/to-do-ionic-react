import { useState, useEffect } from 'react';
import { ToDoDb } from '../service/ToDoDb';

/**
 * Prompts the user to install the application.
 */
const AddToHomescreenPrompt = () => {

    const db = new ToDoDb();


    /**
     * @param { boolean } prompt This constant can change
     * @param { isTrusted: boolean } prompt This constant can change
     */
    const [prompt, setPrompt] = useState(false);



    /**
     * An identical function exists within app-drawer.js
     */
    const promptToInstall = () => {
        if (prompt) {
            return prompt.prompt();
        }
        return Promise.reject(new Error('Tried installing before browser sent "beforeinstallprompt" event'));
    };

    const initializePreferencesIfNecessary = count => {
        if (count === 0) {
            const initialize = {
                username: 'loganconnor44',
                promptUserForInstallation: true
            };
            db.preferences.put(initialize);
        }
    };

    useEffect(() => {
        db.preferences.count().then(initializePreferencesIfNecessary);
        
        const ready = event => {
            event.preventDefault();
            setPrompt(event);
        };
        window.addEventListener("beforeinstallprompt", ready);
        return () => {
            window.removeEventListener("beforeinstallprompt", ready);
        };
    }, []);

    return [prompt, promptToInstall];
};

export default AddToHomescreenPrompt;