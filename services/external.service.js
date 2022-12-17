const logger = require('./logger.service')
const taskService = require('../api/task/task.service.js')

var isWorkerOn = true
async function runWorker() {
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
    } finally {
        setTimeout(runWorker, delay)
    }
}


function execute(task) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (Math.random() > 0.5) resolve(parseInt(Math.random() * 100))
            // TODO: throw some more random errors
            else reject('High Temparture');
        }, 5000)
    })
}
module.exports = {
    execute
}
