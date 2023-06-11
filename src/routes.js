import { randomUUID } from 'node:crypto';
import { Database } from './database.js';
import { buildRoutePath } from './utils/build-route-path.js';

const database = new Database();

export const routes = [
    {
        method: 'GET',
        path: buildRoutePath('/tasks'),
        handler: (req, res) => {
            const { search } = req.query;

            const tasks = database.select('tasks', {
                title: search,
                description: search
              });

            return res.end(JSON.stringify(tasks))
        }
    },
    {
        method: 'POST',
        path: buildRoutePath('/tasks'),
        handler: (req, res) => {
            let today = new Date();
            let formatedDate = `${today.getDay()}/${today.getMonth()}/${today.getFullYear()}`;
            console.log(req.body)
            const { title, description } = req.body;

            if (!title) return res.writeHead(400).end(JSON.stringify({error: 'Title is required'}));

            if (!description) return res.writeHead(400).end(JSON.stringify({error: 'Description is required'}));

            const task ={
                id: randomUUID(),
                title,
                description,
                completed_at: null,
                created_at: formatedDate,
                updated_at: formatedDate
            };

            database.insert('tasks', task);

            return res.writeHead(201).end();
        }
    },
    {
        method: 'PUT',
        path: buildRoutePath('/tasks/:id'),
        handler: (req, res) => {  
            let today = new Date();
            let formatedDate = `${today.getDay()}/${today.getMonth()}/${today.getFullYear()}`; 
            const { id } = req.params;
            const { title, description } = req.body;

            if (!title || !description) return res.writeHead(400).end(JSON.stringify({error:'Title or description required'}));

            const [task] = database.select('tasks', {id});

            if (!task) return res.writeHead(404).end(JSON.stringify({error: 'Task not found'}))

            database.update('tasks', id, {
                title,
                description,
                updated_at: formatedDate
            })

            return res.writeHead(204).end();
        }
    },
    {
        method: 'PATCH',
        path: buildRoutePath('/tasks/:id/complete'),
        handler: (req, res) => {  
            let today = new Date();
            let formatedDate = `${today.getDay()}/${today.getMonth()}/${today.getFullYear()}`; 
            const { id } = req.params;

            const [task] = database.select('tasks', {id});

            if (!task) return res.writeHead(404).end(JSON.stringify({error: 'Task not found'}))

            const isTaskCompleted = !!task.completed_at
            const completed_at = isTaskCompleted ? null : formatedDate;

            database.update('tasks', id, { completed_at })

            return res.writeHead(204).end();
        }
    },
    {
        method: 'DELETE',
        path: buildRoutePath('/tasks/:id'),
        handler: (req, res) => {   
            const { id } = req.params;

            const [task] = database.select('tasks', {id});

            if (!task) return res.writeHead(404).end(JSON.stringify({error: 'Task not found'}))

            database.delete('tasks', id)

            return res.writeHead(204).end();
        }
    }
]