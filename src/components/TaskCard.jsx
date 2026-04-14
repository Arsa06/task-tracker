import React from 'react';
import TaskItem from './TaskItem';

const TaskCard = React.memo((props) => <TaskItem {...props} />);

export default TaskCard;
