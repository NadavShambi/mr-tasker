const dbService = require('../../services/db.service')
const logger = require('../../services/logger.service')
const utilService = require('../../services/util.service')
const externalService = require('../../services/external.service')
const socketService = require('../../services/socket.service')
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
async function addMany(tasks) {
    try {
        const collection = await dbService.getCollection('task')
        const result = await collection.insertMany(tasks)
        return result
    } catch (err) {
        logger.error('cannot insert task', err)
        throw err
    }
}

async function update(task) {
    try {
        socketService.emit('update-task', task)
        const id = task._id
        delete task._id
        const collection = await dbService.getCollection('task')
        await collection.updateOne({ _id: ObjectId(id) }, { $set: { ...task } })
        task._id = id
        return task
    } catch (err) {
        logger.error(`cannot update task ${task._Id}`, err)
        throw err
    }
}

async function removeMany() {
    try {
        const collection = await dbService.getCollection('task')
        const results = await collection.deleteMany()
        return results
    } catch (err) {
        logger.error(`cannot remove all task`, err)
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
        await externalService.execute(taskToSave)
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
        const nextTask = await collection.find({ triesCount: { $lt: 5 }, status: { $ne: 'done' } }).sort({ importance: -1, triesCount: 1 }).limit(1).toArray()
        return nextTask[0]
    } catch (err) {
        logger.error('Failed to get Mongo nextTask', err)
        throw err
    }
}

function getRandomTitle() {
    const length = utilService.getRandomInt(1, 5)
    let title = ''
    for (var i = 0; i < length; i++) {
        title += words[utilService.getRandomInt(1, words.length - 1)]
    }
    return title
}
function getRandomDescription() {
    const length = utilService.getRandomInt(1, 5)
    let title = ''
    for (var i = 0; i < length; i++) {
        title += words[utilService.getRandomInt(1, words.length - 1)]
    }
    return title
}

var words = [
    'The sky',
    'above',
    'the port',
    'was',
    'the color of television',
    'tuned',
    'to',
    'a dead channel',
    'All',
    'this happened',
    'more or less',
    'I',
    'had',
    'the story',
    'bit by bit',
    'from various people',
    'and',
    'as generally',
    'happens',
    'in such cases',
    'each time',
    'it',
    'was',
    'a different story',
    'It',
    'was',
    'a pleasure',
    'to',
    'burn',
]

module.exports = {
    remove,
    query,
    getById,
    add,
    addMany,
    update,
    removeMany,
    performTask,
    getNextTask,
    getRandomTitle,
    getRandomDescription
}
