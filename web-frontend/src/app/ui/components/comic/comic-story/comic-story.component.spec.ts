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
import { RouterTestingModule } from "@angular/router/testing";
import { TranslateModule } from "@ngx-translate/core";
import { DataViewModule } from "primeng/dataview";
import { PanelModule } from "primeng/panel";
import { CardModule } from "primeng/card";
import { ComicGroupingCardComponent } from "../comic-grouping-card/comic-grouping-card.component";
import { ComicStoryComponent } from "./comic-story.component";

describe("ComicStoryComponent", () => {
  let component: ComicStoryComponent;
  let fixture: ComponentFixture<ComicStoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        TranslateModule.forRoot(),
        DataViewModule,
        PanelModule,
        CardModule
      ],
      declarations: [ComicStoryComponent, ComicGroupingCardComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ComicStoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
