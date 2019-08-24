/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2019, The ComiXed Project
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

import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { By } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateModule } from '@ngx-translate/core';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { PanelModule } from 'primeng/panel';
import { CardModule } from 'primeng/card';
import { ComicTitlePipe } from 'app/pipes/comic-title.pipe';
import { ComicCoverUrlPipe } from 'app/pipes/comic-cover-url.pipe';
import {
  COMIC_1,
  COMIC_FILE_1,
  ImportAdaptor,
  SelectionAdaptor
} from 'app/library';
import { ComicCoverComponent } from './comic-cover.component';
import { StoreModule } from '@ngrx/store';
import { REDUCERS } from 'app/app.reducers';
import { LibraryModule } from 'app/library/library.module';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { EffectsModule } from '@ngrx/effects';
import { EFFECTS } from 'app/app.effects';
import { ComicService } from 'app/services/comic.service';
import { UserService } from 'app/services/user.service';
import { MessageService } from 'primeng/api';

describe('ComicCoverComponent', () => {
  let component: ComicCoverComponent;
  let fixture: ComponentFixture<ComicCoverComponent>;
  let import_adaptor: ImportAdaptor;
  let selection_adaptor: SelectionAdaptor;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        LibraryModule,
        HttpClientTestingModule,
        RouterTestingModule,
        BrowserAnimationsModule,
        StoreModule.forRoot(REDUCERS),
        EffectsModule.forRoot(EFFECTS),
        OverlayPanelModule,
        PanelModule,
        CardModule,
        TranslateModule.forRoot()
      ],
      declarations: [ComicCoverComponent, ComicCoverUrlPipe, ComicTitlePipe],
      providers: [ComicService, UserService, MessageService]
    }).compileComponents();

    fixture = TestBed.createComponent(ComicCoverComponent);
    component = fixture.componentInstance;
    component.cover_size = 200;
    component.same_height = true;
    import_adaptor = TestBed.get(ImportAdaptor);
    selection_adaptor = TestBed.get(SelectionAdaptor);

    fixture.detectChanges();
  }));

  it('creates the component', () => {
    expect(component).toBeTruthy();
  });

  describe('when a selected comic is clicked', () => {
    beforeEach(() => {
      component.comic = COMIC_1;
      component.selected = true;
      spyOn(selection_adaptor, 'deselect_comic');
      component.toggle_selection();
    });

    it('fires an action', () => {
      expect(selection_adaptor.deselect_comic).toHaveBeenCalledWith(COMIC_1);
    });
  });

  describe('when an unselected comic is clicked', () => {
    beforeEach(() => {
      component.comic = COMIC_1;
      component.selected = false;
      spyOn(selection_adaptor, 'select_comic');
      component.toggle_selection();
    });

    it('fires an action', () => {
      expect(selection_adaptor.select_comic).toHaveBeenCalledWith(COMIC_1);
    });
  });

  describe('when a selected comic file is clicked', () => {
    beforeEach(() => {
      component.comic = null;
      component.comic_file = COMIC_FILE_1;
      component.selected = true;
      spyOn(import_adaptor, 'deselect_comic_files');
      component.toggle_selection();
    });

    it('fires an action', () => {
      expect(import_adaptor.deselect_comic_files).toHaveBeenCalledWith([
        COMIC_FILE_1
      ]);
    });
  });

  describe('when an unselected comic file is clicked', () => {
    beforeEach(() => {
      component.comic = null;
      component.comic_file = COMIC_FILE_1;
      component.selected = false;
      spyOn(import_adaptor, 'select_comic_files');
      component.toggle_selection();
    });

    it('fires an action', () => {
      expect(import_adaptor.select_comic_files).toHaveBeenCalledWith([
        COMIC_FILE_1
      ]);
    });
  });

  describe('when the comic is not selected', () => {
    beforeEach(() => {
      component.selected = false;
      fixture.detectChanges();
    });

    it('does not have the selected class on the container', () => {
      const elements = fixture.debugElement.query(By.css('.selected-comic'));
      expect(elements).toBeFalsy();
    });
  });

  describe('when the comic is selected', () => {
    beforeEach(() => {
      component.selected = true;
      fixture.detectChanges();
    });

    it('does not have the selected class on the container', () => {
      const elements = fixture.debugElement.query(By.css('.selected-comic'));
      expect(elements).toBeTruthy();
    });
  });
});
