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

import { Component, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-menubar',
  templateUrl: './menubar.component.html',
  styleUrls: ['./menubar.component.css']
})
export class MenubarComponent implements OnInit {
  CORE_MENU_ITEMS: MenuItem[] = [
    {
      label: 'Home',
      icon: 'fas fa-home',
      routerLink: ['/home'],
    },
    {
      label: 'Comics',
      icon: 'fas fa-book',
      items: [
        {
          label: 'Library',
          icon: 'fas fa-book-reader',
          routerLink: ['/comics'],
        },
        {
          label: 'Import',
          icon: 'fas fa-file-upload',
          routerLink: ['/import'],
        },
        { separator: true },
        {
          label: 'Duplicate pages',
          icon: 'fas fa-fingerprint',
          routerLink: ['/duplicates'],
        }
      ]
    }
  ];

  items: MenuItem[];

  constructor() { }

  ngOnInit() {
    this.items = this.CORE_MENU_ITEMS;
  }
}
