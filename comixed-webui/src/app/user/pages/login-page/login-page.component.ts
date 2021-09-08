/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2020, The ComiXed Project
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses>
 */

import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { LoggerService } from '@angular-ru/logger';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { UserModuleState } from '@app/user';
import { Subscription } from 'rxjs';
import { selectUserState } from '@app/user/selectors/user.selectors';
import { loginUser } from '@app/user/actions/user.actions';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { TitleService } from '@app/core/services/title.service';
import { setBusyState } from '@app/core/actions/busy.actions';

@Component({
  selector: 'cx-login',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss']
})
export class LoginPageComponent implements OnInit, OnDestroy, AfterViewInit {
  loginForm: FormGroup;
  userSubscription: Subscription;
  langChangeSubscription: Subscription;
  busy = false;
  private;

  constructor(
    private logger: LoggerService,
    private formBuilder: FormBuilder,
    private store: Store<UserModuleState>,
    private titleService: TitleService,
    private translateService: TranslateService,
    private router: Router
  ) {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(4)]]
    });
    this.userSubscription = this.store
      .select(selectUserState)
      .subscribe(state => {
        this.busy = state.initializing || state.authenticating;
        if (state.authenticated) {
          this.logger.debug('Already authenticated: sending to home');
          this.router.navigateByUrl('/');
        }
      });
    this.langChangeSubscription = this.translateService.onLangChange.subscribe(
      () => this.loadTranslations()
    );
  }

  ngAfterViewInit(): void {
    this.logger.trace('Clear busy mode');
    this.store.dispatch(setBusyState({ enabled: false }));
  }

  ngOnInit(): void {
    this.loadTranslations();
  }

  ngOnDestroy(): void {
    this.userSubscription.unsubscribe();
    this.langChangeSubscription.unsubscribe();
  }

  onSubmitLogin(): void {
    const email = this.loginForm.controls.email.value;
    const password = this.loginForm.controls.password.value;
    this.logger.trace('Attempting to login user:', email);
    this.store.dispatch(loginUser({ email, password }));
  }

  loadTranslations(): void {
    this.titleService.setTitle(this.translateService.instant('login.title'));
  }
}
