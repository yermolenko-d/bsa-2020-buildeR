import { Component, OnInit } from '@angular/core';
import { NotificationSetting } from 'src/app/shared/models/notification-setting/notification-setting';
import { NotificationDescription } from 'src/app/shared/models/notification-setting/notification-description';
import { NotificationSettingType } from '@shared/models/notification-setting/notification-setting-type';
import { ToastrNotificationsService } from '@core/services/toastr-notifications.service';
import { NotificationSettingService } from '@core/services/notification-setting.service';
import { map } from 'rxjs/operators';
import { User } from '@shared/models/user/user';
import { AuthenticationService } from '@core/services/authentication.service';

@Component({
  selector: 'app-notification-setting',
  templateUrl: './notification-setting.component.html',
  styleUrls: ['./notification-setting.component.sass']
})
export class NotificationSettingComponent implements OnInit {

  user: User = this.authService.getCurrentUser();
  setting: NotificationSetting = {} as NotificationSetting;
  descriptions: NotificationDescription [] =
  [
    { notificationType: NotificationSettingType.buildSuccess,  description: 'When build of project was successful'},
    { notificationType: NotificationSettingType.buildFailed, description: 'When build of project was failed'},
  ];
  constructor(
    private settingService: NotificationSettingService,
    private toastrService: ToastrNotificationsService,
    private authService: AuthenticationService,
    ) { }

  ngOnInit(): void {
    this.getSettings(this.user.id);
  }

  getSettings(userId: number) {
    this.settingService.getNotificationSettingByUserId(userId)
    .pipe(
      map(setting =>
        {
          setting.notificationSettingOptions.map(option =>
            {
              option.description = this.descriptions.find(d => d.notificationType === option.notificationType).description;
              return option;
            });
          return setting;
        }))
    .subscribe(
      (data) => this.setting = data,
      (error) => this.toastrService.showError(error.message, error.name)
    );
  }

  onToggle(change: boolean) {
    change = !change;
  }

  save() {
    let res = true;
    if (res) {
      res = false;
      this.settingService.updateNotificationSettings(this.setting)
      .subscribe(
        (data) =>
        {
          this.setting = data;
          this.toastrService.showSuccess('notification settings updated');
          res = true;
        },
        (error) => {
          this.toastrService.showError(error.message, error.name);
          res = true;
        }
      );
    }
  }
}
