import {Component, OnInit, ElementRef, ViewChild} from '@angular/core';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.css']
})
export class NavigationComponent implements OnInit {
  @ViewChild('navigationToggle') navigationToggle: ElementRef;
  constructor() {}

  ngOnInit() {
  }

  collapseNavigation() {
    if (this.navigationVisible()) {
      this.navigationToggle.nativeElement.click();
    }
  }

  private navigationVisible() {
    const isVisible: boolean = (this.navigationToggle.nativeElement.offsetParent !== null);
    return isVisible;
  }

}
