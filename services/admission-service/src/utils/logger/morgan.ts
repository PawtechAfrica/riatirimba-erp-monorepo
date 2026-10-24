import morgan from "morgan";
import logger from "./logger";
import dayjs from "dayjs";

const morganFormat =
    "\n✍:time :method :url :status :res[content-length] - :response-time ms\n";

const stream = {
    write: (message: string) => {
        logger.info(message.trim());
    },
};

morgan.token("time", () => dayjs().format("HH:mm:ss"));

const morganMiddleware = morgan(morganFormat, {stream});

export default morganMiddleware;
