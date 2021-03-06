import { Project } from 'src/app/shared/models/project/project';
import { Component, OnInit } from '@angular/core';
import { ToastrNotificationsService } from '@core/services/toastr-notifications.service';
import { ProjectService } from '@core/services/project.service';
import {
  ActivatedRoute,
  Resolve,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
} from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { TabRoute } from '@shared/models/tabs/tab-route';

@Component({
  selector: 'app-project',
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.sass'],
})
export class ProjectComponent implements OnInit {
  id: number;
  project: Project = {} as Project;
  isLoading = false;

  tabRoutes: TabRoute[] = [
    { name: 'Current', route: 'details' },
    { name: 'Build History', route: 'history' },
    { name: 'Build Steps', route: 'steps' },
    { name: 'Settings', route: 'settings' },
  ];

  constructor(
    private projectService: ProjectService,
    private toastrService: ToastrNotificationsService,
    private route: ActivatedRoute
  ) {
    this.route.paramMap
      .pipe(switchMap((params) => params.getAll('projectId')))
      .subscribe((data) => (this.id = Number(data)));
    this.projectService.projectName.subscribe((res) => {
      this.project.name = res;
    });
  }

  ngOnInit(): void {
    this.getProject(this.id);
  }
  getProject(projectId: number) {
    this.isLoading = true;
    this.projectService.getProjectById(projectId).subscribe(
      (data) => {
        this.isLoading = false;
        this.project = data;
      },
      (error) => {
        this.isLoading = false;
        this.toastrService.showError(error.message, error.name);
      }
    );
  }
}
