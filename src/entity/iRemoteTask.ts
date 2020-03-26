import { ITask } from './itask';

export interface IRemoteTask extends ITask {
    id: number;
    browserId: string;
}