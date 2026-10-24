import * as create from "./intakes.create";
import * as read from "./read";
import * as update from "./intakes.update"

export default {
    create,
    read,
    update
} as {
    create: typeof create;
    read: typeof read;
    update: typeof update
};
