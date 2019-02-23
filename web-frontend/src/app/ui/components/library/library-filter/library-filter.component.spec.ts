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
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { FormsModule } from "@angular/forms";
import { TranslateModule } from "@ngx-translate/core";
import { Store, StoreModule } from "@ngrx/store";
import { AppState } from "../../../../app.state";
import { libraryReducer } from "../../../../reducers/library.reducer";
import { PanelModule } from "primeng/panel";
import { ButtonModule } from "primeng/button";
import { LibraryFilterComponent } from "./library-filter.component";

describe("LibraryFilterComponent", () => {
  let component: LibraryFilterComponent;
  let fixture: ComponentFixture<LibraryFilterComponent>;
  let store: Store<AppState>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
        FormsModule,
        TranslateModule.forRoot(),
        StoreModule.forRoot({ library: libraryReducer }),
        PanelModule,
        ButtonModule
      ],
      declarations: [LibraryFilterComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(LibraryFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    store = TestBed.get(Store);
  }));

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
