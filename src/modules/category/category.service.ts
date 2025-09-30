import { HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PaginationDto } from 'src/common';
import { PrismaClient } from 'generated/prisma';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class CategoryService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(CategoryService.name);

  //------ Connect to the database when the module is initialized ------//
  onModuleInit() {
    this.$connect();
    this.logger.log('CategoryService connected to the database');
  }

  //------ Create a new category ------//
  create(createCategoryDto: CreateCategoryDto) {
    return this.category.create({
      data: createCategoryDto,
    });
  }

  //------ Find all categories ------//
  async findAll(paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;

    const totalPages = await this.category.count();
    const lastPage = Math.ceil(totalPages / limit);

    return {
      data: await this.category.findMany({
        skip: (page - 1) * limit,
        take: limit,
      }),
      meta: {
        total: totalPages,
        page: page,
        lastPage: lastPage,
      },
    };
  }

  //------ Find one category by ID ------//
  async findOne(id: number) {
    const category = await this.category.findUnique({
      where: { id },
    });
    if (!category) {
      throw new RpcException({
        message: `Category with id ${id} not found`,
        status: HttpStatus.BAD_REQUEST,
      });
    }
    return category;
  }

  //------ Update a category by ID ------//
  async update(id: number, updateCategoryDto: UpdateCategoryDto) {
    const { id: _, ...data } = updateCategoryDto;
    console.log('Update data:', data);
    await this.findOne(id);

    return this.category.update({
      where: { id },
      data: data,
    });
  }

  //------ Remove a category by ID ------//
  async remove(id: number) {
    await this.findOne(id);
    return this.category.delete(
      {
        where: { id },
      }
    );
  }

  
}
