const Queue = require('bull');

class JobService {
	constructor() {
		this.queue = new Queue('JobService');

		this.queue.process('main-queue', async (job) => {
			return this.process(job);
		});

		this.handlers = {};
	}

	registerCallback({ name, callback, delay }) {
		this.handlers[name] = { callback, delay };
	}

	async pushToQueue(data) {
		await this.queue.add('main-queue', data, {
			delay: this.handlers[data._config.name].delay || data._config.delay,
			removeOnComplete: true,
		});
	}

	async process(job) {
		const data = job.data;

		const handler = this.handlers[job.data._config.name]?.callback;

		if (!handler) {
			return await job.moveToFailed({ message: 'No handler' });
		}

		try {
			await handler(data);
			return await job.moveToCompleted('done', true);
		} catch (e) {
			return await job.moveToFailed({ message: e });
		}
	}
}

const jobService = new JobService();

module.exports = jobService;
