import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';

import {MainPageComponent} from './main-page/main-page.component';
import {LoginComponent} from './login/login.component';
import {DuplicatePageListComponent} from './comic/duplicate-page-list/duplicate-page-list.component';
import {ComicListComponent} from './comic/comic-list/comic-list.component';
import {ImportComicListComponent} from './comic/import-comic-list/import-comic-list.component';
import {ComicDetailsComponent} from './comic/comic-details/comic-details.component';

const routes: Routes = [
  {path: 'home', component: MainPageComponent},
  {path: 'login', component: LoginComponent},
  {path: 'duplicates', component: DuplicatePageListComponent},
  {path: 'comics', component: ComicListComponent},
  {path: 'comics/:id', component: ComicDetailsComponent},
  {path: 'import', component: ImportComicListComponent},
  {path: '', redirectTo: 'home', pathMatch: 'full'},
  {path: '**', redirectTo: 'home'},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
