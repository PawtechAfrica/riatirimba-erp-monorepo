// src/utils/validate.util.ts
import {plainToInstance} from "class-transformer";
import {validate} from "class-validator";
import {AppError} from "./AppErrorClasses";
import {makeLabel} from "./sharedFunctions";

export async function validateDTO<T extends object>(
    dtoClass: new (...args: any[]) => T,
    data: object
): Promise<T> {
    const dtoInstance = plainToInstance(dtoClass, data, {
        enableImplicitConversion: true,
    });

    const errors = await validate(dtoInstance, {
        whitelist: true,
        forbidNonWhitelisted: true,
        stopAtFirstError: true,
        validationError: {target: false},
    });

    if (errors.length > 0) {
        // recursive error formatter
        const formatErrors = (errs: any[], parent = ""): any[] =>
            errs.flatMap((err) => {
                const propertyPath = parent ? `${parent}.${err.property}` : err.property;

                if (err.children && err.children.length > 0) {
                    return formatErrors(err.children, propertyPath);
                }

                const label = makeLabel(propertyPath); // 👈 human-readable

                return {
                    property: propertyPath,
                    message: err.constraints
                        ? (Object.values(err.constraints)[0] as string ?? "").replace(err.property, label)
                        : `Invalid value for ${label}`,
                };
            });

        const formattedErrors = formatErrors(errors);

        throw new AppError(
            `Please check your input and try again!`,
            400,
            formattedErrors
        );
    }

    return dtoInstance;
}
