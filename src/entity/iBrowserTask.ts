import { ITask } from './itask';

export interface IBrowserTask extends ITask {
    id: string;
	remoteId?: number;
}
