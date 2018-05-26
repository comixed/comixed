import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';

import {ComicService} from '../comic/comic.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  username: string;
  password: string;
  error: boolean = false;

  constructor(private router: Router, private comicService: ComicService) {}

  ngOnInit() {
  }

  login(): void {
    this.comicService.login(this.username, this.password);
  }
}
