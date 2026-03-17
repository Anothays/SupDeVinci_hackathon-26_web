import { ChangeDetectionStrategy, Component } from '@angular/core';

/** @deprecated Cette page a été remplacée par ReportsComponent. La route redirige vers /dashboard/reports. */
@Component({
  selector: 'app-carbon-reports',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<p>Fonctionnalité supprimée. Redirection en cours...</p>',
})
export class CarbonReportsComponent {}
