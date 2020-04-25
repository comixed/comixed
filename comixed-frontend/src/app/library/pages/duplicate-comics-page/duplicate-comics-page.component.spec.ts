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
 * along with this program. If not, see <http:/www.gnu.org/licenses>
 */

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DuplicateComicsPageComponent } from './duplicate-comics-page.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ComicListComponent } from 'app/library/components/comic-list/comic-list.component';
import { DialogModule } from 'primeng/dialog';
import { ConvertComicsSettingsComponent } from 'app/library/components/convert-comics-settings/convert-comics-settings.component';
import { ContextMenuModule } from 'primeng/contextmenu';
import { ComicListToolbarComponent } from 'app/library/components/comic-list-toolbar/comic-list-toolbar.component';
import { DataViewModule } from 'primeng/dataview';
import { ComicListItemComponent } from 'app/library/components/comic-list-item/comic-list-item.component';
import { ComicGridItemComponent } from 'app/library/components/comic-grid-item/comic-grid-item.component';
import {
  ButtonModule,
  CardModule,
  CheckboxModule,
  ConfirmationService,
  DropdownModule,
  MessageService,
  ProgressSpinnerModule,
  ScrollPanelModule,
  SidebarModule,
  SliderModule,
  ToolbarModule,
  TooltipModule,
  TreeModule
} from 'primeng/primeng';
import { LibraryNavigationTreeComponent } from 'app/library/components/library-navigation-tree/library-navigation-tree.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  AppState,
  LibraryAdaptor,
  LibraryDisplayAdaptor,
  ReadingListAdaptor,
  SelectionAdaptor
} from 'app/library';
import { Store, StoreModule } from '@ngrx/store';
import {
  LIBRARY_FEATURE_KEY,
  reducer
} from 'app/library/reducers/library.reducer';
import { ComicsModule } from 'app/comics/comics.module';
import { EffectsModule } from '@ngrx/effects';
import { LibraryEffects } from 'app/library/effects/library.effects';
import { LoggerModule } from '@angular-ru/logger';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BreadcrumbAdaptor } from 'app/adaptors/breadcrumb.adaptor';
import { RouterTestingModule } from '@angular/router/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { COMIC_2, COMIC_5 } from 'app/comics/comics.fixtures';
import { LibraryUpdatesReceived } from 'app/library/actions/library.actions';

describe('DuplicateComicsPageComponent', () => {
  const COMIC = COMIC_2;
  const DUPLICATE_COMIC = { ...COMIC_5, duplicateCount: 1 };
  const COMICS = [COMIC, DUPLICATE_COMIC];

  let component: DuplicateComicsPageComponent;
  let fixture: ComponentFixture<DuplicateComicsPageComponent>;
  let breadcrumbAdaptor: BreadcrumbAdaptor;
  let translateService: TranslateService;
  let store: Store<AppState>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        ComicsModule,
        BrowserAnimationsModule,
        HttpClientTestingModule,
        RouterTestingModule.withRoutes([{ path: '*', redirectTo: '' }]),
        FormsModule,
        ReactiveFormsModule,
        LoggerModule.forRoot(),
        TranslateModule.forRoot(),
        StoreModule.forRoot({}),
        StoreModule.forFeature(LIBRARY_FEATURE_KEY, reducer),
        EffectsModule.forRoot([]),
        EffectsModule.forFeature([LibraryEffects]),
        DialogModule,
        ContextMenuModule,
        DataViewModule,
        SidebarModule,
        TooltipModule,
        ButtonModule,
        DropdownModule,
        CheckboxModule,
        SliderModule,
        ToolbarModule,
        TreeModule,
        ScrollPanelModule,
        CardModule,
        ProgressSpinnerModule
      ],
      declarations: [
        DuplicateComicsPageComponent,
        ComicListComponent,
        ComicListToolbarComponent,
        ComicListItemComponent,
        ComicGridItemComponent,
        LibraryNavigationTreeComponent,
        ConvertComicsSettingsComponent
      ],
      providers: [
        LibraryAdaptor,
        LibraryDisplayAdaptor,
        ReadingListAdaptor,
        SelectionAdaptor,
        BreadcrumbAdaptor,
        MessageService,
        ConfirmationService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DuplicateComicsPageComponent);
    component = fixture.componentInstance;
    breadcrumbAdaptor = TestBed.get(BreadcrumbAdaptor);
    translateService = TestBed.get(TranslateService);
    store = TestBed.get(Store);
    spyOn(store, 'dispatch').and.callThrough();

    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('receiving comics', () => {
    beforeEach(() => {
      store.dispatch(
        new LibraryUpdatesReceived({
          comics: COMICS,
          lastComicId: 0,
          lastReadDates: [],
          moreUpdates: false,
          mostRecentUpdate: new Date(),
          processingCount: 0
        })
      );
    });

    it('populates the list of duplicate comics', () => {
      expect(component.duplicates).toEqual([DUPLICATE_COMIC]);
    });
  });

  describe('when the language changes', () => {
    beforeEach(() => {
      spyOn(breadcrumbAdaptor, 'loadEntries');
      translateService.use('fr');
    });

    it('reloads the breadcrumb train', () => {
      expect(breadcrumbAdaptor.loadEntries).toHaveBeenCalled();
    });
  });
});
