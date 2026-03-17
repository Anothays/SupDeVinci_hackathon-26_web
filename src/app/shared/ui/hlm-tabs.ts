import { computed, Directive, input } from '@angular/core';
import { BrnTabsImports } from '@spartan-ng/brain/tabs';

/** Classe utilitaire — BrnTabs est appliqué directement dans le template via [brnTabs] */
@Directive({
  selector: '[hlmTabs]',
})
export class HlmTabsDirective {}

/** Barre des déclencheurs */
@Directive({
  selector: '[hlmTabsList]',
  host: {
    class:
      'inline-flex h-9 items-center justify-start rounded-lg bg-muted p-1 text-muted-foreground gap-1',
  },
})
export class HlmTabsListDirective {}

/** Bouton déclencheur d'un onglet */
@Directive({
  selector: 'button[hlmTabsTrigger]',
  host: {
    '[class]': '_cls()',
    '[attr.data-state]': 'null',
  },
})
export class HlmTabsTriggerDirective {
  readonly active = input(false);

  protected readonly _cls = computed(
    () =>
      `inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer ${this.active() ? 'bg-background text-foreground shadow' : 'hover:bg-background/50 hover:text-foreground'}`,
  );
}

/** Panneau de contenu d'un onglet */
@Directive({
  selector: '[hlmTabsContent]',
  host: {
    class:
      'mt-4 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
  },
})
export class HlmTabsContentDirective {}

export const HlmTabsImports = [
  HlmTabsDirective,
  HlmTabsListDirective,
  HlmTabsTriggerDirective,
  HlmTabsContentDirective,
  ...BrnTabsImports,
] as const;
