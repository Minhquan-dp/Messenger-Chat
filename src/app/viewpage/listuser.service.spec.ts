import { TestBed } from '@angular/core/testing';

import { ListUserService } from './listuser.service';

describe('ListuserService', () => {
  let service: ListUserService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ListUserService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
