/** Status values are stored Title Case in the data ("In Review"); the UI shows sentence case ("In review"). */
export const statusText = (s: string): string => s.replace(/ ([A-Z])/g, (_, c: string) => ` ${c.toLowerCase()}`);

/** "1 part", "2 parts". Pass `many` for irregular plurals ("assembly", "assemblies"). */
export const plural = (n: number, one: string, many = `${one}s`): string =>
  `${n.toLocaleString("en-US")} ${n === 1 ? one : many}`;
