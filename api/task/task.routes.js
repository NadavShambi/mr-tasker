const express = require('express')
const { getTasks, getTaskById, addTask, generateTasks, updateTask, removeTask, performTask, runWorker , clear , toggleWorker} = require('./task.controller')

const router = express.Router()


// TODO revive runWorker
router.get('/', getTasks)
router.get('/generate', generateTasks)
// router.get('/worker/start', runWorker)
router.get('/worker/toggle', toggleWorker)
router.get('/clearAll', clear)
router.get('/:id', getTaskById)
router.post('/', addTask)
router.put('/:id', updateTask)
router.delete('/:id', removeTask)
router.put('/:id/start', performTask)

// router.delete('/:id', requireAuth, requireAdmin, removeTask)



module.exports = router