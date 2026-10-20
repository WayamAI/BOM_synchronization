/** Status values are stored Title Case in the data ("In Review"); the UI shows sentence case ("In review"). */
export const statusText = (s: string): string => s.replace(/ ([A-Z])/g, (_, c: string) => ` ${c.toLowerCase()}`);
