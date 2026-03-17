import { Directive } from '@angular/core';
import { BrnLabel } from '@spartan-ng/brain/label';

@Directive({
  selector: 'label[hlmLabel]',
  hostDirectives: [BrnLabel],
  host: {
    class: 'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
  },
})
export class HlmLabelDirective {}
