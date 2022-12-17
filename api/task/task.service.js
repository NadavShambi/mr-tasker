const dbService = require('../../services/db.service')
const logger = require('../../services/logger.service')
const utilService = require('../../services/util.service')
const ObjectId = require('mongodb').ObjectId

async function query(filterBy = { title: '' }) {
    try {
        const criteria = {
            title: { $regex: filterBy.title, $options: 'i' }
        }
        const collection = await dbService.getCollection('task')
        var tasks = await collection.find(criteria).toArray()
        return tasks
    } catch (err) {
        logger.error('cannot find tasks', err)
        throw err
    }
}

async function getById(taskId) {
    try {
        const collection = await dbService.getCollection('task')
        const task = collection.findOne({ _id: ObjectId(taskId) })
        return task
    } catch (err) {
        logger.error(`while finding task ${taskId}`, err)
        throw err
    }
}

async function remove(taskId) {
    try {
        const collection = await dbService.getCollection('task')
        await collection.deleteOne({ _id: ObjectId(taskId) })
        return taskId
    } catch (err) {
        logger.error(`cannot remove task ${taskId}`, err)
        throw err
    }
}

async function add(task) {
    try {
        const collection = await dbService.getCollection('task')
        await collection.insertOne(task)
        return task
    } catch (err) {
        logger.error('cannot insert task', err)
        throw err
    }
}

async function update(task) {
    try {
        const taskToSave = { ...task }
        delete taskToSave._id
        console.log(taskToSave);
        const collection = await dbService.getCollection('task')
        await collection.updateOne({ _id: ObjectId(task._id) }, { $set: taskToSave })
        return task
    } catch (err) {
        logger.error(`cannot update task ${task._id}`, err)
        throw err
    }
}

async function addTaskMsg(taskId, msg) {
    try {
        msg.id = utilService.makeId()
        const collection = await dbService.getCollection('task')
        await collection.updateOne({ _id: ObjectId(taskId) }, { $push: { msgs: msg } })
        return msg
    } catch (err) {
        logger.error(`cannot add task msg ${taskId}`, err)
        throw err
    }
}

async function removeTaskMsg(taskId, msgId) {
    try {
        const collection = await dbService.getCollection('task')
        await collection.updateOne({ _id: ObjectId(taskId) }, { $pull: { msgs: { id: msgId } } })
        return msgId
    } catch (err) {
        logger.error(`cannot add task msg ${taskId}`, err)
        throw err
    }
}

async function performTask(task) {
    const taskToSave = { ...task }
    try {
        // TODO: update task status to running and save to DB
        taskToSave.status = 'running'
        await update(taskToSave)
        // TODO: execute the task using: externalService.execute
        await _execute(taskToSave)
        // TODO: update task for success (doneAt, status)
        taskToSave.status = 'done'
        taskToSave.doneAt = Date.now()

    } catch (error) {
        // TODO: update task for error: status, errors
        taskToSave.status = 'failed'
        taskToSave.errors.push(error)
    } finally {
        // TODO: update task lastTried, triesCount and save to DB
        taskToSave.lastTriedAt = Date.now()
        taskToSave.triesCount = +task.triesCount + 1
        await update(taskToSave)
        return taskToSave
    }
}

async function getNextTask() {
    try {
        const collection = await dbService.getCollection('task')
        const nextTask = await collection.find({ triesCount: { $lt: 5 } }).sort({ importance: -1, triesCount: 1 }).limit(1)
        return nextTask
    } catch (err) {
        logger.error('Failed to get Mongo nextTask', err)
        throw err
    }
}


function _execute(task) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (Math.random() > 0.5) resolve(parseInt(Math.random() * 100))
            // TODO: throw some more random errors
            else reject('High Temparture');
        }, 5000)
    })
}
module.exports = {
    remove,
    query,
    getById,
    add,
    update,
    addTaskMsg,
    removeTaskMsg,
    performTask,
    getNextTask
}
