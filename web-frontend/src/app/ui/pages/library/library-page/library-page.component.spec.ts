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

import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { FormsModule } from "@angular/forms";
import { RouterTestingModule } from "@angular/router/testing";
import { TranslateModule } from "@ngx-translate/core";
import { Store, StoreModule } from "@ngrx/store";
import { AppState } from "../../../../app.state";
import { libraryReducer } from "../../../../reducers/library.reducer";
import { libraryFilterReducer } from "../../../../reducers/library-filter.reducer";
import { ConfirmDialogModule } from "primeng/confirmdialog";
import { ButtonModule } from "primeng/button";
import { ToolbarModule } from "primeng/toolbar";
import { DataViewModule } from "primeng/dataview";
import { SliderModule } from "primeng/slider";
import { ConfirmationService } from "primeng/api";
import { CheckboxModule } from "primeng/checkbox";
import { DropdownModule } from "primeng/dropdown";
import { PanelModule } from "primeng/panel";
import { SidebarModule } from "primeng/sidebar";
import { SplitButtonModule } from "primeng/splitbutton";
import { ScrollPanelModule } from "primeng/scrollpanel";
import { ComicListComponent } from "../../../components/library/comic-list/comic-list.component";
import { ComicListToolbarComponent } from "../../../components/library/comic-list-toolbar/comic-list-toolbar.component";
import { LibraryFilterComponent } from "../../../components/library/library-filter/library-filter.component";
import { ComicListItemComponent } from "../../../components/library/comic-list-item/comic-list-item.component";
import { ComicGridItemComponent } from "../../../components/library/comic-grid-item/comic-grid-item.component";
import { ComicCoverComponent } from "../../../components/comic/comic-cover/comic-cover.component";
import { SelectedComicsListComponent } from "../../../components/library/selected-comics-list/selected-comics-list.component";
import { LibraryFilterPipe } from "../../../../pipes/library-filter.pipe";
import { ComicCoverUrlPipe } from "../../../../pipes/comic-cover-url.pipe";
import { UserService } from "../../../../services/user.service";
import { UserServiceMock } from "../../../../services/user.service.mock";
import { ComicService } from "../../../../services/comic.service";
import { ComicServiceMock } from "../../../../services/comic.service.mock";
import { LibraryPageComponent } from "./library-page.component";

xdescribe("LibraryPageComponent", () => {
  let component: LibraryPageComponent;
  let fixture: ComponentFixture<LibraryPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        RouterTestingModule,
        TranslateModule.forRoot(),
        StoreModule.forRoot({
          library: libraryReducer,
          library_filter: libraryFilterReducer
        }),
        ConfirmDialogModule,
        ButtonModule,
        ToolbarModule,
        DataViewModule,
        SliderModule,
        CheckboxModule,
        DropdownModule,
        PanelModule,
        SidebarModule,
        SplitButtonModule,
        ScrollPanelModule
      ],
      declarations: [
        LibraryPageComponent,
        ComicListComponent,
        ComicListToolbarComponent,
        LibraryFilterComponent,
        ComicListItemComponent,
        ComicGridItemComponent,
        SelectedComicsListComponent,
        ComicCoverComponent,
        LibraryFilterPipe,
        ComicCoverUrlPipe
      ],
      providers: [
        ConfirmationService,
        { provide: UserService, useClass: UserServiceMock },
        { provide: ComicService, useClass: ComicServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LibraryPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
