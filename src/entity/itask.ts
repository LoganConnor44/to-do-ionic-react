import { Difficulty } from '../enum/difficulty';
import { Importance } from '../enum/importance';
import { Status } from '../enum/status';

export interface ITask {
    id?: number;
    name: string;
    status: Status;
    created: number;
    deadline?: number;
    difficulty: Difficulty;
    importance: Importance;
    lastModified?: number;
    owner: string;
}

export interface ITasks extends Array<ITask> {};