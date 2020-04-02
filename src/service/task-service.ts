import axios from 'axios';
import { ITask } from '../entity/itask';
import { IRemoteTask } from '../entity/iRemoteTask';
import { ToDoDb } from '../service/ToDoDb';
import NetworkService from '../service/network-service';
import consola from 'consola';
import { IBrowserTask } from '../entity/iBrowserTask';

class TaskService {
    private db: ToDoDb;
    private domain: string = 'http://localhost:8080/';
    private getPath: string = 'to-do/task/';
    private deletePath: string = 'to-do/task/'
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
            this.isOnline = online;
            consola.info(`The application is ${this.isOnline ? 'online' : 'offline'}`);
        });
    }

    updateTaskName(task: IBrowserTask) {
        consola.info(`INITIATING - update for browser and remote databases.`);

        task.lastModified = Date.now() / 1000;

        this.updateBrowserTaskName(task).then( async () => {
            this.updateRemoteTask(task);
            return true;
        }).catch(error => consola.error(`An Error Occured Saving To The Browser Database: ${error}`));
    }

    updateBrowserTask(browserId: string, updatedTask: ITask) {
        consola.info('EXECUTING - update task in browser db.')
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
        consola.info(`EXECUTING - update task in browser db.`);

        return this.db.transaction('rw', this.db.tasks, this.db.databaseUpdates, () => {
            if (task.id !== undefined) {
                this.db.tasks.update(
                    task.id,
                    { name: task.name }
                );
            }
        });
    }

    public updateTaskStatus(task: IBrowserTask) {
        task.lastModified = Date.now() / 1000;
        this.updateBrowserTaskStatus(task);
        this.updateRemoteTask(task);
    }

    private updateBrowserTaskStatus(task: IBrowserTask) {
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
        consola.info(`EXECUTING - delete task in browser db.`);

        this.db.transaction('rw', this.db.tasks, this.db.databaseUpdates, () => {
            this.db.tasks.where("id").equals(id).delete();
        });
    }

    async deleteRemoteTaskById(id: number) {
        consola.info(`EXECUTING - delete task in remote db.`);

        let response = await axios.delete(this.domain + this.deletePath + id);
        return response.status;
    }

    public async getAllBrowserTasks(): Promise<IBrowserTask[]> {
        return this.db.tasks.toArray();
    }

    getAllBrowserTasksByOwner(owner: string): Promise<IBrowserTask[]> {
        return this.db.tasks.where('owner').equals(owner).toArray();
    }

    public async insertTask(newUserTask: IBrowserTask): Promise<number> {
        consola.info(`INITIATING - insert for browser and remote databases.`);
        await this.insertBrowserTask(newUserTask);
        return await this.createRemoteTask(newUserTask);
    }

    insertBrowserTask(newUserTask: IBrowserTask): Promise<string> {
        consola.info(`EXECUTING - insert task into browser db.`);
        return this.db.tasks.put(newUserTask).then( (id: string) => id);
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

    async getAllRemoteTasks(owner: string): Promise<IRemoteTask[]> {
        if (!this.isOnline) {
            return Promise.reject("Application is not online.");
        }
        let response = await axios.get(this.domain + this.getMultipleTasksPath + owner);
        return response.data;
    }

    // async getTaskFromBrowser(id: string): Dexie.Promise<IBrowserTask | undefined> {
    //     let response: IBrowserTask | undefined = await this.db.tasks.get(id);
    //     return response;
    // }

    private async updateRemoteTask(browserTask: IBrowserTask): Promise<boolean> {
        consola.info(`EXECUTING - update task in remote db.`);

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

    // async getRemoteUpdatesByOwner(owner: string): Promise<any> {
    //     if (!this.isOnline) {
    //         return Promise.reject("Application is not online.");
    //     }
    //     let response = await axios.get(this.domain + this.getRemoteUpdatesPath + this.getOwnerUpdatesPath + owner);
    //     return response.data;
    // }

    // async getBrowserUpdatesByOwner(owner: string): Promise<IDatabaseUpdate[]> {
    //     return this.db.databaseUpdates.where('owner').equals(owner).toArray();
    // }

    async createRemoteTask(browserTask: ITask): Promise<number> {
        consola.info(`EXECUTING - insert task into remote db.`);

        if (!this.isOnline) {
            return Promise.reject("Application is not online.");
        }

        let remoteId = await axios.post(
                this.domain + this.getPath,
                browserTask
            ).then(response => {
                const regEx = new RegExp(/\d+$/);
                const idFromHeader: RegExpExecArray | null = regEx.exec(response.headers.location);
                return idFromHeader;
            }).catch(error => {
                consola.error(`Error when creating a remote task: ${error}`);
                return null;
            });

        if (remoteId === null) {
            return -1;
        }

        return parseInt(remoteId[0]);
    }

    public getMissingTasksFromRemote(remotes: IRemoteTask[], allBrowserTasks: IBrowserTask[]): void {
        consola.info(`INITIATING - A browser sync at the owner level.`);

        const allRemoteTasks: IBrowserTask[] = this.convertRemoteTasksToBrowserTasks(
            remotes
        );
        const remoteTasksIds: string[] = allRemoteTasks.map(x => x.id);
        const browserTasksIds: string[] = allBrowserTasks.map(x => x.id);
        const remoteIdsNotInBrowser: string[] = remoteTasksIds.filter(x => !browserTasksIds.includes(x));
        const missingRemoteTasks: IBrowserTask[] = allRemoteTasks.filter(x => remoteIdsNotInBrowser.includes(x.id));
        missingRemoteTasks.forEach(task => this.insertBrowserTask(task));
    }
};

export default TaskService;