import { TestBed } from '@angular/core/testing';

import { CreateFormUtilityService } from './create-form-utility.service';

describe('CreateFormUtilityService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CreateFormUtilityService = TestBed.get(CreateFormUtilityService);
    expect(service).toBeTruthy();
  });
});
