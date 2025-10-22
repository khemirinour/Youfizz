import { BadRequestException, Body, Controller, ForbiddenException, NotFoundException, Post, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBody, ApiBearerAuth, ApiOkResponse, ApiBadRequestResponse, ApiNotFoundResponse, ApiForbiddenResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vendeur } from '../entities/vendeur.entity';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Roles } from './roles.decorator';
import { RolesGuard } from './roles.guard';

@ApiTags('internal')
@Controller('internal/vendors')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class VendorsController {
  constructor(
    @InjectRepository(Vendeur) private readonly vendeurRepo: Repository<Vendeur>,
  ) {}

  @Get('confirm-quota')
  @ApiOperation({ 
    summary: 'Get vendor confirmation quota',
    description: 'Retrieve remaining confirmation quota for a vendor. Either vendorId or vendorUserId must be provided.'
  })
  @ApiQuery({ 
    name: 'vendorId', 
    required: false, 
    description: 'Vendor ID',
    schema: { type: 'string', format: 'uuid' }
  })
  @ApiQuery({ 
    name: 'vendorUserId', 
    required: false, 
    description: 'Vendor User ID',
    schema: { type: 'string', format: 'uuid' }
  })
  @ApiOkResponse({ 
    description: 'Vendor quota retrieved successfully',
    schema: { 
      type: 'object', 
      properties: { 
        vendorId: { type: 'string', format: 'uuid' }, 
        remaining: { type: 'number', minimum: 0 }
      },
      example: {
        vendorId: '123e4567-e89b-12d3-a456-426614174000',
        remaining: 5
      }
    }
  })
  @ApiBadRequestResponse({ 
    description: 'Bad request - vendorId or vendorUserId required',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'vendorId or vendorUserId is required' },
        error: { type: 'string', example: 'Bad Request' },
        statusCode: { type: 'number', example: 400 }
      }
    }
  })
  @ApiNotFoundResponse({ 
    description: 'Vendor not found',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Vendor not found' },
        error: { type: 'string', example: 'Not Found' },
        statusCode: { type: 'number', example: 404 }
      }
    }
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient role' })
  async getConfirmQuota(@Query() query: { vendorId?: string; vendorUserId?: string }) {
    if (!query?.vendorId && !query?.vendorUserId) {
      throw new BadRequestException('vendorId or vendorUserId is required');
    }
    let vendeur: Vendeur | null = null;
    if (query.vendorId) {
      vendeur = await this.vendeurRepo.findOne({ where: { id: query.vendorId } });
    }
    if (!vendeur && query.vendorUserId) {
      vendeur = await this.vendeurRepo.findOne({ where: { idUser: query.vendorUserId } });
    }
    if (!vendeur) throw new NotFoundException('Vendor not found');
    return { vendorId: vendeur.id, remaining: vendeur.nbrCmdConf };
  }

  @Post('confirm-quota/consume')
  @ApiOperation({ 
    summary: 'Consume vendor confirmation quota',
    description: 'Decrease vendor confirmation quota by 1. Either vendorId or vendorUserId must be provided.'
  })
  @ApiBody({ 
    schema: { 
      type: 'object', 
      properties: { 
        vendorId: { type: 'string', format: 'uuid' }, 
        vendorUserId: { type: 'string', format: 'uuid' }
      },
      required: [],
      description: 'Either vendorId or vendorUserId is required',
      example: {
        vendorId: '123e4567-e89b-12d3-a456-426614174000'
      }
    }
  })
  @ApiOkResponse({ 
    description: 'Quota consumed successfully',
    schema: { 
      type: 'object', 
      properties: { 
        vendorId: { type: 'string', format: 'uuid' }, 
        remaining: { type: 'number', minimum: 0 }
      },
      example: {
        vendorId: '123e4567-e89b-12d3-a456-426614174000',
        remaining: 4
      }
    }
  })
  @ApiBadRequestResponse({ 
    description: 'Bad request - vendorId or vendorUserId required',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'vendorId or vendorUserId is required' },
        error: { type: 'string', example: 'Bad Request' },
        statusCode: { type: 'number', example: 400 }
      }
    }
  })
  @ApiNotFoundResponse({ 
    description: 'Vendor not found',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Vendor not found' },
        error: { type: 'string', example: 'Not Found' },
        statusCode: { type: 'number', example: 404 }
      }
    }
  })
  @ApiForbiddenResponse({ 
    description: 'No remaining confirmations',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Vendor has no remaining confirmations' },
        error: { type: 'string', example: 'Forbidden' },
        statusCode: { type: 'number', example: 403 }
      }
    }
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  async consumeConfirmQuota(@Body() body: { vendorId?: string; vendorUserId?: string }) {
    if (!body?.vendorId && !body?.vendorUserId) {
      throw new BadRequestException('vendorId or vendorUserId is required');
    }
    let vendeur: Vendeur | null = null;
    if (body.vendorId) {
      vendeur = await this.vendeurRepo.findOne({ where: { id: body.vendorId } });
    }
    if (!vendeur && body.vendorUserId) {
      vendeur = await this.vendeurRepo.findOne({ where: { idUser: body.vendorUserId } });
    }
    if (!vendeur) throw new NotFoundException('Vendor not found');
    if ((vendeur.nbrCmdConf ?? 0) <= 0) {
      throw new ForbiddenException('Vendor has no remaining confirmations');
    }
    await this.vendeurRepo.update({ id: vendeur.id }, { nbrCmdConf: vendeur.nbrCmdConf - 1 });
    return { vendorId: vendeur.id, remaining: vendeur.nbrCmdConf - 1 };
  }
}


