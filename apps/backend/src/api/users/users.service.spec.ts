/* eslint-disable prettier/prettier */
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { JwtService } from '@nestjs/jwt';
import { getModelToken } from '@nestjs/mongoose';

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken('User'), // Match your model name
          useValue: {
            findOne: jest.fn(), // Add more mocks as needed
            create: jest.fn(),
            loginAdmin: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn().mockResolvedValue('mocked_token'),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('Successfully logs in as ADMIN', async () => {
    const result = await service.loginAdmin();
    expect(result).toEqual({
      _id: 0,
      access_token: 'mocked_token',
      first_name: 'ADMIN',
      last_name: 'ADMIN',
      email: 'ADMIN',
      role: 'ADMIN',
    });
  });
});
