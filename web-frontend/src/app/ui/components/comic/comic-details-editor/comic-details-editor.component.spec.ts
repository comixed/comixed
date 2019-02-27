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
});
