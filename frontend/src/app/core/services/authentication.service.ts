import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { User } from '@shared/models/user/user';
import * as firebase from 'firebase';
import { UserService } from './user.service';
import { NewUser } from '@shared/models/user/new-user';
import { Providers } from '@shared/models/providers';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { RegistrationDialogComponent } from '@core/components/registration-dialog/registration-dialog.component';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  user: firebase.User;
  currentUser: User = undefined;
  constructor(
    private angularAuth: AngularFireAuth,
    private userService: UserService,
    private modalService: NgbModal,
    private router: Router) {
    this.angularAuth.authState.subscribe(user => {
      this.configureAuthState(user);
    });
  }

  configureAuthState(user: firebase.User): void {
    if (user) {
      user.getIdToken().then((theToken) => {
        this.user = user;
        localStorage.setItem('user', JSON.stringify(this.user));
        localStorage.setItem('jwt', theToken);
      });
    }
    else {
      this.user = null;
    }
  }


  doGoogleSignIn(): Promise<void> {
    const googleProvider = new firebase.auth.GoogleAuthProvider();
    return this.angularAuth.signInWithPopup(googleProvider).then((auth) => {
      this.isUidExist(auth);
    });
  }

  doGithubSignIn(): Promise<void> {
    const githubProvider = new firebase.auth.GithubAuthProvider();
    return this.angularAuth.signInWithPopup(githubProvider).then((auth) => {
      this.isUidExist(auth);
    });
  }

  isUidExist(auth: firebase.auth.UserCredential): void {
    this.userService.getUserByUId(auth.user.uid)
      .subscribe((resp) => {
        if (resp.body !== null) {
          this.currentUser = resp.body;
          this.router.navigate(['/portal']);
        }
        else {
          if (auth.credential.providerId === 'google.com') {
            this.doGoogleSignUp(auth);
          } else {
            this.doGithubSignUp(auth);
          }
        }
      });
  }

  doGoogleSignUp(credential: firebase.auth.UserCredential) {
    const user = {
      email: credential.user.email,
      username: credential.user.displayName,
      avatarUrl: credential.user.photoURL,
      firstName: credential.additionalUserInfo.profile[`given_name`],
      lastName: credential.additionalUserInfo.profile[`family_name`],
      providerId: Providers.Google,
      uId: credential.user.uid,
      providerUrl: credential.credential.providerId
    } as NewUser;

    const modalRef = this.modalService.open(RegistrationDialogComponent/*, {backdrop: 'static', keyboard: false}*/);
    modalRef.componentInstance.details = user;
  }

  registerUser(user: NewUser) {
    this.userService.createUser(user).subscribe(
      (resp) => {
        this.currentUser = resp.body;
        this.router.navigate(['/portal']);
      },
      (error) => console.log(error));
  }

  doGithubSignUp(credential: firebase.auth.UserCredential) {
    const user = {
      email: credential.user.email,
      username: credential.additionalUserInfo.username,
      avatarUrl: credential.user.photoURL,
      providerId: Providers.Github,
      uId: credential.user.uid,
      providerUrl: credential.credential.providerId
    } as NewUser;

    const name: string = credential.additionalUserInfo.profile[`name`];
    if (name != null) {
      [user.firstName, user.lastName = ''] = name.split(' ');
    }

    const modalRef = this.modalService.open(RegistrationDialogComponent, {backdrop: 'static', keyboard: false});
    modalRef.componentInstance.details = user;
  }

  logout(): Promise<void> {
    localStorage.removeItem('user');
    localStorage.removeItem('jwt');
    this.router.navigate(['/']);
    return this.angularAuth.signOut();
  }

  getToken(): string {
    return localStorage.getItem('jwt');
  }

  getUser(): User {
    return this.currentUser;
  }

  public isAuthorized() {
    if (this.currentUser === undefined) {

      this.router.navigate(['/']);
      return false;
    }
    return true;
  }
}
