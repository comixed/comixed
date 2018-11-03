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
  async,
  ComponentFixture,
  TestBed,
} from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from "@angular/router/testing";
import { Router } from "@angular/router";

import { ComicService } from '../comic/comic.service';
import { AlertService } from '../services/alert.service';

import { MainPageComponent } from './main-page.component';

describe('MainPageComponent', () => {
  let component: MainPageComponent;
  let fixture: ComponentFixture<MainPageComponent>;
  let debugElement: DebugElement;
  let comic_service: ComicService;
  let alert_service: AlertService;
  let router: Router;

  const routes = [
  ];

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes(routes),
      ],
      declarations: [
        MainPageComponent,
      ],
      providers: [
        AlertService,
        ComicService,
      ],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MainPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    comic_service = debugElement.injector.get(ComicService);
    alert_service = debugElement.injector.get(AlertService);
    router = debugElement.injector.get(Router);
  });

  it('should show the current library size', () => {
    expect(true).toBe(false);
  });

  it('should show an error when the library size call fails', () => {
    expect(true).toBe(false);
  });

  it('should show the duplicate page count', () => {
    expect(true).toBe(false);
  });

  it('should show an error when the dupliate page call fails', () => {
    expect(true).toBe(false);
  });

  it('sends the user to the duplicates page', () => {
    expect(true).toBe(false);
  });
});
