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
import { RouterTestingModule } from "@angular/router/testing";
import { FormsModule } from "@angular/forms";
import { TranslateModule } from "@ngx-translate/core";
import { Store, StoreModule } from "@ngrx/store";
import { AppState } from "../../../../app.state";
import { libraryDisplayReducer } from "../../../../reducers/library-display.reducer";
import { DataViewModule } from "primeng/dataview";
import { SidebarModule } from "primeng/sidebar";
import { SplitButtonModule } from "primeng/splitbutton";
import { ScrollPanelModule } from "primeng/scrollpanel";
import { SliderModule } from "primeng/slider";
import { CheckboxModule } from "primeng/checkbox";
import { DropdownModule } from "primeng/dropdown";
import { PanelModule } from "primeng/panel";
import { SelectedComicsListComponent } from "../selected-comics-list/selected-comics-list.component";
import { ComicListItemComponent } from "../comic-list-item/comic-list-item.component";
import { ComicGridItemComponent } from "../comic-grid-item/comic-grid-item.component";
import { ComicListToolbarComponent } from "../comic-list-toolbar/comic-list-toolbar.component";
import { ComicCoverComponent } from "../../comic/comic-cover/comic-cover.component";
import { LibraryFilterComponent } from "../library-filter/library-filter.component";
import { ComicCoverUrlPipe } from "../../../../pipes/comic-cover-url.pipe";
import { ComicListComponent } from "./comic-list.component";

describe("ComicListComponent", () => {
  let component: ComicListComponent;
  let fixture: ComponentFixture<ComicListComponent>;
  let store: Store<AppState>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        FormsModule,
        TranslateModule.forRoot(),
        StoreModule.forRoot({ library_display: libraryDisplayReducer }),
        DataViewModule,
        SidebarModule,
        SplitButtonModule,
        ScrollPanelModule,
        SliderModule,
        CheckboxModule,
        DropdownModule,
        PanelModule
      ],
      declarations: [
        ComicListComponent,
        SelectedComicsListComponent,
        ComicListItemComponent,
        ComicGridItemComponent,
        ComicListToolbarComponent,
        ComicCoverComponent,
        LibraryFilterComponent,
        ComicCoverUrlPipe
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ComicListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    store = TestBed.get(Store);
  }));

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
