import {
	IonButtons,
	IonCard,
	IonCardContent,
	IonCardHeader,
	IonCardSubtitle,
	IonCardTitle,
	IonContent,
	IonHeader,
	IonItem,
	IonLabel,
	IonList,
	IonMenuButton,
	IonPage,
	IonTitle,
	IonToolbar,
	IonFab,
	IonFabButton,
	IonIcon,
	IonProgressBar
} from '@ionic/react';
import {
	IonItemSliding,
	IonItemOption,
	IonItemOptions
} from '@ionic/react';
import { add } from 'ionicons/icons';
import CreateTask from '../components/CreateTask';
import React, {
	useState,
	useEffect
} from 'react';
import './Home.css';
import { Difficulty } from '../enum/difficulty';
import { Importance } from '../enum/importance';
import { Status } from '../enum/status';
import TaskService from '../service/task-service';
import NetworkService from '../service/network-service';
import consola from 'consola';
import { v4 as uuidv4 } from 'uuid';
import { IBrowserTask } from '../entity/iBrowserTask';
import { IRemoteTask } from '../entity/iRemoteTask';
import TaskItem from '../components/TaskItem';
import { ITasks } from '../entity/itask';

const HomePage: React.FC = () => {

	const [tasks, setTasks] = useState<IBrowserTask[]>([]);
	//const [hasError, setError] = useState<boolean>(false);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [tasksRemaining, setTasksRemaining] = useState<number>(0);
	const [editable, setEditability] = useState<Map<string, boolean>>();
	const [addingNewTask, setAddingNewTask] = useState<boolean>(false);
	//const toggleLoading: Function = (): void => setIsLoading(!isLoading);
	const toggleCreateTask: Function = (): void => setAddingNewTask(!addingNewTask);
	const getIndexOfTaskWithId: Function = (id: string): number => tasks.findIndex(task => task.id === id);
	let taskService: TaskService = new TaskService(new NetworkService());

	/**
     * Updates setTasksRemaining anytime there is a change to `tasks`
     */
	useEffect( (): void => {
		setTasksRemaining(tasks.filter(task => task.status === Status.ACTIVE).length);
	}, [tasks]);

	/**
	 * Checks for any missing tasks from the remote server every minute
	 */
	useEffect( () => {
		const interval = setInterval(() => {
			const getRemoteDatabaseUpdates: Function = async (): Promise<boolean> => {
				let requestUpdate: boolean = false;
				const remotes: IRemoteTask[] = await taskService.getAllRemoteTasks('logan connor');
				const allBrowserTasks: IBrowserTask[] = await taskService.getAllBrowserTasksByOwner('logan connor');
		
				// retrieve missing records from remote
				if (remotes.length !== allBrowserTasks.length) {
					taskService.getMissingTasksFromRemote(remotes, allBrowserTasks);
					requestUpdate = true;
				}

				// retrieve modified records from remote
				allBrowserTasks.forEach( async x => {
					const matchingRemoteTask = remotes.find(y => y.browserId === x.id);
					if (matchingRemoteTask !== undefined) {
						const matchingConvertedTask = taskService.convertRemoteTaskToBrowserTask(matchingRemoteTask);
						if (matchingConvertedTask?.lastModified > x.lastModified) {
							taskService.updateBrowserTask(matchingConvertedTask.id, matchingConvertedTask);
							requestUpdate = true;
						}
					}
				});
				return requestUpdate;
			};
			const getLocalDatabaseUpdates: Function = async (updateRequested: boolean) => {
				const browserTasks = await taskService.getAllBrowserTasks();
				if (updateRequested || tasks.length !== browserTasks.length) {
					setTasks(browserTasks);
				}
			};

			getRemoteDatabaseUpdates().then((updateRequested: boolean) => getLocalDatabaseUpdates(updateRequested));
		}, 60000);
		return () => clearInterval(interval);
	});

	/**
	 * Loads the application state with data from the browser db.
	 */
	useEffect( (): void => {
		setIsLoading(true);
		taskService.getAllBrowserTasks().then(results => {
			setTasks(results);
			setIsLoading(false);
		});
	
	}, []); // eslint-disable-line react-hooks/exhaustive-deps
	
	/**
     * Add a new task in the application.
     */
	const addTask: Function = (name: string): void => {
		consola.info(`STARTING - adding task for ${name}`);

		const newUserTask: IBrowserTask = {
			id: uuidv4(),
			name: name,
			owner: "logan connor",
			status: Status.ACTIVE,
			created: Date.now() / 1000,
			lastModified: Date.now() / 1000,
			difficulty: Difficulty.NORMAL,
			importance: Importance.MEDIUM
		};

		const newTasks = [
			...tasks,
			newUserTask
		];
		setTasks(newTasks);
		toggleCreateTask();

		taskService.insertTask(newUserTask).then(remoteId => {
			const taskWithRemoteId = {
				...newUserTask,
				remoteId: remoteId
			};
			
			const newTasksWithRemoteId = [
				...tasks,
				taskWithRemoteId
			];
			setTasks(newTasksWithRemoteId);
	
			taskService.updateBrowserTaskWithRemoteTaskId(newUserTask, remoteId);
		});
	};

	/**
     * Edits an existing task in the application.
     */
	const editTask: Function = (updatedTask: IBrowserTask): void => {
		consola.info(`STARTING - editing task for ${updatedTask.name}`);

		if (updatedTask.id === undefined) {
			return;
		}

		const taskIndex: number = getIndexOfTaskWithId(updatedTask.id);
		const allExistingTasks: IBrowserTask[] = [
			...tasks.slice(0, taskIndex),
			updatedTask,
			...tasks.slice(taskIndex + 1)
		];
		setTasks(allExistingTasks);
		taskService.updateTaskName(updatedTask);
		toggleEditablility(updatedTask);
	};

	const toggleEditablility: Function = (selectedTask: IBrowserTask): void => {
		if (selectedTask.id === undefined) {
			return;
		}

		// initially undefined so populate it
		if (editable === undefined) {
			let newValue = new Map<string, boolean>();
			newValue.set(selectedTask.id, true);
			setEditability(newValue);
			return;
		}

		let updateEditable = new Map<string, boolean>(editable);
		// see if an existing value just needs to be switched
		updateEditable.forEach((value, key) => {
			if (key === selectedTask.id) {
				updateEditable.set(key, !value);
			}
		});

		// if the id passed in still isn't in the map - set it
		if (!updateEditable.has(selectedTask.id)) {
			updateEditable.set(selectedTask.id, true);
		}

		setEditability(updateEditable);
	};

	const toggleTaskStatusIndicator: Function = (selectedTask: IBrowserTask): ITasks => {
		let existingTaskToUpdate: IBrowserTask = tasks.filter(x => x.id === selectedTask.id)[0];
		const taskIndex: number = getIndexOfTaskWithId(selectedTask.id);

		if (existingTaskToUpdate.status === Status.COMPLETED) {
			existingTaskToUpdate.status = Status.ACTIVE;
		} else if (existingTaskToUpdate.status === Status.ACTIVE) {
			existingTaskToUpdate.status = Status.COMPLETED;
		}

		const allExistingTasks: IBrowserTask[] = [
			...tasks.slice(0, taskIndex),
			existingTaskToUpdate,
			...tasks.slice(taskIndex + 1)
		];

		setTasks(allExistingTasks);
		return allExistingTasks;
	};

	/**
     * Sets an existing task to completed.
     */
	const toggleTaskStatus: Function = (selectedTask: IBrowserTask): void => {
		toggleTaskStatusIndicator(selectedTask);
		if (selectedTask.id === undefined) {
			return;
		}
		taskService.updateTaskStatus(selectedTask);
	};

	/**
     * Removes an existing task from the application.
     */
	const removeTask: Function = (selectedTask: IBrowserTask): void => {
		consola.info(`STARTING - removing task for ${selectedTask.name}`);

		if (selectedTask.id === undefined) {
			return;
		}
		const existingTasks: IBrowserTask[] = [...tasks];
		const taskIndex: number = getIndexOfTaskWithId(selectedTask.id);
		existingTasks.splice(taskIndex, 1);
		setTasks(existingTasks);
		taskService.deleteBrowserTaskById(selectedTask.id);
		if (selectedTask.remoteId !== null && selectedTask.remoteId !== undefined) {
			taskService.deleteRemoteTaskById(selectedTask.remoteId);
		}
	};

	const TasksList: Function = (): JSX.Element => {
		let items;

		if (tasks.length === 0) {
			items = (
				<IonItem>
					<IonLabel>Looks like everythings done. Great Job!</IonLabel>
				</IonItem>
			);
		} else {
			items = tasks.map((x, index) => {

				const existsOnRemote: boolean = x.remoteId !== undefined ? x.remoteId > 0 ? true : false : false;
				const statusToggleMessage: string = x.status === Status.COMPLETED ? "Undo" : "Done";

				return (
					<IonItemSliding key={index}>
						<IonItemOptions side="start">
							<IonItemOption color="primary"
								onClick={() => toggleTaskStatus(x)}>
								{statusToggleMessage}
							</IonItemOption>
							<IonItemOption color="secondary"
								onClick={() => toggleEditablility(x)}>
								Edit
							</IonItemOption>
						</IonItemOptions>
						<TaskItem task={x}
							synced={existsOnRemote}
							editable={editable}
							editTask={editTask} />
						<IonItemOptions side="end">
							<IonItemOption color="danger"
								onClick={() => removeTask(x)} >
								Delete
							</IonItemOption>
						</IonItemOptions>
					</IonItemSliding>
				);
			});
		}
		return (
			<IonList>
				{items}
			</IonList>
		);
	};

	return (
		<IonPage>
			<IonHeader>
				<IonToolbar color='primary'>
					<IonButtons slot="start" color='light'>
						<IonMenuButton />
					</IonButtons>
					<IonTitle>Home</IonTitle>
				</IonToolbar>
			</IonHeader>
			{ isLoading && <IonProgressBar type="indeterminate"></IonProgressBar> }
			<IonContent className='create-input'>
				<IonCard className="tasks-card">
					<IonCardHeader>
						<IonCardSubtitle>There are {tasksRemaining} incomplete tasks</IonCardSubtitle>
						<IonCardTitle>Tasks</IonCardTitle>
					</IonCardHeader>
					<IonCardContent>
						<TasksList />
					</IonCardContent>
				</IonCard>
				<IonFab vertical="bottom" horizontal="end" slot="fixed">
					<IonFabButton onClick={() => {toggleCreateTask()}}>
						<IonIcon icon={add} />
					</IonFabButton>
				</IonFab>
				{
					addingNewTask &&
						<IonList>
							<CreateTask addTask={addTask} />
						</IonList>
				}
			</IonContent>
		</IonPage>
	);
};

export default HomePage;
