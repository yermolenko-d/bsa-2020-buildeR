import { Component, OnInit, Input } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { FirebaseSignInService } from '@core/services/firebase-sign-in.service';
import { emailDotValidator } from '@core/validators/email-dot-validator';
import { Providers } from '@shared/models/providers';
import { User } from '@shared/models/user/user';
import { ToastrNotificationsService } from '../../../core/services/toastr-notifications.service';
import { UserService } from '../../../core/services/user.service';
import { usernameAsyncValidator } from '../../../core/validators/custom-async-validator';
import { UserSocialNetwork } from '@shared/models/user/user-social-network';
import { AuthenticationService } from '@core/services/authentication.service';

@Component({
  selector: 'app-user-settings',
  templateUrl: './user-settings.component.html',
  styleUrls: ['./user-settings.component.sass']
})
export class UserSettingsComponent implements OnInit {

  // hardcoded date for test

  isChanged = false;
  changedUser: User = {} as User;

  @Input() details: User = {} as User;
  public settingsForm: FormGroup;
  googleClick = false;
  githubClick = false;

  constructor(
    private settingsService: UserService,
    private toastrService: ToastrNotificationsService,
    private userService: UserService,
    private route: ActivatedRoute,
    private fbr: FirebaseSignInService,
    private authService: AuthenticationService) { }

  ngOnInit(): void {

    this.route.data.subscribe(data => this.details = data.user);
    this.settingsForm = new FormGroup({
      firstName: new FormControl(this.details.firstName,
        [
          Validators.minLength(2),
          Validators.maxLength(30),
          Validators.pattern('^(?![-\'\\s])(?!.*--)(?!.*\'\')[[A-Za-z-\'\\s]+(?<![-\'\\s])$')
        ]),
      lastName: new FormControl(this.details.lastName,
        [
          Validators.minLength(2),
          Validators.maxLength(30),
          Validators.pattern('^(?![-\'\\s])(?!.*--)(?!.*\'\')[[A-Za-z-\'\\s]+(?<![-\'\\s])$')
        ]),
      avatarUrl: new FormControl(this.details.avatarUrl),
      email: new FormControl(this.details.email,
        [
          Validators.required,
          Validators.email,
          Validators.pattern(`^[a-zA-Z].*`),
          emailDotValidator()
        ]),
      username: new FormControl(this.details.username,
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(30),
          Validators.pattern('^(?![-\\.])(?!.*--)(?!.*\\.\\.)[[A-Za-z0-9-\\._]+(?<![-\\.])$')
        ],
        [
          usernameAsyncValidator(this.userService, this.details.id)
        ]
      ),
      bio: new FormControl(this.details.bio,
        [
          Validators.maxLength(300),
          Validators.pattern('[^А-яа-я]*')
        ])
    });

    this.settingsForm.valueChanges.subscribe(changesSettigsForm => {
      this.isChanged = false;
      this.changedUser = (changesSettigsForm as User);
      if (this.details.lastName === this.changedUser.lastName &&
        this.details.firstName === this.changedUser.firstName &&
        this.details.email === this.changedUser.email &&
        this.details.bio === this.changedUser.bio &&
        this.details.username === this.changedUser.username &&
        this.details.avatarUrl === this.changedUser.avatarUrl) {
        this.isChanged = true;
      }
    });

    this.userService.userLogoUrl.subscribe(url => {
      this.details.avatarUrl = url;
    });
  }

  onSubmit(user: User) {
    user.id = this.details.id;
    user.role = this.details.role;
    user.createdAt = this.details.createdAt;
    if (!user.firstName){
      user.firstName = null;
    }
    if (!user.lastName){
      user.lastName = null;
    }
    this.userService.updateUser(user).subscribe(updateUser => {
      this.details = updateUser;
      this.isChanged = true;
      this.toastrService.showSuccess('Your profile was updated!');
      this.userService.changeUserName(this.settingsForm.controls.username.value);
    }, error => {
      console.error(error);
      this.toastrService.showError('Your profile wasn\'t updated');
    });
  }

  upload() {
    if (!this.isValidUrl(this.settingsForm.controls.avatarUrl.value)) {
      this.toastrService.showError('Invalaid URL');
      return;
    }
    console.log('we here');
    this.settingsService.updateUser(this.details).subscribe((res) => {
      console.log(res);
      this.userService.changeImageUrl(this.settingsForm.controls.avatarUrl.value);
      this.details.avatarUrl = this.settingsForm.controls.avatarUrl.value;
    },
      (err) => {
        console.log(err);
      });
  }

  private isValidUrl(url: string) {
    try {
      // tslint:disable-next-line: no-unused-expression
      new URL(url);
    } catch (_) {
      return false;
    }
    return true;
  }

  linkWithGithub() {
    if (!this.isGithubAddedInFirebase() && !this.isProviderAdded(Providers.Github)) {
      this.fbr.linkWithGithub().then((result) => {
        if (result === 'ok') {
          this.githubClick = true;
        }
        this.showLinkMessage(result, 'Github');
      });
    } else if (!this.isGithubAddedInFirebase() && this.isProviderAdded(Providers.Github)) {
      this.fbr.linkGithubOnlyInFirebase().then((result) => {
        this.showLinkMessage(result, 'Github');
      });
    }
  }

  linkWithGoogle() {
    this.fbr.linkWithGoogle().then((result) => {
      if (result === 'ok') {
        this.googleClick = true;
      }
      this.showLinkMessage(result, 'Google');
    });
  }

  showLinkMessage(result: string, provider: string) {
    if (result === 'ok') {
      this.toastrService.showSuccess(provider + ' account is successfully added!');
    }
    else {
      this.toastrService.showError(result);
    }
  }

  isProviderAdded(provider: Providers) {
    const check = (item: UserSocialNetwork) => item.providerName === provider;
    return this.details.userSocialNetworks.some(check);
  }

  isGithubAddedInFirebase() {
    return this.authService.isGithubAddedInFirebase();
  }
}
