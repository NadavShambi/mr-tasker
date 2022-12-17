const express = require('express')
const { requireAuth, requireAdmin } = require('../../middlewares/requireAuth.middleware')
const { log } = require('../../middlewares/logger.middleware')
const { getTasks, getTaskById, addTask, addTasks, updateTask, removeTask, addTaskMsg, removeTaskMsg, performTask, runWorker } = require('./task.controller')

const router = express.Router()

// middleware that is specific to this router
// router.use(requireAuth)
// TODO revive runWorker
router.get('/', log, getTasks, runWorker)
router.get('/:id', getTaskById)
router.post('/', addTask)
router.put('/:id', updateTask)
router.delete('/:id', removeTask)
router.put('/:id/start', performTask)
// router.delete('/:id', requireAuth, requireAdmin, removeTask)

router.post('/:id/msg', addTaskMsg)
router.delete('/:id/msg/:msgId', removeTaskMsg)

module.exports = router