import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { UserDecorator } from './decorators/user.decorator';
import { CreateUserDto } from './dto/createUser.dto';
import { LoginUserDto } from './dto/loginUser.dto';
import { UpdateUserDto } from './dto/updateUser.dto';
import { AuthGuard } from './guards/auth.guard';
import { IUserResponse } from './user.interface';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // @Get()
  // async getAllUsers(): Promise<User[]> {
  //   return await this.userService.getAllUsers();
  // }

  @Get()
  @UseGuards(AuthGuard)
  async currententUser(
    // @Req() req: IExpressRequest,
    @UserDecorator() user: User
  ): Promise<User> {
    return this.userService.buildUserResponse(user);
  }

  @Post()
  @UsePipes(new ValidationPipe())
  async createUser(@Body() body: CreateUserDto) {
    const user = await this.userService.createUser(body);
    return this.userService.buildUserResponse(user);
  }

  @Post('login')
  @UsePipes(new ValidationPipe())
  async login(@Body() body: LoginUserDto) {
    const user = await this.userService.login(body);
    return this.userService.buildUserResponse(user);
  }

  @Put()
  @UseGuards(AuthGuard)
  async updateUser(
    @UserDecorator('id') currentUserId: number,
    @Body() updateUserDto: UpdateUserDto
  ): Promise<IUserResponse> {
    console.log('updateUserDto', updateUserDto);
    const user = await this.userService.updateUser(currentUserId, updateUserDto);
    return this.userService.buildUserResponse(user);
  }
}
