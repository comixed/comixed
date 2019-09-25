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
 *t
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.package
 * org.comixed;
 */

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainMenuComponent } from './components/main-menu/main-menu.component';
import { MenuModule } from 'primeng/menu';
import { ButtonModule } from 'primeng/button';
import { TranslateModule } from '@ngx-translate/core';
import { UserModule } from 'app/user/user.module';
import { TieredMenuModule } from 'primeng/primeng';

@NgModule({
  declarations: [MainMenuComponent],
  imports: [
    CommonModule,
    UserModule,
    TranslateModule.forRoot(),
    TieredMenuModule,
    ButtonModule
  ],
  exports: [CommonModule, MenuModule, ButtonModule, MainMenuComponent]
})
export class ComiXedCommonModule {}
