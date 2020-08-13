import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '@core/services/authentication.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.sass']
})
export class SignUpComponent implements OnInit {

  constructor(private authService: AuthenticationService, private router: Router) { }

  ngOnInit() {
  }

  signInWithGithub() {
    this.authService.doGithubSignIn();
  }

  signInWithGoogle() {
    this.authService.doGoogleSignIn();
  }

  back() {
    this.router.navigate(['/']);
  }

  goSignIn() {
    this.router.navigate(['/signin']);
  }
}
