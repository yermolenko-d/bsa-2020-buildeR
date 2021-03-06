import { Component, OnInit, OnDestroy } from '@angular/core';
import { ProjectInfo } from '@shared/models/project-info';
import { ToastrNotificationsService } from '@core/services/toastr-notifications.service';
import { ProjectService } from '@core/services/project.service';
import { User } from '@shared/models/user/user';
import { takeUntil } from 'rxjs/operators';
import { BaseComponent } from '@core/components/base/base.component';
import { AuthenticationService } from '@core/services/authentication.service';
import { SynchronizationService } from '@core/services/synchronization.service';
import { SynchronizedUser } from '@core/models/SynchronizedUser';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalContentComponent } from '../../../core/components/modal-content/modal-content.component';
import { ModalCopyProjectComponent } from '../../project/modal-copy-project/modal-copy-project.component';
import { ProjectCreateComponent } from '@modules/project/project-create/project-create.component';
import { Branch } from '@core/models/Branch';
import { NewBuildHistory } from '@shared/models/new-build-history';
import { BuildHistory } from '@shared/models/build-history';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.sass'],
})
export class DashboardComponent
  extends BaseComponent
  implements OnInit, OnDestroy {
  activeProjects: ProjectInfo[];
  starredProjects: ProjectInfo[];
  cachedUserProjects: ProjectInfo[];
  currentUser: User;
  currentGithubUser: SynchronizedUser;
  loadingProjects = false;

  selectedProjectBranches: Branch[];
  loadingSelectedProjectBranches = false;
  selectedProjectBranch: string;

  constructor(
    private projectService: ProjectService,
    private toastrService: ToastrNotificationsService,
    private authService: AuthenticationService,
    private githubService: SynchronizationService,
    private modalService: NgbModal,
    private syncService: SynchronizationService
  ) {
    super();
  }

  ngOnInit(): void {
    this.loadingProjects = true;
    this.currentUser = this.authService.getCurrentUser();
    this.getUserProjects(this.currentUser.id);
  }

  getUserProjects(userId: number) {
    this.loadingProjects = true;
    this.projectService
      .getProjectsByUser(userId)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(
        (resp) => {
          this.loadingProjects = false;
          this.activeProjects = resp.body.filter(
            (project) => !project.isFavorite
          );
          this.starredProjects = resp.body.filter(
            (project) => project.isFavorite
          );
        },
        (error) => {
          this.loadingProjects = false;
          this.toastrService.showError(error);
        }
      );
  }

  triggerBuild(project: ProjectInfo) {
    const newBuildHistory = {
      branchHash: this.selectedProjectBranch,
      performerId: this.currentUser.id,
      projectId: project.id,
      commitHash: null,
    } as NewBuildHistory;
    this.closeModal();
    this.toastrService.showSuccess(
      `You’ve successfully triggered a build for ${newBuildHistory.branchHash} branch of ${project.name}. Hold tight, it might take a moment to show up.`
    );
    this.projectService
      .startProjectBuild(newBuildHistory)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(
        (buildHistory) => {
          project.lastBuildHistory = buildHistory;
        },
        (error) => this.toastrService.showError(error)
      );
  }

  changeFavoriteStateOfProject(project: ProjectInfo) {
    this.projectService
      .changeFavoriteState(project.id)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(
        () => {
          project.isFavorite = !project.isFavorite;
          if (project.isFavorite) {
            this.activeProjects = this.activeProjects.filter(
              (proj) => proj.id !== project.id
            );
            this.starredProjects.push(project);
          } else {
            this.activeProjects.push(project);
            this.starredProjects = this.starredProjects.filter(
              (proj) => proj.id !== project.id
            );
          }
        },
        (error) => this.toastrService.showError(error)
      );
  }

  deleteProject(projectId: number) {
    const modalRef = this.modalService.open(ModalContentComponent);
    const data = {
      title: 'Project deletion',
      message: 'Are you sure you want to delete this project?',
      text:
        'All information associated to this project will be permanently deleted. This operation can not be undone.',
    };
    modalRef.componentInstance.content = data;
    modalRef.result
      .then((result) => {
        if (result) {
          this.projectService
            .deleteProject(projectId)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe(() => {
              this.activeProjects = this.activeProjects.filter(
                (proj) => proj.id !== projectId
              );
              this.starredProjects = this.starredProjects.filter(
                (proj) => proj.id !== projectId
              );
            });
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }

  copyProject(id: number) {
    const modalRef = this.modalService.open(ModalCopyProjectComponent);
    modalRef.componentInstance.id = id;
    modalRef.result
      .then((result) => {
        if (result.isFavorite) {
          this.starredProjects.push(result);
        } else if (result) {
          this.activeProjects.push(result);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }

  openCreateProjectModal() {
    const modalRef = this.modalService.open(ProjectCreateComponent);
    modalRef.result
      .then(() => this.getUserProjects(this.currentUser.id))
      .catch(() => {});
  }

  closeModal() {
    this.modalService.dismissAll('Closed');
  }

  openBranchSelectionModal(content, projectId: number) {
    this.loadProjectBranches(projectId);
    this.modalService
      .open(content)
      .result.then(() => {})
      .catch(() => {});
  }

  getCommit(bh: BuildHistory) {
    return bh.commitHash?.substring(0, 6) ?? "—";
  }

  loadProjectBranches(projectId: number) {
    this.loadingSelectedProjectBranches = true;
    this.syncService
      .getRepositoryBranches(projectId)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(
        (resp) => {
          this.selectedProjectBranches = resp;
          this.loadingSelectedProjectBranches = false;
        },
        (error) => {
          this.toastrService.showError(error);
          this.loadingSelectedProjectBranches = false;
        }
      );
  }
}
