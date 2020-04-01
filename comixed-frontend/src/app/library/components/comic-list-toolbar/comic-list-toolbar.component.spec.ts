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
 * along with this program. If not, see <http://www.gnu.org/licenses>
 */

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { EffectsModule } from '@ngrx/effects';
import { Store, StoreModule } from '@ngrx/store';
import { TranslateModule } from '@ngx-translate/core';
import { ScrapingAdaptor } from 'app/comics/adaptors/scraping.adaptor';
import { COMIC_1, COMIC_3, COMIC_5 } from 'app/comics/comics.fixtures';
import { ComicsModule } from 'app/comics/comics.module';
import {
  AppState,
  LibraryAdaptor,
  LibraryDisplayAdaptor,
  ReadingListAdaptor,
  SelectionAdaptor
} from 'app/library';
import { LibraryEffects } from 'app/library/effects/library.effects';
import * as fromLibrary from 'app/library/reducers/library.reducer';
import * as fromSelect from 'app/library/reducers/selection.reducer';
import { AuthenticationAdaptor } from 'app/user';
import { LoggerModule } from '@angular-ru/logger';
import {
  ButtonModule,
  CheckboxModule,
  ConfirmationService,
  DropdownModule,
  MessageService,
  ScrollPanelModule,
  SidebarModule,
  SliderModule,
  ToolbarModule,
  TooltipModule,
  TreeModule
} from 'primeng/primeng';
import { ComicListToolbarComponent } from './comic-list-toolbar.component';
import { LibraryNavigationTreeComponent } from 'app/library/components/library-navigation-tree/library-navigation-tree.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('ComicListToolbarComponent', () => {
  const COMICS = [COMIC_1, COMIC_3, COMIC_5];

  let component: ComicListToolbarComponent;
  let fixture: ComponentFixture<ComicListToolbarComponent>;
  let confirmationService: ConfirmationService;
  let scrapingAdaptor: ScrapingAdaptor;
  let selectionAdaptor: SelectionAdaptor;
  let router: Router;
  let store: Store<AppState>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        ComicsModule,
        BrowserAnimationsModule,
        HttpClientTestingModule,
        FormsModule,
        RouterTestingModule,
        TranslateModule.forRoot(),
        LoggerModule.forRoot(),
        StoreModule.forRoot({}),
        StoreModule.forFeature(
          fromLibrary.LIBRARY_FEATURE_KEY,
          fromLibrary.reducer
        ),
        StoreModule.forFeature(
          fromSelect.SELECTION_FEATURE_KEY,
          fromSelect.reducer
        ),
        EffectsModule.forRoot([]),
        EffectsModule.forFeature([LibraryEffects]),
        ToolbarModule,
        ButtonModule,
        TooltipModule,
        DropdownModule,
        SliderModule,
        CheckboxModule,
        SidebarModule,
        TreeModule,
        ScrollPanelModule
      ],
      declarations: [ComicListToolbarComponent, LibraryNavigationTreeComponent],
      providers: [
        AuthenticationAdaptor,
        SelectionAdaptor,
        LibraryAdaptor,
        LibraryDisplayAdaptor,
        ReadingListAdaptor,
        ConfirmationService,
        MessageService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ComicListToolbarComponent);
    component = fixture.componentInstance;
    confirmationService = TestBed.get(ConfirmationService);
    scrapingAdaptor = TestBed.get(ScrapingAdaptor);
    selectionAdaptor = TestBed.get(SelectionAdaptor);
    store = TestBed.get(Store);
    router = TestBed.get(Router);
    spyOn(router, 'navigateByUrl');
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('starting to scrape comics', () => {
    beforeEach(() => {
      component.selectedComics = COMICS;
      component.fireStartScraping();
    });

    it('emits an event', () => {
      component.startScraping.subscribe(response =>
        expect(response).toBeTruthy()
      );
    });
  });
});
