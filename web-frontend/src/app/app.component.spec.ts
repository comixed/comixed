/*
 * ComiXed - A digital comic book library management application.
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

import {
  ComponentFixture,
  TestBed,
  async,
  fakeAsync,
  tick
} from "@angular/core/testing";
import { DebugElement } from "@angular/core";
import { By } from "@angular/platform-browser";

import { HttpClientModule } from "@angular/common/http";
import { RouterTestingModule } from "@angular/router/testing";
import { Router } from "@angular/router";

import { Observable } from "rxjs/Observable";
import "rxjs/add/observable/of";

import { AlertService } from "./services/alert.service";
import { UserService } from "./services/user.service";
import { UserServiceMock } from "./services/user.service.mock";
import { User } from "./models/user/user";
import { Role } from "./models/user/role";
import { ComicService } from "./services/comic.service";
import { ComicServiceMock } from "./services/comic.service.mock";
import { LoadingModule } from "ngx-loading";

import { AppComponent } from "./app.component";

describe("AppComponent", () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let user_service: UserService;
  let alert_service: AlertService;
  let comic_service: ComicService;
  let router: Router;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, HttpClientModule, LoadingModule],
      declarations: [AppComponent],
      providers: [
        AlertService,
        { provide: UserService, useClass: UserServiceMock },
        { provide: ComicService, useClass: ComicServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;

    user_service = TestBed.get(UserService);
    alert_service = TestBed.get(AlertService);
    comic_service = TestBed.get(ComicService);
    router = TestBed.get(Router);

    fixture.detectChanges();
    router.initialNavigation();
  }));
});
