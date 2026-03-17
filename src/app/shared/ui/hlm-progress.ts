import { Component, ChangeDetectionStrategy } from '@angular/core';
import { BrnProgressImports } from '@spartan-ng/brain/progress';

@Component({
  selector: 'hlm-progress',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [...BrnProgressImports],
  template: `
    <brn-progress class="relative h-2 w-full overflow-hidden rounded-full bg-muted" [value]="value" [max]="max">
      <brn-progress-indicator
        class="h-full flex-1 transition-all duration-500"
        [style.background]="color"
        [style.width.%]="pct()"
      />
    </brn-progress>
  `,
  host: { class: 'block w-full' },
})
export class HlmProgressComponent {
  value = 0;
  max = 100;
  color = 'var(--primary)';

  pct(): number {
    return this.max > 0 ? Math.min(100, (this.value / this.max) * 100) : 0;
  }
}
