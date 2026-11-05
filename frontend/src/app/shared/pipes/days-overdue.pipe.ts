import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'daysOverdue',
  standalone: true
})
export class DaysOverduePipe implements PipeTransform {
  transform(dueDateStr: string | undefined | null): number {
    if (!dueDateStr) return 0;

    const due = new Date(dueDateStr);
    const today = new Date();
    // Normalize to start of day
    due.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    const diffTime = today.getTime() - due.getTime();
    if (diffTime <= 0) return 0;

    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }
}
