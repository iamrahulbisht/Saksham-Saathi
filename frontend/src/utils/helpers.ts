export function formatDate(date: string | Date): string {
    return new Date(date).toLocaleDateString();
}

export function generateId(): string {
    return Math.random().toString(36).substr(2, 9);
}
