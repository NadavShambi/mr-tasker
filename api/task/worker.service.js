const taskService = require('./task.service.js')


async function runWorker() {
    // The isWorkerOn is toggled by the button: "Start/Stop Task Worker"
    // if (!isWorkerOn) return
    var delay = 5000
    try {
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

module.exports = {
    runWorker
}
