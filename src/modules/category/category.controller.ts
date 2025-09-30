import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { PaginationDto } from 'src/common';

@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}


  //------ Create a new category ------//
  @MessagePattern({ cmd: 'create_category' })
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoryService.create(createCategoryDto);
  }

  //------ Find all categories ------//
  @MessagePattern({ cmd: 'find_all_categories' })
  findAll(@Payload() paginationDto: PaginationDto) {
    console.log('Pagination DTO:', paginationDto);
    return this.categoryService.findAll(paginationDto);
  }

  //------ Find one category ------//
  @MessagePattern({ cmd: 'find_one_category' })
  findOne(@Payload('id', ParseIntPipe) id: number) {
    return this.categoryService.findOne(id);
  }

  //------ Update a category ------//
  @MessagePattern({ cmd: 'update_category' })
  update(@Payload() updateCategoryDto: UpdateCategoryDto) {
    return this.categoryService.update(updateCategoryDto.id, updateCategoryDto);
  }

  //------ Remove a category ------//
  @MessagePattern({ cmd: 'remove_category' })
  remove(@Payload('id',ParseIntPipe) id: number) {
    return this.categoryService.remove(id);
  }



}
