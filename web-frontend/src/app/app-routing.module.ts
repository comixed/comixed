import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';

import {MainPageComponent} from './main-page/main-page.component';
import {ComicListComponent} from './comic/comic-list/comic-list.component';

const routes: Routes = [
  {path: '', component: MainPageComponent},
  {path: 'library/comics', component: ComicListComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
