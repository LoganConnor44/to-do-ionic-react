import axios, {AxiosResponse, AxiosPromise} from 'axios';
import { ITask } from '../entity/itask';
import { ToDoDb } from '../service/ToDoDb';
import Dexie from 'dexie';
import NetworkService from '../service/network-service';

class TaskService {
    private db: ToDoDb;
    private domain: string = 'http://localhost:8080/';
    private getPath: string = 'to-do/task/';
    private putPath: string = 'to-do/task/';
    private isOnline: boolean = false;
    private remoteUpdatesGetPath: string = 'to-do/datase-changes';

    constructor(networkconnectivity: NetworkService) {
        this.db = new ToDoDb();
        this.subscribeToNetworkConnectivity(networkconnectivity);
    }

    private subscribeToNetworkConnectivity(networkService: NetworkService): void {
        networkService.connectionChanged().subscribe(online => {
            if (online) {
                console.log('went online');
            } else {
                console.log('went offline');
            }
            this.isOnline = online;
            console.log(this.isOnline);
        });
    }

    updateBrowserTask(browserId: number, updatedTask: ITask) {
        this.db.tasks.update(browserId, updatedTask);
    }

    updateBrowserTaskWithRemoteTaskId(browserTask: ITask, remoteTaskId: number) {
        if (browserTask.id !== undefined) {
            this.db.tasks.update(
                browserTask.id,
                { remoteId: remoteTaskId }
            );
        }
    }

    updateBrowserTaskName(task: ITask) {
        if (task.id !== undefined) {
            this.db.tasks.update(
                task.id, 
                { name: task.name }
            );
        }
    }

    updateBrowserTaskStatus(task: ITask) {
        if (task.id !== undefined) {
            this.db.tasks.update(
                task.id,
                { status: task.status }
            );
        }
    }

    deleteBrowserTaskById(id: number) {
        this.db.tasks.where("id").equals(id).delete();
    }

    getAllBrowserTasks(): Promise<ITask[]> {
        return this.db.tasks.toArray();
    }

    insertBrowserTask(newUserTask: ITask): Promise<number> {
        return this.db.tasks.put(newUserTask);
    }

    async hasRemoteDatabaseBeenUpdated() {
        let response = await axios.get(this.remoteUpdatesGetPath);
    }



    /**
     * Retrieve the task from the api.
     * 
     * Because the api does not care about the javascript browser id, it does not store this data point.
     * We manually set the incoming ITask's id to undefined and set the incoming id to remoteId .
     * 
     * @param remoteId This is the primary key from the api.
     */
    async getTaskFromRemote(remoteId: number): Promise<ITask> {
        if (!this.isOnline) {
            return Promise.reject("Application is not online.");
        }
        let response = await axios.get(this.domain + this.getPath + remoteId);
        let remoteTask: ITask = {
            ...response.data,
            id: undefined,
            remoteId: response.data.id,
        };
        return remoteTask;
    }

    async getTaskFromBrowser(id: number): Dexie.Promise<ITask | undefined> {
        let response: ITask | undefined = await this.db.tasks.get(id);
        return response;
    }

    async updateTaskFromRemote(browserTask: ITask): Promise<boolean> {
        if (!this.isOnline) {
            return Promise.reject("Application is not online.");
        }
        let response = await axios.put(
            this.domain + this.putPath,
            browserTask
        );
        if (response.status !== 200) {
            return false;
        }
        return true;
    }

    

    /**
     * Convert the tasks' lastModified dates to javascript Date objects and determine which one happened last.
     * Return the updated ITask with the help of the spread operator.
     * 
     * When merging the remote task, remember to set the id because we manually removed it in getTaskFromRemote() .
     * 
     * @param remoteTask The api's task
     * @param browserTask The javascript browser task
     */
    merge(remoteTask: ITask, browserTask: ITask): [string, ITask] {
        let mergedTask: ITask;
        const remoteDate: Date = new Date(remoteTask.lastModified * 1000);
        const browserDate: Date = new Date(browserTask.lastModified);
        let mergeType: string;
        if (remoteDate > browserDate) {
            mergedTask = {
                ...browserTask,
                ...remoteTask,
                id: browserTask.id
            }
            mergeType = 'remote';
        } else {
            mergedTask = {
                ...remoteTask,
                ...browserTask
            };
            mergeType = 'browser'
        }
        return [mergeType, mergedTask];
    }

    async createRemoteTask(browserTask: ITask): Promise<number> {
        if (!this.isOnline) {
            return Promise.reject("Application is not online.");
        }
        let x = {
            ...browserTask,
            created: new Date(browserTask.created),
            lastModified: new Date(browserTask.lastModified)
        };

        let remoteId = await axios.post(
                this.domain + this.getPath,
                x
            ).then(x => {
                const regEx = new RegExp(/\d+$/);
                const y: RegExpExecArray | null = regEx.exec(x.headers.location);
                return y;
            }).catch(error => {
                console.log(`Error when creating a remote task: ${error}`);
                return null;
            });

        if (remoteId === null) {
            return -1;
        }

        return parseInt(remoteId[0]);
    }

    isEquivalent(remoteTask: ITask, browserTask: ITask): boolean {
        // @ts-ignore
        //delete remoteTask.goal;
        // @ts-ignore
        delete remoteTask.parentTask;
        // @ts-ignore
        delete remoteTask.parentTask;
        // @ts-ignore
        delete remoteTask.owner;
        // @ts-ignore
        delete browserTask.owner;
        // @ts-ignore
        delete browserTask.description;

        // Create arrays of property names
        var remoteTaskProps = Object.getOwnPropertyNames(remoteTask);
        var browserTaskProps = Object.getOwnPropertyNames(browserTask);
    
        // If number of properties is different,
        // objects are not equivalent
        if (remoteTaskProps.length !== browserTaskProps.length) {
            return false;
        }
    
        for (var i = 0; i < remoteTaskProps.length; i++) {
            var propName: string = remoteTaskProps[i];
    
            // If values of same property are not equal,
            // objects are not equivalent

            // @ts-ignore
            if (remoteTask[propName] !== browserTask[propName]) {
                return false;
            }
        }
    
        // If we made it this far, objects
        // are considered equivalent
        return true;
    }
};

export default TaskService;