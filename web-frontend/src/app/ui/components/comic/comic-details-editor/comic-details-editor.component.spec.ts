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

import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { RouterTestingModule } from "@angular/router/testing";
import { FormsModule } from "@angular/forms";
import { TranslateModule } from "@ngx-translate/core";
import { Store, StoreModule } from "@ngrx/store";
import { AppState } from "../../../../app.state";
import { userReducer } from "../../../../reducers/user.reducer";
import * as UserActions from "../../../../actions/user.actions";
import { ADMIN_USER, READER_USER } from "../../../../models/user/user.fixtures";
import { singleComicScrapingReducer } from "../../../../reducers/single-comic-scraping.reducer";
import * as ScrapingActions from "../../../../actions/single-comic-scraping.actions";
import { SINGLE_COMIC_SCRAPING_STATE } from "../../../../models/scraping/single-comic-scraping.fixtures";
import {
  COMIC_1000,
  COMIC_1001
} from "../../../../models/comics/comic.fixtures";
import { VOLUME_1000 } from "../../../../models/comics/volume.fixtures";
import { ISSUE_1000 } from "../../../../models/scraping/issue.fixtures";
import { ButtonModule } from "primeng/button";
import { SplitButtonModule } from "primeng/splitbutton";
import { BlockUIModule } from "primeng/blockui";
import { ProgressBarModule } from "primeng/progressbar";
import { TooltipModule } from "primeng/tooltip";
import { InplaceModule } from "primeng/inplace";
import { TableModule } from "primeng/table";
import { CardModule } from "primeng/card";
import { AlertService } from "../../../../services/alert.service";
import { AlertServiceMock } from "../../../../services/alert.service.mock";
import { UserService } from "../../../../services/user.service";
import { UserServiceMock } from "../../../../services/user.service.mock";
import { ComicService } from "../../../../services/comic.service";
import { ComicServiceMock } from "../../../../services/comic.service.mock";
import { VolumeListComponent } from "../../scraping/volume-list/volume-list.component";
import { ComicDetailsEditorComponent } from "./comic-details-editor.component";

fdescribe("ComicDetailsEditorComponent", () => {
  const COMICVINE_API_KEY = "1234567890";
  let component: ComicDetailsEditorComponent;
  let fixture: ComponentFixture<ComicDetailsEditorComponent>;
  let alert_service: AlertService;
  let user_service: UserService;
  let comic_service: ComicService;
  let store: Store<AppState>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        FormsModule,
        TranslateModule.forRoot(),
        StoreModule.forRoot({
          user: userReducer,
          single_comic_scraping: singleComicScrapingReducer
        }),
        ButtonModule,
        SplitButtonModule,
        BlockUIModule,
        ProgressBarModule,
        TooltipModule,
        InplaceModule,
        TableModule,
        CardModule
      ],
      declarations: [ComicDetailsEditorComponent, VolumeListComponent],
      providers: [
        { provide: AlertService, useClass: AlertServiceMock },
        { provide: UserService, useClass: UserServiceMock },
        { provide: ComicService, useClass: ComicServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ComicDetailsEditorComponent);
    component = fixture.componentInstance;

    alert_service = TestBed.get(AlertService);
    user_service = TestBed.get(UserService);
    comic_service = TestBed.get(ComicService);
    store = TestBed.get(Store);

    spyOn(store, "dispatch").and.callThrough();

    fixture.detectChanges();
  }));

  describe("#ngOnInit()", () => {
    it("should subscribe to changes in the current user", () => {
      store.dispatch(new UserActions.UserLoaded({ user: ADMIN_USER }));

      expect(component.user.email).toEqual(ADMIN_USER.email);
    });

    it("should subscribe to changes in the scraping data", () => {
      store.dispatch(
        new ScrapingActions.SingleComicScrapingSetup({
          api_key: COMICVINE_API_KEY,
          comic: COMIC_1000,
          series: COMIC_1000.series,
          volume: COMIC_1000.volume,
          issue_number: COMIC_1000.issue_number
        })
      );

      expect(component.api_key).toEqual(COMICVINE_API_KEY);
      expect(component.series).toEqual(COMIC_1000.series);
      expect(component.volume).toEqual(COMIC_1000.volume);
      expect(component.issue_number).toEqual(COMIC_1000.issue_number);
    });
  });

  describe("#comic", () => {
    beforeEach(() => {
      component.comic = COMIC_1001;
    });

    it("sets a new value for the series", () => {
      expect(component.series).toEqual(COMIC_1001.series);
    });

    it("sets a new value for the volume", () => {
      expect(component.volume).toEqual(COMIC_1001.volume);
    });

    it("sets a new value for the issue number", () => {
      expect(component.issue_number).toEqual(COMIC_1001.issue_number);
    });
  });

  describe("#fetch_candidates()", () => {
    beforeEach(() => {
      component.api_key = COMICVINE_API_KEY;
      component.comic = COMIC_1001;
    });

    it("sets the skip_cache to false when supplied", () => {
      component.fetch_candidates(false);

      expect(component.skip_cache).toBeFalsy();
      expect(store.dispatch).toHaveBeenCalledWith(
        new ScrapingActions.SingleComicScrapingFetchVolumes({
          api_key: COMICVINE_API_KEY,
          series: COMIC_1001.series,
          volume: COMIC_1001.volume,
          issue_number: COMIC_1001.issue_number,
          skip_cache: false
        })
      );
    });

    it("sets the skip_cache to true when supplied", () => {
      component.fetch_candidates(true);

      expect(component.skip_cache).toBeTruthy();
      expect(store.dispatch).toHaveBeenCalledWith(
        new ScrapingActions.SingleComicScrapingFetchVolumes({
          api_key: COMICVINE_API_KEY,
          series: COMIC_1001.series,
          volume: COMIC_1001.volume,
          issue_number: COMIC_1001.issue_number,
          skip_cache: true
        })
      );
    });
  });

  describe("#select_volume()", () => {
    beforeEach(() => {
      component.api_key = COMICVINE_API_KEY;
      component.comic = COMIC_1001;
    });

    it("handles when a volume is selected", () => {
      component.select_volume(VOLUME_1000);
      expect(store.dispatch).toHaveBeenCalledWith(
        new ScrapingActions.SingleComicScrapingSetCurrentVolume({
          api_key: COMICVINE_API_KEY,
          volume: VOLUME_1000,
          issue_number: COMIC_1001.issue_number,
          skip_cache: component.skip_cache
        })
      );
    });

    it("handles when a volume is deselected", () => {
      component.select_volume(null);
      expect(store.dispatch).toHaveBeenCalledWith(
        new ScrapingActions.SingleComicScrapingClearCurrentVolume()
      );
    });
  });

  describe("#select_issue()", () => {
    beforeEach(() => {
      component.api_key = COMICVINE_API_KEY;
      component.comic = COMIC_1000;
      component.single_comic_scraping = SINGLE_COMIC_SCRAPING_STATE;
      component.single_comic_scraping.current_issue = ISSUE_1000;
    });

    it("notifies the store to fetch the issue's metadata", () => {
      component.select_issue();

      expect(store.dispatch).toHaveBeenCalledWith(
        new ScrapingActions.SingleComicScrapingScrapeMetadata({
          api_key: COMICVINE_API_KEY,
          comic: COMIC_1000,
          issue_id: ISSUE_1000.id,
          skip_cache: false,
          multi_comic_mode: false
        })
      );
    });
  });

  describe("#cancel_selection()", () => {
    beforeEach(() => {
      component.api_key = COMICVINE_API_KEY;
      component.comic = COMIC_1000;
      component.single_comic_scraping = SINGLE_COMIC_SCRAPING_STATE;
      component.single_comic_scraping.current_issue = ISSUE_1000;
    });

    it("resets the scraping setup", () => {
      component.cancel_selection();

      expect(store.dispatch).toHaveBeenCalledWith(
        new ScrapingActions.SingleComicScrapingSetup({
          api_key: COMICVINE_API_KEY,
          comic: COMIC_1000,
          series: COMIC_1000.series,
          volume: COMIC_1000.volume,
          issue_number: COMIC_1000.issue_number
        })
      );
    });
  });
});
