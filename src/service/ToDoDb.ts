import Dexie from 'dexie';
import { ITask } from '../entity/itask';
import { IPreference } from '../entity/ipreference';
import { IDatabaseUpdate } from '../entity/IDatabaseUpdate';

export class ToDoDb extends Dexie {
    tasks: Dexie.Table<ITask, number>;
    preferences: Dexie.Table<IPreference, number>;
    databaseUpdates: Dexie.Table<IDatabaseUpdate, number>;

    constructor() {
        super('ToDoDb');
        this.version(1).stores({
            tasks: `++id`,
            preferences: `++id`,
            databaseUpdates: `++id`
        });
        this.tasks = this.table("tasks");
        this.preferences = this.table("preferences");
        this.databaseUpdates = this.table("databaseUpdates");
        this.addDatabaseEventHooks();
    }

    addDatabaseEventHooks() {
        this.databaseUpdates.orderBy(`id`).reverse().toArray().then((x: IDatabaseUpdate[]) => {
            let databaseUpdateRecord: IDatabaseUpdate = {
                databaseName: "browser",
                lastModified: Date.now()
            };
            if (x.length === 1) {
                databaseUpdateRecord = {
                    ...databaseUpdateRecord,
                    id: x[0].id
                };
            }
            if (x.length > 1) {
                this.databaseUpdates.clear();
            }
            this.tasks.hook("creating", (primKey, obj, transaction) => {
                transaction.on.complete.fire(this.databaseUpdates.put(databaseUpdateRecord));
            });

            this.tasks.hook("deleting", (primKey, obj, transaction) => {
                transaction.on.complete.fire(this.databaseUpdates.put(databaseUpdateRecord));
            });
            this.tasks.hook("updating", (modifications, primKey, obj, transaction) => {
                transaction.on.complete.fire(this.databaseUpdates.put(databaseUpdateRecord));
            });
        });       
    }
}