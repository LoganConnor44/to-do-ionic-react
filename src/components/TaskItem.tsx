import React from 'react';
import {
	IonItem,
	IonLabel
} from '@ionic/react';
import { checkmarkCircleOutline } from 'ionicons/icons';
import { IBrowserTask } from '../entity/iBrowserTask';
import { Status } from '../enum/status';
import EditTask from '../components/EditTask';

interface ITaskItemProps {
    task: IBrowserTask;
    synced: boolean;
    editable: Map<string, boolean>;
    editTask: Function;
};
const TaskItem: Function = (taskItemProps: ITaskItemProps): JSX.Element => {
    if (taskItemProps.editable?.get(taskItemProps.task.id) === true) {
        return (
            <EditTask currentTask={taskItemProps.task}
                editTask={taskItemProps.editTask} />
        );
    }

    let itemAttributes = {
        button: true,
        detail: false,
        detailIcon: undefined
    }
    if (taskItemProps.task.status === Status.COMPLETED) {
        itemAttributes.detail = true;
        itemAttributes.detailIcon = checkmarkCircleOutline as any;
    }

    let labelAttributes = {
        color: 'secondary'
    };
    if (taskItemProps.synced) {
        labelAttributes.color = 'success';
    }
    
    const label = React.createElement(IonLabel, labelAttributes, taskItemProps.task.name);
    return React.createElement(IonItem, itemAttributes, label);
};

export default TaskItem;