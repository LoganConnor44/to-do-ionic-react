import Dexie from 'dexie';
import { ITask } from '../entity/itask';
import { IPreference } from '../entity/ipreference';

export class ToDoDb extends Dexie {
    tasks: Dexie.Table<ITask, number>;
    preferences: Dexie.Table<IPreference, number>;

    constructor() {
        super('ToDoDb');
        this.version(1).stores({
            tasks: `++id`,
            preferences: `++id`
        });
        this.tasks = this.table("tasks");
        this.preferences = this.table("preferences");
    }   
}