import Dexie from 'dexie';
import { IPreference } from '../entity/ipreference';
import { IDatabaseUpdate } from '../entity/IDatabaseUpdate';
import { IBrowserTask } from '../entity/iBrowserTask';

export class ToDoDb extends Dexie {
    tasks: Dexie.Table<IBrowserTask, string>;
    preferences: Dexie.Table<IPreference, number>;
    databaseUpdates: Dexie.Table<IDatabaseUpdate, number>;

    constructor() {
        super('ToDoDb');
        this.version(1).stores({
            tasks: `id, owner`,
            preferences: `++id`,
            databaseUpdates: `++id, owner`
        });
        this.tasks = this.table("tasks");
        this.preferences = this.table("preferences");
        this.databaseUpdates = this.table("databaseUpdates");
    }
}