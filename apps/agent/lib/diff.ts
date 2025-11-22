import * as diff from 'diff';


export function calculateDiffStats(
    oldContent: string,
    newContent: string
  ): { linesAdded: number; linesRemoved: number } {
    const changes = diff.diffLines(oldContent, newContent);
    let linesAdded = 0;
    let linesRemoved = 0;

    for (const change of changes) {
      if (change.added) {
        linesAdded += change.count || 0;
      } else if (change.removed) {
        linesRemoved += change.count || 0;
      }
    }

    // Log the diff calculation with emoji (local mode only)
    console.log(`Diff calculated: +${linesAdded} -${linesRemoved} lines`);

    return { linesAdded, linesRemoved };
  }