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
import { ToastModule } from "primeng/toast";
import { MessageService } from "primeng/api";
import { AlertService } from "../../../services/alert.service";
import { AlertServiceMock } from "../../../services/alert.service.mock";
import { NotificationsComponent } from "./notifications.component";

describe("NotificationsComponent", () => {
  let component: NotificationsComponent;
  let fixture: ComponentFixture<NotificationsComponent>;
  let message_service: MessageService;
  let alert_service: AlertService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ToastModule],
      declarations: [NotificationsComponent],
      providers: [
        MessageService,
        { provide: AlertService, useClass: AlertServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(NotificationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    message_service = TestBed.get(MessageService);
    alert_service = TestBed.get(AlertService);
  }));

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
