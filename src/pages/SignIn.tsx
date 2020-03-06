import {
	IonButtons,
	IonCard,
	IonCardContent,
	IonCardHeader,
	IonCardSubtitle,
	IonCardTitle,
	IonContent,
	IonHeader,
	IonMenuButton,
	IonPage,
	IonTitle,
	IonToolbar
} from '@ionic/react';
import React from 'react';
import './Home.css';
import CreateAccount from '../components/CreateAccount';

const SignIn: React.FC = () => {
    return (
		<IonPage>
			<IonHeader>
				<IonToolbar color='primary'>
                    <IonButtons slot="start"
                        color='light'>
						<IonMenuButton />
					</IonButtons>
					<IonTitle>Sign In</IonTitle>
				</IonToolbar>
			</IonHeader>
			<IonContent className='create-input'>
                <IonCard className="tasks-card"
                    color='tertiary'>
					<IonCardHeader>
						<IonCardSubtitle>It's easy and free!</IonCardSubtitle>
						<IonCardTitle>Create An Account</IonCardTitle>
					</IonCardHeader>
					<IonCardContent>
                        <CreateAccount addUser={ ()=> {} } />
					</IonCardContent>
				</IonCard>
                <IonCard className="tasks-card"
                    color='secondary'>
					<IonCardHeader>
						<IonCardSubtitle>Welcome back!</IonCardSubtitle>
						<IonCardTitle>Sign In</IonCardTitle>
					</IonCardHeader>
					<IonCardContent>
                        
					</IonCardContent>
				</IonCard>
			</IonContent>
		</IonPage>
	);
};

export default SignIn;