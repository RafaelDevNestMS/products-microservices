import { HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaClient } from 'generated/prisma';
import { PaginationDto } from 'src/common';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class ProductsService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(ProductsService.name);

  onModuleInit() {
    this.$connect();
    this.logger.log('ProductsService connected to the database');
  }

  //------ CRUD METHODS ------//

  create(createProductDto: CreateProductDto) {
    return this.product.create({
      data: createProductDto,
      include: {
        category: true,
      },
    });
  }

  async findAll(paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;

    const totalPages = await this.product.count({
      where: { available: true },
    });
    const lastPage = Math.ceil(totalPages / limit);

    return {
      data: await this.product.findMany({
        skip: (page - 1) * limit,
        take: limit,
        where: { available: true },
        include: {
          category: true,
        },
      }),
      meta: {
        total: totalPages,
        page: page,
        lastPage: lastPage,
      },
    };
  }

  async findOne(id: number) {
    const product = await this.product.findUnique({
      where: { id, available: true },
      include: {
        category: true,
      },
    });
    if (!product) {
      throw new RpcException({
        message: `Product with id ${id} not found`,
        status: HttpStatus.BAD_REQUEST,
      });
    }

    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    const { id: _, ...data } = updateProductDto;
    console.log('Update data:', data);
    await this.findOne(id);

    return this.product.update({
      where: { id },
      data: data,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.product.update({
      where: { id },
      data: { available: false },
    });
  }

  async findByCategory(categoryId: number, paginationDto: PaginationDto) {
    const category = await this.category.findUnique({
      where: { id: categoryId },
    });
    if (!category) {
      throw new RpcException({
        message: `Category with id ${categoryId} not found`,
        status: HttpStatus.BAD_REQUEST,
      });
    }

    const { page = 1, limit = 10 } = paginationDto;
 
    return this.product.findMany({
      where: {
        categoryId,
        available: true,
      },
      skip: (page - 1) * limit,
      take: limit,
    });
  }
}
