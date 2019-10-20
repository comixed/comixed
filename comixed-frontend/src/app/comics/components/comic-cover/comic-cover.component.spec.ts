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
import { ComicTitlePipe } from 'app/comics/pipes/comic-title.pipe';
import { ComicCoverUrlPipe } from 'app/comics/pipes/comic-cover-url.pipe';
import { ComicCoverComponent } from './comic-cover.component';
import { StoreModule } from '@ngrx/store';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { EffectsModule } from '@ngrx/effects';
import { COMIC_1 } from 'app/comics/models/comic.fixtures';
import { MessageService } from 'primeng/api';
import { COMIC_FILE_1 } from 'app/comic-import/models/comic-file.fixtures';

describe('ComicCoverComponent', () => {
  let component: ComicCoverComponent;
  let fixture: ComponentFixture<ComicCoverComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule,
        BrowserAnimationsModule,
        TranslateModule.forRoot(),
        StoreModule.forRoot({}),
        EffectsModule.forRoot([]),
        OverlayPanelModule,
        PanelModule,
        CardModule
      ],
      declarations: [ComicCoverComponent, ComicCoverUrlPipe, ComicTitlePipe],
      providers: [MessageService]
    }).compileComponents();

    fixture = TestBed.createComponent(ComicCoverComponent);
    component = fixture.componentInstance;
    component.cover_url = 'http://localhost/cover.png';
    component.cover_size = 200;
    component.same_height = true;
    fixture.detectChanges();
  }));

  it('creates the component', () => {
    expect(component).toBeTruthy();
  });

  it('emits an event when clicked with a comic', () => {
    component.comic = COMIC_1;
    component.clicked();
    component.click.subscribe(result => expect(result).toEqual(COMIC_1));
  });

  it('fires an event when clicked with an selected comic file', () => {
    component.comic_file = COMIC_FILE_1;
    component.clicked();
    component.click.subscribe(result => expect(result).toEqual(COMIC_FILE_1));
  });

  describe('when the comic is not selected', () => {
    beforeEach(() => {
      component.comic = COMIC_1;
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
      component.comic = COMIC_1;
      component.selected = true;
      fixture.detectChanges();
    });

    it('does not have the selected class on the container', () => {
      const elements = fixture.debugElement.query(By.css('.selected-comic'));
      expect(elements).toBeTruthy();
    });
  });
});
