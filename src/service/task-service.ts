import axios from 'axios';
import { ITask } from '../entity/itask';
import { IRemoteTask } from '../entity/iRemoteTask';
import { IDatabaseUpdate } from '../entity/IDatabaseUpdate';
import { ToDoDb } from '../service/ToDoDb';
import Dexie from 'dexie';
import NetworkService from '../service/network-service';
import consola from 'consola';
import { IBrowserTask } from '../entity/iBrowserTask';

class TaskService {
    private db: ToDoDb;
    private domain: string = 'http://localhost:8080/';
    private getPath: string = 'to-do/task/';
    private getRemoteUpdatesPath: string = 'to-do/updates/';
    private getOwnerUpdatesPath: string = 'by-owner/';
    private countTasksPath: string = 'total-count-for/';
    private getMultipleTasksPath: string = 'to-do/task/?owner=';
    private putPath: string = 'to-do/task/';
    public isOnline: boolean = false;
    private remoteUpdatesGetPath: string = 'to-do/database-changes';

    constructor(networkconnectivity: NetworkService) {
        this.db = new ToDoDb();
        this.subscribeToNetworkConnectivity(networkconnectivity);
        this.isOnline = networkconnectivity.isOnline();
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

    updateTaskName(task: IBrowserTask) {
        this.updateBrowserTaskName(task).then( async () => {
            this.updateRemoteTask(task);
            return true;
        }).catch(error => console.log(`An Error Occured Saving To The Browser Database: ${error}`));
    }

    updateBrowserTask(browserId: string, updatedTask: ITask) {
        this.db.transaction('rw', this.db.tasks, this.db.databaseUpdates, () => {
            this.db.tasks.update(browserId, updatedTask);
        });
    }

    updateBrowserTaskWithRemoteTaskId(browserTask: IBrowserTask, remoteTaskId: number) {
        this.db.transaction('rw', this.db.tasks, this.db.databaseUpdates, () => {
            if (browserTask.id !== undefined) {
                this.db.tasks.update(
                    browserTask.id,
                    { remoteId: remoteTaskId }
                );
            }
        });
    }

    updateBrowserTaskName(task: IBrowserTask): Promise<void> {
        return this.db.transaction('rw', this.db.tasks, this.db.databaseUpdates, () => {
            if (task.id !== undefined) {
                this.db.tasks.update(
                    task.id,
                    { name: task.name }
                );
            }
        });
    }

    updateBrowserTaskStatus(task: IBrowserTask) {
        this.db.transaction('rw', this.db.tasks, this.db.databaseUpdates, () => {
            if (task.id !== undefined) {
                this.db.tasks.update(
                    task.id,
                    { status: task.status }
                );
            }
        });
    }

    deleteBrowserTaskById(id: string) {
        this.db.transaction('rw', this.db.tasks, this.db.databaseUpdates, () => {
            this.db.tasks.where("id").equals(id).delete();
        });
    }

    public async getAllBrowserTasks(): Promise<IBrowserTask[]> {
        return this.db.tasks.toArray();
    }

    getAllBrowserTasksByOwner(owner: string): Promise<IBrowserTask[]> {
        return this.db.tasks.where('owner').equals(owner).toArray();
    }

    insertBrowserTask(newUserTask: IBrowserTask): Promise<string> {
        consola.log(`inserting task into browser db`);
        return this.db.tasks.put(newUserTask).then( (id: string) => id);
    }

    async hasRemoteDatabaseBeenUpdated() {
        let response = await axios.get(this.remoteUpdatesGetPath);
    }

    public convertRemoteTaskToBrowserTask(remoteTask: IRemoteTask): IBrowserTask {
        const browserTask: IBrowserTask = {
            name: remoteTask.name,
            owner: remoteTask.owner,
            status: remoteTask.status,
            deadline: remoteTask.deadline,
            difficulty: remoteTask.difficulty,
            importance: remoteTask.importance,
            lastModified: remoteTask.lastModified,
            created: remoteTask.created,
            id: remoteTask.browserId,
	        remoteId: remoteTask.id
        }

        return browserTask;
    }

    public convertRemoteTasksToBrowserTasks(remoteTasks: IRemoteTask[]): IBrowserTask[] {
        const browserTasks: IBrowserTask[] = [];
        remoteTasks.forEach(element => {
            browserTasks.push(this.convertRemoteTaskToBrowserTask(element))
        });
        return browserTasks;
    }



    /**
     * Retrieve the task from the api.
     * 
     * Because the api does not care about the javascript browser id, it does not store this data point.
     * We manually set the incoming ITask's id to undefined and set the incoming id to remoteId .
     * 
     * @param remoteId This is the primary key from the api.
     */
    async getTaskFromRemote(remoteId: number): Promise<IBrowserTask> {
        if (!this.isOnline) {
            return Promise.reject("Application is not online.");
        }
        let response = await axios.get(this.domain + this.getPath + remoteId);
        let browserTaskFromRemote: IBrowserTask = {
            ...response.data,
            id: undefined,
            remoteId: response.data.id,
        };
        return browserTaskFromRemote;
    }

    async getCountOfAllRemoteTasks(owner: string): Promise<number> {
        if (!this.isOnline) {
            return Promise.reject("Application is not online.");
        }
        let response = await axios.get(this.domain + this.getPath + this.countTasksPath + owner);
        return response.data;
    }

    async getAllRemoteTasks(owner: string): Promise<IRemoteTask[]> {
        if (!this.isOnline) {
            return Promise.reject("Application is not online.");
        }
        let response = await axios.get(this.domain + this.getMultipleTasksPath + owner);
        return response.data;
    }

    async getTaskFromBrowser(id: string): Dexie.Promise<IBrowserTask | undefined> {
        let response: IBrowserTask | undefined = await this.db.tasks.get(id);
        return response;
    }

    async updateRemoteTask(browserTask: ITask): Promise<boolean> {
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




    async getRemoteUpdatesByOwner(owner: string): Promise<any> {
        if (!this.isOnline) {
            return Promise.reject("Application is not online.");
        }
        let response = await axios.get(this.domain + this.getRemoteUpdatesPath + this.getOwnerUpdatesPath + owner);
        return response.data;
    }

    async getBrowserUpdatesByOwner(owner: string): Promise<IDatabaseUpdate[]> {
        return this.db.databaseUpdates.where('owner').equals(owner).toArray();
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
    merge(remoteTask: IBrowserTask, browserTask: IBrowserTask): [string, IBrowserTask] {
        let mergedTask;
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
        consola.log(`${JSON.stringify(browserTask)}`)
        if (!this.isOnline) {
            return Promise.reject("Application is not online.");
        }

        consola.log(browserTask);

        let remoteId = await axios.post(
                this.domain + this.getPath,
                browserTask
            ).then(response => {
                const regEx = new RegExp(/\d+$/);
                const idFromHeader: RegExpExecArray | null = regEx.exec(response.headers.location);
                return idFromHeader;
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

    public getMissingTasksFromRemote(remotes: IRemoteTask[], allBrowserTasks: IBrowserTask[]): void {
        consola.log(`a sync is needed at the owner level`);
        const allRemoteTasks: IBrowserTask[] = this.convertRemoteTasksToBrowserTasks(
            remotes
        );
        const remoteTasksIds: string[] = allRemoteTasks.map(x => x.id);
        const browserTasksIds: string[] = allBrowserTasks.map(x => x.id);
        const remoteIdsNotInBrowser: string[] = remoteTasksIds.filter(x => !browserTasksIds.includes(x));
        consola.log(`the ids not in the browser ${remoteIdsNotInBrowser}`)
        const missingRemoteTasks: IBrowserTask[] = allRemoteTasks.filter(x => remoteIdsNotInBrowser.includes(x.id));
        consola.log(`the full tasks not in the browser db ${missingRemoteTasks}`)
        missingRemoteTasks.forEach(task => this.insertBrowserTask(task));
    }
};

export default TaskService;