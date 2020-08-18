import { Component, OnInit } from '@angular/core';
import { BuildHistoryService } from '../../../core/services/build-history.service';
import { BaseComponent } from '@core/components/base/base.component';
import { BuildHistory } from '@shared/models/build-history';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-project-build-history',
  templateUrl: './project-build-history.component.html',
  styleUrls: ['./project-build-history.component.sass'],
})
export class ProjectBuildHistoryComponent extends BaseComponent
  implements OnInit {
  projectId: number;
  builds: BuildHistory[] = [];

  constructor(
    private buildHistoryService: BuildHistoryService,
    private route: ActivatedRoute
  ) {
    super();
  }

  ngOnInit(): void {
    this.route.parent.params.subscribe((params) => {
      this.projectId = params.projectId;
      this.buildHistoryService
        .getBuildHistory(this.projectId)
        .subscribe((response) => this.builds = response.body);
    });
  }
}