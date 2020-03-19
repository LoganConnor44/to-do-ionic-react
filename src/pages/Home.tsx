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
import {
	checkmarkCircleOutline,
	add
} from 'ionicons/icons';
import CreateTask from '../components/CreateTask';
import React, {
	useState,
	useContext,
	useEffect
} from 'react';
import { DatabaseContext } from '../context/database-context';
import { NetworkContext } from '../context/network-context';
import './Home.css';
import {
	ITask,
	ITasks
} from '../entity/itask';
import { Difficulty } from '../enum/difficulty';
import { Importance } from '../enum/importance';
import { Status } from '../enum/status';
import EditTask from '../components/EditTask';
import { ToDoDb } from '../service/ToDoDb';
import TaskService from '../service/task-service';
import NetworkService from '../service/network-service';
import consola from 'consola';
import { interval } from 'rxjs';

const HomePage: React.FC = () => {

	const [tasks, setTasks] = useState<ITasks>([]);
	const [hasError, setError] = useState<boolean>(false);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [tasksRemaining, setTasksRemaining] = useState<number>(0);
	const [editable, setEditability] = useState<Map<number, boolean>>();
	const [addingNewTask, setAddingNewTask] = useState<boolean>(false);
	const toggleLoading: Function = (): void => setIsLoading(!isLoading);
	const toggleCreateTask: Function = (): void => setAddingNewTask(!addingNewTask);
	const getIndexOfTaskWithId: Function = (id: number): number => tasks.findIndex(task => task.id === id);
	let taskService: TaskService = new TaskService(new NetworkService());
	let [reload, setReload] = useState<number>(0);

	/**
     * Updates setTasksRemaining anytime there is a change to `tasks`
     */
	useEffect((): void => {
		consola.log('effect called')
		setTasksRemaining(tasks.filter(task => task.status === Status.ACTIVE).length);
	}, [tasks]);

	useEffect((): void => {
		taskService.getAllRemoteTasks('logan connor')
			.then(x => consola.log(x));
	}, []);

	interval(60000).subscribe(x => {
		console.log("reactive jssssssssssssssssssssssssssssssssss")
	});

	useEffect(() => {

		const fetchBrowserAndRemoteData = async (passedTasks: ITasks): Promise<void> => {
			consola.log(`fetchBrowserData called`);
			try {
				passedTasks.map(tsk => {
					consola.log(`task is being iterated: ${tsk}`);
					if (tsk.remoteId !== undefined) {
						consola.log(` the remote id is set to ${tsk.remoteId}`);
						taskService.getTaskFromRemote(tsk.remoteId).then((x: ITask) => {
							if (tsk.id !== undefined) {
								taskService.getTaskFromBrowser(tsk.id).then((y: ITask | undefined) => {
									if (y !== undefined) {
										if (!taskService.isEquivalent(x, y)) {
											const [mergeType, mergedTask] = taskService.merge(x, y);
											if (mergedTask.id !== undefined) {
												if (mergeType === "browser") {
													taskService.updateRemoteTask(mergedTask);
												}
												if (mergeType === "remote") {
													taskService.updateBrowserTask(mergedTask.id, mergedTask)
													taskService.getAllBrowserTasks().then(results => setTasks(results));
												}
											}
										}
									}
								});
							}
						});
					} else {
						consola.log(`in here because remoteid is undefined`)
						addTaskToRemote(tsk);
					}
				});
			} catch (error) {
				consola.log(`An error has occurred: ${error}`)
				setError(true);
			}
		};
		setIsLoading(true);
		taskService.getAllBrowserTasks().then(results => {
			setTasks(results);
			fetchBrowserAndRemoteData(results)
				.then(() => consola.log(`fetchbrowserdata completed`))
				.catch(error => consola.log(`We encountered a problem: ${error}`))
				.finally(() => setIsLoading(false));
		});
		
	}, []);

	/**
	 * Adds a new task and defaults it to not complete.
	 */
	const addTask: Function = (name: string): void => {
		const newUserTask: ITask = {
			name: name,
			owner: "logan Connor",
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
		taskService.insertBrowserTask(newUserTask).then( (browserId: number) => {
			const taskToSendToRemote: ITask = {
				...newUserTask,
				id: browserId
			};
			addTaskToRemote(taskToSendToRemote)
		});
		toggleCreateTask();
	};

	const addTaskToRemote: Function = async (browserTask: ITask): Promise<boolean> => {
		return taskService.createRemoteTask(browserTask).then((x: number) => {
			const taskWithRemoteId = {
				...browserTask,
				remoteId: x
			};

			const newTasks = [
				...tasks,
				taskWithRemoteId
			];
			consola.log('setTasks initiated - screen should be updated')
			setTasks(newTasks);
			taskService.updateBrowserTaskWithRemoteTaskId(browserTask, x);
			return true;
		}).catch(error => {
			consola.log(`oops: ${error}`);
			return false;
		});
	};

	/**
     * Edits an existing task's name.
     */
	const editTask: Function = (updatedTask: ITask) => {
		if (updatedTask.id === undefined) {
			return;
		}

		const taskIndex: number = getIndexOfTaskWithId(updatedTask.id);
		const allExistingTasks: ITask[] = [
			...tasks.slice(0, taskIndex),
			updatedTask,
			...tasks.slice(taskIndex + 1)
		];
		setTasks(allExistingTasks);
		taskService.updateTaskName(updatedTask);
		toggleEditablility(updatedTask);
	};

	const toggleEditablility: Function = (selectedTask: ITask): void => {
		if (selectedTask.id === undefined) {
			return;
		}

		//initially undefined so populate it
		if (editable === undefined) {
			let newValue = new Map<number, boolean>();
			newValue.set(selectedTask.id, true);
			setEditability(newValue);
			return;
		}

		let updateEditable = new Map<number, boolean>(editable);
		//see if an existing value just needs to be switched
		updateEditable.forEach((value, key) => {
			if (key === selectedTask.id) {
				updateEditable.set(key, !value);
			}
		});

		//if the id passed in still isn't in the map - set it
		if (!updateEditable.has(selectedTask.id)) {
			updateEditable.set(selectedTask.id, true);
		}

		setEditability(updateEditable);
	};

	/**
	* Toggles a task's status enum.
	*/
	const toggleTaskStatusIndicator: Function = (selectedTask: ITask): ITasks => {
		let existingTaskToUpdate: ITask = tasks.filter(x => x.id === selectedTask.id)[0];
		const taskIndex: number = getIndexOfTaskWithId(selectedTask.id);

		if (existingTaskToUpdate.status === Status.COMPLETED) {
			existingTaskToUpdate.status = Status.ACTIVE;
		} else if (existingTaskToUpdate.status === Status.ACTIVE) {
			existingTaskToUpdate.status = Status.COMPLETED;
		}

		const allExistingTasks: ITask[] = [
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
	const toggleTaskStatus: Function = (selectedTask: ITask): void => {
		const existingTasks: ITasks = toggleTaskStatusIndicator(selectedTask);
		if (selectedTask.id === undefined) {
			return;
		}
		taskService.updateBrowserTaskStatus(selectedTask);
	};

	/**
     * Removes an existing task from the application state.
     */
	const removeTask: Function = (selectedTask: ITask): void => {
		if (selectedTask.id === undefined) {
			return;
		}
		const existingTasks: ITask[] = [...tasks];
		const taskIndex: number = getIndexOfTaskWithId(selectedTask.id);
		existingTasks.splice(taskIndex, 1);
		setTasks(existingTasks);
		taskService.deleteBrowserTaskById(selectedTask.id);
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
				const identifyAsSyncedToRemote = existsOnRemote ? 'success' : undefined;
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

						{
							x.status === Status.COMPLETED ?
								<IonItem button
									detail
									detailIcon={checkmarkCircleOutline as any}
									color={identifyAsSyncedToRemote}>
									<IonLabel><s>{x.name}</s></IonLabel>
								</IonItem>
								:
								(x.id !== undefined && editable?.get(x.id) === true) ?
									<EditTask currentTask={x}
										editTask={editTask} />
									:
									<IonItem button 
										color={identifyAsSyncedToRemote}>
										<IonLabel>{x.name}</IonLabel>
									</IonItem>
						}

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
			{
				isLoading &&
					<IonProgressBar type="indeterminate"></IonProgressBar>
			}
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
