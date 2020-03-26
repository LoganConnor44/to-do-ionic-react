import { Difficulty } from '../enum/difficulty';
import { Importance } from '../enum/importance';
import { Status } from '../enum/status';

export interface ITask {
    name: string;
    owner: string;
    status: Status;
    deadline?: number;
    difficulty: Difficulty;
    importance: Importance;
    lastModified: number;
    created: number;
}

export interface ITasks extends Array<ITask> {};