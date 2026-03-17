import { Directive, computed, input } from '@angular/core';

export type HlmButtonVariant = 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
export type HlmButtonSize = 'default' | 'sm' | 'lg' | 'icon';

const variantClasses: Record<HlmButtonVariant, string> = {
  default: 'bg-primary text-primary-foreground shadow hover:bg-primary/90',
  destructive: 'bg-destructive text-white shadow-sm hover:bg-destructive/90',
  outline: 'border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground',
  secondary: 'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80',
  ghost: 'hover:bg-accent hover:text-accent-foreground',
  link: 'text-primary underline-offset-4 hover:underline',
};

const sizeClasses: Record<HlmButtonSize, string> = {
  default: 'h-9 px-4 py-2',
  sm: 'h-8 rounded-md px-3 text-xs',
  lg: 'h-10 rounded-md px-8',
  icon: 'h-9 w-9',
};

@Directive({
  selector: 'button[hlmBtn], a[hlmBtn]',
  host: {
    '[class]': '_computedClass()',
    '[attr.disabled]': 'disabled() || null',
    '[attr.aria-disabled]': 'disabled() || null',
  },
})
export class HlmButtonDirective {
  readonly variant = input<HlmButtonVariant>('default');
  readonly size = input<HlmButtonSize>('default');
  readonly disabled = input(false);

  protected readonly _computedClass = computed(
    () =>
      `inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 cursor-pointer ${variantClasses[this.variant()]} ${sizeClasses[this.size()]}`,
  );
}
