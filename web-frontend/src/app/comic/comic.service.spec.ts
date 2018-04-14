import { TestBed, inject } from '@angular/core/testing';

import { ComicService } from './comic.service';

describe('ComicService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ComicService]
    });
  });

  it('should be created', inject([ComicService], (service: ComicService) => {
    expect(service).toBeTruthy();
  }));
});
