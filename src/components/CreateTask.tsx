import React, { useState } from 'react';
import {
	IonItem,
	IonLabel,
	IonInput
} from '@ionic/react';


interface ICreateTaskProps {
	addTask: Function;
};

const CreateTask = (CreateTaskProps: ICreateTaskProps) => {
	
	const [value, setValue] = useState("");

	/**
	 * Creates a task based on the user's input.
	 * 
	 * Prevent default actions from the event.
	 * If the event value is empty, return immediately.
	 * Add the task to the React State.
	 * Reset the user's input value to an emtpy string.
	 * 
	 * @param {React.FormEvent<HTMLFormElement>} event - React Event 
	 */
	const handleSubmitToCreateTask = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
		event.preventDefault();
		if (!value) {
			return;
		}
		CreateTaskProps.addTask(value);
		setValue("");
	};

	return (
		<IonItem>
			<form onSubmit={handleSubmitToCreateTask}
				noValidate
				autoComplete="off">
				<IonLabel>Task</IonLabel>
				<IonInput id='create-task-input'
					value={value}
					placeholder="Add a new Task"
					onIonChange={event => setValue((event.target as HTMLInputElement).value)}
					autofocus />
			</form>
		</IonItem>
	);
};

export default CreateTask;