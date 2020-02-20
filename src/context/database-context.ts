import { createContext } from 'react';
import { ToDoDb } from '../service/ToDoDb';

export const DatabaseContext = createContext(ToDoDb.prototype);