import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { sign } from 'jsonwebtoken';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/createUser.dto';
import { UpdateUserDto } from './dto/updateUser.dto';
import { ILoginResponse, IUserResponse } from './user.interface';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async getAllUsers(): Promise<User[]> {
    return await this.prisma.user.findMany({
      include: { role: true },
    });
  }

  async findByUserName(userName: string): Promise<User | null> {
    return await this.prisma.user.findUnique({ where: { userName } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.prisma.user.findUnique({ where: { email } });
  }

  async findById(id: number): Promise<User | null> {
    return await this.prisma.user.findUnique({ where: { id } });
  }

  async createUser(data: CreateUserDto): Promise<User> {
    // Проверяем, существует ли пользователь с таким userName и email
    const existingUserByUserName = await this.prisma.user.findUnique({
      where: { userName: data.userName },
    });

    const existingUserByEmail = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUserByUserName || existingUserByEmail) {
      throw new HttpException(
        'The user with this name or email already exists',
        HttpStatus.UNPROCESSABLE_ENTITY
      );
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    return await this.prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
      },
    });
  }

  generateToken(user: User): string {
    return sign(
      {
        userName: user.userName,
        email: user.email,
        roleId: user.roleId,
      },
      process.env.JWT_SECRET
    );
  }

  buildUserResponse(user: User): IUserResponse {
    return {
      ...user,
      token: this.generateToken(user),
    };
  }

  async login(data: ILoginResponse): Promise<User> {
    const user = await this.findByEmail(data.email);

    const isPasswordValid = user && (await bcrypt.compare(data.password, user.password));

    if (!isPasswordValid) {
      throw new HttpException('Invalid email or password', HttpStatus.UNAUTHORIZED);
    }

    delete user.password; // !!! надо переделать

    return user;
  }

  async updateUser(id: number, data: UpdateUserDto): Promise<User> {
    const user = await this.findById(id);
    console.log('data', data);

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    // Копируем все поля, кроме пароля
    const updatedData: any = { ...data };

    // Если в запросе есть новый пароль — хешируем его
    if (data.password) {
      updatedData.password = await bcrypt.hash(data.password, 10);
    }

    return await this.prisma.user.update({
      where: { id },
      data: updatedData,
    });
  }
}
