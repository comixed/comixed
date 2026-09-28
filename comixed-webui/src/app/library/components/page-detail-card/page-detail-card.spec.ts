import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PageDetailCard } from './page-detail-card';
import { COMIC_PAGE_1 } from '@app/library/library-fixtures';

describe('PageDetailCard', () => {
  const TEST_PAGE = COMIC_PAGE_1;

  let component: PageDetailCard;
  let fixture: ComponentFixture<PageDetailCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageDetailCard]
    }).compileComponents();

    fixture = TestBed.createComponent(PageDetailCard);
    component = fixture.componentInstance;
    component.page = TEST_PAGE;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
