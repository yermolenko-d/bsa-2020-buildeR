import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '@core/services/authentication.service';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/auth';
import { UserService } from '@core/services/user.service';
import { RegisterDialogService } from '@core/services/register-dialog.service';
import * as firebase from 'firebase';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.sass']
})
export class SignUpComponent implements OnInit {

  constructor(
    private authService: AuthenticationService,
    private router: Router,
    private angularAuth: AngularFireAuth,
    private userService: UserService,
    private registerDialog: RegisterDialogService
  ) { }

  ngOnInit() {
  }

  signInWithGithub() {
    const githubProvider = new firebase.auth.GithubAuthProvider();
    return this.angularAuth.signInWithPopup(githubProvider).then(
      (auth) => {
        this.login(auth);
      },
      (error) => console.log('Email exist')
    );
  }

  signInWithGoogle() {
    const googleProvider = new firebase.auth.GoogleAuthProvider();
    return this.angularAuth.signInWithPopup(googleProvider).then((auth) => {
      this.login(auth);
    },
      (error) => console.log('Email exist')
    );
  }

  back() {
    this.router.navigate(['/']);
  }

  goSignIn() {
    this.router.navigate(['/signin']);
  }

  login(auth: firebase.auth.UserCredential): void {
    this.userService.login(auth.user.uid)
      .subscribe((resp) => {
        if (resp.body !== null) {
          this.authService.setUser(resp.body);
          this.router.navigate(['/portal']);
        }
        else {
          if (auth.credential.providerId === 'google.com') {
            this.registerDialog.doGoogleSignUp(auth);
          } else {
            this.registerDialog.doGithubSignUp(auth);
          }
        }
      });
  }
}
