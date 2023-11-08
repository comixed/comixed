/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2023, The ComiXed Project
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

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ComicFileLoaderComponent } from './comic-file-loader.component';
import { LoggerModule } from '@angular-ru/cdk/logger';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { TranslateModule } from '@ngx-translate/core';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTooltipModule } from '@angular/material/tooltip';
import { USER_ADMIN } from '@app/user/user.fixtures';
import { ROOT_DIRECTORY } from '@app/comic-files/comic-file.fixtures';
import { loadComicFileLists } from '@app/comic-files/actions/comic-file-list.actions';

describe('ComicFileLoaderComponent', () => {
  const MAXIMUM = Math.abs(Math.floor(Math.random() * 1000));
  const initialState = {};

  let component: ComicFileLoaderComponent;
  let fixture: ComponentFixture<ComicFileLoaderComponent>;
  let store: MockStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ComicFileLoaderComponent],
      imports: [
        NoopAnimationsModule,
        FormsModule,
        ReactiveFormsModule,
        LoggerModule.forRoot(),
        TranslateModule.forRoot(),
        MatCardModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        MatSelectModule,
        MatTooltipModule
      ],
      providers: [provideMockStore({ initialState })]
    }).compileComponents();

    fixture = TestBed.createComponent(ComicFileLoaderComponent);
    component = fixture.componentInstance;
    component.user = USER_ADMIN;
    store = TestBed.inject(MockStore);
    spyOn(store, 'dispatch');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('loading files', () => {
    beforeEach(() => {
      component.loadFilesForm.controls.rootDirectory.setValue(ROOT_DIRECTORY);
      component.loadFilesForm.controls.maximum.setValue(MAXIMUM);
      component.onLoadFiles();
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        loadComicFileLists({ directory: ROOT_DIRECTORY, maximum: MAXIMUM })
      );
    });
  });
});
