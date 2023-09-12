import { Test, TestingModule } from '@nestjs/testing';
import { AuthencicationService } from './authencication.service';

describe('AuthencicationService', () => {
  let service: AuthencicationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthencicationService],
    }).compile();

    service = module.get<AuthencicationService>(AuthencicationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
