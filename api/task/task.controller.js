const taskService = require('./task.service.js')
const utilService = require('../../services/util.service')
const socketService = require('../../services/socket.service')
const logger = require('../../services/logger.service')
const externalService = require('../../services/external.service')

async function getTasks(req, res, next) {
  try {
    logger.debug('Getting Tasks')
    const filterBy = {
      title: req.query.title || ''
    }
    const tasks = await taskService.query(filterBy)
    res.json(tasks)
    next()

  } catch (err) {
    logger.error('Failed to get tasks', err)
    res.status(500).send({ err: 'Failed to get tasks' })
  }
}

async function getTaskById(req, res) {
  try {
    const taskId = req.params.id
    const task = await taskService.getById(taskId)
    res.json(task)
  } catch (err) {
    logger.error('Failed to get task', err)
    res.status(500).send({ err: 'Failed to get task' })
  }
}

async function addTask(req, res) {
  const { loggedinUser } = req

  try {
    const task = req.body
    task.owner = loggedinUser
    const addedTask = await taskService.add(task)
    res.json(addedTask)
  } catch (err) {
    logger.error('Failed to add task', err)
    res.status(500).send({ err: 'Failed to add task' })
  }
}
async function generateTasks(req, res) {

  try {
    const tasks = []
    for (var i = 0; i < 10; i++) {
      const title = taskService.getRandomTitle()
      const desc = taskService.getRandomDescription()
      tasks.push(getEmptyTask(title, utilService.getRandomInt(1, 3), desc))
    }

    console.log(tasks)
    const insertedTasks = await taskService.addMany(tasks)
    res.json(tasks)

  } catch (err) {
    logger.error('Failed to add tasks', err)
    res.status(500).send({ err: 'Failed to add task' })
  }
}

async function updateTask(req, res) {
  try {
    const task = req.body
    const updatedTask = await taskService.update(task)
    res.json(updatedTask)
  } catch (err) {
    logger.error('Failed to update task', err)
    res.status(500).send({ err: 'Failed to update task' })

  }
}

async function removeTask(req, res) {
  try {
    const taskId = req.params.id
    const removedId = await taskService.remove(taskId)
    res.send(removedId)
  } catch (err) {
    logger.error('Failed to remove task', err)
    res.status(500).send({ err: 'Failed to remove task' })
  }
}

async function addTaskMsg(req, res) {
  const { loggedinUser } = req
  try {
    const taskId = req.params.id
    const msg = {
      txt: req.body.txt,
      by: loggedinUser
    }
    const savedMsg = await taskService.addTaskMsg(taskId, msg)
    res.json(savedMsg)
  } catch (err) {
    logger.error('Failed to update task', err)
    res.status(500).send({ err: 'Failed to update task' })

  }
}

async function removeTaskMsg(req, res) {
  const { loggedinUser } = req
  try {
    const taskId = req.params.id
    const { msgId } = req.params

    const removedId = await taskService.removeTaskMsg(taskId, msgId)
    res.send(removedId)
  } catch (err) {
    logger.error('Failed to remove task msg', err)
    res.status(500).send({ err: 'Failed to remove task msg' })

  }
}

async function performTask(req, res) {
  try {
    const task = req.body
    const preformedTask = await taskService.performTask(task)
    res.json(preformedTask)
  } catch (err) {
    logger.error('Failed to preform task', err)
    res.status(500).send({ err: 'Failed to preform task' })
  }
}

async function clear(req, res) {
  try {
    await taskService.removeMany()
    res.end()
  } catch (error) { }
}

function getEmptyTask(title, importance, description) {
  return {
    title,
    status: 'new task',
    description: description,
    importance,
    createdAt: Date.now(),
    lastTriedAt: null,
    triesCount: 0,
    doneAt: null,
    errors: [],
  }
}

var timeout
var isWorkerOn = false
function toggleWorker(req, res) {
  isWorkerOn = !isWorkerOn
  socketService.emit('setToggleWorker', isWorkerOn)
  runWorker()
  res.end()
}

async function runWorker(req, res) {
  // The isWorkerOn is toggled by the button: "Start/Stop Task Worker"
  if (!isWorkerOn) return
  var delay = 5000
  try {
    logger.debug('Wake up worker!')
    const task = await taskService.getNextTask()
    if (task) {
      try {
        await taskService.performTask(task)
      } catch (err) {
        console.log(`Failed Task`, err)
      } finally {
        delay = 1
      }
    } else {
      console.log('Snoozing... no tasks to perform')
    }
  } catch (err) {
    console.log(`Failed getting next task to execute`, err)
    res.status(500).send({ err: 'Failed getting next task to execute' })

  } finally {
    clearTimeout(timeout)
    timeout = setTimeout(runWorker, delay)
  }
}




module.exports = {
  getTasks,
  getTaskById,
  addTask,
  generateTasks,
  updateTask,
  removeTask,
  addTaskMsg,
  removeTaskMsg,
  performTask,
  runWorker,
  toggleWorker,
  clear
}
