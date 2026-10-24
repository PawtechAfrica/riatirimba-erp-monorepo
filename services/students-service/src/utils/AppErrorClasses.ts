export class AppError extends Error {

    constructor(message: string, public status: number = 400, public validations?: { property: string, message: string }[]) {
        super();
        this.message = message;
        this.status = status;
        this.validations = validations;
        this.log()
    }

    log() {
        console.error(`Error occurred while executing request: \t message: ${this.message}\n\t`, this)
    }
}
