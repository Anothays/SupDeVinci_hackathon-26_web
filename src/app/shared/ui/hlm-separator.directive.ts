import { Directive } from '@angular/core';
import { BrnSeparatorImports } from '@spartan-ng/brain/separator';

@Directive({
  selector: 'brn-separator[hlmSeparator], [brnSeparator][hlmSeparator]',
  hostDirectives: [...BrnSeparatorImports],
  host: {
    class: 'block shrink-0 bg-border',
    '[class.h-px]': 'true',
    '[class.w-full]': 'true',
  },
})
export class HlmSeparatorDirective {}
