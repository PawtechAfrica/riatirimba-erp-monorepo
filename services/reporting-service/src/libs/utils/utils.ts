export function makeLabel(input: string): string {
    // Handle snake_case by replacing underscores with spaces
    let result = input.replace(/_/g, ' ');

    // Handle camelCase by adding space before uppercase letters
    result = result.replace(/([A-Z])/g, ' $1');

    // Remove the leading space if any
    result = result.trim();

    // Capitalize the first letter, lowercase the rest
    return result.charAt(0).toUpperCase() + result.slice(1).toLowerCase();
}
