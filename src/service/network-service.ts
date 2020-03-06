import { Subject } from 'rxjs';

class NetworkService {
    private internalConnectionChanged = new Subject<boolean>();

    constructor() {
        window.addEventListener('online', () => this.updateOnlineStatus());
        window.addEventListener('offline', () => this.updateOnlineStatus());
    }

    isOnline() {
        return !!window.navigator.onLine;
    }

    connectionChanged() {
        return this.internalConnectionChanged.asObservable();
    }

    private updateOnlineStatus() {
        this.internalConnectionChanged.next(window.navigator.onLine);
    }
}

export default NetworkService;