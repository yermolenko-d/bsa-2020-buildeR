import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgbModule, NgbCollapseModule } from '@ng-bootstrap/ng-bootstrap';

import { BuildStatusPipe } from './pipes/build-status.pipe';
import { DateAgoPipe } from './pipes/date-ago.pipe';
import { BuildStatusColorDirective } from './directives/build-status-color.directive';
import { BuildStatusIconDirective } from './directives/build-status-icon.directive';
import { RouterModule } from '@angular/router';
import { CronJobsModule } from 'ngx-cron-jobs';
import { CronBuilderComponent } from './components/cron-builder/cron-builder.component';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { LogLevelDirective } from './directives/log-level.directive';
import { TimespanPipe } from './pipes/timespan.pipe';
import { BuildHistoryStatusDirective } from './directives/build-history-status.directive';
import { BuildHistoryStatusOutlineDirective } from './directives/build-history-status-outline.directive';
import { TabsComponent } from './components/tabs/tabs.component';
import { LoadingSpinnerComponent } from './components/loading-spinner/loading-spinner.component';
import { ChartSmallComponent } from './components/chart-small/chart-small.component';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { ChartBigNormalizedComponent } from './components/chart-big-normalized/chart-big-normalized.component';
import { ChartBigGroupedComponent } from './components/chart-big-grouped/chart-big-grouped.component';
// Please, add all components, pipes, directives, other modules which should be shared accross all modules
// Do not forget to put them in 'exports' in order to use them outside of this module
@NgModule({
  declarations: [
    BuildStatusPipe,
    DateAgoPipe,
    BuildStatusColorDirective,
    BuildStatusIconDirective,
    LogLevelDirective,
    CronBuilderComponent,
    NotFoundComponent,
    TimespanPipe,
    BuildHistoryStatusDirective,
    BuildHistoryStatusOutlineDirective,
    TabsComponent,
    LoadingSpinnerComponent,
    ChartSmallComponent,
    ChartBigNormalizedComponent,
    ChartBigGroupedComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,
    NgbModule,
    NgbCollapseModule,
    CronJobsModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    NgxChartsModule,
  ],
  exports: [
    CommonModule,
    RouterModule,
    NgbModule,
    NgbCollapseModule,
    ReactiveFormsModule,
    FormsModule,
    BuildStatusPipe,
    DateAgoPipe,
    TimespanPipe,
    BuildStatusColorDirective,
    BuildStatusIconDirective,
    LogLevelDirective,
    NotFoundComponent,
    CronBuilderComponent,
    BuildHistoryStatusDirective,
    BuildHistoryStatusOutlineDirective,
    TabsComponent,
    LoadingSpinnerComponent,
    ChartSmallComponent,
    ChartBigNormalizedComponent,
    ChartBigGroupedComponent
  ],
})
export class SharedModule {}
