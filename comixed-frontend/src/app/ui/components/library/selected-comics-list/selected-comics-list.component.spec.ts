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

import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { RouterTestingModule } from "@angular/router/testing";
import { TranslateModule } from "@ngx-translate/core";
import { Store, StoreModule } from "@ngrx/store";
import { AppState } from "../../../../app.state";
import { libraryReducer } from "../../../../reducers/library.reducer";
import { SidebarModule } from "primeng/sidebar";
import { ScrollPanelModule } from "primeng/scrollpanel";
import { DataViewModule } from "primeng/dataview";
import { SplitButtonModule } from "primeng/splitbutton";
import { OverlayPanelModule } from "primeng/overlaypanel";
import { PanelModule } from "primeng/panel";
import { CardModule } from "primeng/card";
import { ComicGridItemComponent } from "../comic-grid-item/comic-grid-item.component";
import { ComicCoverComponent } from "../../comic/comic-cover/comic-cover.component";
import { ComicCoverUrlPipe } from "../../../../pipes/comic-cover-url.pipe";
import { ComicTitlePipe } from "../../../../pipes/comic-title.pipe";
import { SelectedComicsListComponent } from "./selected-comics-list.component";

describe("SelectedComicsListComponent", () => {
  let component: SelectedComicsListComponent;
  let fixture: ComponentFixture<SelectedComicsListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
        RouterTestingModule,
        TranslateModule.forRoot(),
        StoreModule.forRoot({ library: libraryReducer }),
        SidebarModule,
        ScrollPanelModule,
        DataViewModule,
        SplitButtonModule,
        OverlayPanelModule,
        PanelModule,
        CardModule
      ],
      declarations: [
        SelectedComicsListComponent,
        ComicGridItemComponent,
        ComicCoverComponent,
        ComicCoverUrlPipe,
        ComicTitlePipe
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectedComicsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
