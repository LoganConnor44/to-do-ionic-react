import { createContext } from 'react';
import NetworkService from '../service/network-service';

export const NetworkContext = createContext(NetworkService.prototype);