import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { UserComponent } from './user.component';
import { CommonModule } from '@angular/common';
import { UserSettingsComponent } from './user-settings/user-settings.component';
import { UserResolverService } from '../../core/resolvers/user.resolver';
import { NotificationSettingComponent } from './notification-setting/notification-setting.component';
import { InsightsComponent } from './insights/insights.component';
import { CredentialSettingsComponent } from './credential-settings/credential-settings.component';


@NgModule({
  imports: [CommonModule, RouterModule.forChild([{
    path: '',
    component: UserComponent,
    resolve: {
      user: UserResolverService
    },
    children: [{
      path: '',
      component: UserSettingsComponent,
      resolve: {
        user: UserResolverService
      }
    },
    {
      path: 'notificationsettings',
      component: NotificationSettingComponent,
      resolve: {
        user: UserResolverService
      }
    },
    {
      path: 'insights',
      component: InsightsComponent,
      resolve: {
        user: UserResolverService
      }
    },
    {
      path: 'credentialsettings',
      component: CredentialSettingsComponent,
      resolve: {
        user: UserResolverService
      }
    }
  ]
  }])],
  exports: [RouterModule]
})
export class UserRoutingModule { }
