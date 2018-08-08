/*
 * ComixEd - A digital comic book library management application.
 * Copyright (C) 2017, The ComiXed Project
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
 * along with this program. If not, see <http://www.gnu.org/licenses/>.package
 * org.comixed;
 */

import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  AbstractControl,
  Validators,
} from '@angular/forms';

import {ComicService} from '../comic/comic.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  login_form: FormGroup;
  email: string;
  password: string;
  error = false;

  constructor(
    private router: Router,
    private comic_service: ComicService,
    private form_builder: FormBuilder,
  ) {
    this.login_form = form_builder.group({
      'email': ['', Validators.compose([
        Validators.required,
        Validators.email,
      ])],
      'password': ['', Validators.compose([
        Validators.required,
        Validators.minLength(6),
      ])],
    });
  }

  ngOnInit() {
  }

  login(): void {
    this.comic_service.login(this.email, this.password,
      () => {
        this.router.navigateByUrl('/home');
      });
  }
}
