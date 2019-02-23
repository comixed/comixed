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
import { singleComicScrapingReducer } from "../../../../reducers/single-comic-scraping.reducer";
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
import { ADMIN_USER, READER_USER } from "../../../../models/user/user.fixtures";
import { ComicDetailsEditorComponent } from "./comic-details-editor.component";

xdescribe("ComicDetailsEditorComponent", () => {
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
    component.user = ADMIN_USER;

    fixture.detectChanges();

    alert_service = TestBed.get(AlertService);
    user_service = TestBed.get(UserService);
    comic_service = TestBed.get(ComicService);
    store = TestBed.get(Store);
  }));

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
