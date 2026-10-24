import Sonyflake from "sonyflake";

// Hardcoded epoch in milliseconds (e.g. Jan 1, 2024 UTC)
const epoch = 1704067200000;

class SnowFlake extends Sonyflake {
	constructor() {
		super({
			machineId: 1,
			startTime: epoch,
		});
	}

	genId() {
		return this.nextId().toString();
	}
}

export default new SnowFlake();
