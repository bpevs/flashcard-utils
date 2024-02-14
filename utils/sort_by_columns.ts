// Sort by row values starting from index 0; aka put category first
export default function sortByColumns(a: string[], b: string[]) {
  for (let i = 0; i < a.length; i++) {
    const comp = a[i].localeCompare(b[0])
    if (comp) return comp
  }
  return 0
}
