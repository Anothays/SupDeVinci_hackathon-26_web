import { Directive, computed, input } from '@angular/core';

export type HlmBadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline' | 'success';

const variantClasses: Record<HlmBadgeVariant, string> = {
  default: 'bg-primary text-primary-foreground',
  secondary: 'bg-secondary text-secondary-foreground',
  destructive: 'bg-destructive text-white',
  outline: 'border border-border text-foreground',
  success: 'bg-green-100 text-green-800',
};

@Directive({
  selector: '[hlmBadge]',
  host: { '[class]': '_computedClass()' },
})
export class HlmBadgeDirective {
  readonly variant = input<HlmBadgeVariant>('default');

  protected readonly _computedClass = computed(
    () =>
      `inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${variantClasses[this.variant()]}`,
  );
}
