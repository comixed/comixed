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
import { InplaceModule } from "primeng/inplace";
import { DropdownModule } from "primeng/dropdown";
import { userAdminReducer } from "../../../../reducers/user-admin.reducer";
import { COMIC_1000 } from "../../../../models/comics/comic.fixtures";
import { EXISTING_LIBRARY } from "../../../../models/actions/library.fixtures";
import { ComicOverviewComponent } from "./comic-overview.component";

describe("ComicOverviewComponent", () => {
  let component: ComicOverviewComponent;
  let fixture: ComponentFixture<ComicOverviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        RouterTestingModule,
        TranslateModule.forRoot(),
        StoreModule.forRoot({ user_admin: userAdminReducer }),
        InplaceModule,
        DropdownModule
      ],
      declarations: [ComicOverviewComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ComicOverviewComponent);
    component = fixture.componentInstance;
    component.is_admin = false;
    component.comic = COMIC_1000;
    component.library = EXISTING_LIBRARY;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
