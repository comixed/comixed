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
import { RouterModule } from "@angular/router";
import { TranslateModule } from "@ngx-translate/core";
import { MenubarModule } from "primeng/menubar";
import { ButtonModule } from "primeng/button";
import { Store, StoreModule } from "@ngrx/store";
import { AppState } from "../../../../app.state";
import { userReducer } from "../../../../reducers/user.reducer";
import { MenubarComponent } from "./menubar.component";

describe("MenubarComponent", () => {
  let component: MenubarComponent;
  let fixture: ComponentFixture<MenubarComponent>;
  let store: Store<AppState>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterModule.forRoot([]),
        TranslateModule.forRoot(),
        MenubarModule,
        ButtonModule,
        StoreModule.forRoot({ user: userReducer })
      ],
      declarations: [MenubarComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MenubarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    store = TestBed.get(Store);
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
