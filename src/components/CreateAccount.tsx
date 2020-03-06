import React, { useState } from 'react';
import {
	IonItem,
	IonLabel,
	IonInput
} from '@ionic/react';

interface ICreateAccountProps {
	addUser: Function;
};

const CreateAccount = (CreateAccountProps: ICreateAccountProps) => {
	
    const [commonName, setCommonName] = useState<string>('');
    const [userName, setUserName] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [email, setEmail] = useState<string>('');

    const validateEmail: Function = (email: string) => email.includes('@');
    const validatePassword: Function = (password: string) => password.length > 4;

	const handleSubmitToCreateAccount = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
		event.preventDefault();
		if (!userName) {
			return;
		}
		CreateAccountProps.addUser(userName);
		setUserName('');
		console.log(`account created for ${userName}`);
	};

	return (
		<IonItem>
			<form onSubmit={handleSubmitToCreateAccount}
				noValidate
				autoComplete="off">
				<IonLabel>Name</IonLabel>
				<IonInput id='create-account-name-input'
					value={commonName}
					placeholder="Ni jiao shenme mingzi"
					onIonChange={event => setCommonName((event.target as HTMLInputElement).value)}
					autofocus />
                <IonLabel>User Name</IonLabel>
				<IonInput id='create-account-user-name-input'
					value={userName}
					placeholder="Unique name"
					onIonChange={event => setUserName((event.target as HTMLInputElement).value)} />
                <IonLabel>Password</IonLabel>
				<IonInput id='create-account-password-input'
					value={password}
					placeholder="1234 that's my password..."
					onIonChange={event => setPassword((event.target as HTMLInputElement).value)} />
			</form>
		</IonItem>
	);
};

export default CreateAccount;