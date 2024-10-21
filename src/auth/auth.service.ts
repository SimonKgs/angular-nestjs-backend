import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import * as bcrypt from 'bcryptjs'

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-auth.dto';
import { User } from './entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interfaces/jwt-payload';
import { LoginResponse } from './interfaces/login-response';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {

  constructor(
    @InjectModel(User.name) 
    private userModel: Model<User>,
    private jwtService: JwtService 
  ){}

  async create(createUserDto: CreateUserDto): Promise<Omit<User, 'password'>> {
    try {

      const { password, ...userData } = createUserDto;
      
      // 1 - Encrypt password
      const newUser = new this.userModel({
        ...userData,
        password: bcrypt.hashSync(password, 10)
      });

      // 2- save user
      await newUser.save()

      const { password:_, ...user } = newUser.toJSON();

      return user;

      // 3- Generate JWT


    } catch (error) {
      console.log(error);
      
      if (error.code === 11000 ) {
        throw new BadRequestException(`${ createUserDto.email } already exists!`)
      }
      throw new InternalServerErrorException('Something was wrong')
    }
  }


  async register(registerDto: RegisterDto): Promise<LoginResponse> {
      
    const user = await this.create(registerDto);
          
    return {
      user,
      token: this.getJWT({ id: user._id.toString()})
    }

  }



  async login( loginDto: LoginDto): Promise<LoginResponse> {
    const { password, email } = loginDto;

    const user = await this.userModel.findOne({ email })

    if (!user )
      throw new UnauthorizedException('Not valid credentials')

    if (!bcrypt.compareSync(password, user.password))
      throw new UnauthorizedException('Not valid credentials')

    const { password:_, ...userData } = user.toJSON();
    
    return {
      user: userData,
      token: this.getJWT({ id: user.id})
    }
  }

  // returns an array of users without password
  async findAll(): Promise<Array<Omit<User, 'password'>>> {
    const users = await this.userModel.find().lean();

    const finalUsers = users.map( ( fullUser ) => {
      
      const {password:_, ...user  } = fullUser

      return user

    })
      
    return finalUsers
  }

  async findUserById(id: string) {
    const fullUser = await this.userModel.findById( id );

    const {password:_, ...user  } = fullUser.toJSON()

    return user
  }


  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }

  getJWT( payload: JwtPayload) {    
    const token = this.jwtService.sign(payload)
    return token;
  }
}
