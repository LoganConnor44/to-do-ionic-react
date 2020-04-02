import React, { useState } from 'react';
import {
	IonItem,
	IonLabel,
	IonInput
} from '@ionic/react';
import { ITask } from '../entity/itask';

interface IEditTaskProps {
    editTask: Function;
    currentTask: ITask;
};

const EditTask = (EditTaskProps: IEditTaskProps) => {
	
	const [userValue, setValue] = useState<string>(EditTaskProps.currentTask.name as string);

	/**
	 * Edits a task based on the user's input.
	 * 
	 * Prevent default actions from the event.
	 * If the event value is empty, return immediately.
	 * Add the task to the React State.
	 * Reset the user's input value to an emtpy string.
	 * 
	 * @param {React.FormEvent<HTMLFormElement>} event - React Event 
	 */
	const handleSubmitToEditTask = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
		event.preventDefault();
		if (!userValue) {
			return;
        }
        const updatedTask = {
			...EditTaskProps.currentTask, 
			name: userValue
        };
		EditTaskProps.editTask(updatedTask);
		setValue("");
	};

	return (
		<IonItem>
			<form onSubmit={handleSubmitToEditTask}
				noValidate
				autoComplete="off">
				<IonLabel>Edit</IonLabel>
                <IonInput value={userValue}
					placeholder="Add a new Task"
					onIonChange={event => setValue((event.target as HTMLInputElement).value)} />
			</form>
		</IonItem>
	);
};

export default EditTask;