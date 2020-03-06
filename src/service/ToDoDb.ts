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
            this.databaseUpdates.toArray().then((updates: IDatabaseUpdate[]) => {
                if (updates.length === 1) {
                    this.tasks.hook("creating", (primKey, obj, transaction) => {
                        this.databaseUpdates.update(
                            //@ts-ignore
                            updates[0].id,
                            {
                                database_name: "browser",
                                lastModified: Date.now()
                            }
                        );
                    });
                    this.tasks.hook("deleting", (primKey, obj, transaction) => {
                        this.databaseUpdates.update(
                            //@ts-ignore
                            updates[0].id,
                            {
                                database_name: "browser",
                                lastModified: Date.now()
                            }                            
                        );
                    });
                    this.tasks.hook("updating", (modifications, primKey, obj, transaction) => {
                        this.databaseUpdates.update(
                            //@ts-ignore
                            updates[0].id,
                            {
                                database_name: "browser",
                                lastModified: Date.now()
                            }                            
                        );
                    });
                }
                if (updates.length === 0) {
                    const newRecord: IDatabaseUpdate = {
                        database_name: "browser",
                        lastModified: Date.now()
                    };
    
                    this.tasks.hook("creating", (primKey, obj, transaction) => {
                        transaction.on("complete").fire =
                            this.databaseUpdates.put(
                                newRecord
                            )
                        ;
                    });
                    this.tasks.hook("deleting", (primKey, obj, transaction) => {
                        transaction.on("complete").fire(
                            this.databaseUpdates.put(
                                newRecord
                            )
                        );
                    });
                    this.tasks.hook("updating", (modifications, primKey, obj, transaction) => {
                        transaction.on("complete").fire(
                            this.databaseUpdates.put(
                                newRecord
                            )
                        );
                    });
                }
            });        
    }
}