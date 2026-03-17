import { Directive } from '@angular/core';

@Directive({
  selector: 'input[hlmInput], textarea[hlmInput]',
  host: {
    class:
      'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
  },
})
export class HlmInputDirective {}
