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

import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ComicOverviewComponent } from './comic-overview.component';
import { LoggerModule } from '@angular-ru/logger';
import { ComicCoverUrlPipe } from '@app/comic/pipes/comic-cover-url.pipe';
import { TranslateModule } from '@ngx-translate/core';
import { COMIC_1 } from '@app/comic/comic.fixtures';
import { RouterTestingModule } from '@angular/router/testing';

describe('ComicOverviewComponent', () => {
  const COMIC = COMIC_1;

  let component: ComicOverviewComponent;
  let fixture: ComponentFixture<ComicOverviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ComicOverviewComponent, ComicCoverUrlPipe],
      imports: [
        LoggerModule.forRoot(),
        TranslateModule.forRoot(),
        RouterTestingModule.withRoutes([
          {
            path: '*',
            redirectTo: ''
          }
        ])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ComicOverviewComponent);
    component = fixture.componentInstance;
    component.comic = COMIC;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
