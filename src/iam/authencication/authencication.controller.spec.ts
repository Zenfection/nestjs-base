import { Test, TestingModule } from '@nestjs/testing';
import { AuthencicationController } from './authencication.controller';

describe('AuthencicationController', () => {
  let controller: AuthencicationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthencicationController],
    }).compile();

    controller = module.get<AuthencicationController>(AuthencicationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
