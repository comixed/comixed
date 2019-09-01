/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2018, The ComiXed Project
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
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';
import { Store, StoreModule } from '@ngrx/store';
import { TabViewModule } from 'primeng/tabview';
import { CardModule } from 'primeng/card';
import { InplaceModule } from 'primeng/inplace';
import { DropdownModule } from 'primeng/dropdown';
import { PanelModule } from 'primeng/panel';
import { DataViewModule } from 'primeng/dataview';
import { SplitButtonModule } from 'primeng/splitbutton';
import { BlockUIModule } from 'primeng/blockui';
import { ProgressBarModule } from 'primeng/progressbar';
import { TooltipModule } from 'primeng/tooltip';
import { TableModule } from 'primeng/table';
import { ComicOverviewComponent } from 'app/ui/components/comic/comic-overview/comic-overview.component';
import { ComicStoryComponent } from 'app/ui/components/comic/comic-story/comic-story.component';
import { ComicReaderComponent } from 'app/ui/components/comic/comic-reader/comic-reader.component';
import { ComicCreditsComponent } from 'app/ui/components/comic/comic-credits/comic-credits.component';
import { ComicPagesComponent } from 'app/ui/components/comic/comic-pages/comic-pages.component';
import { ComicDetailsEditorComponent } from 'app/ui/components/comic/comic-details-editor/comic-details-editor.component';
import { ComicGroupingCardComponent } from 'app/ui/components/comic/comic-grouping-card/comic-grouping-card.component';
import { VolumeListComponent } from 'app/ui/components/scraping/volume-list/volume-list.component';
import { ComicService } from 'app/services/comic.service';
import { ComicServiceMock } from 'app/services/comic.service.mock';
import { ComicTitlePipe } from 'app/pipes/comic-title.pipe';
import { ComicCoverUrlPipe } from 'app/pipes/comic-cover-url.pipe';
import { ComicPageUrlPipe } from 'app/pipes/comic-page-url.pipe';
import { SINGLE_COMIC_SCRAPING_STATE } from 'app/models/scraping/single-comic-scraping.fixtures';
import { ComicDetailsPageComponent } from './comic-details-page.component';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { ComicDownloadLinkPipe } from 'app/pipes/comic-download-link.pipe';
import { COMIC_1, COMIC_2, COMIC_3, LibraryAdaptor } from 'app/library';
import { UserService } from 'app/services/user.service';
import { UserServiceMock } from 'app/services/user.service.mock';
import { ConfirmationService, MessageService } from 'primeng/api';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ScrapingIssueTitlePipe } from 'app/pipes/scraping-issue-title.pipe';
import { REDUCERS } from 'app/app.reducers';
import { AuthenticationAdaptor } from 'app/user';
import { LibraryModule } from 'app/library/library.module';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { EffectsModule } from '@ngrx/effects';
import { EFFECTS } from 'app/app.effects';
import { UserModule } from 'app/user/user.module';
import { AppState } from 'app/app.state';
import { LibraryGotUpdates } from 'app/library/actions/library.actions';
import { Router } from '@angular/router';

describe('ComicDetailsPageComponent', () => {
  const COMICS = [COMIC_1, COMIC_2, COMIC_3];

  let component: ComicDetailsPageComponent;
  let fixture: ComponentFixture<ComicDetailsPageComponent>;
  let download_link: DebugElement;
  let library_adaptor: LibraryAdaptor;
  let store: Store<AppState>;
  let router: Router;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        UserModule,
        LibraryModule,
        HttpClientTestingModule,
        EffectsModule.forRoot(EFFECTS),
        BrowserAnimationsModule,
        FormsModule,
        ReactiveFormsModule,
        RouterTestingModule,
        TranslateModule.forRoot(),
        StoreModule.forRoot(REDUCERS),
        TabViewModule,
        CardModule,
        InplaceModule,
        DropdownModule,
        PanelModule,
        DataViewModule,
        SplitButtonModule,
        BlockUIModule,
        ProgressBarModule,
        TooltipModule,
        TableModule
      ],
      declarations: [
        ComicDetailsPageComponent,
        ComicOverviewComponent,
        ComicStoryComponent,
        ComicReaderComponent,
        ComicCreditsComponent,
        ComicPagesComponent,
        ComicDetailsEditorComponent,
        ComicGroupingCardComponent,
        VolumeListComponent,
        ComicTitlePipe,
        ComicCoverUrlPipe,
        ComicPageUrlPipe,
        ComicDownloadLinkPipe,
        ScrapingIssueTitlePipe
      ],
      providers: [
        AuthenticationAdaptor,
        MessageService,
        UserService,
        ComicService,
        ConfirmationService,
        { provide: ComicService, useClass: ComicServiceMock },
        { provide: UserService, useClass: UserServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ComicDetailsPageComponent);
    component = fixture.componentInstance;
    store = TestBed.get(Store);
    store.dispatch(
      new LibraryGotUpdates({
        comics: COMICS,
        last_read_dates: [],
        pending_imports: 0,
        pending_rescans: 0
      })
    );
    router = TestBed.get(Router);
    library_adaptor = TestBed.get(LibraryAdaptor);
    library_adaptor._current_comic$.next(COMIC_1);
    component.single_comic_scraping = SINGLE_COMIC_SCRAPING_STATE;

    fixture.detectChanges();

    download_link = fixture.debugElement.query(By.css('#cx-download-link'));
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('download link', () => {
    it('contains a link', () => {
      expect(download_link).toBeTruthy();
    });

    it('the link text is accurate', () => {
      expect(download_link.nativeElement.innerText).toEqual(
        'comic-details-page.text.download-link'
      );
    });
  });

  describe('when setting the series navigation buttons', () => {
    it('enables the previous button when there is a previous issue in the series', () => {
      spyOn(library_adaptor, 'get_previous_issue').and.returnValue(COMIC_2);
      expect(component.disable_previous_button()).toBeFalsy();
      expect(library_adaptor.get_previous_issue).toHaveBeenCalledWith(
        component.comic
      );
    });

    it('disables the previous button when there is no previous issue in the series', () => {
      spyOn(library_adaptor, 'get_previous_issue').and.returnValue(null);
      expect(component.disable_previous_button()).toBeTruthy();
      expect(library_adaptor.get_previous_issue).toHaveBeenCalledWith(
        component.comic
      );
    });

    it('enables the previous button when there is a next issue in the series', () => {
      spyOn(library_adaptor, 'get_next_issue').and.returnValue(COMIC_2);
      expect(component.disable_next_button()).toBeFalsy();
      expect(library_adaptor.get_next_issue).toHaveBeenCalledWith(
        component.comic
      );
    });

    it('disables the previous button when there is no next issue in the series', () => {
      spyOn(library_adaptor, 'get_next_issue').and.returnValue(null);
      expect(component.disable_next_button()).toBeTruthy();
      expect(library_adaptor.get_next_issue).toHaveBeenCalledWith(
        component.comic
      );
    });
  });

  describe('when loading the next comic', () => {
    beforeEach(() => {
      spyOn(library_adaptor, 'get_next_issue').and.returnValue(COMIC_2);
      spyOn(router, 'navigate');
      component.go_to_next_comic();
    });

    it('gets the previous issue', () => {
      expect(library_adaptor.get_next_issue).toHaveBeenCalledWith(
        component.comic
      );
    });

    it('navigates to the previous issue', () => {
      expect(router.navigate).toHaveBeenCalledWith(['comics', COMIC_2.id]);
    });
  });

  describe('when loading the previous comic', () => {
    beforeEach(() => {
      spyOn(library_adaptor, 'get_previous_issue').and.returnValue(COMIC_2);
      spyOn(router, 'navigate');
      component.go_to_previous_comic();
    });

    it('gets the previous issue', () => {
      expect(library_adaptor.get_previous_issue).toHaveBeenCalledWith(
        component.comic
      );
    });

    it('navigates to the previous issue', () => {
      expect(router.navigate).toHaveBeenCalledWith(['comics', COMIC_2.id]);
    });
  });
});
